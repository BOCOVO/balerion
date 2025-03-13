const getService = (name) => {
  return balerion.service(`admin::${name}`);
};

export { getService };
