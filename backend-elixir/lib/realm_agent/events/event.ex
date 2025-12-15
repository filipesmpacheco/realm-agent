defmodule RealmAgent.Events.Event do
  @moduledoc """
  Schema para armazenar eventos de notificação.
  """
  use Ecto.Schema
  import Ecto.Changeset

  schema "events" do
    field :type, :string
    field :payload, :map
    field :sent_at, :utc_datetime

    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(event, attrs) do
    event
    |> cast(attrs, [:type, :payload, :sent_at])
    |> validate_required([:type, :payload])
    |> validate_inclusion(:type, ["realm_status_changed", "weekly_reset"])
  end
end
