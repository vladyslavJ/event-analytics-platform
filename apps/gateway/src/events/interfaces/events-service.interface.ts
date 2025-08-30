import { ProcessedEventsResultInterface } from './processed-events-result.interface';

export interface EventsServiceInterface {
  processAndFilterEvents(events: Record<string, unknown>[]): ProcessedEventsResultInterface;
}
