import messaging from '@react-native-firebase/messaging';
import { PermissionsAndroid, Platform } from 'react-native';

import type { MessageHandler, RemoteMessage } from '../types/notifications';

/**
 * Requests notification permission.
 * On Android 13+ uses the runtime permission API; on iOS uses Firebase Auth.
 */
export async function requestPermission(): Promise<boolean> {
  if (Platform.OS === 'android' && Platform.Version >= 33) {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }

  const authStatus = await messaging().requestPermission();
  return (
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL
  );
}

/**
 * Subscribes the device to an FCM topic.
 */
export async function subscribeToTopic(topic: string): Promise<void> {
  await messaging().subscribeToTopic(topic);
}

/**
 * Unsubscribes the device from an FCM topic.
 */
export async function unsubscribeFromTopic(topic: string): Promise<void> {
  await messaging().unsubscribeFromTopic(topic);
}

/**
 * Returns the FCM registration token for the current device.
 */
export async function getFCMToken(): Promise<string> {
  return messaging().getToken();
}

/**
 * Registers a listener for messages received while the app is in the foreground.
 * Returns an unsubscribe function.
 */
export function onMessageReceived(handler: MessageHandler): () => void {
  return messaging().onMessage(handler);
}

/**
 * Registers a listener for when the app is opened via a notification tap.
 * Returns an unsubscribe function.
 */
export function onNotificationOpenedApp(handler: MessageHandler): () => void {
  return messaging().onNotificationOpenedApp(handler);
}

/**
 * Returns the notification that launched the app if it was opened from a closed state,
 * or null otherwise.
 */
export async function getInitialNotification(): Promise<RemoteMessage | null> {
  return messaging().getInitialNotification();
}
