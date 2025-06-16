import { PrismaClient } from "@prisma/client";
import { Router, Request, Response } from "express";

const router = Router();
const prisma = new PrismaClient();

router.post("/", async (req: Request, res: Response) => {
  let body: any;

  // Detectamos si el body viene como texto plano (enviar desde sendBeacon)
  if (req.headers["content-type"] === "text/plain") {
    try {
      body = JSON.parse(req.body);
    } catch (e) {
      console.error("Body inválido:", req.body);
      return res.status(400).json({ error: "Body inválido" });
    }
  } else {
    body = req.body; // Normal si vino con application/json
  }

  const { nombre, tipo, id_lugar } = body;

  if (!nombre || !tipo || !id_lugar) {
    return res.status(400).json({ error: "Faltan campos obligatorios" });
  }

  try {
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
          hora_salida: null,
        },
      });
      return res.status(201).json(asistencia);
    } else if (tipo === "salida") {
      const asistencia = await prisma.asistencia.findFirst({
        where: {
          id_usuario: usuario.id,
          id_lugar,
          hora_salida: null,
        },
      });

      if (!asistencia) {
        return res.status(400).json({ error: "No hay entrada abierta" });
      }

      const asistenciaActualizada = await prisma.asistencia.update({
        where: { id: asistencia.id },
        data: { hora_salida: new Date() },
      });

      return res.status(200).json(asistenciaActualizada);
    } else {
      return res.status(400).json({ error: "Tipo inválido" });
    }
  } catch (error) {
    console.error("Error en backend:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
});


router.get("/", async (req: Request, res: Response) => {
  const asistencias = await prisma.asistencia.findMany({
    include: {
      usuario: true,
      lugar: true,
    },
  });
  res.json(asistencias);
});

export default router;
