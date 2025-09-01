import { FacebookEventInterface } from 'libs/common/interfaces/facebook-event.interface';

export interface EventProcessorInterface {
  processEvent(event: FacebookEventInterface, correlationId: string): Promise<void>;
}
