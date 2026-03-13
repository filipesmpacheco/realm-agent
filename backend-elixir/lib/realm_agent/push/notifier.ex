defmodule RealmAgent.Push.Notifier do
  @moduledoc """
  Sends push notifications via Firebase Cloud Messaging (FCM) v1 API.
  Requires FIREBASE_SERVICE_ACCOUNT_JSON to be set; logs a warning and skips
  silently when not configured (e.g. local dev without credentials).
  """
  require Logger

  @fcm_scope "https://www.googleapis.com/auth/firebase.messaging"

  def send_status_change(payload) do
    send_to_topic("wow_us_all_status", payload)
  end

  def send_weekly_reset(payload) do
    send_to_topic("wow_us_weekly_reset", payload)
  end

  defp send_to_topic(topic, payload) do
    with {:ok, token} <- get_token(),
         {:ok, project_id} <- get_project_id(),
         {:ok, _response} <- do_send(token, project_id, topic, payload) do
      Logger.info("Notification sent to topic: #{topic}")
      :ok
    else
      {:error, :not_configured} ->
        Logger.warning("FCM not configured — skipping notification to #{topic}")
        :ok

      {:error, reason} ->
        Logger.error("Failed to send notification to #{topic}: #{inspect(reason)}")
        {:error, reason}
    end
  end

  defp get_token do
    case Process.whereis(RealmAgent.Goth) do
      nil ->
        {:error, :not_configured}

      _pid ->
        case Goth.fetch(RealmAgent.Goth) do
          {:ok, %{token: token}} -> {:ok, token}
          {:error, reason} -> {:error, {:token_error, reason}}
        end
    end
  end

  defp get_project_id do
    case Application.get_env(:realm_agent, :firebase_project_id) do
      nil -> {:error, :not_configured}
      id -> {:ok, id}
    end
  end

  defp do_send(token, project_id, topic, payload) do
    url = "https://fcm.googleapis.com/v1/projects/#{project_id}/messages:send"

    body = %{
      "message" => %{
        "topic" => topic,
        "notification" => %{
          "title" => payload[:title] || payload["title"],
          "body" => payload[:body] || payload["body"]
        },
        "data" => stringify_data(payload[:data] || payload["data"] || %{}),
        "android" => %{
          "priority" => "high",
          "notification" => %{"sound" => "default", "channel_id" => "realm_status"}
        },
        "apns" => %{
          "payload" => %{"aps" => %{"sound" => "default"}}
        }
      }
    }

    case Req.post(url, json: body, auth: {:bearer, token}) do
      {:ok, %{status: 200, body: response}} ->
        {:ok, response}

      {:ok, %{status: status, body: response}} ->
        Logger.error("FCM returned #{status}: #{inspect(response)}")
        {:error, {:http_error, status}}

      {:error, reason} ->
        {:error, {:network_error, reason}}
    end
  end

  # FCM v1 data map requires all values to be strings
  defp stringify_data(data) when is_map(data) do
    Map.new(data, fn {k, v} -> {to_string(k), stringify_value(v)} end)
  end

  defp stringify_data(_), do: %{}

  defp stringify_value(v) when is_binary(v), do: v
  defp stringify_value(v) when is_number(v), do: to_string(v)
  defp stringify_value(v) when is_boolean(v), do: to_string(v)
  defp stringify_value(v) when is_atom(v), do: to_string(v)
  defp stringify_value(v), do: Jason.encode!(v)

  @doc false
  def __fcm_scope__, do: @fcm_scope
end
