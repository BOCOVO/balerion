import { RenderAdminArgs, renderAdmin } from '@balerion/admin/balerion-admin';
import contentTypeBuilder from '@balerion/content-type-builder/balerion-admin';
import contentManager from '@balerion/content-manager/balerion-admin';
import email from '@balerion/email/balerion-admin';
import upload from '@balerion/upload/balerion-admin';
import i18n from '@balerion/i18n/balerion-admin';
import contentReleases from '@balerion/content-releases/balerion-admin';
import reviewWorkflows from '@balerion/review-workflows/balerion-admin';

const render = (mountNode: HTMLElement | null, { plugins, ...restArgs }: RenderAdminArgs) => {
  return renderAdmin(mountNode, {
    ...restArgs,
    plugins: {
      'content-manager': contentManager,
      'content-type-builder': contentTypeBuilder,
      email,
      upload,
      contentReleases,
      i18n,
      reviewWorkflows,
      ...plugins,
    },
  });
};

export { render as renderAdmin };
export type { RenderAdminArgs };

export * from '@balerion/admin/balerion-admin';

export {
  unstable_useDocumentLayout,
  unstable_useDocumentActions,
  unstable_useDocument,
  unstable_useContentManagerContext,
  useDocumentRBAC,
} from '@balerion/content-manager/balerion-admin';

export {
  private_useAutoReloadOverlayBlocker,
  private_AutoReloadOverlayBlockerProvider,
} from '@balerion/content-type-builder/balerion-admin';
