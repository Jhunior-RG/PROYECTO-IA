import { PrismaClient } from "@prisma/client";
import { Router, Request, Response } from "express";

const router = Router();
const prisma = new PrismaClient();

router.get("/", async (req: Request, res: Response) => {
    const ubicaciones = await prisma.lugar.findMany();
    res.json(ubicaciones);
});

router.post("/", async (req: Request, res: Response) => {
    const { nombre } = req.body;
    const ubicacion = await prisma.lugar.create({ data: { nombre } });
    res.json(ubicacion);
})

// obtener 
router.get('/actuales', async (req: Request, res: Response) => {

    const lugares = await prisma.lugar.findMany({
        include: {
            asistencias: {
                include: {
                    usuario: true
                },
                where: {
                    hora_entrada: { not: null },
                    hora_salida: null
                }
            }
        }
    });
    res.json(lugares);
})

export default router;