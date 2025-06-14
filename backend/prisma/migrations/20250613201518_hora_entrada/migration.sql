-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Asistencia" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_usuario" INTEGER NOT NULL,
    "id_lugar" INTEGER NOT NULL,
    "hora_entrada" DATETIME,
    "hora_salida" DATETIME,
    CONSTRAINT "Asistencia_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Asistencia_id_lugar_fkey" FOREIGN KEY ("id_lugar") REFERENCES "Lugar" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Asistencia" ("hora_entrada", "hora_salida", "id", "id_lugar", "id_usuario") SELECT "hora_entrada", "hora_salida", "id", "id_lugar", "id_usuario" FROM "Asistencia";
DROP TABLE "Asistencia";
ALTER TABLE "new_Asistencia" RENAME TO "Asistencia";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
