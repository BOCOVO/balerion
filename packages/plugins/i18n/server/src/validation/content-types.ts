import { yup, validateYupSchema } from '@balerion/utils';

import { get } from 'lodash/fp';

const validateGetNonLocalizedAttributesSchema = yup
  .object()
  .shape({
    model: yup.string().required(),
    id: yup.mixed().when('model', {
      is: (model: any) => get('kind', balerion.contentType(model)) === 'singleType',
      then: yup.balerionID().nullable(),
      otherwise: yup.balerionID().required(),
    }),
    locale: yup.string().required(),
  })
  .noUnknown()
  .required();

const validateGetNonLocalizedAttributesInput = validateYupSchema(
  validateGetNonLocalizedAttributesSchema
);

export { validateGetNonLocalizedAttributesInput };
