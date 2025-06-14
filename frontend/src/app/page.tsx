import Link from "next/link";
import Navbar from "../components/Navbar";
import MiniMapa from "../components/MiniMapa";
import { FaUserPlus, FaVideo } from "react-icons/fa";

export default function Home() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
            <Navbar />
            <MiniMapa />

            <section className="container mx-auto px-6 ">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="card p-8 animate-fade-in">
                        <div className="flex items-center mb-6">
                            <div className="bg-teal-100 p-3 rounded-full mr-4">
                                <FaUserPlus className="text-2xl text-teal-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-800">Registro de Usuarios</h2>
                        </div>
                        <p className="text-slate-600 mb-6">
                            Comienza registrando usuarios en el sistema para un seguimiento efectivo de asistencia.
                            Mantén un control preciso de la presencia de cada persona.
                        </p>
                        <Link
                            href="/registro"
                            className="btn-primary inline-flex items-center cursor-pointer hover:bg-teal-600 hover:text-white transition-all duration-300 hover:scale-102 hover:shadow-lg rounded-md p-2 text-teal-700"
                        >
                            <FaUserPlus className="mr-2" />
                            Registrar Usuario
                        </Link>
                    </div>

                    <div className="card p-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                        <div className="flex items-center mb-6">
                            <div className="bg-teal-100 p-3 rounded-full mr-4">
                                <FaVideo className="text-2xl text-teal-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-800">Reconocimiento Facial</h2>
                        </div>
                        <p className="text-slate-600 mb-6">
                            Sistema avanzado de reconocimiento facial en tiempo real para registrar
                            entradas y salidas de manera automática y eficiente.
                        </p>
                        <Link
                            href="/registro"
                            className="btn-primary inline-flex items-center cursor-pointer hover:bg-teal-600 hover:text-white transition-all duration-300 hover:scale-102 hover:shadow-lg rounded-md p-2 text-teal-700"
                        >
                            <FaVideo className="mr-2" />
                            Iniciar Reconocimiento
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
