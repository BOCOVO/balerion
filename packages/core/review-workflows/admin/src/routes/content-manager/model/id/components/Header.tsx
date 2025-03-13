import { unstable_useDocumentLayout as useDocumentLayout } from '@balerion/content-manager/balerion-admin';
import { Flex } from '@strapi/design-system';
import { useParams } from 'react-router-dom';

import { AssigneeSelect } from './AssigneeSelect';
import { StageSelect } from './StageSelect';

const Header = () => {
  const {
    slug = '',
    id,
    collectionType,
  } = useParams<{
    collectionType: string;
    slug: string;
    id: string;
  }>();

  const {
    edit: { options },
  } = useDocumentLayout(slug);

  if (
    !window.balerion.isEE ||
    !options?.reviewWorkflows ||
    (collectionType !== 'single-types' && !id) ||
    id === 'create'
  ) {
    return null;
  }

  return (
    <Flex gap={2}>
      <AssigneeSelect isCompact />
      <StageSelect isCompact />
    </Flex>
  );
};

Header.type = 'preview';

export { Header };
