import chalk from 'chalk';
import CLITable from 'cli-table3';
import _ from 'lodash/fp';

import type { Core } from '@balerion/types';

export const createStartupLogger = (app: Core.Balerion) => {
  return {
    logStats() {
      const columns = Math.min(process.stderr.columns, 80) - 2;
      console.log();
      console.log(chalk.black.bgWhite(_.padEnd(columns, ' Project information')));
      console.log();

      const infoTable = new CLITable({
        colWidths: [20, 50],
        chars: { mid: '', 'left-mid': '', 'mid-mid': '', 'right-mid': '' },
      });

      const dbInfo = app.db?.getInfo();

      infoTable.push(
        [chalk.blue('Time'), `${new Date()}`],
        [chalk.blue('Launched in'), `${Date.now() - app.config.launchedAt} ms`],
        [chalk.blue('Environment'), app.config.environment],
        [chalk.blue('Process PID'), process.pid],
        [chalk.blue('Version'), `${app.config.info.balerion} (node ${process.version})`],
        [chalk.blue('Edition'), 'Community'],
        [chalk.blue('Database'), dbInfo?.client],
        [chalk.blue('Database name'), dbInfo?.displayName]
      );

      if (dbInfo?.schema) {
        infoTable.push([chalk.blue('Database schema'), dbInfo.schema]);
      }

      console.log(infoTable.toString());
      console.log();
      console.log(chalk.black.bgWhite(_.padEnd(columns, ' Actions available')));
      console.log();
    },

    logFirstStartupMessage() {
      if (!balerion.config.get('server.logger.startup.enabled')) {
        return;
      }

      this.logStats();

      console.log(chalk.bold('One more thing...'));
      console.log(
        chalk.grey('Create your first administrator 💻 by going to the administration panel at:')
      );
      console.log();

      const addressTable = new CLITable();

      const adminUrl = balerion.config.get('admin.absoluteUrl');
      addressTable.push([chalk.bold(adminUrl)]);

      console.log(`${addressTable.toString()}`);
      console.log();
    },

    logDefaultStartupMessage() {
      if (!balerion.config.get('server.logger.startup.enabled')) {
        return;
      }
      this.logStats();

      console.log(chalk.bold('Welcome back!'));

      if (app.config.get('admin.serveAdminPanel') === true) {
        console.log(chalk.grey('To manage your project 🚀, go to the administration panel at:'));
        const adminUrl = balerion.config.get('admin.absoluteUrl');
        console.log(chalk.bold(adminUrl));
        console.log();
      }

      console.log(chalk.grey('To access the server ⚡️, go to:'));
      const serverUrl = balerion.config.get('server.absoluteUrl');
      console.log(chalk.bold(serverUrl));
      console.log();
    },

    logStartupMessage({ isInitialized }: { isInitialized: boolean }) {
      if (!balerion.config.get('server.logger.startup.enabled')) {
        return;
      }
      if (!isInitialized) {
        this.logFirstStartupMessage();
      } else {
        this.logDefaultStartupMessage();
      }
    },
  };
};
