import express from 'express';
import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import morgan from 'morgan';
import path from 'path';
import usuarios from './routes/usuarios';
import cors from 'cors';
import ubicaciones from './routes/ubicaciones';
import asistencia from './routes/asistencia';

const app = express();
app.use(morgan('dev'));
app.use(cors());

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use("/usuarios", usuarios);
app.use("/ubicaciones", ubicaciones);
app.use("/asistencia", asistencia);

app.get('/', (req: Request, res: Response): void => {
    res.send('Hello Express + TS + SQLite + Prisma!');
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () =>
    console.log(`Servidor en http://localhost:`, PORT)
);
