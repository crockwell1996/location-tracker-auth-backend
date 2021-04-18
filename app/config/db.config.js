require('dotenv').config();

module.exports = {
    HOST: process.env.DB_LOC_HOST,
    PORT: Number(process.env.DB_LOC_PORT),
    DB: process.env.DB_LOC_NAME
};
