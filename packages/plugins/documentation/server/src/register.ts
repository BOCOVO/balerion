import type { Core } from '@balerion/types';

import { addDocumentMiddlewares } from './middlewares/documentation';

export async function register({ balerion }: { balerion: Core.Balerion }) {
  await addDocumentMiddlewares({ balerion });
}
