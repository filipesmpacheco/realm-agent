import Config

# Load .env file when running locally (outside Docker)
if config_env() != :prod do
  env_file = Path.join([__DIR__, "..", "..", ".env"])

  if File.exists?(env_file) do
    env_file
    |> File.read!()
    |> String.split("\n")
    |> Enum.each(fn line ->
      line = String.trim(line)

      unless String.starts_with?(line, "#") or line == "" do
        case String.split(line, "=", parts: 2) do
          [key, value] -> System.put_env(key, value)
          _ -> :ok
        end
      end
    end)
  end
end

# Enable the HTTP server (required in Docker / releases)
if System.get_env("PHX_SERVER") do
  config :realm_agent, RealmAgentWeb.Endpoint, server: true
end

config :realm_agent, RealmAgentWeb.Endpoint,
  http: [port: String.to_integer(System.get_env("PORT", "4000"))]

# Use DATABASE_URL when set (Docker or any environment with the var)
if database_url = System.get_env("DATABASE_URL") do
  maybe_ipv6 = if System.get_env("ECTO_IPV6") in ~w(true 1), do: [:inet6], else: []

  config :realm_agent, RealmAgent.Repo,
    url: database_url,
    pool_size: String.to_integer(System.get_env("POOL_SIZE") || "10"),
    socket_options: maybe_ipv6
end

# Firebase Cloud Messaging — optional, push is skipped when absent
case System.get_env("FIREBASE_SERVICE_ACCOUNT_JSON") do
  nil ->
    :ok

  json ->
    credentials = Jason.decode!(json)

    config :realm_agent,
      firebase_credentials: credentials,
      firebase_project_id: credentials["project_id"]
end

# Production-only config
if config_env() == :prod do
  secret_key_base =
    System.get_env("SECRET_KEY_BASE") ||
      raise "environment variable SECRET_KEY_BASE is missing"

  host = System.get_env("PHX_HOST") || "example.com"

  config :realm_agent, :dns_cluster_query, System.get_env("DNS_CLUSTER_QUERY")

  config :realm_agent, RealmAgentWeb.Endpoint,
    url: [host: host, port: 443, scheme: "https"],
    http: [ip: {0, 0, 0, 0, 0, 0, 0, 0}],
    secret_key_base: secret_key_base
end
