"use client";
import Link from "next/link";
import { useState } from "react";

export const aulas = ["Aula 1", "Aula 2", "Aula 3", "Aula 4", "Aula 5"];
export default function SelectAula() {
    const [selected, setSelected] = useState<string | null>(null);

    return (
        <div className="flex flex-col items-center p-6 space-y-6">
            <h1 className="text-2xl font-bold mb-2">Selecciona el aula</h1>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-3xl w-full">
                {aulas.map((aula) => (
                    <div
                        key={aula}
                        onClick={() => setSelected(aula)}
                        className={`cursor-pointer border rounded-lg p-6 text-center font-medium shadow-sm transition ${
                            selected === aula
                                ? "bg-teal-500 text-white ring-2 ring-teal-700"
                                : "bg-white text-black hover:bg-gray-100"
                        }`}
                    >
                        {aula}
                    </div>
                ))}
            </div>

            {selected && (
                <Link
                    href={`/asistencia?Aula=${encodeURIComponent(selected)}`}
                    className="mt-6 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 px-6 rounded-lg transition"
                >
                    Entrar a {selected}
                </Link>
            )}
        </div>
    );
}
