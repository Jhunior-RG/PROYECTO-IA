"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
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
    const searchParams = useSearchParams();
    const selectedAula = searchParams.get("Aula") || "Aula 1";

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [faceMatcher, setFaceMatcher] = useState<faceapi.FaceMatcher | null>(
        null
    );
    const [cargado, setCargado] = useState(false);

    // 1️⃣ Carga de modelos y personas
    const iniciarCamara = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error("Error al iniciar la cámara:", err);
        }
    };
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

    // 3️⃣ Reconocimiento facial y registro
    const handleVideoPlay = () => {
        const video = videoRef.current!;
        const canvas = canvasRef.current!;
        if (!faceMatcher) return;

        faceapi.matchDimensions(canvas, {
            width: video.width,
            height: video.height,
        });

        setInterval(async () => {
            const dets = await faceapi
                .detectAllFaces(video)
                .withFaceLandmarks()
                .withFaceDescriptors();
            const resized = faceapi.resizeResults(dets, {
                width: video.width,
                height: video.height,
            });

            const ctx = canvas.getContext("2d")!;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            for (const d of resized) {
                const match = faceMatcher.findBestMatch(d.descriptor);
                const { x, y, width, height } = d.detection.box;

                ctx.strokeStyle = "#00ff00";
                ctx.lineWidth = 2;
                ctx.strokeRect(x, y, width, height);

                const label =
                    match.label === "unknown" ? "Desconocido" : match.label;
                ctx.font = "16px Arial";
                ctx.fillStyle = "white";
                ctx.fillText(`${label} - ${selectedAula}`, x + 4, y - 5);
                const ahora = Date.now();
                const nombre = match.label;

                if (nombre !== "unknown") {
                    if (!personasActivas[nombre]) {
                        // Nueva detección → entrada
                        personasActivas[nombre] = {
                            entrada: new Date().toISOString(),
                            ultimaVezVisto: ahora,
                        };

                        // Registro entrada
                        const data: AsistenciaData = {
                            nombre,
                            aula: selectedAula,
                            tipo: "entrada",
                            fecha: personasActivas[nombre].entrada,
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
                    const salidaIso = new Date().toISOString();
                    const data: AsistenciaData = {
                        nombre,
                        aula: selectedAula,
                        tipo: "salida",
                        fecha: salidaIso,
                    };
                    console.log(data);
                    postAsistencia(data);
                    delete personasActivas[nombre];
                }
            }
        }, 3000);
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">
                Asistencia en {selectedAula}
            </h1>

            <div className="relative border w-[720px] h-[560px]">
                {!cargado ? (
                    <div className="flex items-center justify-center h-full">
                        <p>Cargando...</p>
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
                            className="absolute top-0 left-0 w-full h-full object-cover"
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
