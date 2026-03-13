defmodule RealmAgent.Application do
  @moduledoc false

  use Application

  @impl true
  def start(_type, _args) do
    children =
      [
        RealmAgentWeb.Telemetry,
        RealmAgent.Repo,
        {DNSCluster, query: Application.get_env(:realm_agent, :dns_cluster_query) || :ignore},
        {Phoenix.PubSub, name: RealmAgent.PubSub},
        {Oban, Application.fetch_env!(:realm_agent, Oban)},
        RealmAgent.Monitor.StatusChecker,
        RealmAgentWeb.Endpoint
      ] ++ goth_child()

    opts = [strategy: :one_for_one, name: RealmAgent.Supervisor]
    Supervisor.start_link(children, opts)
  end

  @impl true
  def config_change(changed, _new, removed) do
    RealmAgentWeb.Endpoint.config_change(changed, removed)
    :ok
  end

  defp goth_child do
    case Application.get_env(:realm_agent, :firebase_credentials) do
      nil ->
        []

      credentials ->
        [
          {Goth,
           name: RealmAgent.Goth,
           source:
             {:service_account, credentials,
              scopes: ["https://www.googleapis.com/auth/firebase.messaging"]}}
        ]
    end
  end
end
