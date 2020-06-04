// This file loads configuration from environment variables.

module.exports = {
	get redisHost(): string {
		return process.env.REDIS_ADDRESS;
	},
	get redisPort(): number {
		return parseInt(process.env.REDIS_PORT, 10) || 6379;
	},
	get dbIP(): string {
		return process.env.DATABASE_ADDRESS;
	},
	get dbName(): string {
		return process.env.DATABASE_NAME || 'kitcoin';
	},
	get dbUser(): string {
		return process.env.DATABASE_USER;
	},
	get dbPort(): number {
		return parseInt(process.env.DATABASE_PORT || '33060', 10);
	},
	get dbPassword(): string {
		return process.env.DATABASE_PASSWORD;
	},
	get waitTime(): number {
		return parseFloat(process.env.WAIT_TO_CONNECT || '0');
	},
	get oauthCallbackUrl(): string {
		return process.env.OAUTH_CALLBACK_URL;
	}, // Will have /oauthstage# appended to it. This should be routed to this server, through reverse proxy if necessary.
	get enableRemote(): boolean {
		return process.env.ENABLE_REMOTE === '1';
	},
	get testing(): boolean {
		return process.env.INSECURE_TESTING_MODE_IF_YOU_ENABLE_THIS_IN_PRODUCTION_IM_NOT_RESPONSIBLE_FOR_WHAT_HAPPENS_NEXT === 'ENABLE';
	},
	helpMessage: `
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
    Returns this help message.`
};
