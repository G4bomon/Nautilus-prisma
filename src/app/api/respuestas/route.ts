import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const respuestas = await prisma.respuestas.findMany();
    return NextResponse.json(respuestas);
  } catch (error) {
    console.error("Error fetching respuestas:", error);
    return NextResponse.json(
      { error: "Failed to fetch respuestas" },
      { status: 500 }
    );
  }
}