'use strict';

// Helpers.
const { createAuthRequest } = require('api-tests/request');
const { createBalerionInstance, superAdmin } = require('api-tests/balerion');
const { createUtils } = require('api-tests/utils');

const internals = {
  role: null,
};

describe('Admin Auth End to End', () => {
  let rq;
  let balerion;
  let utils;
  beforeAll(async () => {
    balerion = await createBalerionInstance();
    rq = await createAuthRequest({ balerion });
    utils = createUtils(balerion);

    internals.role = await utils.createRole({
      name: 'auth_test_role',
      description: 'Only used for auth crud test (api)',
    });
  });

  afterAll(async () => {
    await utils.deleteRolesById([internals.role.id]);

    await balerion.destroy();
  });

  describe('Login', () => {
    test('Can connect successfully', async () => {
      const res = await rq({
        url: '/admin/login',
        method: 'POST',
        body: superAdmin.loginInfo,
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toMatchObject({
        token: expect.any(String),
        user: {
          firstname: expect.stringOrNull(),
          lastname: expect.stringOrNull(),
          username: expect.stringOrNull(),
          email: expect.any(String),
          isActive: expect.any(Boolean),
        },
      });
    });

    test('Can login with password that no longer passes validation', async () => {
      // insert a user with a password that is over 72 bytes, which is not valid
      const longPassword = `aA1${'b'.repeat(100)}`;
      const someUser = await utils.createUser({
        email: 'some-user@balerion.io',
        firstname: 'some',
        lastname: 'user',
        password: longPassword,
      });

      const res = await rq({
        url: '/admin/login',
        method: 'POST',
        body: {
          email: someUser.email,
          password: longPassword,
        },
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toMatchObject({
        token: expect.any(String),
        user: {
          firstname: expect.stringOrNull(),
          lastname: expect.stringOrNull(),
          username: expect.stringOrNull(),
          email: expect.any(String),
          isActive: expect.any(Boolean),
        },
      });
    });

    test('Fails on invalid password', async () => {
      const res = await rq({
        url: '/admin/login',
        method: 'POST',
        body: {
          ...superAdmin.loginInfo,
          password: 'wrongPassword',
        },
      });

      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({
        data: null,
        error: {
          status: 400,
          name: 'ApplicationError',
          message: 'Invalid credentials',
          details: {},
        },
      });
    });

    test('Fails on invalid email', async () => {
      const res = await rq({
        url: '/admin/login',
        method: 'POST',
        body: {
          email: 'non-existent-user@balerion.io',
          password: 'pcw123',
        },
      });

      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({
        data: null,
        error: {
          status: 400,
          name: 'ApplicationError',
          message: 'Invalid credentials',
          details: {},
        },
      });
    });

    test('Fails on missing credentials', async () => {
      const res = await rq({
        url: '/admin/login',
        method: 'POST',
        body: {
          email: 'non-existent-user@balerion.io',
        },
      });

      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({
        data: null,
        error: {
          status: 400,
          name: 'ApplicationError',
          message: 'Missing credentials',
          details: {},
        },
      });
    });
  });

  describe('Renew token', () => {
    test('Renew token', async () => {
      const authRes = await rq({
        url: '/admin/login',
        method: 'POST',
        body: superAdmin.loginInfo,
      });

      expect(authRes.statusCode).toBe(200);
      const { token } = authRes.body.data;

      const res = await rq({
        url: '/admin/renew-token',
        method: 'POST',
        body: {
          token,
        },
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toEqual({
        token: expect.any(String),
      });
    });

    test('Fails on invalid token', async () => {
      const res = await rq({
        url: '/admin/renew-token',
        method: 'POST',
        body: {
          token: 'invalid-token',
        },
      });

      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({
        data: null,
        error: {
          status: 400,
          name: 'ValidationError',
          message: 'Invalid token',
          details: {},
        },
      });
    });

    test('Fails on missing token', async () => {
      const res = await rq({
        url: '/admin/renew-token',
        method: 'POST',
        body: {},
      });

      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({
        data: null,
        error: {
          status: 400,
          message: 'token is a required field',
          name: 'ValidationError',
          details: {
            errors: [
              {
                message: 'token is a required field',
                name: 'ValidationError',
                path: ['token'],
              },
            ],
          },
        },
      });
    });
  });

  describe('GET /registration-info', () => {
    const registrationToken = 'foobar';
    let user;

    beforeAll(async () => {
      const userInfo = {
        email: 'test@balerion.io',
        firstname: 'test',
        lastname: 'balerion',
        roles: [internals.role.id],
        registrationToken,
        isActive: false,
      };

      user = await utils.createUser(userInfo);
    });

    afterAll(async () => {
      await utils.deleteUserById(user.id);
    });

    test('Returns registration info', async () => {
      const res = await rq({
        url: `/admin/registration-info?registrationToken=${registrationToken}`,
        method: 'GET',
        body: {},
      });

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        data: {
          email: user.email,
          firstname: user.firstname,
          lastname: user.lastname,
        },
      });
    });

    test('Fails on missing registration token', async () => {
      const res = await rq({
        url: '/admin/registration-info',
        method: 'GET',
        body: {},
      });

      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({
        data: null,
        error: {
          status: 400,
          details: {
            errors: [
              {
                message: 'registrationToken is a required field',
                name: 'ValidationError',
                path: ['registrationToken'],
              },
            ],
          },
          message: 'registrationToken is a required field',
          name: 'ValidationError',
        },
      });
    });

    test('Fails on invalid registration token. Without too much info', async () => {
      const res = await rq({
        url: '/admin/registration-info?registrationToken=ABCD',
        method: 'GET',
        body: {},
      });

      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({
        data: null,
        error: {
          status: 400,
          name: 'ValidationError',
          message: 'Invalid registrationToken',
          details: {},
        },
      });
    });
  });

  describe('GET /register', () => {
    let user;

    beforeEach(async () => {
      const userInfo = {
        email: 'test@balerion.io',
        firstname: 'test',
        lastname: 'balerion',
        registrationToken: 'foobar',
      };

      user = await utils.createUser(userInfo);
    });

    afterEach(async () => {
      await utils.deleteUserById(user.id);
    });

    test('Fails on missing payload', async () => {
      const res = await rq({
        url: '/admin/register',
        method: 'POST',
        body: {
          userInfo: {},
        },
      });

      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({
        data: null,
        error: {
          status: 400,
          details: {
            errors: [
              {
                message: 'registrationToken is a required field',
                name: 'ValidationError',
                path: ['registrationToken'],
              },
              {
                message: 'userInfo.firstname is a required field',
                name: 'ValidationError',
                path: ['userInfo', 'firstname'],
              },
              {
                message: 'userInfo.password is a required field',
                name: 'ValidationError',
                path: ['userInfo', 'password'],
              },
            ],
          },
          message: '3 errors occurred',
          name: 'ValidationError',
        },
      });
    });

    test('Fails on invalid password', async () => {
      const res = await rq({
        url: '/admin/register',
        method: 'POST',
        body: {
          registrationToken: user.registrationToken,
          userInfo: {
            firstname: 'test',
            lastname: 'Balerion',
            password: '123',
          },
        },
      });

      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({
        data: null,
        error: {
          status: 400,
          details: {
            errors: [
              {
                message: 'userInfo.password must be at least 8 characters',
                name: 'ValidationError',
                path: ['userInfo', 'password'],
                value: '123',
              },
              {
                message: 'userInfo.password must contain at least one lowercase character',
                name: 'ValidationError',
                path: ['userInfo', 'password'],
                value: '123',
              },
              {
                message: 'userInfo.password must contain at least one uppercase character',
                name: 'ValidationError',
                path: ['userInfo', 'password'],
                value: '123',
              },
            ],
          },
          message: '3 errors occurred',
          name: 'ValidationError',
        },
      });
    });

    test('Fails on password of 73 bytes', async () => {
      const password = `aA1${'b'.repeat(70)}`;
      const res = await rq({
        url: '/admin/register',
        method: 'POST',
        body: {
          registrationToken: user.registrationToken,
          userInfo: {
            firstname: 'test',
            lastname: 'Balerion',
            password,
          },
        },
      });

      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({
        data: null,
        error: {
          status: 400,
          details: {
            errors: [
              {
                message: 'userInfo.password must be less than 73 bytes',
                name: 'ValidationError',
                value: password,
                path: ['userInfo', 'password'],
              },
            ],
          },
          message: 'userInfo.password must be less than 73 bytes',
          name: 'ValidationError',
        },
      });
    });

    test('Registers user correctly', async () => {
      const userRegistrationInfo = {
        firstname: 'test',
        lastname: 'Balerion',
        password: '1Test2azda3',
      };

      const res = await rq({
        url: '/admin/register',
        method: 'POST',
        body: {
          registrationToken: user.registrationToken,
          userInfo: userRegistrationInfo,
        },
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toMatchObject({
        token: expect.any(String),
        user: {
          email: user.email,
          firstname: 'test',
          lastname: 'Balerion',
        },
      });

      expect(res.body.data.user.password === userRegistrationInfo.password).toBe(false);
    });
  });

  describe('GET /register-admin', () => {
    test('Fails on missing payload', async () => {
      const res = await rq({
        url: '/admin/register-admin',
        method: 'POST',
        body: {},
      });

      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({
        data: null,
        error: {
          status: 400,
          details: {
            errors: [
              {
                message: 'email is a required field',
                name: 'ValidationError',
                path: ['email'],
              },
              {
                message: 'firstname is a required field',
                name: 'ValidationError',
                path: ['firstname'],
              },
              {
                message: 'password is a required field',
                name: 'ValidationError',
                path: ['password'],
              },
            ],
          },
          message: '3 errors occurred',
          name: 'ValidationError',
        },
      });
    });

    test('Fails on invalid password', async () => {
      const res = await rq({
        url: '/admin/register-admin',
        method: 'POST',
        body: {
          email: 'test@balerion.io',
          firstname: 'test',
          lastname: 'Balerion',
          password: '123',
        },
      });

      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({
        data: null,
        error: {
          status: 400,
          details: {
            errors: [
              {
                message: 'password must be at least 8 characters',
                name: 'ValidationError',
                path: ['password'],
                value: '123',
              },
              {
                message: 'password must contain at least one lowercase character',
                name: 'ValidationError',
                path: ['password'],
                value: '123',
              },
              {
                message: 'password must contain at least one uppercase character',
                name: 'ValidationError',
                path: ['password'],
                value: '123',
              },
            ],
          },
          message: '3 errors occurred',
          name: 'ValidationError',
        },
      });
    });

    test('Fails if already a user', async () => {
      const userInfo = {
        email: 'test-admin@balerion.io',
        firstname: 'test',
        lastname: 'Balerion',
        password: '1Test2azda3',
      };

      const res = await rq({
        url: '/admin/register-admin',
        method: 'POST',
        body: userInfo,
      });

      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({
        data: null,
        error: {
          status: 400,
          name: 'ApplicationError',
          message: 'You cannot register a new super admin',
          details: {},
        },
      });
    });
  });

  describe('POST /forgot-password', () => {
    test('Always returns en empty response', async () => {
      global.balerion.service('admin::auth').forgotPassword = jest.fn(() => {});

      const res = await rq({
        url: '/admin/forgot-password',
        method: 'POST',
        body: {
          email: 'admin@balerion.io',
        },
      });

      expect(res.statusCode).toBe(204);
      expect(res.body).toStrictEqual({});

      const nonExistentRes = await rq({
        url: '/admin/forgot-password',
        method: 'POST',
        body: {
          email: 'email-do-not-exist@balerion.io',
        },
      });

      expect(nonExistentRes.statusCode).toBe(204);
      expect(nonExistentRes.body).toStrictEqual({});
    });
  });
});
