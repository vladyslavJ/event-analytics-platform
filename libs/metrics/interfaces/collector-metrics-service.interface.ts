type CollectorSource = 'fb' | 'ttk';

export interface CollectorsMetricsServiceInterface {
  incrementConsumed(source: CollectorSource): void;
  incrementProcessed(source: CollectorSource): void;
  incrementFailed(source: CollectorSource): void;
}
