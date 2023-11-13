import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { ChatsModule } from 'src/chats/chat.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ChatsModule, ConfigModule],
  providers: [EventsGateway],
  exports: [EventsGateway],
})
export class EventsModule {}
