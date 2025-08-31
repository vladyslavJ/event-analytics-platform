import { Module } from '@nestjs/common';
import { PrismaClientService } from './prisma-client.service';
import { PrismaServiceDiTokens } from '../di/prisma-service-di-tokens';

@Module({
  providers: [
    {
      provide: PrismaServiceDiTokens.PRISMA_CLIENT,
      useClass: PrismaClientService,
    },
  ],
  exports: [PrismaServiceDiTokens.PRISMA_CLIENT],
})
export class PrismaClientModule {}
