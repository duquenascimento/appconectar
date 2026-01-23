interface GetAvailableDatesResponseData {
  availableDates: string[];
}

export interface GetAvailableDeliveryDatesResponseDTO {
  success: boolean;
  statusCode: number;
  data: GetAvailableDatesResponseData;
  msg?: string;
}
