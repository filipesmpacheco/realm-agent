import messaging from '@react-native-firebase/messaging';
import {PermissionsAndroid, Platform} from 'react-native';

/**
 * Solicita permissão para notificações (Android 13+)
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
 * Assina um tópico FCM
 */
export async function subscribeToTopic(topic: string): Promise<void> {
  await messaging().subscribeToTopic(topic);
  console.log(`Subscribed to topic: ${topic}`);
}

/**
 * Desassina um tópico FCM
 */
export async function unsubscribeFromTopic(topic: string): Promise<void> {
  await messaging().unsubscribeFromTopic(topic);
  console.log(`Unsubscribed from topic: ${topic}`);
}

/**
 * Obtém o token FCM do dispositivo
 */
export async function getFCMToken(): Promise<string> {
  const token = await messaging().getToken();
  console.log('FCM Token:', token);
  return token;
}

/**
 * Configura listener para mensagens em foreground
 */
export function onMessageReceived(
  handler: (message: any) => void,
): () => void {
  return messaging().onMessage(handler);
}

/**
 * Configura listener para quando o app é aberto via notificação
 */
export function onNotificationOpenedApp(
  handler: (message: any) => void,
): () => void {
  return messaging().onNotificationOpenedApp(handler);
}

/**
 * Verifica se o app foi aberto via notificação (app estava fechado)
 */
export async function getInitialNotification(): Promise<any | null> {
  return await messaging().getInitialNotification();
}
