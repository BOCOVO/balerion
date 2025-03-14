import { SerializedError } from '@reduxjs/toolkit';
import { type UnknownApiError, type ApiError } from '@balerion/balerion/admin';

type BaseQueryError = ApiError | UnknownApiError | SerializedError;

const isBaseQueryError = (error: BaseQueryError): error is ApiError | UnknownApiError => {
  return error.name !== undefined;
};

export { isBaseQueryError };
