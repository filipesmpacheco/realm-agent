defmodule RealmAgent.Blizzard.Client do
  @moduledoc """
  Cliente para interagir com a Blizzard API.
  Responsável por autenticação OAuth e consultas aos endpoints de reinos.
  """

  require Logger

  @token_url "https://oauth.battle.net/token"
  @api_base_url "https://us.api.blizzard.com"

  @doc """
  Obtém um access token via OAuth client credentials flow.
  O token é cacheado e reutilizado até expirar.
  """
  def get_access_token do
    client_id = System.get_env("BLIZZARD_CLIENT_ID")
    client_secret = System.get_env("BLIZZARD_CLIENT_SECRET")

    unless client_id && client_secret do
      raise "BLIZZARD_CLIENT_ID e BLIZZARD_CLIENT_SECRET devem estar configurados"
    end

    case HTTPoison.post(
           @token_url,
           {:form, [grant_type: "client_credentials"]},
           [],
           hackney: [basic_auth: {client_id, client_secret}]
         ) do
      {:ok, %HTTPoison.Response{status_code: 200, body: body}} ->
        case Jason.decode(body) do
          {:ok, %{"access_token" => token}} ->
            {:ok, token}

          error ->
            Logger.error("Erro ao decodificar resposta de token: #{inspect(error)}")
            {:error, :invalid_response}
        end

      {:ok, %HTTPoison.Response{status_code: status, body: body}} ->
        Logger.error("Erro ao obter token (status #{status}): #{body}")
        {:error, :auth_failed}

      {:error, %HTTPoison.Error{reason: reason}} ->
        Logger.error("Erro de rede ao obter token: #{inspect(reason)}")
        {:error, :network_error}
    end
  end

  @doc """
  Lista todos os connected realms da região especificada.
  """
  def get_connected_realms(region \\ "us") do
    with {:ok, token} <- get_access_token() do
      url = "#{@api_base_url}/data/wow/connected-realm/"

      headers = [
        {"Authorization", "Bearer #{token}"}
      ]

      params = [
        namespace: "dynamic-#{region}",
        locale: "en_US"
      ]

      case HTTPoison.get(url, headers, params: params) do
        {:ok, %HTTPoison.Response{status_code: 200, body: body}} ->
          case Jason.decode(body) do
            {:ok, %{"connected_realms" => realms}} ->
              {:ok, realms}

            error ->
              Logger.error("Erro ao decodificar connected realms: #{inspect(error)}")
              {:error, :invalid_response}
          end

        {:ok, %HTTPoison.Response{status_code: status, body: body}} ->
          Logger.error("Erro ao buscar connected realms (status #{status}): #{body}")
          {:error, :api_error}

        {:error, %HTTPoison.Error{reason: reason}} ->
          Logger.error("Erro de rede ao buscar connected realms: #{inspect(reason)}")
          {:error, :network_error}
      end
    end
  end

  @doc """
  Obtém o status de um connected realm específico.
  Retorna %{id: integer, is_up: boolean, name: string}
  """
  def get_realm_status(connected_realm_id, region \\ "us") do
    with {:ok, token} <- get_access_token() do
      url = "#{@api_base_url}/data/wow/connected-realm/#{connected_realm_id}"

      headers = [
        {"Authorization", "Bearer #{token}"}
      ]

      params = [
        namespace: "dynamic-#{region}",
        locale: "en_US"
      ]

      case HTTPoison.get(url, headers, params: params) do
        {:ok, %HTTPoison.Response{status_code: 200, body: body}} ->
          case Jason.decode(body) do
            {:ok, data} ->
              parse_realm_status(data)

            error ->
              Logger.error("Erro ao decodificar status do realm: #{inspect(error)}")
              {:error, :invalid_response}
          end

        {:ok, %HTTPoison.Response{status_code: status, body: body}} ->
          Logger.error("Erro ao buscar status do realm (status #{status}): #{body}")
          {:error, :api_error}

        {:error, %HTTPoison.Error{reason: reason}} ->
          Logger.error("Erro de rede ao buscar status do realm: #{inspect(reason)}")
          {:error, :network_error}
      end
    end
  end

  defp parse_realm_status(%{"id" => id, "status" => %{"type" => type}, "realms" => realms}) do
    is_up = type == "UP"
    name = get_primary_realm_name(realms)

    {:ok, %{id: id, is_up: is_up, name: name}}
  end

  defp parse_realm_status(data) do
    Logger.warning("Formato inesperado de resposta: #{inspect(data)}")
    {:error, :invalid_format}
  end

  defp get_primary_realm_name([%{"name" => name} | _rest]), do: name
  defp get_primary_realm_name(_), do: "Unknown"
end
