export interface EventsControllerInterface {
  handleEvents(events: Record<string, unknown>[]): Promise<{
    message: string;
    accepted?: number;
    rejected?: number;
  }>;
}
