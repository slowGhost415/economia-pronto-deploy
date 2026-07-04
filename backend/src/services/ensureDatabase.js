import prisma from './prismaClient.js';

const ensureDatabase = async () => {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "User" (
      "id" SERIAL PRIMARY KEY,
      "nome" TEXT NOT NULL,
      "email" TEXT NOT NULL UNIQUE,
      "senha" TEXT NOT NULL,
      "data_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Interaction" (
      "id" SERIAL PRIMARY KEY,
      "userId" INTEGER NOT NULL REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
      "tipo_acao" TEXT NOT NULL,
      "descricao" TEXT NOT NULL,
      "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Transacao" (
      "id" SERIAL PRIMARY KEY,
      "userId" INTEGER NOT NULL REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
      "tipo" TEXT NOT NULL,
      "categoria" TEXT NOT NULL,
      "descricao" TEXT NOT NULL,
      "valor" DOUBLE PRECISION NOT NULL,
      "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Meta" (
      "id" SERIAL PRIMARY KEY,
      "userId" INTEGER NOT NULL REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
      "nome" TEXT NOT NULL,
      "valorAlvo" DOUBLE PRECISION NOT NULL,
      "valorAtual" DOUBLE PRECISION NOT NULL DEFAULT 0,
      "prazo" TIMESTAMP(3) NOT NULL,
      "criada_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Investimento" (
      "id" SERIAL PRIMARY KEY,
      "userId" INTEGER NOT NULL REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
      "nome" TEXT NOT NULL,
      "tipo" TEXT NOT NULL,
      "valor" DOUBLE PRECISION NOT NULL,
      "taxa" DOUBLE PRECISION NOT NULL,
      "data_inicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
};

export default ensureDatabase;
