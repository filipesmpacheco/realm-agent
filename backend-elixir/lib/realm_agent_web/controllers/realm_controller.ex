defmodule RealmAgentWeb.RealmController do
  use RealmAgentWeb, :controller

  import Ecto.Query
  alias RealmAgent.Realms.ConnectedRealm
  alias RealmAgent.Repo

  def index(conn, _params) do
    realms =
      ConnectedRealm
      |> order_by([r], asc: r.name)
      |> Repo.all()

    json(conn, %{realms: Enum.map(realms, &format_realm/1)})
  end

  defp format_realm(realm) do
    %{
      id: realm.blizzard_id,
      name: realm.name,
      is_up: realm.is_up,
      last_changed_at: realm.last_changed_at
    }
  end
end
