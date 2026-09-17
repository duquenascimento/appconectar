export interface UserNotificationSettings {
  orderConfirmed: boolean;
  orderRejected: boolean;
  chatMessage: boolean;
}

export interface GetUserNotificationSettingsResponseDTO {
  data: UserNotificationSettings;
}

export interface UpdateUserNotificationSettingsResponseDTO {
  data: UserNotificationSettings;
}
