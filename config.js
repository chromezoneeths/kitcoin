// This file allows reading config values from environment variables or using a default.

exports.dbAddress = process.env.MONGO_ADDR || 'db';
exports.dbUser = process.env.MONGO_USER || 'kcuser';
exports.dbPass = process.env.MONGO_PASS || 'kcpass';
exports.dbName = process.env.MONGO_DBNAME || 'kitcoin';
