import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { connect, NatsConnection, JSONCodec } from 'nats';
import { NatsServiceInterface } from './interfaces/nats-service.interface';

@Injectable()
export class NatsService implements OnModuleInit, OnModuleDestroy, NatsServiceInterface {
  private natsConnection: NatsConnection;
  private jsonCodec = JSONCodec();

  async onModuleInit() {
    try {
      this.natsConnection = await connect({
        servers: process.env.NATS_URL || 'nats://localhost:4222',
      });
      console.log('Successfully connected to NATS');
    } catch (error) {
      console.error('Failed to connect to NATS', error);
    }
  }

  async onModuleDestroy() {
    if (this.natsConnection) {
      await this.natsConnection.close();
      console.log('NATS connection closed');
    }
  }

  async publish(subject: string, data: unknown): Promise<void> {
    if (!this.natsConnection) {
      console.error('NATS connection is not available. Cannot publish message.');
      return;
    }
    this.natsConnection.publish(subject, this.jsonCodec.encode(data));
    await this.natsConnection.flush();
  }
}
