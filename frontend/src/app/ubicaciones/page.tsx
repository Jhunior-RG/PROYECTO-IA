"use client";

import { API_URL } from "@/services/api";
import { useEffect, useState } from "react";
import { FaMapMarkerAlt, FaClock, FaUser } from "react-icons/fa";

export interface Usuario {
    id: number;
    nombre: string;
}
export interface Lugar {
    id: number;
    nombre: string;
    asistencias: Asistencia[];
}
export interface Asistencia {
    hora_entrada: string;
    hora_salida: string;
    id: number;
    id_lugar: number;
    id_usuario: number;
    lugar?: Lugar;
    usuario?: Usuario;
}

export default function MiniMapa() {
    const [actuales, setActuales] = useState<Lugar[]>([]);
    const [loading, setLoading] = useState(true);

    // Formatea ISO string a hora local sin milisegundos
    const formatTime = (iso: string) => {
        const d = new Date(iso);
        return d.toLocaleTimeString("es-BO", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    useEffect(() => {
        let isFirst = true;

        const fetchData = async () => {
            // Solo mostramos spinner la primera vez
            if (isFirst) setLoading(true);

            try {
                const res = await fetch(API_URL + `/ubicaciones/actuales`);
                const data: Lugar[] = await res.json();

                setActuales(data);
            } catch (err) {
                console.error(err);
            } finally {
                if (isFirst) {
                    setLoading(false);
                    isFirst = false;
                }
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
                <FaClock className="animate-spin text-5xl text-blue-600 mb-4" />
                <p className="text-gray-700 text-lg">Cargando mapa…</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
                <FaClock className="animate-spin text-5xl text-blue-600 mb-4" />
                <p className="text-gray-700 text-lg">Cargando mapa…</p>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 p-6 mt-12">
            <header className="flex flex-col sm:flex-row items-center justify-between mb-8">
                <div className="flex items-center mb-4 sm:mb-0">
                    <FaMapMarkerAlt className="text-red-500 text-3xl mr-2" />
                    <h1 className="text-3xl font-extrabold text-gray-800">
                        Mini Mapa de Ubicaciones
                    </h1>
                </div>
                <span className="flex items-center text-gray-600">
                    <FaClock className="mr-1" /> Actualización cada 5s
                </span>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 max-w-7xl mx-auto">
                {actuales.map((lugar) => {
                    const count = lugar?.asistencias.length || 0;
                    const occupied = count > 0;

                    return (
                        <div
                            key={lugar.id}
                            className={`
                relative bg-white rounded-lg shadow-md p-5
                transition-transform transform hover:scale-105 hover:shadow-lg
              `}
                        >
                            {/* Badge con la cuenta */}
                            <div
                                className={`
                  absolute top-3 right-3 flex items-center justify-center
                  w-6 h-6 rounded-full text-xs font-semibold
                  ${
                      occupied
                          ? "bg-green-500 text-white"
                          : "bg-gray-300 text-gray-600"
                  }
                `}
                            >
                                {count}
                            </div>

                            <h2 className="text-xl font-bold mb-4 text-gray-800">
                                {lugar.nombre}
                            </h2>

                            {occupied ? (
                                <ul className="space-y-3 max-h-48 overflow-y-auto pr-2">
                                    {lugar.asistencias.map((asistencia) => (
                                        <li
                                            key={asistencia.id}
                                            className="flex items-center bg-gray-100 rounded-lg p-3"
                                        >
                                            <FaUser className="text-teal-600 mr-3" />
                                            <div>
                                                <p className="font-medium text-gray-800">
                                                    {asistencia.usuario?.nombre}
                                                </p>
                                                <p className="text-gray-500 text-sm">
                                                    Entrada:{" "}
                                                    {formatTime(
                                                        asistencia.hora_entrada
                                                    )}
                                                </p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-center text-gray-500 italic">
                                    Sin ocupantes
                                </p>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
