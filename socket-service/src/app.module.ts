import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventsModule } from './events/events.module';
import { ConfigModule } from '@nestjs/config';
import { KafkaModule } from './kafka/kafka.module';

@Module({
  imports: [ConfigModule.forRoot(), EventsModule, KafkaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
