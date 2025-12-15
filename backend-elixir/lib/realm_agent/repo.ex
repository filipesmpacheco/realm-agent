defmodule RealmAgent.Repo do
  use Ecto.Repo,
    otp_app: :realm_agent,
    adapter: Ecto.Adapters.Postgres
end
