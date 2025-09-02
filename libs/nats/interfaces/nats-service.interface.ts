import { ValidEvent } from 'apps/gateway/src/infrastructure/validators/schemas/event.schema';

export interface NatsServiceInterface {
  publishEvent(event: ValidEvent & { correlationId: string }): Promise<void>;
  close(): Promise<void>;
}
