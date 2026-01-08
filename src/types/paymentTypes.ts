import { DateTime } from "luxon";

export interface PaymentDescriptions {
  [key: string]: string;
}

export interface PaymentDateData {
  [key: string]: DateTime;
}
