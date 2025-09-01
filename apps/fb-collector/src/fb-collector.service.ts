import { Injectable, Inject } from '@nestjs/common';
import { PrismaClientService } from 'libs/prisma-client/src/prisma-client.service';
import { FacebookEventInterface } from 'libs/common/interfaces/facebook-event.interface';
import { Prisma } from '@prisma/client';
import { LoggerDiTokens } from 'libs/logger/di/logger-di-tokens';
import { PrismaServiceDiTokens } from 'libs/prisma-client/di/prisma-service-di-tokens';
import type { LoggerInterface } from 'libs/logger/interfaces/logger.interface';

@Injectable()
export class FbCollectorService {
  constructor(
    @Inject(PrismaServiceDiTokens.PRISMA_CLIENT)
    private readonly prismaClient: PrismaClientService,
    @Inject(LoggerDiTokens.LOGGER)
    private readonly logger: LoggerInterface,
  ) {
    this.logger.setContext(FbCollectorService.name);
  }

  async processFacebookEvent(event: FacebookEventInterface, correlationId: string): Promise<void> {
    this.logger.info(`[${correlationId}] Processing event ${event.eventId} from Facebook...`);

    const { eventId, timestamp, funnelStage, eventType, data } = event;
    const { user, engagement } = data;
    const source = 'facebook';

    try {
      await this.prismaClient.$transaction(async tx => {
        const dbUser = await tx.user.upsert({
          where: { source_sourceUserId: { source: source, sourceUserId: user.userId } },
          update: {
            name: user.name,
            age: user.age,
            gender: user.gender,
            country: user.location.country,
            city: user.location.city,
          },
          create: {
            source: source,
            sourceUserId: user.userId,
            name: user.name,
            age: user.age,
            gender: user.gender,
            country: user.location.country,
            city: user.location.city,
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
                adId: 'adId' in engagement ? engagement.adId : null,
                campaignId: 'campaignId' in engagement ? engagement.campaignId : null,
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
    }
  }
}
