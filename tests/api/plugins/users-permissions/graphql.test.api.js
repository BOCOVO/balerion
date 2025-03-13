'use strict';

// Helpers.
const { createBalerionInstance } = require('api-tests/balerion');
const { createAuthRequest, createRequest } = require('api-tests/request');

let balerion;
let authReq;

describe('Test Graphql user service', () => {
  beforeAll(async () => {
    balerion = await createBalerionInstance({ bypassAuth: false });
    authReq = await createAuthRequest({ balerion });
  });

  afterAll(async () => {
    await balerion.destroy();
  });

  describe('Check createUser authorizations', () => {
    test('createUser is forbidden to public', async () => {
      const rq = createRequest({ balerion });
      const res = await rq({
        url: '/graphql',
        method: 'POST',
        body: {
          query: /* GraphQL */ `
            mutation {
              createUsersPermissionsUser(
                data: { username: "test", email: "test", password: "test" }
              ) {
                data {
                  id
                  attributes {
                    username
                  }
                }
              }
            }
          `,
        },
      });

      expect(res.statusCode).toBe(200);
      expect(res.body).toMatchObject({
        data: null,
        errors: [
          {
            message: 'Forbidden access',
          },
        ],
      });
    });

    test('createUser is forbidden for admins', async () => {
      const res = await authReq({
        url: '/graphql',
        method: 'POST',
        body: {
          query: /* GraphQL */ `
            mutation {
              createUsersPermissionsUser(
                data: { username: "test", email: "test", password: "test" }
              ) {
                data {
                  id
                  attributes {
                    username
                  }
                }
              }
            }
          `,
        },
      });

      expect(res.statusCode).toBe(401);
      expect(res.body).toMatchObject({
        error: {
          status: 401,
          name: 'UnauthorizedError',
          message: 'Missing or invalid credentials',
          details: {},
        },
      });
    });
  });

  describe('Check updateUser authorizations', () => {
    test('updateUser is forbidden to public', async () => {
      const rq = createRequest({ balerion });
      const res = await rq({
        url: '/graphql',
        method: 'POST',
        body: {
          query: /* GraphQL */ `
            mutation {
              updateUsersPermissionsUser(
                id: 1
                data: { username: "test", email: "test", password: "test" }
              ) {
                data {
                  id
                  attributes {
                    username
                  }
                }
              }
            }
          `,
        },
      });

      expect(res.statusCode).toBe(200);
      expect(res.body).toMatchObject({
        data: null,
        errors: [
          {
            message: 'Forbidden access',
          },
        ],
      });
    });

    test('updateUser is forbidden for admins', async () => {
      const res = await authReq({
        url: '/graphql',
        method: 'POST',
        body: {
          query: /* GraphQL */ `
            mutation {
              updateUsersPermissionsUser(
                id: 1
                data: { username: "test", email: "test", password: "test" }
              ) {
                data {
                  id
                  attributes {
                    username
                  }
                }
              }
            }
          `,
        },
      });

      expect(res.statusCode).toBe(401);
      expect(res.body).toMatchObject({
        error: {
          status: 401,
          name: 'UnauthorizedError',
          message: 'Missing or invalid credentials',
          details: {},
        },
      });
    });

    describe('Check deleteUser authorizations', () => {
      test('deleteUser is forbidden to public', async () => {
        const rq = createRequest({ balerion });
        const res = await rq({
          url: '/graphql',
          method: 'POST',
          body: {
            query: /* GraphQL */ `
              mutation deleteUser {
                deleteUsersPermissionsUser(id: 1) {
                  data {
                    id
                    attributes {
                      username
                    }
                  }
                }
              }
            `,
          },
        });

        expect(res.statusCode).toBe(200);
        expect(res.body).toMatchObject({
          data: null,
          errors: [
            {
              message: 'Forbidden access',
            },
          ],
        });
      });

      test('deleteUser is authorized for admins', async () => {
        const res = await authReq({
          url: '/graphql',
          method: 'POST',
          body: {
            query: /* GraphQL */ `
              mutation deleteUser {
                deleteUsersPermissionsUser(id: 1) {
                  data {
                    id
                    attributes {
                      username
                    }
                  }
                }
              }
            `,
          },
        });

        expect(res.statusCode).toBe(401);
        expect(res.body).toMatchObject({
          error: {
            status: 401,
            name: 'UnauthorizedError',
            message: 'Missing or invalid credentials',
            details: {},
          },
        });
      });
    });
  });
});
