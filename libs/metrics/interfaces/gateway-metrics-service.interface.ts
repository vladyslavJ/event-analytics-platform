export interface GatewayMetricsServiceInterface {
  incrementAcceptedEvents(count?: number): void;
  incrementProcessedEvents(count?: number): void;
  incrementFailedEvents(count?: number): void;
}
