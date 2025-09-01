type ReportCategory = 'events' | 'revenue' | 'demographics';

export interface ReportsMetricsServiceInterface {
  observeReportLatency<T>(category: ReportCategory, fn: () => Promise<T>): Promise<T>;
}
