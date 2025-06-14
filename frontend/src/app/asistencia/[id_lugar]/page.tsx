"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import * as faceapi from "face-api.js";
import { API_URL, postAsistencia, type AsistenciaData } from "@/services/api";

const personasActivas: Record<
    string,
    {
        entrada: string;
        ultimaVezVisto: number;
    }
> = {};

export default function Asistencia() {
    const { id_lugar } = useParams();

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [faceMatcher, setFaceMatcher] = useState<faceapi.FaceMatcher | null>(
        null
    );
    const [cargado, setCargado] = useState(false);
    useEffect(() => {
        async function init() {
            const MODEL_URL = "/models";
            await Promise.all([
                faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
                faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
                faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
            ]);

            const res = await fetch(API_URL + "/usuarios");
            const personas: {
                id: string;
                nombre: string;
                imagenes: string[];
            }[] = await res.json();

            const descriptors: faceapi.LabeledFaceDescriptors[] = [];
            for (const persona of personas) {
                const descs: Float32Array[] = [];
                for (const urlImage of persona.imagenes) {
                    const img = await faceapi.fetchImage(urlImage);
                    const d = await faceapi
                        .detectSingleFace(img)
                        .withFaceLandmarks()
                        .withFaceDescriptor();
                    if (d) descs.push(d.descriptor);
                }
                if (descs.length) {
                    descriptors.push(
                        new faceapi.LabeledFaceDescriptors(
                            persona.nombre,
                            descs
                        )
                    );
                }
            }

            setFaceMatcher(new faceapi.FaceMatcher(descriptors));
            setCargado(true);
            iniciarCamara();
        }

        init();
    }, []);

    const handleBeforeUnload = () => {
        for (const nombre in personasActivas) {
            const data = JSON.stringify({
                nombre,
                id_lugar,
                tipo: "salida",
            });
            const blob = new Blob([data], { type: "application/json" });
            navigator.sendBeacon(API_URL + "/asistencia", blob);
        }
    };

    useEffect(() => {
        window.addEventListener("pagehide", handleBeforeUnload);
        return () => {
            window.removeEventListener("pagehide", handleBeforeUnload);
        };
    }, [id_lugar]);
    
    if (!id_lugar) return;
    // Iniciar cámara con resolución 16:9
    const iniciarCamara = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                },
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error("Error al iniciar la cámara:", err);
        }
    };

    // Reconocimiento facial y registro
    const handleVideoPlay = () => {
        const video = videoRef.current!;
        const canvas = canvasRef.current!;
        if (!faceMatcher) return;

        faceapi.matchDimensions(canvas, {
            width: 1280,
            height: 720,
        });

        setInterval(async () => {
            const dets = await faceapi
                .detectAllFaces(video)
                .withFaceLandmarks()
                .withFaceDescriptors();
            const resized = faceapi.resizeResults(dets, {
                width: 1280,
                height: 720,
            });

            const ctx = canvas.getContext("2d")!;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            for (const d of resized) {
                const match = faceMatcher.findBestMatch(d.descriptor);
                const { x, y, width, height } = d.detection.box;

                // Dibujar rectángulo de detección
                ctx.strokeStyle = "#00ff00";
                ctx.lineWidth = 2;
                ctx.strokeRect(x, y, width, height);

                const label =
                    match.label === "unknown" ? "Desconocido" : match.label;
                const texto = `${label} `;

                // Texto simple sin formato
                ctx.fillStyle = "white";
                ctx.font = "30px Arial";
                ctx.fillText(texto, x + 4, y - 5);

                const ahora = Date.now();
                const nombre = match.label;

                if (nombre !== "unknown") {
                    if (!personasActivas[nombre]) {
                        personasActivas[nombre] = {
                            entrada: new Date().toISOString(),
                            ultimaVezVisto: ahora,
                        };

                        const data: AsistenciaData = {
                            nombre,
                            id_lugar: parseInt(id_lugar as string),
                            tipo: "entrada",
                        };
                        console.log(data);

                        postAsistencia(data);
                    } else {
                        // Solo actualizar último visto
                        console.log(
                            "actualizando ultima vez visto de ",
                            nombre
                        );
                        personasActivas[nombre].ultimaVezVisto = ahora;
                    }
                }
            }
            const ahora = Date.now();
            for (const [nombre, datos] of Object.entries(personasActivas)) {
                if (ahora - datos.ultimaVezVisto > 30000) {
                    // Persona ha salido (más de 30s sin verla)
                    const data: AsistenciaData = {
                        nombre,
                        id_lugar: 1,
                        tipo: "salida",
                    };
                    postAsistencia(data);
                    delete personasActivas[nombre];
                }
            }
        }, 3000);
    };

    return (
        <div className="p-6 flex flex-col items-center justify-center min-h-screen bg-gray-50 space-y-4">
            <h1 className="text-2xl font-bold mb-4">
                Asistencia en {id_lugar}
            </h1>
            <p className="text-sm text-gray-600 max-w-3xl mb-4 text-center">
                Asegúrate de que tu cámara esté encendida y que el navegador
                tenga permisos para acceder a ella. El reconocimiento facial se
                activará automáticamente al detectar rostros.
            </p>

            <div className="relative w-full max-w-3xl aspect-video mx-auto border-2 border-gray-400 rounded-lg overflow-hidden bg-black">
                {!cargado ? (
                    <div className="flex items-center justify-center h-full text-white">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                            <p>Cargando modelos y cámara...</p>
                        </div>
                    </div>
                ) : (
                    <div className="relative w-full h-full">
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
                    </div>
                )}
            </div>

            <div className="text-sm text-gray-500 text-center space-y-2">
                {Object.keys(personasActivas).length > 0 && (
                    <div className="bg-gray-100 rounded-lg p-3 max-w-md mx-auto">
                        <p className="text-xs font-semibold mb-2">
                            Personas detectadas:
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {Object.entries(personasActivas).map(([nombre]) => (
                                <span
                                    key={nombre}
                                    className="bg-green-500 text-white px-2 py-1 rounded-full text-xs"
                                >
                                    {nombre}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
