import pluginPkg from '../../package.json';

const pluginId = pluginPkg.name.replace(/^balerion-plugin-/i, '');

export default pluginId;
