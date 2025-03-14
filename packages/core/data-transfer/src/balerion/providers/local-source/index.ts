import { Readable } from 'stream';
import { chain } from 'stream-chain';
import type { Core, Struct } from '@balerion/types';

import type { IMetadata, ISourceProvider, ProviderType } from '../../../../types';
import type { IDiagnosticReporter } from '../../../utils/diagnostic';
import { createEntitiesStream, createEntitiesTransformStream } from './entities';
import { createLinksStream } from './links';
import { createConfigurationStream } from './configuration';
import { createAssetsStream } from './assets';
import * as utils from '../../../utils';
import { assertValidBalerion } from '../../../utils/providers';

export interface ILocalBalerionSourceProviderOptions {
  getBalerion(): Core.Balerion | Promise<Core.Balerion>; // return an initialized instance of Balerion

  autoDestroy?: boolean; // shut down the instance returned by getBalerion() at the end of the transfer
}

export const createLocalBalerionSourceProvider = (options: ILocalBalerionSourceProviderOptions) => {
  return new LocalBalerionSourceProvider(options);
};

class LocalBalerionSourceProvider implements ISourceProvider {
  name = 'source::local-balerion';

  type: ProviderType = 'source';

  options: ILocalBalerionSourceProviderOptions;

  balerion?: Core.Balerion;

  #diagnostics?: IDiagnosticReporter;

  constructor(options: ILocalBalerionSourceProviderOptions) {
    this.options = options;
  }

  async bootstrap(diagnostics?: IDiagnosticReporter): Promise<void> {
    this.#diagnostics = diagnostics;
    this.balerion = await this.options.getBalerion();
    this.balerion.db.lifecycles.disable();
  }

  #reportInfo(message: string) {
    this.#diagnostics?.report({
      details: {
        createdAt: new Date(),
        message,
        origin: 'local-source-provider',
      },
      kind: 'info',
    });
  }

  /**
   * Reports an error to the diagnostic reporter.
   */
  #reportError(message: string, error: Error) {
    this.#diagnostics?.report({
      details: {
        createdAt: new Date(),
        message,
        error,
        severity: 'fatal',
        name: error.name,
      },
      kind: 'error',
    });
  }

  /**
   * Handles errors that occur in read streams.
   */
  #handleStreamError(streamType: string, err: Error) {
    const { message, stack } = err;
    const errorMessage = `[Data transfer] Error in ${streamType} read stream: ${message}`;
    const formattedError = {
      message: errorMessage,
      stack,
      timestamp: new Date().toISOString(),
    };

    this.balerion?.log.error(formattedError);
    this.#reportError(formattedError.message, err);
  }

  async close(): Promise<void> {
    const { autoDestroy } = this.options;
    assertValidBalerion(this.balerion);
    this.balerion.db.lifecycles.enable();
    // Basically `!== false` but more deterministic
    if (autoDestroy === undefined || autoDestroy === true) {
      await this.balerion?.destroy();
    }
  }

  getMetadata(): IMetadata {
    this.#reportInfo('getting metadata');
    const balerionVersion = balerion.config.get<string>('info.balerion');
    const createdAt = new Date().toISOString();

    return {
      createdAt,
      balerion: {
        version: balerionVersion,
      },
    };
  }

  async createEntitiesReadStream(): Promise<Readable> {
    assertValidBalerion(this.balerion, 'Not able to stream entities');
    this.#reportInfo('creating entities read stream');
    return chain([
      // Entities stream
      createEntitiesStream(this.balerion),

      // Transform stream
      createEntitiesTransformStream(),
    ]);
  }

  createLinksReadStream(): Readable {
    assertValidBalerion(this.balerion, 'Not able to stream links');
    this.#reportInfo('creating links read stream');

    return createLinksStream(this.balerion);
  }

  createConfigurationReadStream(): Readable {
    assertValidBalerion(this.balerion, 'Not able to stream configuration');
    this.#reportInfo('creating configuration read stream');
    return createConfigurationStream(this.balerion);
  }

  getSchemas(): Record<string, Struct.Schema> {
    assertValidBalerion(this.balerion, 'Not able to get Schemas');
    this.#reportInfo('getting schemas');
    const schemas = utils.schema.schemasToValidJSON({
      ...this.balerion.contentTypes,
      ...this.balerion.components,
    });

    return utils.schema.mapSchemasValues(schemas);
  }

  createSchemasReadStream(): Readable {
    return Readable.from(Object.values(this.getSchemas()));
  }

  createAssetsReadStream(): Readable {
    assertValidBalerion(this.balerion, 'Not able to stream assets');
    this.#reportInfo('creating assets read stream');

    const stream = createAssetsStream(this.balerion);
    stream.on('error', (err) => {
      this.#handleStreamError('assets', err);
    });

    return stream;
  }
}

export type ILocalBalerionSourceProvider = InstanceType<typeof LocalBalerionSourceProvider>;
