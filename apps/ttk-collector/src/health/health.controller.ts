import { Inject, Controller, Get, Header } from '@nestjs/common';
import { HealthCheck, HealthCheckService, PrismaHealthIndicator } from '@nestjs/terminus'; // --- ДОДАНО
import { NatsDiTokens } from 'libs/nats/di/nats-di-tokens';
import type { NatsHealthIndicatorInterface } from 'libs/nats/interfaces/nats-health-indicator.interface';
import { register, collectDefaultMetrics } from 'prom-client';
import { PrismaServiceDiTokens } from 'libs/prisma-client/di/prisma-service-di-tokens'; // --- ДОДАНО
import { PrismaClientService } from 'libs/prisma-client/src/prisma-client.service'; // --- ДОДАНО

collectDefaultMetrics({ prefix: 'ttk_collector_' });

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    @Inject(NatsDiTokens.NATS_HEALTH_INDICATOR)
    private natsHealth: NatsHealthIndicatorInterface,
    private readonly prismaHealth: PrismaHealthIndicator,
    @Inject(PrismaServiceDiTokens.PRISMA_CLIENT)
    private readonly prisma: PrismaClientService,
  ) {}

  @Get('live')
  @HealthCheck()
  live() {
    return this.health.check([]);
  }

  @Get('ready')
  @HealthCheck()
  ready() {
    return this.health.check([
      () => this.natsHealth.isHealthy('nats'),
      () => this.prismaHealth.pingCheck('database', this.prisma),
    ]);
  }

  @Get('metrics')
  @Header('Content-Type', register.contentType)
  async metrics(): Promise<string> {
    return register.metrics();
  }
}
