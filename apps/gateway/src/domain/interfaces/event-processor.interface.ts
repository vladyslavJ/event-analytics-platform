export interface EventProcessorInterface {
  processEvents(events: Record<string, unknown>[]): Promise<ProcessingResult>;
}

export interface ProcessingResult {
  message: string;
  accepted: number;
  rejected: number;
}
