import admin from './admin';
import preview from '../preview';

export default {
  admin,
  ...(preview.routes ? preview.routes : {}),
};
