defmodule RealmAgent.Monitor.StatusChecker do
  @moduledoc """
  GenServer que faz polling periódico dos connected realms e detecta mudanças de status.
  """
  use GenServer
  require Logger

  alias RealmAgent.Blizzard.Client
  alias RealmAgent.Realms.ConnectedRealm
  alias RealmAgent.Events.Event
  alias RealmAgent.Repo
  alias RealmAgent.Push.Notifier

  import Ecto.Query

  @poll_interval_ms String.to_integer(System.get_env("POLL_INTERVAL_SECONDS", "60")) * 1000
  @region System.get_env("WOW_REGION", "us")

  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl true
  def init(_opts) do
    Logger.info("StatusChecker iniciado. Polling a cada #{@poll_interval_ms}ms")
    schedule_check()
    {:ok, %{}}
  end

  @impl true
  def handle_info(:check_status, state) do
    check_all_realms()
    schedule_check()
    {:noreply, state}
  end

  defp schedule_check do
    Process.send_after(self(), :check_status, @poll_interval_ms)
  end

  defp check_all_realms do
    Logger.info("Iniciando verificação de status dos reinos...")

    case Client.get_connected_realms(@region) do
      {:ok, realms} ->
        Logger.info("Encontrados #{length(realms)} connected realms")

        changes =
          realms
          |> Enum.map(fn %{"href" => href} -> extract_realm_id(href) end)
          |> Enum.filter(& &1)
          |> Enum.map(&check_realm_status/1)
          |> Enum.filter(&(&1 != nil))

        if length(changes) > 0 do
          Logger.info("Detectadas #{length(changes)} mudanças de status")
          process_changes(changes)
        else
          Logger.debug("Nenhuma mudança detectada")
        end

      {:error, reason} ->
        Logger.error("Erro ao buscar connected realms: #{inspect(reason)}")
    end
  end

  defp extract_realm_id(href) do
    case Regex.run(~r/connected-realm\/(\d+)/, href) do
      [_, id] -> String.to_integer(id)
      _ -> nil
    end
  end

  defp check_realm_status(realm_id) do
    case Client.get_realm_status(realm_id, @region) do
      {:ok, %{id: id, is_up: is_up, name: name}} ->
        existing = Repo.get_by(ConnectedRealm, blizzard_id: id)

        cond do
          # Primeiro registro deste realm
          is_nil(existing) ->
            create_realm(id, name, is_up)
            nil

          # Status mudou
          existing.is_up != is_up ->
            Logger.info("Status mudou: #{name} (#{id}) -> #{if is_up, do: "UP", else: "DOWN"}")
            update_realm(existing, is_up)
            %{id: id, name: name, old_status: existing.is_up, new_status: is_up}

          # Sem mudança
          true ->
            nil
        end

      {:error, reason} ->
        Logger.warning("Erro ao verificar realm #{realm_id}: #{inspect(reason)}")
        nil
    end
  end

  defp create_realm(blizzard_id, name, is_up) do
    %ConnectedRealm{}
    |> ConnectedRealm.changeset(%{
      blizzard_id: blizzard_id,
      name: name,
      is_up: is_up,
      last_changed_at: DateTime.utc_now(),
      last_notified_state: is_up
    })
    |> Repo.insert()
  end

  defp update_realm(realm, new_status) do
    realm
    |> ConnectedRealm.changeset(%{
      is_up: new_status,
      last_changed_at: DateTime.utc_now()
    })
    |> Repo.update()
  end

  defp process_changes(changes) do
    # Agregar mudanças para evitar spam
    offline_count = Enum.count(changes, &(&1.new_status == false))
    online_count = Enum.count(changes, &(&1.new_status == true))

    # Se muitos reinos mudaram, enviar resumo agregado
    if length(changes) > 5 do
      send_aggregated_notification(offline_count, online_count, changes)
    else
      # Enviar notificação individual para cada mudança
      Enum.each(changes, &send_individual_notification/1)
    end

    # Registrar evento
    create_event("realm_status_changed", %{
      changes: changes,
      offline_count: offline_count,
      online_count: online_count,
      timestamp: DateTime.utc_now()
    })
  end

  defp send_aggregated_notification(offline_count, online_count, changes) do
    title = "Mudanças de status"

    body =
      "#{length(changes)} reinos mudaram (#{offline_count} offline, #{online_count} online)"

    Notifier.send_status_change(%{
      title: title,
      body: body,
      data: %{
        type: "aggregated",
        changes: changes
      }
    })
  end

  defp send_individual_notification(%{name: name, new_status: new_status}) do
    status_text = if new_status, do: "ONLINE", else: "OFFLINE"
    title = "Realm #{status_text}"
    body = "#{name} ficou #{status_text} • Americas & Oceania"

    Notifier.send_status_change(%{
      title: title,
      body: body,
      data: %{
        type: "individual",
        realm_name: name,
        status: status_text
      }
    })
  end

  defp create_event(type, payload) do
    %Event{}
    |> Event.changeset(%{
      type: type,
      payload: payload,
      sent_at: DateTime.utc_now()
    })
    |> Repo.insert()
  end
end
