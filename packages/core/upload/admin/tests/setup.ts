import { server } from '@balerion/admin/balerion-admin/test';

import { handlers } from './handlers';

beforeAll(() => {
  server.listen();
});

beforeEach(() => {
  server.use(...handlers);
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});
