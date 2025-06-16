"use client";
import { useState, useRef, useCallback } from "react";
import type React from "react";

import Navbar from "@/components/Navbar";
import Image from "next/image";
import { API_URL } from "@/services/api";
import { Camera, X, Star, Upload } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Registro() {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [profilePhotoIndex, setProfilePhotoIndex] = useState(0);
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Maneja el cambio de archivos
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    const newFiles = [...files, ...selectedFiles];
    setFiles(newFiles);

    // Generar URLs para previsualización
    const newUrls = selectedFiles.map((file) => URL.createObjectURL(file));
    const allUrls = [...previews, ...newUrls];
    setPreviews(allUrls);

    // Si es la primera foto, establecerla como foto de perfil
    if (files.length === 0) {
      setProfilePhotoIndex(0);
    }
  };

  // Abrir cámara
  const openCamera = useCallback(async () => {
    setCameraError("");

    // Verificar si el navegador soporta getUserMedia
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError("Tu navegador no soporta el acceso a la cámara");
      return;
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });

      setStream(mediaStream);
      setShowCamera(true);

      // Esperar a que el video esté listo
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      }, 100);
    } catch (error) {
      console.error("Error accessing camera:", error);
      if (error instanceof Error) {
        if (error.name === "NotAllowedError") {
          setCameraError(
            "Permiso de cámara denegado. Por favor, permite el acceso a la cámara."
          );
        } else if (error.name === "NotFoundError") {
          setCameraError("No se encontró ninguna cámara en tu dispositivo.");
        } else {
          setCameraError("Error al acceder a la cámara: " + error.message);
        }
      } else {
        setCameraError("Error desconocido al acceder a la cámara");
      }
    }
  }, []);

  // Cerrar cámara
  const closeCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setShowCamera(false);
    setCameraError("");
  }, [stream]);

  // Capturar foto
  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) {
      alert("Error: No se pudo acceder a la cámara");
      return;
    }

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext("2d");

    if (!context) {
      alert("Error: No se pudo crear el contexto del canvas");
      return;
    }

    // Establecer dimensiones del canvas
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    // Dibujar el frame actual del video en el canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convertir a blob y crear archivo
    canvas.toBlob(
      (blob) => {
        if (blob) {
          const timestamp = Date.now();
          const file = new File([blob], `camera-photo-${timestamp}.jpg`, {
            type: "image/jpeg",
          });

          const newFiles = [...files, file];
          setFiles(newFiles);

          const url = URL.createObjectURL(file);
          const newPreviews = [...previews, url];
          setPreviews(newPreviews);

          // Si es la primera foto, establecerla como foto de perfil
          if (files.length === 0) {
            setProfilePhotoIndex(0);
          }

          closeCamera();
        } else {
          alert("Error al capturar la foto");
        }
      },
      "image/jpeg",
      0.8
    );
  }, [files, previews, closeCamera]);

  // Cambiar foto de perfil
  const setAsProfilePhoto = (index: number) => {
    setProfilePhotoIndex(index);
  };

  // Eliminar foto
  const removePhoto = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);

    // Limpiar URL del objeto
    URL.revokeObjectURL(previews[index]);

    setFiles(newFiles);
    setPreviews(newPreviews);

    // Ajustar índice de foto de perfil si es necesario
    if (newFiles.length === 0) {
      setProfilePhotoIndex(0);
    } else if (index === profilePhotoIndex) {
      setProfilePhotoIndex(0); // Establecer la primera como perfil
    } else if (index < profilePhotoIndex) {
      setProfilePhotoIndex(profilePhotoIndex - 1);
    }
  };

  // Funciones para drag & drop
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files).filter((file) =>
      file.type.startsWith("image/")
    );

    if (droppedFiles.length > 0) {
      const newFiles = [...files, ...droppedFiles];
      setFiles(newFiles);

      const newUrls = droppedFiles.map((file) => URL.createObjectURL(file));
      const allUrls = [...previews, ...newUrls];
      setPreviews(allUrls);

      if (files.length === 0) {
        setProfilePhotoIndex(0);
      }
    }
  };

  // Envía el formulario al backend
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!nombre.trim()) {
      alert("Por favor ingresa tu nombre");
      return;
    }

    if (files.length === 0) {
      alert("Por favor agrega al menos una foto");
      return;
    }

    const formData = new FormData();
    formData.append("nombre", nombre.trim());

    // Reordenar archivos: foto de perfil primero, luego las demás
    const reorderedFiles = [
      files[profilePhotoIndex], // Foto de perfil primero
      ...files.filter((_, index) => index !== profilePhotoIndex), // Las demás fotos
    ];

    // Enviar archivos en orden (el backend sabrá que la primera es la foto de perfil)
    reorderedFiles.forEach((file) => {
      formData.append("files", file);
    });

    try {
      const res = await fetch(API_URL + "/usuarios/", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        alert("Usuario registrado exitosamente");
        router.push("/");
      } else {
        const errorData = await res.text();
        alert("Error en el registro: " + errorData);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error de conexión. Verifica tu conexión a internet.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <section className="pt-24 flex flex-col items-center px-6">
        <h2 className="text-3xl font-bold mb-4">Registro de Usuario</h2>

        {cameraError && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md max-w-2xl w-full">
            {cameraError}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-6 w-full max-w-2xl bg-white p-8 rounded-lg shadow-md"
        >
          <div>
            <label
              htmlFor="nombre"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Nombre *
            </label>
            <input
              id="nombre"
              type="text"
              placeholder="Ingrese su nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Fotos *
            </label>

            {/* Área de drag & drop mejorada */}
            <div
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                isDragging
                  ? "border-teal-500 bg-teal-50 scale-105"
                  : "border-gray-300 hover:border-teal-400 hover:bg-gray-50"
              }`}
            >
              <div className="space-y-4">
                {/* Icono central */}
                <div className="flex justify-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                    <Upload className="w-8 h-8 text-gray-400" />
                  </div>
                </div>

                {/* Texto principal */}
                <div>
                  <p className="text-lg font-medium text-gray-700 mb-2">
                    {isDragging
                      ? "¡Suelta las imágenes aquí!"
                      : "Sube tus fotos"}
                  </p>
                  <p className="text-sm text-gray-500">
                    Arrastra y suelta las imágenes o haz clic en los botones
                  </p>
                </div>

                {/* Botones mejorados */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <label
                    htmlFor="file-upload"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 cursor-pointer transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg font-medium"
                  >
                    <Upload size={20} />
                    Seleccionar Archivos
                    <input
                      id="file-upload"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileChange}
                      className="sr-only"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={openCamera}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg font-medium"
                  >
                    <Camera size={20} />
                    Tomar Foto
                  </button>
                </div>

                {/* Información de formatos */}
                <div className="pt-2 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    Formatos soportados: PNG, JPG, GIF • Tamaño máximo: 10MB por
                    archivo
                  </p>
                </div>
              </div>

              {/* Overlay para drag */}
              {isDragging && (
                <div className="absolute inset-0 bg-teal-500 bg-opacity-10 rounded-xl flex items-center justify-center">
                  <div className="text-teal-600 font-medium text-lg">
                    Suelta las imágenes aquí
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Preview de fotos */}
          {previews.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-3">
                Fotos seleccionadas ({previews.length})
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {previews.map((src, idx) => (
                  <div
                    key={idx}
                    className={`relative group rounded-lg overflow-hidden shadow-sm border-2 transition-all ${
                      idx === profilePhotoIndex
                        ? "border-yellow-400 ring-2 ring-yellow-200"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="relative w-full pt-[100%]">
                      <Image
                        src={src || "/placeholder.svg"}
                        alt={`Foto ${idx + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, 33vw"
                      />
                    </div>

                    {/* Indicador de foto de perfil */}
                    {idx === profilePhotoIndex && (
                      <div className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                        <Star size={12} fill="currentColor" />
                        Perfil
                      </div>
                    )}

                    {/* Controles */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="flex gap-2">
                        {idx !== profilePhotoIndex && (
                          <button
                            type="button"
                            onClick={() => setAsProfilePhoto(idx)}
                            className="bg-yellow-500 hover:bg-yellow-600 text-white p-2 rounded-full transition-colors"
                            title="Establecer como foto de perfil"
                          >
                            <Star size={16} />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => removePhoto(idx)}
                          className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-colors"
                          title="Eliminar foto"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-sm text-gray-600 mt-3 flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500" fill="currentColor" />
                La foto marcada será tu foto de perfil principal
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={!nombre.trim() || files.length === 0}
            className="w-full bg-teal-600 text-white py-3 px-4 rounded-md font-medium hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Registrarse
          </button>
        </form>
      </section>

      {/* Modal de cámara */}
      {showCamera && (
        <div className="fixed inset-0 bg-black/10 bg-blur-sm backdrop-blur bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Tomar Foto</h3>
              <button
                onClick={closeCamera}
                className="text-gray-500 hover:text-gray-700 p-1"
                type="button"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="relative bg-gray-100 rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-auto rounded-lg"
                  style={{ maxHeight: "300px" }}
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={capturePhoto}
                  className="flex-1 bg-teal-600 text-white py-2 px-4 rounded-md hover:bg-teal-700 transition-colors"
                >
                  Capturar
                </button>
                <button
                  type="button"
                  onClick={closeCamera}
                  className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Canvas oculto para capturar la foto */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
