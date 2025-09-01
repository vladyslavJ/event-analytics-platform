import { Inject, Controller, Get, Header } from '@nestjs/common';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';
import { NatsDiTokens } from 'libs/nats/di/nats-di-tokens';
import type { NatsHealthIndicatorInterface } from 'libs/nats/interfaces/nats-health-indicator.interface';
import { register, collectDefaultMetrics } from 'prom-client';

collectDefaultMetrics();

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    @Inject(NatsDiTokens.NATS_HEALTH_INDICATOR)
    private natsHealth: NatsHealthIndicatorInterface,
  ) {}

  @Get('live')
  @HealthCheck()
  live() {
    return this.health.check([]);
  }

  @Get('ready')
  @HealthCheck()
  ready() {
    return this.health.check([() => this.natsHealth.isHealthy('nats')]);
  }

  @Get('metrics')
  @Header('Content-Type', register.contentType)
  async metrics(): Promise<string> {
    return register.metrics();
  }
}
