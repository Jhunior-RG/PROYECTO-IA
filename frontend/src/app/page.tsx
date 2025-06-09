import Link from "next/link";
import Navbar from "../components/Navbar";
import MiniMapa from "./ubicaciones/page";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <MiniMapa />
      <section className="pt-24 flex items-center justify-center text-center px-6">
        <div>
          <p className="mt-4 text-sm text-gray-600 max-w-2xl">
            Empieza Registrando Usuarios.
          </p>
          <Link
            href="/registro"
            className="mt-8 inline-block bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-6 rounded-lg transition"
          >
            Registrar
          </Link>
        </div>
        <div>
          <p className="mt-4 text-sm text-gray-600 max-w-xl">
            Registra entradas y salidas automáticamente mediante reconocimiento
            facial en tiempo real.
          </p>
          <Link
            href="/ubicacion"
            className="mt-8 inline-block bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-6 rounded-lg transition"
          >
            Comenzar
          </Link>
        </div>
      </section>
    </div>
  );
}
