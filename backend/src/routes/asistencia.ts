import { PrismaClient } from "@prisma/client";
import { Router, Request, Response } from "express";

const router = Router();
const prisma = new PrismaClient();

router.post("/", async (req: Request, res: Response) => {
    const { nombre, tipo, id_lugar } = req.body;
    let usuario = await prisma.usuario.findFirst({ where: { nombre } });
    if (!usuario) {
        usuario = await prisma.usuario.create({ data: { nombre } });
    }

    if (tipo === "entrada") {
        const asistencia = await prisma.asistencia.create({
            data: {
                id_usuario: usuario.id,
                id_lugar,
                hora_entrada: new Date(),
                hora_salida: null
            }
        });
        return res.status(201).json(asistencia);
    } else {
        const asistencia = await prisma.asistencia.findFirst({
            where: {
                id_usuario: usuario.id,
                id_lugar,
                hora_salida: null
            }
        });

        if (!asistencia) {
            return res.status(400).json({ error: "No hay registro de entrada abierto" });
        }

        const asistenciaActualizada = await prisma.asistencia.update({
            where: { id: asistencia.id },
            data: {
                hora_salida: new Date()
            }
        });
        return res.status(200).json(asistenciaActualizada);
    }
})

router.get("/", async (req: Request, res: Response) => {
    const asistencias = await prisma.asistencia.findMany({
        include: {
            usuario: true,
            lugar: true
        }
    });
    res.json(asistencias);
})


export default router;