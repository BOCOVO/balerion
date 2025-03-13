import type { UID, Data, Core } from '@balerion/types';

import type { SettingsService } from '../services/settings';
import type { ReleaseService } from '../services/release';
import type { ReleaseActionService } from '../services/release-action';

type Services = {
  release: ReleaseService;
  'release-validation': any;
  scheduling: any;
  'release-action': ReleaseActionService;
  'event-manager': any;
  settings: SettingsService;
};

interface Action {
  contentType: UID.ContentType;
  documentId?: Data.DocumentID;
  locale?: string;
}

export const getService = <TName extends keyof Services>(
  name: TName,
  { balerion }: { balerion: Core.Balerion }
): Services[TName] => {
  return balerion.plugin('content-releases').service(name);
};

export const getDraftEntryValidStatus = async (
  { contentType, documentId, locale }: Action,
  { balerion }: { balerion: Core.Balerion }
) => {
  const populateBuilderService = balerion.plugin('content-manager').service('populate-builder');
  // @ts-expect-error - populateBuilderService should be a function but is returning service
  const populate = await populateBuilderService(contentType).populateDeep(Infinity).build();

  const entry = await getEntry({ contentType, documentId, locale, populate }, { balerion });

  return isEntryValid(contentType, entry, { balerion });
};

export const isEntryValid = async (
  contentTypeUid: string,
  entry: any,
  { balerion }: { balerion: Core.Balerion }
) => {
  try {
    // @TODO: When documents service has validateEntityCreation method, use it instead
    await balerion.entityValidator.validateEntityCreation(
      balerion.getModel(contentTypeUid as UID.ContentType),
      entry,
      undefined,
      // @ts-expect-error - FIXME: entity here is unnecessary
      entry
    );

    const workflowsService = balerion.plugin('review-workflows').service('workflows');
    const workflow = await workflowsService.getAssignedWorkflow(contentTypeUid, {
      populate: 'stageRequiredToPublish',
    });

    if (workflow?.stageRequiredToPublish) {
      return entry.balerion_stage.id === workflow.stageRequiredToPublish.id;
    }

    return true;
  } catch {
    return false;
  }
};

export const getEntry = async (
  {
    contentType,
    documentId,
    locale,
    populate,
    status = 'draft',
  }: Action & { status?: 'draft' | 'published'; populate: any },
  { balerion }: { balerion: Core.Balerion }
) => {
  if (documentId) {
    // Try to get an existing draft or published document
    const entry = await balerion
      .documents(contentType)
      .findOne({ documentId, locale, populate, status });

    // The document isn't published yet, but the action is to publish it, fetch the draft
    if (status === 'published' && !entry) {
      return balerion
        .documents(contentType)
        .findOne({ documentId, locale, populate, status: 'draft' });
    }

    return entry;
  }

  return balerion.documents(contentType).findFirst({ locale, populate, status });
};

export const getEntryStatus = async (contentType: UID.ContentType, entry: Data.ContentType) => {
  if (entry.publishedAt) {
    return 'published';
  }

  const publishedEntry = await balerion.documents(contentType).findOne({
    documentId: entry.documentId,
    locale: entry.locale,
    status: 'published',
    fields: ['updatedAt'],
  });

  if (!publishedEntry) {
    return 'draft';
  }

  const entryUpdatedAt = new Date(entry.updatedAt).getTime();
  const publishedEntryUpdatedAt = new Date(publishedEntry.updatedAt).getTime();

  if (entryUpdatedAt > publishedEntryUpdatedAt) {
    return 'modified';
  }

  return 'published';
};
