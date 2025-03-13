import { SerializedError } from '@reduxjs/toolkit';
import { ApiError } from '@balerion/admin/balerion-admin';

type BaseQueryError = ApiError | SerializedError;

const isBaseQueryError = (error?: BaseQueryError): error is BaseQueryError => {
  return typeof error !== 'undefined' && error.name !== undefined;
};

export { isBaseQueryError };
export type { BaseQueryError };
