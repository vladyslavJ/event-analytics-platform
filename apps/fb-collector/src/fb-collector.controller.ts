import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService, PrismaHealthIndicator } from '@nestjs/terminus';
import { PrismaClientService } from 'libs/prisma-client/src/prisma-client.service';

@Controller()
export class FbCollectorController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly prismaHealth: PrismaHealthIndicator,
    private readonly prisma: PrismaClientService,
  ) {}

  @Get('health/live')
  @HealthCheck()
  liveness() {
    return this.health.check([]);
  }

  @Get('health/ready')
  @HealthCheck()
  readiness() {
    return this.health.check([() => this.prismaHealth.pingCheck('database', this.prisma)]);
  }
}
