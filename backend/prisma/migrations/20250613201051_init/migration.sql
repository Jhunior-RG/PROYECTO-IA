-- CreateTable
CREATE TABLE "Usuario" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT
);

-- CreateTable
CREATE TABLE "Asistencia" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_usuario" INTEGER NOT NULL,
    "id_lugar" INTEGER NOT NULL,
    "hora_entrada" DATETIME NOT NULL,
    "hora_salida" DATETIME NOT NULL,
    CONSTRAINT "Asistencia_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Asistencia_id_lugar_fkey" FOREIGN KEY ("id_lugar") REFERENCES "Lugar" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Lugar" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL
);
