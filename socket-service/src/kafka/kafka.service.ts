import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Server } from 'socket.io';
import { Kafka, Consumer as KafkaConsumer } from 'kafkajs';
import { EventsGateway } from 'src/events/events.gateway';

@Injectable()
export class KafkaService implements OnModuleInit {
  private kafka: Kafka;
  private consumer: KafkaConsumer;
  private socketServer: EventsGateway;

  constructor(
    private readonly configService: ConfigService,
    private readonly eventsGateway: EventsGateway,
  ) {
    this.kafka = new Kafka({
      clientId: 'sociogram',
      brokers: [this.configService.get<string>('KAFKA_HOST')],
    });

    this.consumer = this.kafka.consumer({ groupId: 'kafka' });
    this.socketServer = this.eventsGateway;
  }

  async onModuleInit() {
    await this.connect();
    await this.subscribeToTopics();
  }

  private async connect() {
    await this.consumer.connect();
  }

  private async subscribeToTopics() {
    await this.consumer.subscribe({
      topic: 'notification',
      fromBeginning: true,
    });

    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const event = JSON.parse(message.value.toString());
        this.socketServer.server.to(event.receiver_id).emit(topic, event);
      },
    });
  }

  async onModuleDestroy() {
    await this.consumer.disconnect();
  }
}
