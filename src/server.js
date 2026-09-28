import 'dotenv/config';
import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express4';
import mongoose from 'mongoose';
import { Product } from './models/Product.js';
import { createResolvers } from './resolvers.js';
import { typeDefs } from './schema.js';

const port = Number(process.env.PORT ?? 4000);
const mongoUri = process.env.MONGODB_URI;

async function startServer() {
  if (!mongoUri) {
    throw new Error('Falta MONGODB_URI. Configúrala en el archivo .env.');
  }

  await mongoose.connect(mongoUri, { dbName: process.env.MONGODB_DB || 'productos' });
  console.log(
    `MongoDB conectado: base=${mongoose.connection.name}, colección=${Product.collection.name}`
  );

  const app = express();
  const apollo = new ApolloServer({ typeDefs, resolvers: createResolvers(Product) });
  await apollo.start();

  app.get('/health', (_request, response) => response.json({ status: 'ok' }));
  app.use('/graphql', express.json(), expressMiddleware(apollo));

  app.listen(port, '0.0.0.0', () => {
    console.log(`Servidor GraphQL listo en http://localhost:${port}/graphql`);
  });
}

startServer().catch((error) => {
  console.error('No se pudo iniciar el servidor:', error.message);
  if (error.reason?.servers instanceof Map) {
    for (const [address, server] of error.reason.servers) {
      const detail = server.error;
      console.error(
        `MongoDB ${address}: ${detail?.name ?? server.type}: ${detail?.message ?? 'sin detalle adicional'}`
      );
    }
  }
  process.exitCode = 1;
});