import { readdirSync, statSync } from 'fs'
import path from 'path'
import { NextResponse } from 'next/server'

export async function GET() {
  const basePath = path.join(process.cwd(), 'public/conocidos')

  const carpetas = readdirSync(basePath).filter((nombre) =>
    statSync(path.join(basePath, nombre)).isDirectory()
  )

  const resultado = carpetas.map((carpeta) => {
    const imagenes = readdirSync(path.join(basePath, carpeta)).filter((archivo) =>
      /\.(jpe?g|png)$/i.test(archivo)
    )
    return { nombre: carpeta, imagenes }
  })

  return NextResponse.json(resultado)
}
