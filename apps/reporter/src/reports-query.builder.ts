import { Injectable } from '@nestjs/common';
import { Prisma, Source } from '@prisma/client';
import { ReportsQueryBuilderInterface } from './interfaces/reports-query-builder.interface';
import { GetEventsReportDto } from './dto/get-events-report.dto';
import { GetRevenueReportDto } from './dto/get-revenue-report.dto';
import { GetDemographicsReportDto } from './dto/get-demographics-report.dto';
import { FacebookBottomEvent } from 'libs/common/enums/facebook-event.enum';
import { TiktokBottomEvent } from 'libs/common/enums/tiktok-event.enum';

@Injectable()
export class ReportsQueryBuilder implements ReportsQueryBuilderInterface {
  buildEventsReportQuery(filters: GetEventsReportDto): Prisma.EventGroupByArgs {
    const where: Prisma.EventWhereInput = {
      timestamp: {
        gte: filters.from,
        lte: filters.to,
      },
      source: filters.source,
      funnelStage: filters.funnelStage,
      eventType: filters.eventType,
    };

    return {
      by: ['source', 'funnelStage', 'eventType'],
      _count: {
        id: true,
      },
      where,
    };
  }

  buildRevenueReportQuery(filters: GetRevenueReportDto): Prisma.EventFindManyArgs {
    const where: Prisma.EventWhereInput = {
      timestamp: {
        gte: filters.from,
        lte: filters.to,
      },
      source: filters.source,
      OR: [
        { eventType: FacebookBottomEvent.CheckoutComplete },
        { eventType: TiktokBottomEvent.Purchase },
      ],
      engagement: {
        campaignId: filters.campaignId,
        // ВИПРАВЛЕНО: Фільтруємо по полю purchaseAmount, а не по JSON
        purchaseAmount: {
          not: null,
        },
      },
    };

    return {
      where,
      select: {
        source: true,
        engagement: {
          select: {
            campaignId: true,
            // ВИПРАВЛЕНО: Вибираємо поле purchaseAmount напряму
            purchaseAmount: true,
          },
        },
      },
    };
  }

  buildDemographicsReportQuery(filters: GetDemographicsReportDto): Prisma.UserFindManyArgs {
    const where: Prisma.UserWhereInput = {
      source: filters.source,
      events: {
        some: {
          timestamp: {
            gte: filters.from,
            lte: filters.to,
          },
        },
      },
    };

    const facebookSelect: Prisma.UserSelect = {
      sourceUserId: true,
      name: true,
      age: true,
      gender: true,
      country: true,
      city: true,
    };

    const tiktokSelect: Prisma.UserSelect = {
      sourceUserId: true,
      name: true,
      followers: true,
    };

    return {
      where,
      select: filters.source === Source.facebook ? facebookSelect : tiktokSelect,
    };
  }
}
