import { Injectable, Inject } from '@nestjs/common';
import { PrismaClientService } from 'libs/prisma-client/src/prisma-client.service';
import { TiktokEventInterface } from 'libs/common/interfaces/tiktok-event.interface';
import { Prisma } from '@prisma/client';
import { LoggerDiTokens } from 'libs/logger/di/logger-di-tokens';
import { PrismaServiceDiTokens } from 'libs/prisma-client/di/prisma-service-di-tokens';
import type { LoggerInterface } from 'libs/logger/interfaces/logger.interface';

@Injectable()
export class TtkCollectorService {
  constructor(
    @Inject(PrismaServiceDiTokens.PRISMA_CLIENT)
    private readonly prismaClient: PrismaClientService,
    @Inject(LoggerDiTokens.LOGGER)
    private readonly logger: LoggerInterface,
  ) {
    this.logger.setContext(TtkCollectorService.name);
  }

  async processTiktokEvent(event: TiktokEventInterface, correlationId: string): Promise<void> {
    this.logger.info(`[${correlationId}] Processing event ${event.eventId} from TikTok...`);

    const { eventId, timestamp, funnelStage, eventType, data } = event;
    const { user, engagement } = data;
    const source = 'tiktok';

    try {
      await this.prismaClient.$transaction(async tx => {
        const dbUser = await tx.user.upsert({
          where: { source_sourceUserId: { source: source, sourceUserId: user.userId } },
          update: {
            name: user.username,
            followers: user.followers,
          },
          create: {
            source: source,
            sourceUserId: user.userId,
            name: user.username,
            followers: user.followers,
            extra: {},
          },
        });

        await tx.event.create({
          data: {
            eventId,
            timestamp: new Date(timestamp),
            source: source,
            funnelStage,
            eventType,
            userId: dbUser.id,
            engagement: {
              create: {
                engagementType: funnelStage,
                videoId: 'videoId' in engagement ? engagement.videoId : null,
                purchaseAmount:
                  'purchaseAmount' in engagement && engagement.purchaseAmount
                    ? new Prisma.Decimal(engagement.purchaseAmount)
                    : null,
                details: engagement as unknown as Prisma.JsonObject,
              },
            },
          },
        });
      });
      this.logger.info(`[${correlationId}] Successfully saved event ${eventId}.`);
    } catch (error) {
      this.logger.error(
        `[${correlationId}] Failed to save event ${eventId}. Error: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
