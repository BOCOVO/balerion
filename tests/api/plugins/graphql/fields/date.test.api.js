'use strict';

// Helpers.
const { createTestBuilder } = require('api-tests/builder');
const { createBalerionInstance } = require('api-tests/balerion');
const { createAuthRequest } = require('api-tests/request');

const builder = createTestBuilder();
let balerion;
let rq;
let graphqlQuery;

const postModel = {
  attributes: {
    myDate: {
      type: 'date',
    },
  },
  singularName: 'post',
  pluralName: 'posts',
  displayName: 'Post',
  description: '',
  collectionName: '',
};

describe('Test Graphql API End to End', () => {
  beforeAll(async () => {
    await builder.addContentType(postModel).build();

    balerion = await createBalerionInstance();
    rq = await createAuthRequest({ balerion });

    graphqlQuery = (body) => {
      return rq({
        url: '/graphql',
        method: 'POST',
        body,
      });
    };
  });

  afterAll(async () => {
    await balerion.destroy();
    await builder.cleanup();
  });

  describe('GraphQL - Date field', () => {
    test.each(['2022-03-17', null])('Can create an entity with date equals: %s', async (value) => {
      const res = await graphqlQuery({
        query: /* GraphQL */ `
          mutation createPost($data: PostInput!) {
            createPost(data: $data) {
              data {
                attributes {
                  myDate
                }
              }
            }
          }
        `,
        variables: {
          data: {
            myDate: value,
          },
        },
      });

      const { body } = res;

      expect(res.statusCode).toBe(200);
      expect(body).toEqual({
        data: {
          createPost: {
            data: {
              attributes: { myDate: value },
            },
          },
        },
      });
    });

    test.each(['2022-03-17T15:06:57.878Z', {}, [], 'something'])(
      'Cannot create an entity with date equals: %s',
      async (value) => {
        const res = await graphqlQuery({
          query: /* GraphQL */ `
            mutation createPost($data: PostInput!) {
              createPost(data: $data) {
                data {
                  attributes {
                    myDate
                  }
                }
              }
            }
          `,
          variables: {
            data: {
              myDate: value,
            },
          },
        });

        const { body } = res;

        expect(res.statusCode).toBe(400);
        expect(body).toMatchObject({
          errors: [
            {
              extensions: { code: 'BAD_USER_INPUT' },
            },
          ],
        });
      }
    );

    test.each(['2022-03-17'])('Can filter query with date: %s', async (value) => {
      const res = await graphqlQuery({
        query: /* GraphQL */ `
          query posts($myDate: Date!) {
            posts_connection(filters: { myDate: { gt: $myDate } }) {
              data {
                attributes {
                  myDate
                }
              }
            }
          }
        `,
        variables: {
          myDate: value,
        },
      });

      const { body } = res;

      expect(res.statusCode).toBe(200);
      expect(body).toEqual({
        data: {
          posts_connection: {
            data: [],
          },
        },
      });
    });
  });
});
