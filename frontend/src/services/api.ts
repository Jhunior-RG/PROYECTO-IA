export const API_URL = "http://localhost:4000";

export async function registrarEntrada(id_usuario: string) {
    const response = await fetch(`${API_URL}/asistencia/entrada`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ id_usuario }),
    });
    return response.json();
}

export async function registrarSalida(id_usuario: string) {
    const response = await fetch(`${API_URL}/asistencia/salida`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ id_usuario }),
    });
    return response.json();
}

export async function obtenerAsistenciaHoy(id_usuario: string) {
    const response = await fetch(`${API_URL}/asistencia/hoy/${id_usuario}`);
    return response.json();
}

export async function listarUsuarios() {
    const response = await fetch(`${API_URL}/usuarios`);
    return response.json();
}

export const registrarAsistencia = async (idUsuario: string) => {
    try {
        const response = await fetch(API_URL + "/asistencia/entrada", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id_usuario: idUsuario }),
        });
        const data = await response.json();
        console.log(data.msg);
    } catch (error) {
        console.error("Error al registrar la asistencia:", error);
    }
};
export interface AsistenciaData {
    nombre: string;
    id_lugar?: string | number;
    tipo: "entrada" | "salida";
}

export const postAsistencia = async (data: AsistenciaData) => {
    try {
        const response = await fetch(`${API_URL}/asistencia`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        return response.json();
    } catch (error) {
        console.error("Error al enviar las asistencias:", error);
    }
};
