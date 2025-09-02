export interface EventPublisherInterface {
  publishEvents(events: any[]): Promise<PublishResult>;
}

export interface PublishResult {
  publishedCount: number;
  failedCount: number;
}
