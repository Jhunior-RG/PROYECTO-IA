"use client";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Image from "next/image";
import { API_URL } from "@/services/api";

export default function Registro() {
    const [nombre, setNombre] = useState("");
    const [files, setFiles] = useState<File[]>([]); // <-- array de archivos
    const [previews, setPreviews] = useState<string[]>([]); // <-- array de URLs

    // Maneja el cambio de archivos y prepara varios previews
    interface FileWithPreview extends File {
        preview?: string;
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(
            e.target.files || []
        ) as FileWithPreview[];
        setFiles(selectedFiles);

        // Generar URLs para previsualización
        const urls = selectedFiles.map((file) => URL.createObjectURL(file));
        setPreviews(urls);
    };

    // Envía el formulario al backend
    const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!nombre || files.length === 0)
            return alert("Nombre y al menos una foto son requeridos");

        const formData = new FormData();
        formData.append("nombre", nombre);

        // Agregar cada archivo al FormData
        files.forEach((file) => {
            formData.append("files", file);
        });

        const res = await fetch(API_URL + "/usuarios/register", {
            method: "POST",
            body: formData,
        });

        if (res.ok) {
            alert("Usuario registrado");
            // limpiar estado
            setNombre("");
            setFiles([]);
            setPreviews([]);
        } else {
            alert("Error en el registro");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <section className="pt-24 flex flex-col items-center px-6">
                <h2 className="text-3xl font-bold mb-4">Registro de Usuario</h2>
                <form
                    onSubmit={handleSubmit}
                    className="space-y-6 w-full max-w-md bg-white p-8 rounded-lg shadow-md"
                >
                    <div>
                        <label
                            htmlFor="nombre"
                            className="block text-sm font-medium text-gray-700 mb-2"
                        >
                            Nombre
                        </label>
                        <input
                            id="nombre"
                            type="text"
                            placeholder="Ingrese su nombre"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="fotos"
                            className="block text-sm font-medium text-gray-700 mb-2"
                        >
                            Fotos
                        </label>
                        <label
                            htmlFor="file-upload"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-teal-600 hover:text-teal-500"
                        >
                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-teal-500 transition-colors">
                                <div className="space-y-1 text-center">
                                    <div className="flex text-sm text-gray-600">
                                        <span>Subir fotos</span>
                                        <input
                                            id="file-upload"
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={handleFileChange}
                                            className="sr-only"
                                        />
                                        <p className="pl-1">
                                            o arrastrar y soltar
                                        </p>
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        PNG, JPG, GIF hasta 10MB
                                    </p>
                                </div>
                            </div>
                        </label>
                    </div>

                    {previews.length > 0 && (
                        <div className="grid grid-cols-3 gap-3">
                            {previews.map((src, idx) => (
                                <div
                                    key={idx}
                                    className="relative w-full pt-[100%] rounded-lg overflow-hidden shadow-sm"
                                >
                                    <Image
                                        src={src}
                                        alt={`Preview ${idx + 1}`}
                                        fill
                                        className="object-cover hover:opacity-75 transition-opacity"
                                    />
                                </div>
                            ))}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-teal-600 text-white py-3 px-4 rounded-md font-medium hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-colors"
                    >
                        Registrarse
                    </button>
                </form>
            </section>
        </div>
    );
}
