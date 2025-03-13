import { DesignSystemProvider } from '@strapi/design-system';
import { render as renderTL } from '@testing-library/react';
import { IntlProvider } from 'react-intl';

import { FromComputerForm } from '../FromComputerForm';

jest.mock('@balerion/admin/balerion-admin', () => ({
  ...jest.requireActual('@balerion/admin/balerion-admin'),
  getFetchClient: jest.fn().mockReturnValue({
    get: jest.fn(),
  }),
}));

describe('FromComputerForm', () => {
  it('snapshots the component', async () => {
    const { container } = renderTL(
      <IntlProvider locale="en" messages={{}}>
        <DesignSystemProvider>
          <FromComputerForm onClose={jest.fn()} onAddAssets={jest.fn()} />
        </DesignSystemProvider>
      </IntlProvider>
    );

    expect(container).toMatchSnapshot();
  });
});
