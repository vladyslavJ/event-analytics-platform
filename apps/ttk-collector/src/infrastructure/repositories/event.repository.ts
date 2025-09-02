import { Injectable, Inject } from '@nestjs/common';
import { PrismaClientService } from 'libs/prisma-client/src/prisma-client.service';
import { PrismaServiceDiTokens } from 'libs/prisma-client/di/prisma-service-di-tokens';
import type {
  EventRepositoryInterface,
  SavedEvent,
} from '../../domain/interfaces/repository.interface';
import { EventMapper } from '../../domain/mappers/event.mapper';
import { TiktokEventInterface } from 'libs/common/interfaces/tiktok-event.interface';

@Injectable()
export class EventRepository implements EventRepositoryInterface {
  constructor(
    @Inject(PrismaServiceDiTokens.PRISMA_CLIENT)
    private readonly prisma: PrismaClientService,
  ) {}

  async saveEvent(event: TiktokEventInterface, userId: string): Promise<SavedEvent> {
    const mappedEvent = EventMapper.mapFromTiktokEvent(event, userId);
    const { engagement } = event.data;
    const existingEvent = await this.prisma.event.findUnique({
      where: { eventId: mappedEvent.eventId },
    });
    if (existingEvent) {
      return {
        id: existingEvent.id,
        eventId: existingEvent.eventId,
        timestamp: existingEvent.timestamp,
        source: existingEvent.source,
        funnelStage: existingEvent.funnelStage,
        eventType: existingEvent.eventType,
        userId: existingEvent.userId,
      };
    }

    const result = await this.prisma.event.create({
      data: {
        eventId: mappedEvent.eventId,
        timestamp: mappedEvent.timestamp,
        source: mappedEvent.source as any,
        funnelStage: mappedEvent.funnelStage as any,
        eventType: mappedEvent.eventType,
        userId: mappedEvent.userId,
        engagement: {
          create: {
            engagementType: event.funnelStage,
            videoId: 'videoId' in engagement ? engagement.videoId : null,
            purchaseAmount:
              'purchaseAmount' in engagement && engagement.purchaseAmount
                ? parseFloat(engagement.purchaseAmount)
                : null,
            details: engagement as any,
          },
        },
      },
    });

    return {
      id: result.id,
      eventId: result.eventId,
      timestamp: result.timestamp,
      source: result.source,
      funnelStage: result.funnelStage,
      eventType: result.eventType,
      userId: result.userId,
    };
  }

  async findEventById(eventId: string): Promise<SavedEvent | null> {
    const result = await this.prisma.event.findUnique({
      where: { eventId },
    });
    if (!result) return null;
    return {
      id: result.id,
      eventId: result.eventId,
      timestamp: result.timestamp,
      source: result.source,
      funnelStage: result.funnelStage,
      eventType: result.eventType,
      userId: result.userId,
    };
  }
}
