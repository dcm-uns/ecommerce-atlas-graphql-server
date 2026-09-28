export const typeDefs = `#graphql
  type Product {
    id: ID!
    name: String!
    price: Float!
    stock: Int!
    category: String!
    description: String!
  }

  input ProductFilter {
    name: String
    category: String
    description: String
    price: Float
    minPrice: Float
    maxPrice: Float
    minStock: Int
    maxStock: Int
  }

  input UpdateProductInput {
    name: String
    price: Float
    stock: Int
    category: String
    description: String
  }

  input CreateProductInput {
    name: String!
    price: Float!
    stock: Int
    category: String!
    description: String
  }

  type Query {
    products(filter: ProductFilter): [Product!]!
    product(id: ID!): Product
  }

  type Mutation {
    createProduct(input: CreateProductInput!): Product!
    updateProduct(id: ID!, input: UpdateProductInput!): Product!
  }
`;