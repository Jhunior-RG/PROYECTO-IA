import { PrismaClient } from "@prisma/client";
import { Router, Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = Router();
const prisma = new PrismaClient();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../../uploads', 'temp');
        fs.mkdirSync(uploadDir, { recursive: true });
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueFilename = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueFilename);
    }
});

const upload = multer({ storage });

router.get('/', async (req: Request, res: Response) => {
    try {
        const users = await prisma.usuario.findMany();
        const baseUrl = `${req.protocol}://${req.get('host')}`;

        const usersWithImages = await Promise.all(users.map(async (user) => {
            const userDir = path.join(__dirname, '../../uploads', user.id.toString());
            let imagenes_urls: string[] = [];

            if (fs.existsSync(userDir)) {
                const files = fs.readdirSync(userDir);
                imagenes_urls = files.map(file =>
                    `${baseUrl}/uploads/${user.id}/${file}`
                );
            }

            return {
                id: user.id,
                nombre: user.nombre,
                imagenes: imagenes_urls
            };
        }));

        res.json(usersWithImages);
    } catch (error) {
        res.status(500).json({ error: 'Error al listar usuarios' });
    }
});
router.post('/', upload.array('files'), async (req, res) => {
    try {
        const { nombre } = req.body;

        let user = await prisma.usuario.findFirst({
            where: { nombre }
        });

        if (!user) {
            user = await prisma.usuario.create({ data: { nombre } });
        }

        const files = req.files as Express.Multer.File[];
        const tempDir = path.join(__dirname, '../../uploads', 'temp');
        const userDir = path.join(__dirname, '../../uploads', user.id.toString());
        fs.mkdirSync(userDir, { recursive: true });

        const saved_filenames: string[] = [];

        for (const file of files) {
            const tempPath = path.join(tempDir, file.filename);
            const destPath = path.join(userDir, file.filename);
            fs.renameSync(tempPath, destPath);
            saved_filenames.push(file.filename);
        }

        res.status(201).json({ ok: true, user, filenames: saved_filenames });
    } catch (error) {
        res.status(500).json({ error: 'Error al registrar usuario' });
    }
});

export default router;