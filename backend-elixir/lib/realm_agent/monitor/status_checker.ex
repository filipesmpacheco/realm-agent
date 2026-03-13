defmodule RealmAgent.Monitor.StatusChecker do
  @moduledoc """
  GenServer that periodically polls connected realms and detects status changes.
  """
  use GenServer
  require Logger

  alias RealmAgent.Blizzard.Client
  alias RealmAgent.Realms.ConnectedRealm
  alias RealmAgent.Events.Event
  alias RealmAgent.Repo
  alias RealmAgent.Push.Notifier

  @poll_interval_ms String.to_integer(System.get_env("POLL_INTERVAL_SECONDS", "60")) * 1000
  @region System.get_env("WOW_REGION", "us")

  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl true
  def init(_opts) do
    Logger.info("StatusChecker started. Polling every #{@poll_interval_ms}ms")
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
    Logger.info("Starting realm status check...")

    case Client.get_connected_realms(@region) do
      {:ok, realms} ->
        realm_ids =
          realms
          |> Enum.map(fn %{"href" => href} -> extract_realm_id(href) end)
          |> Enum.filter(& &1)

        Logger.info("Found #{length(realm_ids)} connected realms")

        # Load all existing realms from DB in a single query
        existing_by_id =
          Repo.all(ConnectedRealm)
          |> Map.new(&{&1.blizzard_id, &1})

        changes =
          realm_ids
          |> Enum.map(&check_realm_status(&1, existing_by_id))
          |> Enum.filter(& &1)

        if length(changes) > 0 do
          Logger.info("Detected #{length(changes)} status changes")
          process_changes(changes)
        else
          Logger.debug("No changes detected")
        end

      {:error, reason} ->
        Logger.error("Error fetching connected realms: #{inspect(reason)}")
    end
  end

  defp extract_realm_id(href) do
    case Regex.run(~r/connected-realm\/(\d+)/, href) do
      [_, id] -> String.to_integer(id)
      _ -> nil
    end
  end

  defp check_realm_status(realm_id, existing_by_id) do
    case Client.get_realm_status(realm_id, @region) do
      {:ok, %{id: id, is_up: is_up, name: name}} ->
        existing = Map.get(existing_by_id, id)

        cond do
          is_nil(existing) ->
            create_realm(id, name, is_up)
            nil

          existing.is_up != is_up ->
            Logger.info("Status changed: #{name} (#{id}) -> #{if is_up, do: "UP", else: "DOWN"}")
            update_realm(existing, is_up)
            %{id: id, name: name, old_status: existing.is_up, new_status: is_up}

          true ->
            nil
        end

      {:error, reason} ->
        Logger.warning("Error checking realm #{realm_id}: #{inspect(reason)}")
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
    offline_count = Enum.count(changes, &(&1.new_status == false))
    online_count = Enum.count(changes, &(&1.new_status == true))

    if length(changes) > 5 do
      send_aggregated_notification(offline_count, online_count, changes)
    else
      Enum.each(changes, &send_individual_notification/1)
    end

    create_event("realm_status_changed", %{
      changes: changes,
      offline_count: offline_count,
      online_count: online_count,
      timestamp: DateTime.utc_now()
    })
  end

  defp send_aggregated_notification(offline_count, online_count, changes) do
    Notifier.send_status_change(%{
      title: "Realm status changes",
      body: "#{length(changes)} realms changed (#{offline_count} offline, #{online_count} online)",
      data: %{
        type: "aggregated",
        changes: changes
      }
    })
  end

  defp send_individual_notification(%{name: name, new_status: new_status}) do
    status_text = if new_status, do: "ONLINE", else: "OFFLINE"

    Notifier.send_status_change(%{
      title: "Realm #{status_text}",
      body: "#{name} is now #{status_text} • Americas & Oceania",
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
