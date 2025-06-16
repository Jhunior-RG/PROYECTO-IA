"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/services/api";
import { FaCalendarAlt, FaClock, FaUser, FaMapMarkerAlt, FaSearch, FaFilter, FaTimes } from "react-icons/fa";
import Navbar from "@/components/Navbar";
import type { Asistencia } from "../../components/MiniMapa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface Lugar {
    id: number;
    nombre: string;
}

export default function Historial() {
    const [asistencias, setAsistencias] = useState<Asistencia[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredAsistencias, setFilteredAsistencias] = useState<Asistencia[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [lugares, setLugares] = useState<Lugar[]>([]);
    const [selectedLugar, setSelectedLugar] = useState<number | null>(null);
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [asistenciasRes, lugaresRes] = await Promise.all([
                    fetch(API_URL + "/asistencia"),
                    fetch(API_URL + "/ubicaciones")
                ]);

                if (asistenciasRes.ok && lugaresRes.ok) {
                    const [asistenciasData, lugaresData] = await Promise.all([
                        asistenciasRes.json(),
                        lugaresRes.json()
                    ]);
                    setAsistencias(asistenciasData);
                    setFilteredAsistencias(asistenciasData);
                    setLugares(lugaresData);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        let filtered = asistencias;

        // Filtrar por término de búsqueda
        if (searchTerm) {
            filtered = filtered.filter(
                (asistencia) =>
                    asistencia.usuario?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    asistencia.lugar?.nombre.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filtrar por fecha
        if (selectedDate) {
            filtered = filtered.filter((asistencia) => {
                const asistenciaDate = new Date(asistencia.hora_entrada);
                return (
                    asistenciaDate.getDate() === selectedDate.getDate() &&
                    asistenciaDate.getMonth() === selectedDate.getMonth() &&
                    asistenciaDate.getFullYear() === selectedDate.getFullYear()
                );
            });
        }

        // Filtrar por lugar
        if (selectedLugar) {
            filtered = filtered.filter(
                (asistencia) => asistencia.lugar?.id === selectedLugar
            );
        }

        setFilteredAsistencias(filtered);
    }, [searchTerm, selectedDate, selectedLugar, asistencias]);

    const formatDateTime = (isoString: string) => {
        const date = new Date(isoString);
        return date.toLocaleString("es-BO", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const clearFilters = () => {
        setSearchTerm("");
        setSelectedDate(null);
        setSelectedLugar(null);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
                <Navbar />
                <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 mt-15">
            <Navbar />
            <main className="container mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <div className="flex items-center">
                        <FaCalendarAlt className="text-3xl text-teal-600 mr-3" />
                        <h1 className="text-3xl font-bold text-slate-800">Historial de Asistencias</h1>
                    </div>
                    <div className="flex gap-4 w-full md:w-auto">
                        <div className="relative flex-1 md:w-96">
                            <input
                                type="text"
                                placeholder="Buscar por nombre o ubicación..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all duration-300"
                            />
                            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                        </div>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="btn-secondary flex items-center gap-2"
                        >
                            <FaFilter />
                            Filtros
                        </button>
                    </div>
                </div>

                {/* Panel de Filtros */}
                <div className={`card mb-8 transition-all duration-300 overflow-hidden ${showFilters ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-slate-800">Filtros</h2>
                            <button
                                onClick={clearFilters}
                                className="text-slate-500 hover:text-slate-700 transition-colors"
                            >
                                <FaTimes />
                            </button>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Fecha
                                </label>
                                <DatePicker
                                    selected={selectedDate}
                                    onChange={setSelectedDate}
                                    dateFormat="dd/MM/yyyy"
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all duration-300"
                                    placeholderText="Seleccionar fecha"
                                    isClearable
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Ubicación
                                </label>
                                <select
                                    value={selectedLugar || ""}
                                    onChange={(e) => setSelectedLugar(e.target.value ? Number(e.target.value) : null)}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all duration-300"
                                >
                                    <option value="">Todas las ubicaciones</option>
                                    {lugares.map((lugar) => (
                                        <option key={lugar.id} value={lugar.id}>
                                            {lugar.nombre}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid gap-6">
                    {filteredAsistencias.map((asistencia) => (
                        <div
                            key={asistencia.id}
                            className="card border border-slate-300 rounded-lg p-6 hover:shadow-lg transition-all duration-300 transform "
                        >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-center space-x-4">
                                    <div className="bg-teal-100 rounded-full overflow-hidden w-12 h-12 flex items-center justify-center">
                                        {asistencia.usuario?.perfil === null ? (<FaUser className="text-xl text-teal-600" />) : (<img src={asistencia.usuario?.perfil } className="object-cover w-full h-full"/>)}
                                        
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-slate-800">
                                            {asistencia.usuario?.nombre}
                                        </h3>
                                        <div className="flex items-center text-slate-600 mt-1">
                                            <FaMapMarkerAlt className="mr-2" />
                                            <span>{asistencia.lugar?.nombre}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col md:items-end space-y-2">
                                    <div className="flex items-center text-slate-600">
                                        <FaClock className="mr-2" />
                                        <span>Entrada: {formatDateTime(asistencia.hora_entrada)}</span>
                                    </div>
                                    {asistencia.hora_salida && (
                                        <div className="flex items-center text-slate-600">
                                            <FaClock className="mr-2" />
                                            <span>Salida: {formatDateTime(asistencia.hora_salida)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredAsistencias.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-slate-600 text-lg">
                            {searchTerm || selectedDate || selectedLugar
                                ? "No se encontraron resultados para los filtros seleccionados"
                                : "No hay registros de asistencia"}
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
}
