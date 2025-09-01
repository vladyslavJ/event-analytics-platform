import { TiktokEventInterface } from 'libs/common/interfaces/tiktok-event.interface';

export interface EventProcessorInterface {
  processEvent(event: TiktokEventInterface, correlationId: string): Promise<void>;
}
