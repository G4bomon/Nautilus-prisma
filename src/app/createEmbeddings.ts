import { PrismaClient } from '@prisma/client';
import { GoogleGenerativeAI } from '@google/generative-ai';

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

async function generateEmbedding(text: string): Promise<number[]> {
  const model = genAI.getGenerativeModel({ model: "embedding-001" });
  const result = await model.embedContent(text);
  return result.embedding.values;
}

async function processAllRecords() {
  const allResponses = await prisma.respuestas.findMany();

  for (const response of allResponses) {
    if (!response.embedding) {  // Solo procesar si no tiene embedding
      try {
        const embedding = await generateEmbedding(response.resultados);
        await prisma.respuestas.update({
          where: { id: response.id },
          data: { embedding },
        });
        console.log(`Embedding generado para registro ${response.id}`);
      } catch (error) {
        console.error(`Error en registro ${response.id}:`, error);
      }
    }
  }
}

processAllRecords()
  .then(() => console.log("¡Proceso completado!"))
  .catch(console.error)
  .finally(() => prisma.$disconnect());