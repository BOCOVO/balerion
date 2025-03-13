import { REVIEW_WORKFLOW_COLUMNS } from '../routes/content-manager/model/constants';

import type { ListFieldLayout, ListLayout } from '@balerion/content-manager/balerion-admin';

/* -------------------------------------------------------------------------------------------------
 * addColumnToTableHook
 * -----------------------------------------------------------------------------------------------*/
interface AddColumnToTableHookArgs {
  layout: ListLayout;
  displayedHeaders: ListFieldLayout[];
}

const addColumnToTableHook = ({ displayedHeaders, layout }: AddColumnToTableHookArgs) => {
  const { options } = layout;

  if (!options.reviewWorkflows) {
    return { displayedHeaders, layout };
  }

  return {
    displayedHeaders: [...displayedHeaders, ...REVIEW_WORKFLOW_COLUMNS],
    layout,
  };
};

export { addColumnToTableHook };
