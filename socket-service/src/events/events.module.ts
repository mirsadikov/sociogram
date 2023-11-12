import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { ChatsModule } from 'src/chats/chat.module';
import { AuthModule } from 'src/auth/auth.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ChatsModule, AuthModule, ConfigModule],
  providers: [EventsGateway],
})
export class EventsModule {}
