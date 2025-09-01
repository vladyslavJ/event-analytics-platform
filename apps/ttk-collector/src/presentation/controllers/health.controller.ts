import { Controller, Get, Header, Inject } from '@nestjs/common';
import { HealthCheck, HealthCheckService, PrismaHealthIndicator } from '@nestjs/terminus';
import { PrismaClientService } from 'libs/prisma-client/src/prisma-client.service';
import { PrismaServiceDiTokens } from 'libs/prisma-client/di/prisma-service-di-tokens';
import { NatsDiTokens } from 'libs/nats/di/nats-di-tokens';
import type { NatsHealthIndicatorInterface } from 'libs/nats/interfaces/nats-health-indicator.interface';
import { register, collectDefaultMetrics } from 'prom-client';

collectDefaultMetrics({ prefix: 'ttk_collector_' });

@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly prismaHealth: PrismaHealthIndicator,
    @Inject(PrismaServiceDiTokens.PRISMA_CLIENT)
    private readonly prisma: PrismaClientService,
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
    return this.health.check([
      () => this.prismaHealth.pingCheck('database', this.prisma as any),
      () => this.natsHealth.isHealthy('nats'),
    ]);
  }

  @Get('metrics')
  @Header('Content-Type', register.contentType)
  async getMetrics(): Promise<string> {
    return register.metrics();
  }
}
