import { PrismaClient } from "@prisma/client";
import { Router, Request, Response } from "express";

const router = Router();
const prisma = new PrismaClient();

router.get("/", async (req: Request, res: Response) => {
    const ubicaciones = await prisma.lugar.findMany();
    res.json(ubicaciones);
});

router.get("/:id", async (req: Request, res: Response) => {
    const { id } = req.params;
    const ubicacion = await prisma.lugar.findUnique({
        where: { id: Number(id) },
        
    });
    if (!ubicacion) {
        return res.status(404).json({ error: "Ubicación no encontrada" });
    }
    res.json(ubicacion);
});

router.post("/", async (req: Request, res: Response) => {
    const { nombre } = req.body;
    const ubicacion = await prisma.lugar.create({ data: { nombre } });
    res.json(ubicacion);
})

// obtener 
router.get('/actuales', async (req: Request, res: Response) => {
    // Primero obtenemos todas las asistencias sin salida
    const asistenciasSinSalida = await prisma.asistencia.findMany({
        where: { hora_salida: null },
        orderBy: { hora_entrada: 'desc' }
    });

    // Agrupamos por usuario y actualizamos todas excepto la más reciente
    const asistenciasPorUsuario = new Map();
    asistenciasSinSalida.forEach(asistencia => {
        if (!asistenciasPorUsuario.has(asistencia.id_usuario)) {
            asistenciasPorUsuario.set(asistencia.id_usuario, []);
        }
        asistenciasPorUsuario.get(asistencia.id_usuario).push(asistencia);
    });

    // Actualizamos todas las asistencias excepto la más reciente de cada usuario
    for (const [_, asistencias] of asistenciasPorUsuario) {
        if (asistencias.length > 1) {
            const idsParaActualizar = asistencias.slice(1).map((a: { id: number }) => a.id);
            await prisma.asistencia.updateMany({
                where: {
                    id: { in: idsParaActualizar }
                },
                data: {
                    hora_salida: new Date(new Date().getTime() + 30000)
                }
            });
        }
    }

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