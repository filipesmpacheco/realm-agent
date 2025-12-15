defmodule RealmAgent.Realms.ConnectedRealm do
  @moduledoc """
  Schema para armazenar o estado dos connected realms.
  """
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  schema "connected_realms" do
    field :blizzard_id, :integer
    field :name, :string
    field :is_up, :boolean, default: true
    field :last_changed_at, :utc_datetime
    field :last_notified_state, :boolean

    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(connected_realm, attrs) do
    connected_realm
    |> cast(attrs, [:blizzard_id, :name, :is_up, :last_changed_at, :last_notified_state])
    |> validate_required([:blizzard_id, :is_up])
    |> unique_constraint(:blizzard_id)
  end
end
