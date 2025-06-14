import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const lugares = ['Aula 1', 'Aula 2', 'Aula 3', 'Aula 4', 'Aula 5', 'Aula 6'];
    const result = await prisma.$transaction(
        lugares.map(lugar =>
            prisma.lugar.upsert({
                where: { id: 0, nombre: lugar },
                update: { nombre: lugar },
                create: { nombre: lugar },
            })
        )
    );
    console.log('Upsert completo.');

}

main()
    .catch(e => { console.error(e); process.exit(1); })
    .finally(() => prisma.$disconnect());
