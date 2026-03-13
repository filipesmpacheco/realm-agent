FROM elixir:1.17-slim

# Native dependencies needed by some hex packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential git ca-certificates \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install hex + rebar (package manager tools for Elixir)
RUN mix local.hex --force && mix local.rebar --force

EXPOSE 4000

CMD ["mix", "phx.server"]
