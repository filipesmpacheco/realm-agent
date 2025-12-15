defmodule RealmAgent.Repo.Migrations.CreateConnectedRealms do
  use Ecto.Migration

  def change do
    create table(:connected_realms, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :blizzard_id, :integer, null: false
      add :name, :string
      add :is_up, :boolean, default: true, null: false
      add :last_changed_at, :utc_datetime
      add :last_notified_state, :boolean

      timestamps(type: :utc_datetime)
    end

    create unique_index(:connected_realms, [:blizzard_id])
  end
end
