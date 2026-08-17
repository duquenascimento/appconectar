export type ChannelType = 'restaurant' | 'supplier';

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

export type GetMessagesPayload = {
  channelType: ChannelType;
  channelId: string;
  page: number;
  limit: number;
};

interface RestaurantMessage {
  restaurantId: string;
  restaurantName: string;
}

interface SupplierMessage {
  supplierId: string;
  supplierName: string;
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
  externalId: string | null;
  target: (RestaurantMessage | SupplierMessage | AttendantMessage)[];
};

export interface GetPagesResponse {
  items: ChatMessage[];
  metadata: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}

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
