import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { connect, NatsConnection, JetStreamClient } from 'nats';
import { NatsDiTokens } from 'libs/common/di/nats-di-tokens';
import configuration from './config/configuration';

@Global()
@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true, load: [configuration] })],
  providers: [
    {
      provide: NatsDiTokens.NATS_CONNECTION,
      useFactory: async (configService: ConfigService): Promise<NatsConnection> => {
        const natsConnection = await connect({
          servers: 'nats://nats:4222',
        });
        console.log(`NATS connected to ${natsConnection.getServer()}`);
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
  ],
  exports: [NatsDiTokens.NATS_CONNECTION, NatsDiTokens.JETSTREAM_CLIENT],
})
export class NatsClientModule {}
