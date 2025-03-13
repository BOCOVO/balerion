import * as React from 'react';

import { render, screen, waitFor } from '@balerion/balerion/admin/test';

import { EmailTemplatesPage } from '../index';

jest.mock('@balerion/balerion/admin', () => ({
  ...jest.requireActual('@balerion/balerion/admin'),
  useRBAC: jest.fn().mockImplementation(() => ({
    isLoading: false,
    allowedActions: { canUpdate: true },
  })),
}));

describe('ADMIN | Pages | Settings | Email Templates', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  it('renders and matches the snapshot', async () => {
    render(<EmailTemplatesPage />);

    await waitFor(() => {
      expect(screen.getByText('Reset password')).toBeInTheDocument();
    });
  });
});
