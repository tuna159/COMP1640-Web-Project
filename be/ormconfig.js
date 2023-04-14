// eslint-disable-next-line @typescript-eslint/no-var-requires
const dotenv = require('dotenv');
dotenv.config();
module.exports = {
  type: 'mysql',
  host: process.env['DB_MYSQL_HOST'] || 'localhost', // TODO if do not run container image mysql then // port: +configService.get(EConfiguration.DB_MYSQL_PORT),
  port: parseInt(process.env['DB_MYSQL_DOCKER_PORT'] || '', 10),
  username: process.env['DB_MYSQL_USER'] || 'mysql',
  password: process.env['DB_MYSQL_PASSWORD'] || 'mysql',
  database: process.env['DB_MYSQL_NAME'] || 'mysql', // run all files migrate in here
  migrations: [__dirname + '/src/core/database/mysql/migrations/**{.ts,.js}'],
  entities: [
    __dirname + '/dist/core/database/mysql/entity/**{.ts,.js}',
    __dirname + '/src/core/database/mysql/entity/**{.ts,.js}',
  ],
  seeds: [__dirname + '/src/core/database/mysql/seeds/**{.ts,.js}'],
  factories: [__dirname + '/src/core/database/mysql/factories/**{.ts,.js}'],
  timezone: process.env['DB_MYSQL_TZ'] || '+09:00',
  cli: {
    // create file migrate move here
    migrationsDir: 'src/core/database/mysql/migrations',
  },
  timezone: process.env['TZ'] || 'Z',
};
