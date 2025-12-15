defmodule RealmAgent.Monitor.WeeklyResetWorker do
  @moduledoc """
  Oban worker que dispara notificação de weekly reset.
  Agendado para toda terça-feira às 15:00 UTC.
  """
  use Oban.Worker, queue: :default, max_attempts: 3

  require Logger

  alias RealmAgent.Push.Notifier
  alias RealmAgent.Events.Event
  alias RealmAgent.Repo

  @impl Oban.Worker
  def perform(%Oban.Job{}) do
    Logger.info("Executando job de weekly reset")

    title = "Weekly reset"
    body = "US/Latin/Oceanic — terças 15:00 UTC"

    # Enviar notificação
    Notifier.send_weekly_reset(%{
      title: title,
      body: body,
      data: %{
        type: "weekly_reset",
        region: "us",
        timestamp: DateTime.utc_now()
      }
    })

    # Registrar evento
    %Event{}
    |> Event.changeset(%{
      type: "weekly_reset",
      payload: %{
        region: "us",
        timestamp: DateTime.utc_now()
      },
      sent_at: DateTime.utc_now()
    })
    |> Repo.insert()

    :ok
  end
end
