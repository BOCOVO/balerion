import { createJwtToken, getTokenOptions, decodeJwtToken, createToken } from '../token';

const delay = (time: any) =>
  new Promise((resolve) => {
    setTimeout(resolve, time);
  });

describe('Token', () => {
  describe('token options', () => {
    test('Has defaults', () => {
      const getFn = jest.fn(() => ({}));
      global.balerion = {
        config: {
          get: getFn,
        },
      } as any;

      const res = getTokenOptions();

      expect(getFn).toHaveBeenCalledWith('admin.auth', {});
      expect(res).toEqual({ options: { expiresIn: '30d' } });
    });

    test('Merges defaults with configuration', () => {
      const config = {
        options: {},
        secret: '123',
      };

      const getFn = jest.fn(() => config);
      global.balerion = {
        config: {
          get: getFn,
        },
      } as any;

      const res = getTokenOptions();

      expect(getFn).toHaveBeenCalledWith('admin.auth', {});
      expect(res).toEqual({
        options: {
          expiresIn: '30d',
        },
        secret: config.secret,
      });
    });

    test('Overwrite defaults with configuration options', () => {
      const config = {
        options: {
          expiresIn: '1d',
        },
        secret: '123',
      };

      const getFn = jest.fn(() => config);
      global.balerion = {
        config: {
          get: getFn,
        },
      } as any;

      const res = getTokenOptions();

      expect(getFn).toHaveBeenCalledWith('admin.auth', {});
      expect(res).toEqual({
        options: {
          expiresIn: '1d',
        },
        secret: config.secret,
      });
    });
  });

  describe('createJwtToken', () => {
    test('Returns a jwt token', () => {
      global.balerion = {
        config: {
          get() {
            return {
              secret: 'test-123',
            };
          },
        },
      } as any;

      const token = createJwtToken({ id: 1 });

      expect(token).toBeDefined();
      expect(typeof token === 'string').toBe(true);
    });

    test('Token payload does not leak user infos', () => {
      global.balerion = {
        config: {
          get() {
            return {
              secret: 'test-123',
            };
          },
        },
      } as any;

      const token = createJwtToken({
        id: 1,
      });

      const { payload } = decodeJwtToken(token);

      expect(payload).toEqual({
        id: 1,
        iat: expect.any(Number),
        exp: expect.any(Number),
      });
    });
  });

  describe('decodeJwtToken', () => {
    test('Fails if the token is invalid', () => {
      const { payload, isValid } = decodeJwtToken('invalid-token');
      expect(payload).toBe(null);
      expect(isValid).toBe(false);
    });

    test('Fails if the token was not generated with the same secret', () => {
      global.balerion = {
        config: {
          get() {
            return {
              secret: 'test-123',
            };
          },
        },
      } as any;

      const user = { id: 1 };
      const token = createJwtToken(user);

      global.balerion = {
        config: {
          get() {
            return {
              secret: 'not-the-same-secret',
            };
          },
        },
      } as any;

      const { payload, isValid } = decodeJwtToken(token);
      expect(payload).toBe(null);
      expect(isValid).toBe(false);
    });

    test('Fails if the token has expired', async () => {
      global.balerion = {
        config: {
          get() {
            return {
              options: {
                expiresIn: '1ms',
              },
              secret: 'test-123',
            };
          },
        },
      } as any;

      const user = { id: 1 };
      const token = createJwtToken(user);

      await delay(10);

      const { payload, isValid } = decodeJwtToken(token);
      expect(payload).toBe(null);
      expect(isValid).toBe(false);
    });

    test('Returns payload if token is valid', async () => {
      global.balerion = {
        config: {
          get() {
            return {
              options: { expiresIn: '30d' },
              secret: 'test-123',
            };
          },
        },
      } as any;

      const user = { id: 1 };
      const token = createJwtToken(user);

      const { payload, isValid } = decodeJwtToken(token);
      expect(payload).toEqual({
        id: 1,
        iat: expect.any(Number),
        exp: expect.any(Number),
      });
      expect(isValid).toBe(true);
    });
  });

  describe('createToken', () => {
    test('Create a random token of length 128', () => {
      const token = createToken();

      expect(token).toBeDefined();
      expect(typeof token === 'string').toBe(true);
      expect(token.length).toBe(40);
    });
  });
});
