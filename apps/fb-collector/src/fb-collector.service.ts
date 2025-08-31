import { Injectable, Logger } from '@nestjs/common';
import { PrismaClientService } from 'libs/prisma-client/src/prisma-client.service';
import { FacebookEventInterface } from 'libs/common/interfaces/facebook-event.interface';
import { Prisma } from '@prisma/client';

@Injectable()
export class FbCollectorService {
  private readonly logger = new Logger(FbCollectorService.name);

  constructor(private readonly prisma: PrismaClientService) {}

  async processFacebookEvent(event: FacebookEventInterface, correlationId: string): Promise<void> {
    this.logger.log(`[${correlationId}] Processing event ${event.eventId} from Facebook...`);

    const { eventId, timestamp, funnelStage, eventType, data } = event;
    const { user, engagement } = data;

    try {
      await this.prisma.$transaction(async tx => {
        const dbUser = await tx.user.upsert({
          where: { source_sourceUserId: { source: 'facebook', sourceUserId: user.userId } },
          update: {
            name: user.name,
            age: user.age,
            gender: user.gender,
            country: user.location.country,
            city: user.location.city,
          },
          create: {
            source: 'facebook',
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
            source: 'facebook',
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
      this.logger.log(`[${correlationId}] Successfully saved event ${eventId}.`);
    } catch (error) {
      this.logger.error(
        `[${correlationId}] Failed to save event ${eventId}. Error: ${error.message}`,
        error.stack,
      );
    }
  }
}
