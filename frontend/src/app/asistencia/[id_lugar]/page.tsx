"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Rune from "rune";
import { API_URL, postAsistencia } from "@/services/api";
import Navbar from "@/components/Navbar";

interface Aula {
    id: number;
    nombre: string;
}
const personasActivas: Record<
    string,
    { entrada: string; ultimaVezVisto: number }
> = {};

class DescriptorEtiquetado {
    constructor(public etiqueta: string, public vectores: Float32Array[]) {}

    aFormatoOriginal() {
        return new Rune.types.LabeledDescriptor(this.etiqueta, this.vectores);
    }
}

class ComparadorVectores {
    private comparador: InstanceType<typeof Rune.types.Matcher>;

    constructor(lista: DescriptorEtiquetado[], umbral: number = 0.6) {
        const originales =
            lista.length > 0
                ? lista.map((d) => d.aFormatoOriginal())
                : [
                      new Rune.types.LabeledDescriptor("Desconocido", [
                          new Float32Array(128),
                      ]),
                  ];

        this.comparador = new Rune.types.Matcher(originales, umbral);
    }

    mejorCoincidencia(descriptor: Float32Array) {
        const resultado = this.comparador.findBestMatch(descriptor);
        return {
            etiqueta: resultado.label,
            certeza: 1 - resultado.distance,
        };
    }
}

export default function Asistencia() {
    const { id_lugar } = useParams();
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [ubicacionNombre, setUbicacionNombre] = useState<string>("");
    const [comparador, setComparador] = useState<ComparadorVectores | null>(
        null
    );
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
            const ubicacion = fetch(
                API_URL + `/ubicaciones/nombre/${id_lugar}`
            );
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
            const MODEL_URL = "modelo_hog_caras.pth";
            await Rune.loadModel(MODEL_URL);

            const res = await fetch(API_URL + "/usuarios");
            const personas: {
                id: string;
                nombre: string;
                imagenes: string[];
            }[] = await res.json();

            const descriptores: DescriptorEtiquetado[] = [];

            for (const persona of personas) {
                const vectores: Float32Array[] = [];
                for (const url of persona.imagenes) {
                    const img = await Rune.io.fetchImageFrom(url);
                    const detecciones = await Rune.pipeline.processAll(img);
                    if (
                        Array.isArray(detecciones) &&
                        detecciones[0]?.descriptor
                    ) {
                        vectores.push(detecciones[0].descriptor);
                    }
                }
                if (vectores.length) {
                    descriptores.push(
                        new DescriptorEtiquetado(persona.nombre, vectores)
                    );
                }
            }

            setComparador(new ComparadorVectores(descriptores));
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

        Rune.io.resizeCanvasTo(canvas, { width: 1280, height: 720 });

        setInterval(async () => {
            const detecciones = await Rune.pipeline.processAll(video);
            const resultados = Rune.io.scaleOutputs(detecciones, {
                width: 1280,
                height: 720,
            });

            const ctx = canvas.getContext("2d")!;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            let i = 0;
            for (const resultado of resultados) {
                const match = comparador.mejorCoincidencia(
                    resultado.descriptor
                );
                const nombre =
                    match.etiqueta === "unknown"
                        ? "Desconocido"
                        : match.etiqueta;
                if (nombre === "unknown" || nombre === "Desconocido") continue;
                ctx.fillStyle = "white";
                ctx.font = "30px Arial";
                ctx.fillText(nombre,30 + 100 * i, 30);

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
                i += 1;
            }

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
            <h1 className="text-2xl font-bold mb-4">
                Asistencia en {ubicacionNombre}
            </h1>
            <p className="text-sm text-gray-600 max-w-3xl mb-4 text-center">
                Asegúrate de que tu cámara esté encendida y que el navegador
                tenga permisos para acceder a ella.
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
