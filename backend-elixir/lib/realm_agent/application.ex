defmodule RealmAgent.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  @impl true
  def start(_type, _args) do
    children = [
      RealmAgentWeb.Telemetry,
      RealmAgent.Repo,
      {DNSCluster, query: Application.get_env(:realm_agent, :dns_cluster_query) || :ignore},
      {Phoenix.PubSub, name: RealmAgent.PubSub},
      # Oban for job scheduling
      {Oban, Application.fetch_env!(:realm_agent, Oban)},
      # Status checker GenServer
      RealmAgent.Monitor.StatusChecker,
      # Start to serve requests, typically the last entry
      RealmAgentWeb.Endpoint
    ]

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: RealmAgent.Supervisor]
    Supervisor.start_link(children, opts)
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  @impl true
  def config_change(changed, _new, removed) do
    RealmAgentWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end
