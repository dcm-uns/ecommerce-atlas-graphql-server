# API de productos GraphQL

API con Express, Apollo Server y Mongoose para consultar, filtrar y actualizar productos en MongoDB Atlas.

## Requisitos

- Node.js 20 o superior
- Una instancia de MongoDB Atlas con acceso de red configurado

## Configuración

1. Instala dependencias con `npm install`.
2. Copia `.env.example` a `.env`.
3. Sustituye `MONGODB_URI` por la URI de conexión de Atlas. Mantén usuario y contraseña únicamente en `.env`; no subas ese archivo al repositorio.
4. Comprueba que la IP esté permitida en Atlas y que el usuario tenga permisos sobre la base de datos indicada por `MONGODB_DB`.
5. Arranca con `npm run dev` o `npm start`.

GraphQL queda disponible en `http://localhost:4000/graphql`; la comprobación de estado está en `http://localhost:4000/health`.

## Operaciones

```graphql
query {
  products(filter: { category: "Bebidas", minPrice: 1, maxStock: 20 }) {
    id
    name
    price
    stock
    category
    description
  }
}
```

Los filtros `name` y `description` buscan texto sin distinguir mayúsculas; `category` compara el valor exacto. También se aceptan `minPrice`, `maxPrice`, `minStock` y `maxStock`. Para obtener un producto por identificador, usa `product(id: "...")`.

```graphql
mutation {
  createProduct(input: {
    name: "Café molido"
    price: 5.5
    stock: 20
    category: "Bebidas"
    description: "Paquete de 500 g"
  }) {
    id
    name
    price
  }
}
```

```graphql
mutation {
  updateProduct(id: "ID_DEL_PRODUCTO", input: { price: 12.5, stock: 8 }) {
    id
    name
    price
    stock
  }
}
```

`updateProduct` acepta cualquier subconjunto de `name`, `price`, `stock`, `category` y `description`; Mongoose aplica las validaciones del esquema.

## Pruebas

Ejecuta `npm test`. Las pruebas de resolvers no necesitan conectarse a MongoDB Atlas.