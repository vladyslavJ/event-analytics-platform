import { Injectable, Inject } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import type { NatsConnection } from 'nats';
import { NatsHealthIndicatorInterface } from '../interfaces/nats-health-indicator.interface';
import { NatsDiTokens } from '../di/nats-di-tokens';

@Injectable()
export class NatsHealthIndicator extends HealthIndicator implements NatsHealthIndicatorInterface {
  constructor(
    @Inject(NatsDiTokens.NATS_CONNECTION)
    private readonly natsConnection: NatsConnection,
  ) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      const isConnected = !this.natsConnection.isClosed();
      if (!isConnected) {
        throw new Error('NATS connection is closed');
      }
      return this.getStatus(key, true);
    } catch (error) {
      throw new HealthCheckError(
        'NATS health check failed',
        this.getStatus(key, false, { message: error.message }),
      );
    }
  }
}
