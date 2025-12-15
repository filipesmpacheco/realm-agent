defmodule RealmAgent.Repo.Migrations.CreateEvents do
  use Ecto.Migration

  def change do
    create table(:events) do
      add :type, :string, null: false
      add :payload, :map, null: false
      add :sent_at, :utc_datetime

      timestamps(type: :utc_datetime)
    end

    create index(:events, [:type])
    create index(:events, [:inserted_at])
  end
end
