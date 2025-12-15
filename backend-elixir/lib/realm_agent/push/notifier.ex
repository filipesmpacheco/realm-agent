defmodule RealmAgent.Push.Notifier do
  @moduledoc """
  Módulo responsável por enviar notificações para o serviço Node.js (FCM gateway).
  """
  require Logger

  @node_service_url System.get_env("NODE_SERVICE_URL", "http://localhost:3000")

  @doc """
  Envia notificação de mudança de status para o tópico FCM.
  """
  def send_status_change(payload) do
    send_to_topic("wow_us_all_status", payload)
  end

  @doc """
  Envia notificação de weekly reset para o tópico FCM.
  """
  def send_weekly_reset(payload) do
    send_to_topic("wow_us_weekly_reset", payload)
  end

  defp send_to_topic(topic, payload) do
    url = "#{@node_service_url}/push/topic"

    body =
      Jason.encode!(%{
        topic: topic,
        notification: %{
          title: payload[:title] || payload["title"],
          body: payload[:body] || payload["body"]
        },
        data: payload[:data] || payload["data"] || %{}
      })

    headers = [{"Content-Type", "application/json"}]

    case HTTPoison.post(url, body, headers) do
      {:ok, %HTTPoison.Response{status_code: 200}} ->
        Logger.info("Notificação enviada com sucesso para tópico: #{topic}")
        :ok

      {:ok, %HTTPoison.Response{status_code: status, body: response_body}} ->
        Logger.error("Erro ao enviar notificação (status #{status}): #{response_body}")
        {:error, :push_failed}

      {:error, %HTTPoison.Error{reason: reason}} ->
        Logger.error("Erro de rede ao enviar notificação: #{inspect(reason)}")
        {:error, :network_error}
    end
  end
end
