// components/UsuarioCard.tsx
export interface Usuario {
  id: string;
  nombre: string;
}

export default function UsuarioCard({ usuario }: { usuario: Usuario }) {
  return (
    <div>
      <h3>{usuario.nombre}</h3>
      <p>ID: {usuario.id}</p>
    </div>
  );
}
