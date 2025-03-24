import { PrismaClient } from '@prisma/client';

// Initialize Prisma Client
const prisma = new PrismaClient();

// Function to fetch all entries from the "respuestas" table
async function getRespuestas() {
  const respuestas = await prisma.respuestas.findMany();
  return respuestas;
}

export default async function RespuestasPage() {
  // Fetch the data
  const respuestas = await getRespuestas();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Respuestas</h1>
      <div className="space-y-4">
        {respuestas.map((respuesta) => (
          <div key={respuesta.id} className="p-4 border rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold">ID: {respuesta.id}</h2>
            <p className="text-gray-700">{respuesta.resultados}</p>
          </div>
        ))}
      </div>
    </div>
  );
}