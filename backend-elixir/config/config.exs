# This file is responsible for configuring your application
# and its dependencies with the aid of the Config module.
#
# This configuration file is loaded before any dependency and
# is restricted to this project.

# General application configuration
import Config

config :realm_agent,
  ecto_repos: [RealmAgent.Repo],
  generators: [timestamp_type: :utc_datetime, binary_id: true]

# Configure the endpoint
config :realm_agent, RealmAgentWeb.Endpoint,
  url: [host: "localhost"],
  adapter: Bandit.PhoenixAdapter,
  render_errors: [
    formats: [json: RealmAgentWeb.ErrorJSON],
    layout: false
  ],
  pubsub_server: RealmAgent.PubSub,
  live_view: [signing_salt: "0NN8m8dF"]

# Configure the mailer
#
# By default it uses the "Local" adapter which stores the emails
# locally. You can see the emails in your browser, at "/dev/mailbox".
#
# For production it's recommended to configure a different adapter
# at the `config/runtime.exs`.
config :realm_agent, RealmAgent.Mailer, adapter: Swoosh.Adapters.Local

# Configure Elixir's Logger
config :logger, :default_formatter,
  format: "$time $metadata[$level] $message\n",
  metadata: [:request_id]

# Configure Oban
config :realm_agent, Oban,
  repo: RealmAgent.Repo,
  queues: [default: 10],
  plugins: [
    {Oban.Plugins.Cron,
     crontab: [
       # Weekly reset: toda terça-feira às 15:00 UTC
       {"0 15 * * 2", RealmAgent.Monitor.WeeklyResetWorker}
     ]}
  ]

# Use Jason for JSON parsing in Phoenix
config :phoenix, :json_library, Jason

# Import environment specific config. This must remain at the bottom
# of this file so it overrides the configuration defined above.
import_config "#{config_env()}.exs"
