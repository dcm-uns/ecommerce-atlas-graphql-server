import { GraphQLError } from 'graphql';

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function createResolvers(Product) {
  return {
    Query: {
      products: (_parent, { filter = {} }) => {
        const query = {};

        for (const field of ['name', 'description']) {
          if (filter[field]) {
            query[field] = { $regex: escapeRegex(filter[field]), $options: 'i' };
          }
        }

        if (filter.category) query.category = filter.category;
        if (filter.price !== undefined) query.price = { $eq: filter.price };

        for (const [filterField, modelField, operator] of [
          ['minPrice', 'price', '$gte'],
          ['maxPrice', 'price', '$lte'],
          ['minStock', 'stock', '$gte'],
          ['maxStock', 'stock', '$lte']
        ]) {
          if (filter[filterField] !== undefined) {
            query[modelField] ??= {};
            query[modelField][operator] = filter[filterField];
          }
        }

        return Product.find(query).exec();
      },
      product: (_parent, { id }) => Product.findById(id).exec()
    },
    Mutation: {
      updateProduct: async (_parent, { id, input }) => {
        const updates = Object.fromEntries(
          Object.entries(input).filter(([, value]) => value !== undefined)
        );

        if (Object.keys(updates).length === 0) {
          throw new GraphQLError('Debes indicar al menos un campo para actualizar.', {
            extensions: { code: 'BAD_USER_INPUT' }
          });
        }

        const product = await Product.findByIdAndUpdate(id, updates, {
          new: true,
          runValidators: true
        }).exec();

        if (!product) {
          throw new GraphQLError('No se encontró el producto.', {
            extensions: { code: 'NOT_FOUND' }
          });
        }

        return product;
      }
    },
    Product: {
      id: (product) => product.id ?? product._id?.toString()
    }
  };
}