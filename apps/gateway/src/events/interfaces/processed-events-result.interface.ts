import { ValidEvent } from '../schemas/event.schema';

export interface ProcessedEventsResultInterface {
  validEvents: ValidEvent[];
  invalidCount: number;
}