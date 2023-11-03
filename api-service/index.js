const http = require('http');

const server = http.createServer((req, res) => {
  res.end('Hello from api-service');
});

server.listen(process.env.PORT, () => {
  console.log('Server listening on port 3000');
});