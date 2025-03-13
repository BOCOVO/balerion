import * as React from 'react';

import { render, waitFor } from '@balerion/balerion/admin/test';

import { ProvidersPage } from '../index';

jest.mock('@balerion/balerion/admin', () => ({
  ...jest.requireActual('@balerion/balerion/admin'),
  useRBAC: jest.fn(() => ({
    isLoading: false,
    allowedActions: { canUpdate: false },
  })),
}));

describe('Admin | containers | ProvidersPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should show a list of providers', async () => {
    const { getByText, getByTestId } = render(<ProvidersPage />);

    await waitFor(() => {
      expect(getByText('email')).toBeInTheDocument();
      expect(getByTestId('enable-email').textContent).toEqual('Enabled');
      expect(getByTestId('enable-discord').textContent).toEqual('Disabled');
    });
  });
});
