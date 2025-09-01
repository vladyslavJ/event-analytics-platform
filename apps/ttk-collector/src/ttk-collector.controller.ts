import { Controller, Get, Inject } from '@nestjs/common';
import { HealthCheck, HealthCheckService, PrismaHealthIndicator } from '@nestjs/terminus';
import { PrismaClientService } from 'libs/prisma-client/src/prisma-client.service';
import { PrismaServiceDiTokens } from 'libs/prisma-client/di/prisma-service-di-tokens';

@Controller()
export class TtkCollectorController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly prismaHealth: PrismaHealthIndicator,
    @Inject(PrismaServiceDiTokens.PRISMA_CLIENT)
    private readonly prismaClient: PrismaClientService,
  ) {}

  @Get('health/live')
  @HealthCheck()
  liveness() {
    return this.health.check([]);
  }

  @Get('health/ready')
  @HealthCheck()
  readiness() {
    return this.health.check([() => this.prismaHealth.pingCheck('database', this.prismaClient)]);
  }
}
