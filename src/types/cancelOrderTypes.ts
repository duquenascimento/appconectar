export enum CancelationOrderErrorKind {
  BUSINESS = 'BUSINESS',
  NOT_FOUND = 'NOT_FOUND',
  TECHNICAL = 'TECHNICAL',
}

export enum CancelationRulesCriteria {
  EXPIRED = 'EXPIRED',
  CREATION_TIME_LIMIT = 'CREATION_TIME_LIMIT',
  SUPPLIER_CLOSING_LIMIT = 'SUPPLIER_CLOSING_LIMIT',
}

export type CancelOrderResult =
  | { success: true }
  | {
      success: false;
      statusCode?: number;
      message: string;
      kind: CancelationOrderErrorKind;
    };

export type CancelationRulesType = {
  criteria: CancelationRulesCriteria;
  remainingSeconds: number;
  deadline: Date | null;
};
