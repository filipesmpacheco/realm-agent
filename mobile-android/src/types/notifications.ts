import type { FirebaseMessagingTypes } from '@react-native-firebase/messaging';

export type RemoteMessage = FirebaseMessagingTypes.RemoteMessage;

export type MessageHandler = (message: RemoteMessage) => void;
