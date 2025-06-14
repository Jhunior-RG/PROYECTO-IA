import express from 'express';
import type { Request, Response } from 'express';
import morgan from 'morgan';
import path from 'path';
import usuarios from './routes/usuarios';
import cors from 'cors';
import ubicaciones from './routes/ubicaciones';
import asistencia from './routes/asistencia';

const PORT = process.env.PORT || 4000;
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

app.listen(PORT, () =>
    console.log(`Servidor en http://localhost:${PORT}`)
);