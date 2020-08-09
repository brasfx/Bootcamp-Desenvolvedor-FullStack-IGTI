import express from 'express';
import mongoose from 'mongoose';
import { router } from './routes/accountRouter.js';
import dotenv from 'dotenv';

dotenv.config();

const port = 3000;
const app = express();

const mongodbAtlas = async () => {
  try {
    await mongoose.connect(
      `mongodb+srv://${process.env.USERDB}:${process.env.PSWDB}@bootcampigti-rq8t9.mongodb.net/mybankapi?retryWrites=true&w=majority`,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
    console.log('Atlas conectado com sucesso!');
  } catch (error) {
    console.log('Erro ao conectar');
    mongoose.disconnect();
  }
};

app.use(express.json());
app.use(router);
app.listen(port, () => {
  console.log('API iniciada!');
});

mongodbAtlas();
