import http from 'http';
import { Server } from 'socket.io';

const server = http.createServer((req, res) => res.end('OK'));

const io = new Server(server);

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('chat message', (msg) => {
    console.log(`Message: ${msg}`);
    io.emit('chat message', msg);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

server.listen(process.env.PORT, (err) => {
  if (err) console.error(err);
  console.log(`Server listening on port ${process.env.PORT}`);
});
