export type UserType = 'restaurant' | 'supplier' | 'attendant';
export type ChannelType = 'restaurant' | 'supplier';

export type NativePushPlatform = 'android' | 'ios';

export type WebPushSubscriptionPayload = {
  endpoint: string;
  expirationTime: number | null;
  keys: {
    p256dh: string;
    auth: string;
  };
};

export type ExpoPushRegisterPayload = {
  userType: UserType;
  userId: string;
  channelType: ChannelType;
  channelIds: string[];
  platform: NativePushPlatform;
  deviceId: string;
  pushProvider: 'expo';
  expoPushToken: string;
};

export type WebPushRegisterPayload = {
  userType: UserType;
  userId: string;
  channelType: ChannelType;
  channelIds: string[];
  platform: 'web';
  deviceId: string;
  pushProvider: 'web-push';
  webPushSubscription: WebPushSubscriptionPayload;
};

export type PushRegisterPayload = ExpoPushRegisterPayload | WebPushRegisterPayload;

export type ChatMessageNotificationData = {
  type: 'chat_message';
  channelType: ChannelType;
  channelId: string;
  channelKey?: string;
  messageId?: string;
};

export type OrderConfirmedNotificationData = {
  type: 'order_confirmed';
  channelType: ChannelType;
  channelId: string;
  channelKey?: string;
  orderId: string;
};

export type PushNotificationData = ChatMessageNotificationData | OrderConfirmedNotificationData;
