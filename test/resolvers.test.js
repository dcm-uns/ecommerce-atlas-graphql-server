import assert from 'node:assert/strict';
import test from 'node:test';
import { ApolloServer } from '@apollo/server';
import { createResolvers } from '../src/resolvers.js';
import { typeDefs } from '../src/schema.js';

test('products combina filtros de texto, categoría, precio e inventario', async () => {
  let receivedQuery;
  const Product = {
    find: (query) => ({
      exec: async () => {
        receivedQuery = query;
        return [];
      }
    })
  };
  const resolvers = createResolvers(Product);

  await resolvers.Query.products(null, {
    filter: {
      name: 'café (molido)',
      category: 'Bebidas',
      price: 10,
      minPrice: 5,
      maxPrice: 20,
      minStock: 2,
      maxStock: 12
    }
  });

  assert.deepEqual(receivedQuery, {
    name: { $regex: 'café \\(molido\\)', $options: 'i' },
    category: 'Bebidas',
    price: { $eq: 10, $gte: 5, $lte: 20 },
    stock: { $gte: 2, $lte: 12 }
  });
});

test('updateProduct persiste solo los campos enviados y valida el resultado', async () => {
  let receivedUpdate;
  let receivedOptions;
  const updatedProduct = { _id: 'abc123', name: 'Té verde', price: 8 };
  const Product = {
    findByIdAndUpdate: (_id, update, options) => ({
      exec: async () => {
      receivedUpdate = update;
      receivedOptions = options;
      return updatedProduct;
      }
    })
  };
  const resolvers = createResolvers(Product);

  const result = await resolvers.Mutation.updateProduct(null, {
    id: 'abc123',
    input: { name: 'Té verde', price: 8 }
  });

  assert.equal(result, updatedProduct);
  assert.deepEqual(receivedUpdate, { name: 'Té verde', price: 8 });
  assert.deepEqual(receivedOptions, { new: true, runValidators: true });
  assert.equal(resolvers.Product.id(result), 'abc123');
});

test('updateProduct rechaza una entrada vacía', async () => {
  const resolvers = createResolvers({
    findByIdAndUpdate: async () => assert.fail('No debe actualizar')
  });

  await assert.rejects(
    resolvers.Mutation.updateProduct(null, { id: 'abc123', input: {} }),
    { extensions: { code: 'BAD_USER_INPUT' } }
  );
});

test('el esquema ejecuta una consulta GraphQL completa', async () => {
  const apollo = new ApolloServer({
    typeDefs,
    resolvers: createResolvers({
      find: () => ({
        exec: async () => [{ _id: 'abc123', name: 'Café', price: 5, stock: 4, category: 'Bebidas', description: '' }]
      })
    })
  });
  await apollo.start();

  const response = await apollo.executeOperation({
    query: '{ products(filter: { name: "Café", price: 5 }) { id name price stock category description } }'
  });

  assert.equal(response.body.kind, 'single');
  assert.deepEqual(JSON.parse(JSON.stringify(response.body.singleResult.data.products)), [
    { id: 'abc123', name: 'Café', price: 5, stock: 4, category: 'Bebidas', description: '' }
  ]);
  await apollo.stop();
});