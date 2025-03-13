'use strict';

const { isFunction, isNil, prop } = require('lodash/fp');
const { createBalerionInstance } = require('./balerion');
const componentData = require('../../core/core/src/services/document-service/components');

const toContentTypeUID = (name) => {
  return name.includes('::') ? name : `api::${name}.${name}`;
};

const toCompoUID = (name) => {
  return `default.${name}`;
};

const createHelpers = async ({ balerion: balerionInstance = null, ...options } = {}) => {
  const balerion = balerionInstance || (await createBalerionInstance(options));
  const contentTypeService = balerion.plugin('content-type-builder').service('content-types');
  const componentsService = balerion.plugin('content-type-builder').service('components');

  const cleanup = async () => {
    if (isNil(balerionInstance)) {
      await balerion.destroy();
    }
  };

  return {
    balerion,
    contentTypeService,
    componentsService,
    cleanup,
  };
};

const createContentType = async (model, { balerion } = {}) => {
  const { contentTypeService, cleanup } = await createHelpers({ balerion });

  const contentType = await contentTypeService.createContentType({
    contentType: {
      ...model,
    },
  });

  await cleanup();

  return contentType;
};

const createContentTypes = async (models, { balerion } = {}) => {
  const { contentTypeService, cleanup } = await createHelpers({ balerion });

  const contentTypes = await contentTypeService.createContentTypes(
    models.map((model) => ({
      contentType: {
        ...model,
      },
    }))
  );

  await cleanup();

  return contentTypes;
};

const createComponent = async (component, { balerion } = {}) => {
  const { componentsService, cleanup } = await createHelpers({ balerion });

  const createdComponent = await componentsService.createComponent({
    component: {
      category: 'default',
      icon: 'default',
      ...component,
    },
  });

  await cleanup();

  return createdComponent;
};

const createComponents = async (components, { balerion } = {}) => {
  const createdComponents = [];

  for (const component of components) {
    createdComponents.push(await createComponent(component, { balerion }));
  }

  return createdComponents;
};

const deleteComponent = async (componentUID, { balerion } = {}) => {
  const { componentsService, cleanup } = await createHelpers({ balerion });

  const component = await componentsService.deleteComponent(componentUID);

  await cleanup();

  return component;
};

const deleteComponents = async (componentsUID, { balerion } = {}) => {
  const deletedComponents = [];

  for (const componentUID of componentsUID) {
    deletedComponents.push(await deleteComponent(componentUID, { balerion }));
  }

  return deletedComponents;
};

const deleteContentType = async (uid, { balerion } = {}) => {
  const { contentTypeService, cleanup } = await createHelpers({ balerion });

  const contentType = await contentTypeService.deleteContentType(uid);

  await cleanup();

  return contentType;
};

const deleteContentTypes = async (modelsUIDs, { balerion } = {}) => {
  const { contentTypeService, cleanup } = await createHelpers({ balerion });

  const contentTypes = await contentTypeService.deleteContentTypes(modelsUIDs);

  await cleanup();

  return contentTypes;
};

async function cleanupModel(uid, { balerion: balerionIst } = {}) {
  const { balerion, cleanup } = await createHelpers({ balerion: balerionIst });

  await balerion.db.query(uid).deleteMany();

  await cleanup();
}

async function cleanupModels(models, { balerion } = {}) {
  for (const model of models) {
    await cleanupModel(model, { balerion });
  }
}

async function createFixtures(dataMap, { balerion: balerionIst } = {}) {
  const { balerion, cleanup } = await createHelpers({ balerion: balerionIst });
  const models = Object.keys(dataMap);
  const resultMap = {};

  for (const model of models) {
    const entries = [];

    for (const data of dataMap[model]) {
      entries.push(await balerion.db.query(toContentTypeUID(model)).create({ data }));
    }

    resultMap[model] = entries;
  }

  await cleanup();

  return resultMap;
}

async function createFixturesFor(model, entries, { balerion: balerionIst } = {}) {
  const { balerion, cleanup } = await createHelpers({ balerion: balerionIst });

  const uid = toContentTypeUID(model);
  const contentType = balerion.getModel(uid);

  const results = [];

  for (const entry of entries) {
    const dataToCreate = isFunction(entry) ? entry(results) : entry;

    const componentValidData = await componentData.createComponents(uid, dataToCreate);
    const entryData = Object.assign(
      componentData.omitComponentData(contentType, dataToCreate),
      componentValidData
    );

    const res = await balerion.db.query(uid).create({ data: entryData });

    results.push(res);
  }

  await cleanup();

  return results;
}

async function deleteFixturesFor(model, entries, { balerion: balerionIst } = {}) {
  const { balerion, cleanup } = await createHelpers({ balerion: balerionIst });

  await balerion.db
    .query(toContentTypeUID(model))
    .deleteMany({ where: { id: entries.map(prop('id')) } });

  await cleanup();
}

async function modifyContentType(data, { balerion } = {}) {
  const { contentTypeService, cleanup } = await createHelpers({ balerion });

  const sanitizedData = { ...data };
  delete sanitizedData.editable;
  delete sanitizedData.restrictRelationsTo;

  const uid = toContentTypeUID(sanitizedData.singularName);

  const ct = await contentTypeService.editContentType(uid, {
    contentType: {
      ...sanitizedData,
    },
  });

  await cleanup();

  return ct;
}

async function modifyComponent(data, { balerion } = {}) {
  const { componentsService, cleanup } = await createHelpers({ balerion });

  const sanitizedData = { ...data };
  delete sanitizedData.editable;
  delete sanitizedData.restrictRelationsTo;

  const uid = toCompoUID(sanitizedData.displayName);

  const compo = await componentsService.editComponent(uid, {
    component: {
      ...sanitizedData,
    },
  });

  await cleanup();

  return compo;
}

async function getContentTypeSchema(modelName, { balerion: balerionIst } = {}) {
  const { balerion, contentTypeService, cleanup } = await createHelpers({ balerion: balerionIst });

  const uid = toContentTypeUID(modelName);
  const ct = contentTypeService.formatContentType(balerion.contentTypes[uid]);

  await cleanup();

  return (ct || {}).schema;
}

module.exports = {
  toContentTypeUID,
  // Create Content-Types
  createContentType,
  createContentTypes,
  // Delete Content-Types
  deleteContentType,
  deleteContentTypes,
  // Cleanup Models
  cleanupModel,
  cleanupModels,
  // Create Components
  createComponent,
  createComponents,
  // Delete Components
  deleteComponent,
  deleteComponents,
  // Fixtures
  createFixtures,
  createFixturesFor,
  deleteFixturesFor,
  // Update
  modifyContentType,
  modifyComponent,
  // Misc
  getContentTypeSchema,
};
