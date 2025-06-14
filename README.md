# 📚 README
## Estructura del proyecto

```text
mi-proyecto/
├── backend/           # API Express + TypeScript + Prisma
│   ├── prisma/        # schema.prisma, migrations/, seed.ts
│   ├── src/
│   │   ├── index.ts   # punto de entrada
│   │   └── routes/    # usuarios.ts, asistencia.ts, ubicaciones.ts…
│   ├── .env           # DATABASE_URL, PORT…
│   ├── package.json
│   └── tsconfig.json
├── frontend/          # App Next.js (React 18)
│   ├── app/
│   ├── components/
│   ├── public/
│   └── package.json
├── .gitignore
└── README.md          # este archivo
````

---

## 🛠 Prerrequisitos

| Herramienta | Versión mínima |
| ----------- | -------------- |
| **Node.js** | 18 LTS         |
| **npm**     | 9 +            |
| **Git**     | —              |

>Prisma usa SQLite por defecto. (Cambia a PostgreSQL añadiendo otra cadena `DATABASE_URL`).

---

## ⚙️ Configuración y arranque

### 1. Backend (Express + Prisma)

```bash
# 1.1  Instalar dependencias
cd backend
npm install

# 1.2  Crear la base de datos y generar cliente
npx prisma migrate dev --name init   # crea dev.db + migraciones
# (Opcional) npx prisma db seed      # si tienes prisma/seed.ts

# 1.3  Arrancar en modo desarrollo (hot-reload)
npm run dev    # ts-node-dev src/index.ts
```

* Escucha en: **[http://localhost:4000](http://localhost:4000)**

---

### 2. Frontend (Next.js)

```bash
cd ../frontend
npm install
npm run dev
```

* Escucha en: **[http://localhost:3000](http://localhost:3000)**

---

## 🚀 Cómo usar

1. Visita **[http://localhost:3000](http://localhost:3000)**.
2. En la barra, haz clic en **Registrar** y sube una o varias fotos.
3. Vuelve al inicio y pulsa **Comenzar**:

   * Selecciona el aula.
   * La cámara detectará tu rostro y registrará **entradas** y **salidas** de forma automática.

---

## 📋 Endpoints clave (Express API)

| Método | Ruta                        | Descripción                                |
| ------ | --------------------------- | ------------------------------------------ |
| POST   | `/api/usuarios/register`    | Registra usuario y sube fotos              |
| GET    | `/api/usuarios`             | Devuelve usuarios + URLs de imágenes       |
| POST   | `/api/asistencia`           | Crea evento de **entrada** o **salida**    |
| GET    | `/api/ubicaciones/actuales` | Lista quiénes están presentes en cada aula |
| GET    | `/api/ubicaciones`          | CRUD/Lectura de aulas                      |
| GET    | `/api/historial`            | Historial completo con filtros opcionales  |
