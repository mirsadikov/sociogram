import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import userRoute from './routes/user.route.js';
import postRoute from './routes/post.route.js';
import followRoute from './routes/follows.route.js';
import errorHandler from './middlewares/error.middleware.js';

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());
app.use('/user', userRoute);
app.use('/post', postRoute);
app.use('/follow', followRoute);

app.get('/', (req, res) => {
  res.end('OK');
});

app.use(errorHandler);

app.listen(process.env.PORT, (err) => {
  if (err) console.error(err);
  console.log(`Server listening on port ${process.env.PORT}`);
});
