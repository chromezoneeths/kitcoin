// This file loads configuration from environment variables.

exports.dbIP = process.env.DATABASE_ADDRESS; // Allows you to set the IP address of the database.
exports.dbUser = process.env.DATABASE_USER; // Allows you to set the user this server uses to access the database.
exports.dbPort = process.env.DATABASE_PORT; // Allows you to set the database's port.
exports.dbPassword = process.env.DATABASE_PASSWORD; // The password for the database user.
exports.waitTime = process.env.WAIT_TO_CONNECT; // Time to wait for MySQL to start in seconds.
exports.oauthCallbackUrl = process.env.OAUTH_CALLBACK_URL // Will have /oauthstage# appended to it. This should be routed to this server, through reverse proxy if necessary.
exports.enableRemote = process.env.ENABLE_REMOTE == "1";
