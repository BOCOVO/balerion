import { translatedErrors } from '@balerion/balerion/admin';
import * as yup from 'yup';

export const createRoleSchema = yup.object().shape({
  name: yup.string().required(translatedErrors.required.id),
  description: yup.string().required(translatedErrors.required.id),
});
