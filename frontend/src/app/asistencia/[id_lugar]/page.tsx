"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import {
  modelos,
  cargarImagenDesdeURL,
  detectarRostros,
  DescriptorRostroEtiquetado,
  ComparadorRostros,
  ajustarLienzo,
  redimensionarResultados,
} from "@/services/reconocimiento";
import { API_URL, postAsistencia } from "@/services/api";
import Navbar from "@/components/Navbar";

const personasActivas: Record<
  string,
  { entrada: string; ultimaVezVisto: number }
> = {};

interface Aula {
  id: number;
  nombre: string;
}

export default function Asistencia() {
  const { id_lugar } = useParams();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ubicacionNombre, setUbicacionNombre] = useState<string>("");

  // Ahora mantenemos un ComparadorRostros en vez de FaceMatcher
  const [comparador, setComparador] = useState<ComparadorRostros | null>(null);
  const [cargado, setCargado] = useState(false);

  useEffect(() => {
    const enviarSalidas = () => {
      for (const [nombre] of Object.entries(personasActivas)) {
        const data = JSON.stringify({
          nombre,
          id_lugar: parseInt(id_lugar as string),
          tipo: "salida",
        });
        navigator.sendBeacon(`${API_URL}/asistencias`, data);
      }
    };

    window.addEventListener("beforeunload", enviarSalidas);
    return () => {
      window.removeEventListener("beforeunload", enviarSalidas);
    };
  }, [id_lugar]);

  const getAulaNombre = async () => {
    try {
      const ubicacion = fetch(API_URL + `/ubicaciones/nombre/${id_lugar}`);
      const aula: Aula = await ubicacion.then((res) => res.json());
      setUbicacionNombre(aula.nombre);
    } catch (error) {
      console.error("Error obteniendo el nombre del aula:", error);
      return "Aula Desconocida";
    }
  };

    useEffect(() => {
        getAulaNombre();
    }, []);

  useEffect(() => {
    async function init() {
      const MODELOS_URL = "/models";
      await Promise.all([
        modelos.cargarDetector(MODELOS_URL),
        modelos.cargarPuntosFaciales(MODELOS_URL),
        modelos.cargarReconocedor(MODELOS_URL),
      ]);

      const res = await fetch(API_URL + "/usuarios");
      const personas: {
        id: string;
        nombre: string;
        imagenes: string[];
      }[] = await res.json();

      // Para cada usuario, detecto 1 rostro y genero sus descriptores etiquetados
      const descriptores: DescriptorRostroEtiquetado[] = [];
      for (const persona of personas) {
        const vectores: Float32Array[] = [];
        for (const url of persona.imagenes) {
          const img = await cargarImagenDesdeURL(url);
          const d = await detectarRostros(img);
          if (Array.isArray(d) && d[0]?.descriptor) {
            vectores.push(d[0].descriptor);
          }
        }
        if (vectores.length) {
          descriptores.push(
            new DescriptorRostroEtiquetado(persona.nombre, vectores)
          );
        }
      }

      // Creo mi comparador con esos descriptores
      setComparador(new ComparadorRostros(descriptores));
      setCargado(true);
      iniciarCamara();
    }
    init();
  }, []);

  if (!id_lugar) return null;

  const iniciarCamara = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
      });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      console.error("Error iniciando cámara:", err);
    }
  };

  const handleVideoPlay = () => {
    const video = videoRef.current!;
    const canvas = canvasRef.current!;
    if (!comparador) return;

    // Preparo canvas
    ajustarLienzo(canvas, { width: 1280, height: 720 });

    setInterval(async () => {
      // Detecto rostros en el video
      const detecciones = await detectarRostros(video);
      const resultados = redimensionarResultados(detecciones, {
        width: 1280,
        height: 720,
      });

      const ctx = canvas.getContext("2d")!;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const resultado of resultados) {
        const { x, y, width, height } = resultado.detection.box;
        // Dibujo caja
        ctx.strokeStyle = "#00ff00";
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);

        // Comparo descriptor
        const match = comparador.mejorCoincidencia(resultado.descriptor);
        const nombre =
          match.etiqueta === "unknown" ? "Desconocido" : match.etiqueta;
        // Texto
        ctx.fillStyle = "white";
        ctx.font = "30px Arial";
        ctx.fillText(nombre, x + 4, y - 5);

        const ahora = Date.now();
        if (nombre !== "Desconocido") {
          if (!personasActivas[nombre]) {
            personasActivas[nombre] = {
              entrada: new Date().toISOString(),
              ultimaVezVisto: ahora,
            };
            postAsistencia({
              nombre,
              id_lugar: parseInt(id_lugar as string),
              tipo: "entrada",
            });
          } else {
            personasActivas[nombre].ultimaVezVisto = ahora;
          }
        }
      }

      // Registro salidas tras 30 s sin verse
      const ahora = Date.now();
      for (const [nombre, datos] of Object.entries(personasActivas)) {
        if (ahora - datos.ultimaVezVisto > 30000) {
          postAsistencia({
            nombre,
            id_lugar: parseInt(id_lugar as string),
            tipo: "salida",
          });
          delete personasActivas[nombre];
        }
      }
    }, 3000);
  };

  return (
    <div className="p-6 flex flex-col items-center justify-center min-h-screen bg-gray-50 space-y-4">
      <Navbar />
      <h1 className="text-2xl font-bold mb-4">Asistencia en {ubicacionNombre}</h1>
      <p className="text-sm text-gray-600 max-w-3xl mb-4 text-center">
        Asegúrate de que tu cámara esté encendida y que el navegador tenga
        permisos para acceder a ella.
      </p>

      <div className="relative w-full max-w-3xl aspect-video mx-auto border-2 border-gray-400 rounded-lg overflow-hidden bg-black">
        {!cargado ? (
          <div className="flex items-center justify-center h-full text-white">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4" />
              <p>Cargando modelos y cámara...</p>
            </div>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              width={720}
              height={560}
              muted
              autoPlay
              onPlay={handleVideoPlay}
              className="absolute top-0 left-0 w-full h-full object-contain"
            />
            <canvas
              ref={canvasRef}
              width={720}
              height={560}
              className="absolute top-0 left-0 w-full h-full"
            />
          </>
        )}
      </div>
    </div>
  );
}
