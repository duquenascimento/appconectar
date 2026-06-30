export type ChannelType = 'restaurant' | 'supplier';

export interface GetMessagesPayload {
  userType: 'restaurant' | 'supplier' | 'attendant';
  channelType: 'restaurant' | 'supplier';
  channelId: string;
}

export type JoinChatPayload = {
  userId: string;
  channelType: 'restaurant' | 'supplier';
  channelId: string;
  allChannels: string[];
  userName: string;
  channelName: string;
  userType: 'restaurant';
  restaurantId: string;
};

export type SendMessagePayload = {
  channelType: 'restaurant';
  channelId: string;
  content: string;
  externalId: string;
};

export type LeaveChatPayload = {
  channelType: ChannelType;
  channelId: string;
};

interface RestaurantMessage {
  restaurantId: string;
  restaurantName: string;
  externalId: string | null;
}

interface SupplierMessage {
  supplierId: string;
  supplierName: string;
  externalId: string | null;
}

interface AttendantMessage {
  channelType: 'restaurant' | 'supplier';
  channelId: string;
  channelName: string;
}

export type ChatMessage = {
  id: string;
  createdAt: string;
  read: boolean;
  content: string;
  channelKey: string;
  userType: 'restaurant' | 'supplier' | 'attendant';
  userId: string;
  userName: string;
  target: (RestaurantMessage | SupplierMessage | AttendantMessage)[];
};

export type SocketError = {
  code: string;
  message: string;
};

export type JoinChatResponse = {
  message: string;
};

export type GiftedChatMessage = {
  _id: string;
  text: string;
  createdAt: Date;
  user: {
    _id: string;
    name: string;
  };
  userType?: 'restaurant' | 'supplier' | 'attendant';
  read?: boolean;
  channelKey?: string;
};
