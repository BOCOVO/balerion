import { strings } from '@balerion/utils';

import type { Context } from 'koa';

import { getService } from '../utils';
import { ACTIONS, FOLDER_MODEL_UID, FILE_MODEL_UID } from '../constants';
import {
  validateDeleteManyFoldersFiles,
  validateMoveManyFoldersFiles,
} from './validation/admin/folder-file';

import type { File, Folder } from '../types';

export default {
  async deleteMany(ctx: Context) {
    const { body } = ctx.request;
    const {
      state: { userAbility },
    } = ctx;

    const pmFolder = balerion.service('admin::permission').createPermissionsManager({
      ability: ctx.state.userAbility,
      model: FOLDER_MODEL_UID,
    });

    const pmFile = balerion.service('admin::permission').createPermissionsManager({
      ability: userAbility,
      action: ACTIONS.read,
      model: FILE_MODEL_UID,
    });

    await validateDeleteManyFoldersFiles(body);

    const fileService = getService('file');
    const folderService = getService('folder');

    const deletedFiles = await fileService.deleteByIds(body.fileIds);
    const {
      folders: deletedFolders,
      totalFolderNumber,
      totalFileNumber,
    } = await folderService.deleteByIds(body.folderIds);

    if (deletedFiles.length + deletedFolders.length > 1) {
      balerion.telemetry.send('didBulkDeleteMediaLibraryElements', {
        eventProperties: {
          rootFolderNumber: deletedFolders.length,
          rootAssetNumber: deletedFiles.length,
          totalFolderNumber,
          totalAssetNumber: totalFileNumber + deletedFiles.length,
        },
      });
    }

    ctx.body = {
      data: {
        files: await pmFile.sanitizeOutput(deletedFiles),
        folders: await pmFolder.sanitizeOutput(deletedFolders),
      },
    };
  },
  async moveMany(ctx: Context) {
    const { body } = ctx.request;
    const {
      state: { userAbility },
    } = ctx;

    const pmFolder = balerion.service('admin::permission').createPermissionsManager({
      ability: ctx.state.userAbility,
      model: FOLDER_MODEL_UID,
    });

    const pmFile = balerion.service('admin::permission').createPermissionsManager({
      ability: userAbility,
      action: ACTIONS.read,
      model: FILE_MODEL_UID,
    });

    await validateMoveManyFoldersFiles(body);
    const { folderIds = [], fileIds = [], destinationFolderId } = body;

    let totalFolderNumber = 0;
    let totalFileNumber = 0;

    const trx = await balerion.db.transaction();
    try {
      // fetch folders
      const existingFolders = await balerion.db
        .queryBuilder(FOLDER_MODEL_UID)
        .select(['id', 'pathId', 'path'])
        .where({ id: { $in: folderIds } })
        .transacting(trx.get())
        .forUpdate()
        .execute<Folder[]>();

      // fetch files
      const existingFiles = await balerion.db
        .queryBuilder(FILE_MODEL_UID)
        .select(['id'])
        .where({ id: { $in: fileIds } })
        .transacting(trx.get())
        .forUpdate()
        .execute<File[]>();

      // fetch destinationFolder path
      let destinationFolderPath = '/';
      if (destinationFolderId !== null) {
        const destinationFolder = await balerion.db
          .queryBuilder(FOLDER_MODEL_UID)
          .select('path')
          .where({ id: destinationFolderId })
          .transacting(trx.get())
          .first()
          .execute<Folder>();
        destinationFolderPath = destinationFolder.path;
      }

      const fileTable = balerion.getModel(FILE_MODEL_UID).collectionName;
      const folderTable = balerion.getModel(FOLDER_MODEL_UID).collectionName;
      const folderPathColName =
        // @ts-expect-error - no dynamic typings for the models
        balerion.db.metadata.get(FILE_MODEL_UID).attributes.folderPath.columnName;
      // @ts-expect-error - no dynamic typings for the models
      const pathColName = balerion.db.metadata.get(FOLDER_MODEL_UID).attributes.path.columnName;

      if (existingFolders.length > 0) {
        // update folders' parent relation
        // @ts-expect-error - no dynamic typings for the models
        const { joinTable } = balerion.db.metadata.get(FOLDER_MODEL_UID).attributes.parent;
        await balerion.db
          .queryBuilder(joinTable.name)
          .transacting(trx.get())
          .delete()
          .where({ [joinTable.joinColumn.name]: { $in: folderIds } })
          .execute();

        if (destinationFolderId !== null) {
          await balerion.db
            .queryBuilder(joinTable.name)
            .transacting(trx.get())
            .insert(
              existingFolders.map((folder) => ({
                [joinTable.inverseJoinColumn.name]: destinationFolderId,
                [joinTable.joinColumn.name]: folder.id,
              }))
            )
            .execute();
        }

        for (const existingFolder of existingFolders) {
          let replaceQuery;
          switch (balerion.db.dialect.client) {
            case 'sqlite':
              replaceQuery = '? || SUBSTRING(??, ?)';
              break;
            case 'postgres':
              replaceQuery = 'CONCAT(?::TEXT, SUBSTRING(??, ?::INTEGER))';
              break;
            default:
              replaceQuery = 'CONCAT(?, SUBSTRING(??, ?))';
          }

          // update path for folders themselves & folders below
          totalFolderNumber = await balerion.db
            .getConnection(folderTable)
            .transacting(trx.get())
            .where(pathColName, existingFolder.path)
            .orWhere(pathColName, 'like', `${existingFolder.path}/%`)
            .update(
              pathColName,
              balerion.db.connection.raw(replaceQuery, [
                strings.joinBy('/', destinationFolderPath, `${existingFolder.pathId}`),
                pathColName,
                existingFolder.path.length + 1,
              ])
            );

          // update path of files below
          totalFileNumber = await balerion.db
            .getConnection(fileTable)
            .transacting(trx.get())
            .where(folderPathColName, existingFolder.path)
            .orWhere(folderPathColName, 'like', `${existingFolder.path}/%`)
            .update(
              folderPathColName,
              balerion.db.connection.raw(replaceQuery, [
                strings.joinBy('/', destinationFolderPath, `${existingFolder.pathId}`),
                folderPathColName,
                existingFolder.path.length + 1,
              ])
            );
        }
      }

      if (existingFiles.length > 0) {
        // update files' folder relation (delete + insert; upsert not possible)
        // @ts-expect-error - no dynamic typings for the models
        const fileJoinTable = balerion.db.metadata.get(FILE_MODEL_UID).attributes.folder.joinTable;
        await balerion.db
          .queryBuilder(fileJoinTable.name)
          .transacting(trx.get())
          .delete()
          .where({ [fileJoinTable.joinColumn.name]: { $in: fileIds } })
          .execute();

        if (destinationFolderId !== null) {
          await balerion.db
            .queryBuilder(fileJoinTable.name)
            .transacting(trx.get())
            .insert(
              existingFiles.map((file) => ({
                [fileJoinTable.inverseJoinColumn.name]: destinationFolderId,
                [fileJoinTable.joinColumn.name]: file.id,
              }))
            )
            .execute();
        }

        // update files main fields (path + updatedBy)
        await balerion.db
          .getConnection(fileTable)
          .transacting(trx.get())
          .whereIn('id', fileIds)
          .update(folderPathColName, destinationFolderPath);
      }

      await trx.commit();
    } catch (e) {
      await trx.rollback();
      throw e;
    }

    const updatedFolders = await balerion.db.query(FOLDER_MODEL_UID).findMany({
      where: { id: { $in: folderIds } },
    });

    const updatedFiles = await balerion.db.query(FILE_MODEL_UID).findMany({
      where: { id: { $in: fileIds } },
    });

    balerion.telemetry.send('didBulkMoveMediaLibraryElements', {
      eventProperties: {
        rootFolderNumber: updatedFolders.length,
        rootAssetNumber: updatedFiles.length,
        totalFolderNumber,
        totalAssetNumber: totalFileNumber + updatedFiles.length,
      },
    });

    ctx.body = {
      data: {
        files: await pmFile.sanitizeOutput(updatedFiles),
        folders: await pmFolder.sanitizeOutput(updatedFolders),
      },
    };
  },
};
