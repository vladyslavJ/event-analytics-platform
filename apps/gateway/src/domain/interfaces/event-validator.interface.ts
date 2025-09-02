export interface EventValidatorInterface {
  validateEvents(events: Record<string, unknown>[]): ValidationResult;
}

export interface ValidationResult {
  validEvents: any[];
  invalidCount: number;
}
