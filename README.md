
## Estructura del proyecto

```text
mi-proyecto/
├── backend/        # API FastAPI
│   ├── main.py
│   ├── routers/
│   ├── models/
│   ├── db/
│   ├── requirements.txt
│   └── .venv/
├── frontend/       # App Next.js
│   ├── app/
│   ├── components/
│   ├── public/
│   ├── package.json
│   └── node_modules/
├── .gitignore
└── README.md       # Este archivo
````

---

## 🛠 Prerrequisitos

* **Python 3.10+**
* **Node.js 16+**
* **Git**

---

## ⚙️ Configuración y arranque

### 1. Backend (FastAPI + Uvicorn)

1. **Crear y activar entorno virtual**

   ```bash
   cd backend
   python -m venv .venv

   .venv\Scripts\activate

   ```

2. **Instalar dependencias**

   ```bash
   pip install -r requirements.txt
   ```

3. **Arrancar el servidor**

   ```bash
   uvicorn main:app --reload
   ```

   * Por defecto corre en: `http://127.0.0.1:8000`

---

### 2. Frontend (Next.js)

1. **Instalar dependencias**

   ```bash
   cd ../frontend
   npm install
   ```

2. **Arrancar la aplicación**

   ```bash
   npm run dev
   ```

   * Por defecto corre en: `http://localhost:3000`

---

## 🚀 Cómo usar

1. Abre tu navegador en `http://localhost:3000`.
2. En la barra de navegación, haz clic en **Registrar**:

   * Introduce tu nombre.
   * Sube una o varias fotos de tu rostro.
3. Regresa a la **Home** y pulsa **Comenzar**:

   * Selecciona el aula donde realizarás el reconocimiento.
   * Se iniciará la cámara y, al detectar tu cara, registrará automáticamente tus entradas y salidas.

---

## 📋 Endpoints clave

| Método | Ruta                        | Descripción                                   |
| ------ | --------------------------- | --------------------------------------------- |
| POST   | `/api/usuarios/register`    | Registra un nuevo usuario y guarda sus fotos. |
| GET    | `/api/usuarios`             | Lista usuarios con URLs a sus imágenes.       |
| POST   | `/api/asistencia`           | Registra un evento de entrada o salida.       |
| GET    | `/api/ubicaciones/actuales` | Muestra quiénes están dentro de cada aula.    |
| GET    | `/api/ubicaciones`          | Listado de aulas y personas presentes.        |
| GET    | `/api/historial`            | Historial completo de asistencias.            |

---

## 💡 Buenas prácticas

* Mantén el archivo `requirements.txt` con versiones fijas para asegurar reproducibilidad.
* Usar `uvicorn main:app --reload` en lugar de `fastapi run` para mayor compatibilidad.
* Añade a `.gitignore` cualquier carpeta o archivo sensible (por ejemplo, `.env`, archivos DB locales, `.venv/`).
* Documenta cualquier variable de entorno necesaria (p.ej., `DATABASE_URL`) en un archivo `.env.example`.


