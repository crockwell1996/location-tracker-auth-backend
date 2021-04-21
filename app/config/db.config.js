require('dotenv').config();

module.exports = {
    HOST: process.env.DB_LOC_HOST,
    PORT: Number(process.env.DB_LOC_PORT),
    DB: process.env.DB_LOC_NAME,
    // LIVE DB information
    USERNAME: process.env.DB_USERNAME,
    PASSWORD: process.env.DB_PASSWORD,
    CLUSTER: process.env.DB_CLUSTER,
    NAME: process.env.DB_NAME,
    // DB ENVIRONMENT
    DBENV: process.env.DB_ENVIRONMENT,
};
