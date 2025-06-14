// components/UsuarioCard.tsx
import { FaUser } from "react-icons/fa";

export interface Usuario {
  id: string;
  nombre: string;
}

export default function UsuarioCard({ usuario }: { usuario: Usuario }) {
  return (
    <div className="card p-6 hover:scale-105 transition-all duration-300">
      <div className="flex items-center space-x-4">
        <div className="bg-teal-100 p-3 rounded-full">
          <FaUser className="text-xl text-teal-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-800">{usuario.nombre}</h3>
          <p className="text-sm text-slate-500">ID: {usuario.id}</p>
        </div>
      </div>
    </div>
  );
}
