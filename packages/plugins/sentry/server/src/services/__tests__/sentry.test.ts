import Sentry, { type NodeOptions } from '@sentry/node';

import sentryServiceLoader from '../sentry';
import defaultConfig from '../../config';

const INVALID_DSN = 'an_invalid_dsn';
const VALID_DSN = 'a_valid_dsn';

jest.mock('@sentry/node', () => {
  return {
    init(options: NodeOptions = {}) {
      if (options.dsn !== VALID_DSN) {
        throw Error('invalid dsn');
      }
    },
    captureException: jest.fn(),
    withScope(configureScope: () => void) {
      configureScope();
    },
  };
});

describe('Sentry service', () => {
  beforeEach(() => {
    // Reset Balerion state
    global.balerion = {
      config: {
        // @ts-expect-error - ignore the generic type
        get: () => defaultConfig,
        set: jest.fn(),
        has: jest.fn(),
      },
      // @ts-expect-error - we only need a subset of the balerion log object
      log: {
        warn: jest.fn(),
        info: jest.fn(),
      },
    };
  });

  afterEach(() => {
    // Reset the plugin resource state
    jest.resetModules();
  });

  it('disables Sentry when no DSN is provided', () => {
    const sentryService = sentryServiceLoader({ balerion });
    sentryService.init();
    expect(balerion.log.info).toHaveBeenCalledWith(expect.stringMatching(/disabled/i));

    const instance = sentryService.getInstance();
    expect(instance).toBeNull();
  });

  it('disables Sentry when an invalid DSN is provided', () => {
    // @ts-expect-error - ignore the generic type
    global.balerion.config.get = () => ({ dsn: INVALID_DSN });
    const sentryService = sentryServiceLoader({ balerion });
    sentryService.init();
    expect(balerion.log.warn).toHaveBeenCalledWith(expect.stringMatching(/could not set up sentry/i));

    const instance = sentryService.getInstance();
    expect(instance).toBeNull();
  });

  it("doesn't send events before init", () => {
    const sentryService = sentryServiceLoader({ balerion });
    sentryService.sendError(Error());
    expect(balerion.log.warn).toHaveBeenCalledWith(expect.stringMatching(/cannot send event/i));
  });

  it('initializes and sends errors', () => {
    // @ts-expect-error - ignore the generic type
    global.balerion.config.get = () => ({ dsn: VALID_DSN, sendMetadata: true });
    const sentryService = sentryServiceLoader({ balerion });
    sentryService.init();

    // Saves the instance correctly
    const instance = sentryService.getInstance();
    expect(instance).not.toBeNull();

    // Doesn't allow re-init
    sentryService.init();

    // Send error
    const error = Error('an error');
    const configureScope = jest.fn();
    sentryService.sendError(error, configureScope);
    expect(configureScope).toHaveBeenCalled();
    const captureExceptionSpy = jest.spyOn(Sentry, 'captureException');
    expect(captureExceptionSpy).toHaveBeenCalled();
  });

  it('does not send metadata when the option is disabled', () => {
    // Init with metadata option disabled
    // @ts-expect-error - ignore the generic type
    global.balerion.config.get = () => ({ dsn: VALID_DSN, sendMetadata: false });
    const sentryService = sentryServiceLoader({ balerion });
    sentryService.init();

    // Send error
    const error = Error('an error');
    const configureScope = jest.fn();
    sentryService.sendError(error, configureScope);
    expect(configureScope).not.toHaveBeenCalled();
  });
});
