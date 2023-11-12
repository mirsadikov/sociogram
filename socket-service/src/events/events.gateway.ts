import { UseFilters } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from 'src/chats/chat.service';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { ExceptionFilter } from './exception.filter';

interface AuthenticatedSocket extends Socket {
  user: {
    id: string;
    email: string;
  };
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
@UseFilters(ExceptionFilter)
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly chatService: ChatService,
    private readonly configService: ConfigService,
  ) {}

  @WebSocketServer()
  server: Server;

  handleConnection(client: AuthenticatedSocket) {
    const token = client.handshake.auth.token;

    if (!token) {
      client.disconnect();
      return;
    }

    try {
      const decoded = jwt.verify(
        token,
        this.configService.get<string>('JWT_SECRET'),
      ) as { id: string; email: string };

      client.user = { id: decoded.id, email: decoded.email };

      client.join(client.user.id);
    } catch (error) {
      client.disconnect();
    }
  }

  handleDisconnect(client: any) {
    client.leave(client.user.id);
  }

  @SubscribeMessage('get-chats')
  async getUserChats(@ConnectedSocket() client: AuthenticatedSocket) {
    try {
      const chats = await this.chatService.getUserChats(client.user.id);
      client.emit('get-chats', chats);
    } catch (error) {
      throw new WsException(error);
    }
  }

  @SubscribeMessage('new-chat')
  async createChat(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: any,
  ) {
    try {
      const { chat, messages, sender, receiver, last_message } =
        await this.chatService.createChat(data, client.user.id);

      client.to(data.receiver_id).emit('new-chat', {
        ...chat,
        messages,
        last_message,
        receiver: sender,
      });

      client.emit('new-chat', {
        ...chat,
        messages,
        last_message,
        receiver,
      });
    } catch (error) {
      throw new WsException(error);
    }
  }

  @SubscribeMessage('get-messages')
  async getMessages(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: any,
  ) {
    try {
      const messages = await this.chatService.getMessagesByChatId(
        client.user.id,
        data.receiver_id,
      );

      client.emit('get-messages', {
        receiver_id: data.receiver_id,
        messages,
      });
    } catch (error) {
      throw new WsException(error);
    }
  }

  @SubscribeMessage('new-message')
  async sendMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: any,
  ) {
    try {
      const { sender, message } = await this.chatService.sendMessage(
        client.user.id,
        data.receiver_id,
        data.message,
      );

      client.to(data.receiver_id).emit('new-message', {
        message,
        sender,
      });
      client.emit('new-message', {
        owner: true,
        message,
      });
    } catch (error) {
      throw new WsException(error);
    }
  }
}
