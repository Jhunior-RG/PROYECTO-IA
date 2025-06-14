// lib/reconocimiento.ts
import * as vision from "face-api.js";

// Carga de modelos con nombres propios
export const modelos = {
    cargarDetector: async (ruta: string) => {
        await vision.nets.ssdMobilenetv1.loadFromUri(ruta);
    },
    cargarPuntosFaciales: async (ruta: string) => {
        await vision.nets.faceLandmark68Net.loadFromUri(ruta);
    },
    cargarReconocedor: async (ruta: string) => {
        await vision.nets.faceRecognitionNet.loadFromUri(ruta);
    },
};

// Utilidades de canvas
type Dimensiones = { width: number; height: number };
export function ajustarLienzo(
    lienzo: HTMLCanvasElement | HTMLVideoElement | HTMLImageElement,
    tamaño: Dimensiones
) {
    vision.matchDimensions(lienzo, tamaño);
}

export function redimensionarResultados(
    resultados: vision.WithFaceDescriptor<vision.WithFaceLandmarks<{ detection: vision.FaceDetection }, vision.FaceLandmarks68>>[],
    tamaño: Dimensiones
) {
    return vision.resizeResults(resultados, tamaño);
}

// Imagen
export async function cargarImagenDesdeURL(url: string) {
    return await vision.fetchImage(url);
}

// Detección de rostros
export async function detectarRostros(
    input: HTMLVideoElement | HTMLImageElement
) {
    return await vision
        .detectAllFaces(input)
        .withFaceLandmarks()
        .withFaceDescriptors();
}

export async function detectarUnRostro(imagen: HTMLImageElement) {
    return await vision
        .detectSingleFace(imagen)
        .withFaceLandmarks()
        .withFaceDescriptor();
}

// Clases renombradas
export class DescriptorRostroEtiquetado {
    constructor(public etiqueta: string, public vectores: Float32Array[]) {}

    aEstructuraOriginal() {
        return new vision.LabeledFaceDescriptors(this.etiqueta, this.vectores);
    }
}

export class ComparadorRostros {
    private comparador: vision.FaceMatcher;

    constructor(lista: DescriptorRostroEtiquetado[], umbral: number = 0.6) {
        // Si no hay descriptores, creamos uno dummy para evitar error
        const originales = lista.length > 0
            ? lista.map(d => d.aEstructuraOriginal())
            : [new vision.LabeledFaceDescriptors("Desconocido", [new Float32Array(128)])];
        this.comparador = new vision.FaceMatcher(originales, umbral);
    }

    mejorCoincidencia(descriptor: Float32Array) {
        const resultado = this.comparador.findBestMatch(descriptor);
        return {
            etiqueta: resultado.label,
            certeza: 1 - resultado.distance,
        };
    }
}
