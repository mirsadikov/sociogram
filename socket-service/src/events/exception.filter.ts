import { Catch, ArgumentsHost, WsExceptionFilter } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Catch(WsException)
export class ExceptionFilter implements WsExceptionFilter {
  catch(exception: WsException, host: ArgumentsHost) {
    const client: Socket = host.switchToWs().getClient();
    const errorMessage = exception.getError();
    client.emit('exception', { message: errorMessage });
  }
}
