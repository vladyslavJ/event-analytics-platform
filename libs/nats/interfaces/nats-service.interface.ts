import { ValidEvent } from "apps/gateway/src/events/schemas/event.schema";

export interface NatsServiceInterface {
  publishEvent(event: ValidEvent & { correlationId: string }): Promise<void>;
  close(): Promise<void>;
}
