"use strict";
// This file loads configuration from environment variables.
Object.defineProperty(exports, "__esModule", { value: true });
exports.dbIP = process.env.DATABASE_ADDRESS; // Allows you to set the IP address of the database.
exports.dbUser = process.env.DATABASE_USER; // Allows you to set the user this server uses to access the database.
exports.dbPort = process.env.DATABASE_PORT; // Allows you to set the database's port.
exports.dbPassword = process.env.DATABASE_PASSWORD; // The password for the database user.
exports.waitTime = process.env.WAIT_TO_CONNECT; // Time to wait for MySQL to start in seconds.
exports.oauthCallbackUrl = process.env.OAUTH_CALLBACK_URL; // Will have /oauthstage# appended to it. This should be routed to this server, through reverse proxy if necessary.
exports.enableRemote = process.env.ENABLE_REMOTE === '1';
exports.helpMessage = "\n---=== Kitcoin Administrative Interface ===---\nThis is a help message for the Kitcoin backend\nserver. The following is a list of known\ncommands.\n\n- listUsers\n    This command returns all users in a JSON-formatted list. There are no arguments.\n- listTransactions\n    This command returns n most recent transactions, where n is the body parsed as an integer.\n- grant\n    This command assigns a role to a user, where the body is the user\u2019s email address, a space, and the role to assign.\n- degrant\n    This command reverts a user to the \"student\" role.\n- sql\n    This command is not allowed in this version of Kitcoin.\n- probe\n    This command returns a user by email address.\n- revert\n    This command reverts a transaction by uuid, where the body is the uuid.\n- help\n    Returns this help message.";