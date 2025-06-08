## Configuración y arranque

### 1. Backend (FastAPI)

1. Entra al directorio e instala dependencias:

```
cd backend
python -m venv .venv

.venv\Scripts\activate

pip install -r requirements.txt
```

2.Arranca el servidor en modo desarrollo:

`uvicorn main:app --reload
`

## 2. Frontend (Next.js)

Entra al directorio e instala dependencias:

`cd frontend

npm install`

Arranca la app en desarrollo:
`npm run dev`

## Como usar

Ingrese a http://localhost:3000

luego ingrese a registrar
registre su nombre y agregue fotos

vuelva a la pagina principal
haga clic en comenzar seleccione el lugar en que hara el reconocimiento
