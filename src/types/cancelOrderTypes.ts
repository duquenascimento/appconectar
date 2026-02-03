export type CancelOrderResult =
  | { success: true }
  | {
      success: false;
      statusCode?: number;
      message: string;
      kind: 'BUSINESS' | 'NOT_FOUND' | 'TECHNICAL';
    };

export type CancelationRulesType = {
  criteria: 'EXPIRED' | 'CREATION_TIME_LIMIT' | 'SUPPLIER_CLOSING_LIMIT';
  remainingSeconds: number;
  deadline: Date | null;
};
