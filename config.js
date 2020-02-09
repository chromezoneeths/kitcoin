// This file allows reading config values from environment variables or using a default.

exports.nodePort = process.env.PORT || 5000;
exports.dbAddress = process.env.MONGO_ADDR || 'db';
exports.dbUser = process.env.MONGO_USER || 'kcuser';
exports.dbPass = process.env.MONGO_PASS || 'kcpass';
exports.dbName = process.env.MONGO_DBNAME || 'kitcoin';
exports.clientId = '330095267528-p3cutg5kj1vovflak1fmu229s5tlrc54.apps.googleusercontent.com';
exports.clientSecret = 'xHc30N5R5DqTkTs6Dgodbiyq';
