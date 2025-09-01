import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { connect, NatsConnection, JetStreamClient } from 'nats';
import { NatsDiTokens } from 'libs/nats/di/nats-di-tokens';
import configuration from '../config/configuration';
import { LoggerModule } from 'libs/logger/logger.module';
import { NatsHealthIndicator } from './health/nats-health-indicator.service';

@Global()
@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true, load: [configuration] }), LoggerModule],
  providers: [
    {
      provide: NatsDiTokens.NATS_CONNECTION,
      useFactory: async (configService: ConfigService): Promise<NatsConnection> => {
        const natsConnection = await connect({
          servers: configService.get<string>('nats.url'),
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
  ],
  exports: [
    NatsDiTokens.NATS_CONNECTION,
    NatsDiTokens.JETSTREAM_CLIENT,
    NatsDiTokens.NATS_HEALTH_INDICATOR,
  ],
})
export class NatsClientModule {}
