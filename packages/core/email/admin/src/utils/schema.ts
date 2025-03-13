import { translatedErrors } from '@balerion/admin/balerion-admin';
import * as yup from 'yup';

export const schema = yup.object().shape({
  email: yup.string().email(translatedErrors.email.id).required(translatedErrors.required.id),
});
