import { env } from '@balerion/utils';

export const apiConfig = {
  apiBaseUrl: env('BALERION_CLI_CLOUD_API', 'https://cloud-cli-api.balerion.io'),
  dashboardBaseUrl: env('BALERION_CLI_CLOUD_DASHBOARD', 'https://cloud.balerion.io'),
};
