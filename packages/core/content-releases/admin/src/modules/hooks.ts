import { Dispatch } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

import type { Store } from '@balerion/admin/balerion-admin';

type RootState = ReturnType<Store['getState']>;

const useTypedDispatch: () => Dispatch = useDispatch;
const useTypedSelector: TypedUseSelectorHook<RootState> = useSelector;

export { useTypedSelector, useTypedDispatch };
