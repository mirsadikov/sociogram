import cookieParser from 'cookie-parser';
import myExpress from './myExpress.js';
import userRoute from './routes/user.route.js';
import postRoute from './routes/post.route.js';
import followRoute from './routes/follows.route.js';
import errorHandler from './middlewares/error.middleware.js';
import { PORT } from './config/secrets.js';

// this is my custom server in express style
const app = myExpress();

app.use(cookieParser());
app.use(myExpress.json());
app.use('/user', userRoute);
app.use('/post', postRoute);
app.use('/follow', followRoute);

app.get('/', (req, res) => {
  res.end('OK');
});

app.use(errorHandler);

app.listen(PORT, (err) => {
  if (err) console.error(err);
  console.log(`Server listening on port ${PORT}`);
});
