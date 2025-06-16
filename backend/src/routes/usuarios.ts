import { PrismaClient } from "@prisma/client";
import cloudinary from "../lib/cloudinary";
import { Router, Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = Router();
const prisma = new PrismaClient();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../../uploads", "temp");
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueFilename = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueFilename);
  },
});

const upload = multer({ storage });

router.get("/", async (req: Request, res: Response) => {
  try {
    const users = await prisma.usuario.findMany({
      include: {
        fotos: true, // Incluye todas las fotos relacionadas
      },
    });

    const usersWithImages = users.map((user) => ({
      id: user.id,
      nombre: user.nombre,
      perfil: user.perfil,
      imagenes: user.fotos.map((foto) => foto.url),
    }));

    res.json(usersWithImages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al listar usuarios" });
  }
});

router.post("/", upload.array("files"), async (req, res) => {
  try {
    const { nombre } = req.body;

    // 1. Buscar o crear el usuario
    let user = await prisma.usuario.findFirst({ where: { nombre } });

    if (!user) {
      user = await prisma.usuario.create({ data: { nombre } });
    }

    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res.status(400).json({ error: "No se subió ninguna imagen." });
    }

    const uploadedUrls: string[] = [];

    // 2. Subir todas las imágenes a Cloudinary
    for (const file of files) {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: `usuarios/${user.id}`,
        public_id: `foto-${Date.now()}-${Math.random()
          .toString(36)
          .substring(2, 7)}`,
      });

      // 3. Guardar cada imagen en la tabla Foto
      await prisma.foto.create({
        data: {
          url: result.secure_url,
          usuario: {
            connect: { id: user.id },
          },
        },
      });

      uploadedUrls.push(result.secure_url);

      // 4. Eliminar archivo temporal
      fs.unlinkSync(file.path);
    }

    // 5. Actualizar perfil con la primera imagen
    const perfilUrl = uploadedUrls[0];

    const updatedUser = await prisma.usuario.update({
      where: { id: user.id },
      data: { perfil: perfilUrl },
      include: { fotos: true }, // opcional: para devolver también las fotos
    });

    res.status(201).json({ ok: true, user: updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al registrar usuario" });
  }
});

export async function handleClientDisconnect(userId: number, id_lugar: number) {
  const asistencia = await prisma.asistencia.findFirst({
    where: { id_usuario: userId, id_lugar: id_lugar, hora_salida: null },
    orderBy: { hora_entrada: "desc" },
  });
  if (asistencia && asistencia.hora_entrada) {
    await prisma.asistencia.update({
      where: { id: asistencia.id },
      data: {
        hora_salida: new Date(asistencia.hora_entrada.getTime() + 30000), // 30 segundos = 30000 ms
      },
    });
    console.log(`Salida registrada de user ${userId}`);
  }
}

export default router;
