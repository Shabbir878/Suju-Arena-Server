import express from 'express';
import cors from 'cors';
import router from './app/routes';
import notFound from './app/middleware/Notfound';
import globalErrorhandler from './app/middleware/globalErrorhandler';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/', router);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use(globalErrorhandler);
app.use(notFound);
export default app;
