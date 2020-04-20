import * as db from './db';
import * as config from './config';
import {Info} from './user';

export async function listUsers(): Promise<any> {
	const usersQuery = await db.listUsers();
	return {
		action: 'elevateResult',
		status: 'ok',
		contents: usersQuery
	};
}

export async function listTransactions(_: Info, message: any): Promise<any> {
	let transactions = await db.listTransactions();
	let limit: number; // This isn't implemented correctly but who cares right now
	try {
		limit = parseInt(message.body, 10);
	} catch (_) {
		limit = 50;
	}

	transactions = transactions.slice(-limit);
	return {
		action: 'elevateResult',
		status: 'ok',
		contents: transactions
	};
}

export async function grant(_: Info, message: any): Promise<any> {
	const userAddress = message.body.split(' ')[0];
	const permission = message.body.split(' ')[1];
	await db.grant(userAddress, permission);
	return {
		action: 'elevateResult',
		status: 'ok'
	};
}

export async function probe(_: Info, message: any): Promise<any> {
	const userQuery = await db.getUserByAddress(message.body);
	return {
		action: 'elevateResult',
		status: 'ok',
		contents: userQuery
	};
}

export async function revert(_: Info, message: any): Promise<any> {
	await db.revoke(message.body);
	return {
		action: 'elevateResult',
		status: 'ok'
	};
}

export async function help(_: Info): Promise<any> {
	return {
		action: 'elevateResult',
		status: 'ok',
		contents: config.helpMessage
	};
}

export async function listSessions(_: Info, message: any): Promise<any> {
	let sessions = await db.listSessions();
	let limit: number;
	try {
		limit = parseInt(message.body, 10);
	} catch (_) {
		limit = 50;
	}

	sessions = sessions.slice(-limit);
	return {
		action: 'elevateResult',
		status: 'ok',
		contents: sessions
	};
}

export async function getSession(_: Info, message: any): Promise<any> {
	const session = await db.getSessionById(message.body);
	return {
		action: 'elevateResult',
		status: 'ok',
		contents: session
	};
}
