// This file loads configuration from environment variables.

export const dbIP: string = process.env.DATABASE_ADDRESS; // Allows you to set the IP address of the database.
export const dbName: string = process.env.DATABASE_NAME || 'kitcoin';
export const dbUser: string = process.env.DATABASE_USER; // Allows you to set the user this server uses to access the database.
export const dbPort: number = parseInt(process.env.DATABASE_PORT || 33060, 10); // Allows you to set the database's port.
export const dbPassword: string = process.env.DATABASE_PASSWORD; // The password for the database user.
export const waitTime: number = parseFloat(process.env.WAIT_TO_CONNECT || 0); // Time to wait for MySQL to start in seconds.
export const oauthCallbackUrl: string = process.env.OAUTH_CALLBACK_URL; // Will have /oauthstage# appended to it. This should be routed to this server, through reverse proxy if necessary.
export const enableRemote: boolean = process.env.ENABLE_REMOTE === '1';
export const helpMessage = `
---=== Kitcoin Administrative Interface ===---
This is a help message for the Kitcoin backend
server. The following is a list of known
commands.

- listUsers
    This command returns all users in a JSON-formatted list. There are no arguments.
- listTransactions
    This command returns n most recent transactions, where n is the body parsed as an integer.
- grant
    This command assigns a role to a user, where the body is the user’s email address, a space, and the role to assign.
- degrant
    This command reverts a user to the "student" role.
- sql
    This command is not allowed in this version of Kitcoin.
- probe
    This command returns a user by email address.
- revert
				This command reverts a transaction by uuid, where the body is the uuid.
- listSessions
				List all valid user sessions.
- killSession
				Invalidate an active session.
- getSession
				Get a session by id.
- bogusSession
				Get a bogus session for a user by id. This can be used to log in as the user.
- help
    Returns this help message.`;

export const testing = process.env.INSECURE_TESTING_MODE_IF_YOU_ENABLE_THIS_IN_PRODUCTION_IM_NOT_RESPONSIBLE_FOR_WHAT_HAPPENS_NEXT === 'ENABLE';

