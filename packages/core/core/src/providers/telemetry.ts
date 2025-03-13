import { defineProvider } from './provider';
import createTelemetry from '../services/metrics';

export default defineProvider({
  init(balerion) {
    balerion.add('telemetry', () => createTelemetry(balerion));
  },
  async register(balerion) {
    balerion.get('telemetry').register();
  },
  async bootstrap(balerion) {
    balerion.get('telemetry').bootstrap();
  },
  async destroy(balerion) {
    balerion.get('telemetry').destroy();
  },
});
