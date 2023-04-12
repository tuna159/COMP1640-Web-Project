export const configuration = () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  databaseMysql: {
    host: process.env.DB_MYSQL_HOST,
    port: parseInt(process.env.DB_MYSQL_LOCAL_PORT, 10) || 3306,
    user: process.env.DB_MYSQL_USER,
    password: process.env.DB_MYSQL_PASSWORD,
    name: process.env.DB_MYSQL_NAME,
    trigger: process.env.DB_MYSQL_TRIGGER
      ? JSON.parse(process.env.DB_MYSQL_TRIGGER)
      : '',
    timezone: process.env.DB_MYSQL_TZ,
  },
  firebase: {
    api_key: process.env.FIREBASE_API_KEY,
    auth_domain: process.env.FIREBASE_AUTH_DOMAIN,
    project_id: process.env.FIREBASE_PROJECT_ID,
    storage_bucket: process.env.FIREBASE_STORAGE_BUCKET,
    messaging_sender_id: process.env.FIREBASE_MESSAGING_SENDER_ID,
    app_id: process.env.FIREBASE_APP_ID,
    measurement_id: process.env.FIREBASE_MEASUREMENT_ID,
  },
  auth: {
    secret: process.env.SECRET_KEY,
    exprie: process.env.EXPRIE_TOKEN + 's',
    secretKeyRegisterConfirm: process.env.SECRET_KEY_REGISTER_CONFIRM,
    secretKeyRefeshToken: process.env.SECRET_KEY_REFRESH_TOKEN,
    exprie_refresh_token: process.env.EXPRIE_REFRESH_TOKEN + 's',
  },
  timezone: process.env.TZ,
});
export enum EConfiguration {
  ENVIRONMENT = 'environment',
  APP_NAME = 'appName',
  PORT = 'port',
  DB_MYSQL_HOST = 'databaseMysql.host',
  DB_MYSQL_LOCAL_PORT = 'databaseMysql.port',
  DB_MYSQL_USER = 'databaseMysql.user',
  DB_MYSQL_PASSWORD = 'databaseMysql.password',
  DB_MYSQL_NAME = 'databaseMysql.name',
  DB_MYSQL_TRIGGER = 'databaseMysql.trigger',
  DB_MYSQL_TZ = 'databaseMysql.timezone',

  AUTH_SECRET_KEY = 'auth.secret',
  AUTH_TOKEN_EXPIRE = 'auth.exprie',
  AUTH_TOKEN_CONFIRM_REGISTER = 'auth.secretKeyRegisterConfirm',
  AUTH_SECRET_KEY_REFRESH_TOKEN = 'auth.secretKeyRefeshToken',
  AUTH_REFRESH_TOKEN_EXPIRE = 'auth.exprie_refresh_token',

  FIREBASE_API_KEY = 'firebase.api_key',
  FIREBASE_AUTH_DOMAIN = 'firebase.auth_domain',
  FIREBASE_PROJECT_ID = 'firebase.project_id',
  FIREBASE_STORAGE_BUCKET = 'firebase.storage_bucket',
  FIREBASE_MESSAGING_SENDER_ID = 'firebase.messaging_sender_id',
  FIREBASE_APP_ID = 'firebase.app_id',
  FIREBASE_MEASUREMENT_ID = 'firebase.measurement_id',

  TZ = 'timezone',
}
