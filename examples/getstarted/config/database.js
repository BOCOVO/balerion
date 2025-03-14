const sqlite = {
  client: 'sqlite',
  connection: {
    filename: '.tmp/data.db',
  },
  useNullAsDefault: true,
};

const postgres = {
  client: 'postgres',
  connection: {
    database: 'balerion',
    user: 'balerion',
    password: 'balerion',
    port: 5432,
    host: 'localhost',
  },
};

const mysql = {
  client: 'mysql',
  connection: {
    database: 'balerion',
    user: 'balerion',
    password: 'balerion',
    port: 3306,
    host: 'localhost',
  },
};

const mariadb = {
  client: 'mysql',
  connection: {
    database: 'balerion',
    user: 'balerion',
    password: 'balerion',
    port: 3307,
    host: 'localhost',
  },
};

const db = {
  mysql,
  sqlite,
  postgres,
  mariadb,
};

module.exports = {
  connection: process.env.DB ? db[process.env.DB] || db.sqlite : db.sqlite,
};
