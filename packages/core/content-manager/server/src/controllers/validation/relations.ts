import { yup, validateYupSchema } from '@balerion/utils';

const validateFindAvailableSchema = yup
  .object()
  .shape({
    component: yup.string(),
    id: yup.balerionID(),
    _q: yup.string(),
    idsToOmit: yup.array().of(yup.balerionID()),
    idsToInclude: yup.array().of(yup.balerionID()),
    page: yup.number().integer().min(1),
    pageSize: yup.number().integer().min(1).max(100),
    locale: yup.string().nullable(),
    status: yup.string().oneOf(['published', 'draft']).nullable(),
  })
  .required();

const validateFindExistingSchema = yup
  .object()
  .shape({
    page: yup.number().integer().min(1),
    pageSize: yup.number().integer().min(1).max(100),
    locale: yup.string().nullable(),
    status: yup.string().oneOf(['published', 'draft']).nullable(),
  })
  .required();

const validateFindAvailable = validateYupSchema(validateFindAvailableSchema, { strict: false });
const validateFindExisting = validateYupSchema(validateFindExistingSchema, { strict: false });

export { validateFindAvailable, validateFindExisting };
