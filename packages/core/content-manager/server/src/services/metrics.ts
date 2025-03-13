import { intersection, prop } from 'lodash/fp';
import { relations } from '@balerion/utils';
import type { Core, Struct } from '@balerion/types';
import type { Configuration } from '../../../shared/contracts/content-types';

const { getRelationalFields } = relations;

export default ({ balerion }: { balerion: Core.Balerion }) => {
  const sendDidConfigureListView = async (
    contentType: Struct.ContentTypeSchema,
    configuration: Configuration
  ) => {
    const displayedFields = prop('length', configuration.layouts.list);
    const relationalFields = getRelationalFields(contentType);
    const displayedRelationalFields = intersection(
      relationalFields,
      configuration.layouts.list
    ).length;

    const data = {
      eventProperties: { containsRelationalFields: !!displayedRelationalFields },
    };

    if (data.eventProperties.containsRelationalFields) {
      Object.assign(data.eventProperties, {
        displayedFields,
        displayedRelationalFields,
      });
    }

    try {
      await balerion.telemetry.send('didConfigureListView', data);
    } catch (e) {
      // silence
    }
  };

  return {
    sendDidConfigureListView,
  };
};
