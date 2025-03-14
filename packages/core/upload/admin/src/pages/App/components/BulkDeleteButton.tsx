import { ConfirmDialog } from '@balerion/admin/balerion-admin';
import { Button, Dialog } from '@strapi/design-system';
import { Trash } from '@strapi/icons';
import { useIntl } from 'react-intl';

import { useBulkRemove } from '../../../hooks/useBulkRemove';

import type { File } from '../../../../../shared/contracts/files';
import type { FolderDefinition } from '../../../../../shared/contracts/folders';

export interface FileWithType extends File {
  type: string;
}

export interface BulkDeleteButtonProps {
  selected: Array<FileWithType | FolderDefinition>;
  onSuccess: () => void;
}

export const BulkDeleteButton = ({ selected, onSuccess }: BulkDeleteButtonProps) => {
  const { formatMessage } = useIntl();
  const { remove } = useBulkRemove();

  const handleConfirmRemove = async () => {
    await remove(selected);
    onSuccess();
  };

  return (
    <Dialog.Root>
      <Dialog.Trigger>
        <Button variant="danger-light" size="S" startIcon={<Trash />}>
          {formatMessage({ id: 'global.delete', defaultMessage: 'Delete' })}
        </Button>
      </Dialog.Trigger>
      <ConfirmDialog onConfirm={handleConfirmRemove} />
    </Dialog.Root>
  );
};
