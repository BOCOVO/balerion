import { yup, validateYupSchema } from '@balerion/utils';
import { isValidCategoryName } from './common';

const componentCategorySchema = yup
  .object({
    name: yup.string().min(3).test(isValidCategoryName).required('name.required'),
  })
  .noUnknown();

export default validateYupSchema(componentCategorySchema);
