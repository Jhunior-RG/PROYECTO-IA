import Link from 'next/link'
import Navbar from '../components/Navbar'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <section className="pt-24 flex flex-col items-center justify-center text-center px-6">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-800 leading-tight">
          Bienvenido al <span className="text-teal-600">Sistema de Asistencia</span>
        </h1>
        <p className="mt-4 text-lg text-gray-600 max-w-2xl">
        Empieza Registrando Usuarios.
        </p>
        <Link href="/registro" className="mt-8 inline-block bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-6 rounded-lg transition">
          Registrar
        </Link>
        <p className="mt-4 text-lg text-gray-600 max-w-2xl">
          Registra entradas y salidas automáticamente mediante reconocimiento facial en tiempo real.
        </p>
        <Link href="/ubicacion" className="mt-8 inline-block bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-6 rounded-lg transition">
          Comenzar
        </Link>
      </section>
    </div>
  )
}
