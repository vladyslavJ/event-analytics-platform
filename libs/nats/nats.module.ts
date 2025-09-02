import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { connect, NatsConnection, JetStreamClient } from 'nats';
import { NatsDiTokens } from 'libs/nats/di/nats-di-tokens';
import configuration from '../config/configuration';
import { LoggerModule } from 'libs/logger/logger.module';
import { NatsHealthIndicator } from './health/nats-health-indicator.service';
import { NatsPublisherService } from './nats-publisher.service';

@Global()
@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true, load: [configuration] }), LoggerModule],
  providers: [
    {
      provide: NatsDiTokens.NATS_CONNECTION,
      useFactory: async (configService: ConfigService): Promise<NatsConnection> => {
        const natsConnection = await connect({
          servers: configService.get<string>('nats.url'),
          maxReconnectAttempts: configService.get<number>('nats.maxReconnectAttempts', 10),
          reconnectTimeWait: configService.get<number>('nats.reconnectTimeWait', 2000),
          timeout: configService.get<number>('nats.timeout', 10000),
          pingInterval: configService.get<number>('nats.pingInterval', 60000),
          maxPingOut: configService.get<number>('nats.maxPingOut', 5),
          noEcho: true,
        });
        return natsConnection;
      },
      inject: [ConfigService],
    },
    {
      provide: NatsDiTokens.JETSTREAM_CLIENT,
      useFactory: (natsConnection: NatsConnection): JetStreamClient => {
        return natsConnection.jetstream();
      },
      inject: [NatsDiTokens.NATS_CONNECTION],
    },
    {
      provide: NatsDiTokens.NATS_HEALTH_INDICATOR,
      useClass: NatsHealthIndicator,
    },
    NatsPublisherService,
  ],
  exports: [
    NatsDiTokens.NATS_CONNECTION,
    NatsDiTokens.JETSTREAM_CLIENT,
    NatsDiTokens.NATS_HEALTH_INDICATOR,
    NatsPublisherService,
  ],
})
export class NatsClientModule {}
