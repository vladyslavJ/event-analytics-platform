import { Controller, Get, Header, Inject } from '@nestjs/common';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';
import { NatsDiTokens } from 'libs/nats/di/nats-di-tokens';
import type { NatsHealthIndicatorInterface } from 'libs/nats/interfaces/nats-health-indicator.interface';
import { register, collectDefaultMetrics } from 'prom-client';

collectDefaultMetrics({ prefix: 'gateway_' });

@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    @Inject(NatsDiTokens.NATS_HEALTH_INDICATOR)
    private readonly natsHealth: NatsHealthIndicatorInterface,
  ) {}

  @Get('live')
  @HealthCheck()
  checkLiveness() {
    return this.health.check([]);
  }

  @Get('ready')
  @HealthCheck()
  checkReadiness() {
    return this.health.check([() => this.natsHealth.isHealthy('nats')]);
  }

  @Get('metrics')
  @Header('Content-Type', register.contentType)
  async getMetrics(): Promise<string> {
    return register.metrics();
  }
}
