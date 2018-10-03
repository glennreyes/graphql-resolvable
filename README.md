# graphql-resolvable

Run GraphQL resolvers as needed – GraphQL Resolvable bypasses resolvers if all queried fields are whitelisted or resolved by the parent object.

## Installation

```sh
yarn add graphql-resolvable
```

## Use case

Let's take following example use case:

```js
const typeDefs = gql`
  type Author {
    id: Int
    name: String
    posts: [Posts!]!
  }

  type Post {
    id: Int
    title: String
    comments: [Comment!]!
  }

  type Query {
    mainAuthor: Author
  }
`;

const resolvers = {
  Query: {
    mainAuthor: () => ({
      id: 1
      name: 'Glenn',
      posts: [{
        id: 1,
        title: 'Hello World'
      }],
    }),
  },
  Author: {
    posts: async (parent) => {
      const comments = await fetchPostCommentsFromAuthor(parent.id);

      return { ...parent.posts, comments };
    }
  },
};
```

Now if we do following query:

```graphql
{
  mainAuthor {
    id
    name
    posts {
      id
      title
    }
  }
}
```

Ideally we can resolve the `id` and `title` of the post without waiting for the comments to be fetched. This is exactly what GraphQL Resolvable addresses generically.

## Usage

Simply wrap your resolver with the `resolvable` function:

```js
import resolvable from 'graphql-resolvable';

const resolver = {
  Author: {
    posts: resolveable(parent => getPostsbyAuthor(parent.id)),
  },
};
```

GraphQL resolvable will check queried fields against the fields that are coming from the parent. Based on that it will check if it can bypass the resolver.

You can also specify a whitelist of fields to bypass:

```js
const resolver = {
  Author: {
    posts: resolveable(parent => getPostsbyAuthor(parent.id), {
      whitelist: ['id', 'bio', ' twitter'],
    }),
  },
};
```

Sometimes you'd want to just return the value from the args. This can be done by setting the `returnArgs` to `true`:

```js
const resolver = {
  Author: {
    posts: resolveable(parent => getPostsbyAuthor(parent.id), {
      returnArgs: true,
    }),
  },
};
```

## API

### Options

#### `whitelist`: string[]

Additionally to the parent fields, the whitelist option allows to specify more fields to bypass the GraphQL resolver.

Default: `[]`

#### `returnArgs`: boolean

Set this to `true` to add the args to the return value.

> Note this will only apply if the return value of the GraphQL resolver is not an iterable.

Default: `false`

## License

MIT
