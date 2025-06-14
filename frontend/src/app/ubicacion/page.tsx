"use client";
import { API_URL } from "@/services/api";
import Link from "next/link";
import { useEffect, useState } from "react";
interface Ubicaciones {
    id: number;
    nombre: string;
}
export const aulas = ["Aula 1", "Aula 2", "Aula 3", "Aula 4", "Aula 5"];
export default function SelectAula() {
    const [lugares, setLugares] = useState<Ubicaciones[]>([]);
    const getLugares = async () => {
        const res = await fetch(API_URL + "/ubicaciones");
        if (res.ok) {
            const lugares = await res.json();
            setLugares(lugares);
        }
    };
    useEffect(() => {
        getLugares();
    }, []);
    
    return (
        <div className="flex flex-col items-center p-6 space-y-6">
            <h1 className="text-2xl font-bold mb-2">Selecciona el aula</h1>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-3xl w-full">
                {lugares.map((lugar) => (
                    <Link
                        href={`asistencia/${lugar.id}`}
                        key={lugar.id}
                        className={`p-10 text-center inline-block bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg transition`}
                    >
                        {lugar.nombre}
                    </Link>
                ))}
            </div>
        </div>
    );
}
