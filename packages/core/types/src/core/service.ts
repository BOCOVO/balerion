export type Service = {
  // TODO [V5] Consider changing the any value to unknown.
  // See: https://github.com/balerion/balerion/issues/16993 and https://github.com/balerion/balerion/pull/17020 for further information
  [key: keyof any]: any;
};
