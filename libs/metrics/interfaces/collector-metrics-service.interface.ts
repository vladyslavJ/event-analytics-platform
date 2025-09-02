import { CollectorSource } from '../types/collector-sources.type';

export interface CollectorsMetricsServiceInterface {
  incrementConsumed(source: CollectorSource): void;
  incrementProcessed(source: CollectorSource): void;
  incrementFailed(source: CollectorSource): void;
}
