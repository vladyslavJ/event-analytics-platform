export interface NatsServiceInterface {
  publish(subject: string, data: unknown): Promise<void>;
}
