import * as db from './db';
import * as google from './google';
const googleapis = require('googleapis').google;

export interface Info {
	name: string;
	id: string;
	address: string;
	role: db.Permission;
	auth: any;
}

export async function getBalance(info: Info): Promise<any> {
	const balance = await db.user.balance(info.id);
	return {
		action: 'balance',
		balance
	};
}

export const balance = getBalance;

export async function sendCoin(info: Info, message: any): Promise<any> {
	const targetAddress = message.target;
	const balance = await db.user.balance(info.id);
	const isBalanceSufficient = balance > message.amount;
	const target = await db.user.getByAddress(targetAddress);
	if (message.amount !== parseInt(message.amount, 10) || !/[A-Za-z\d]*@[A-Za-z\d]*\.[a-z]{3}/.test(message.target)) {
		return {
			action: 'sendResponse',
			status: 'badInput'
		};
	}

	if (isBalanceSufficient && target) {
		await db.transaction.add(info.id, target.uuid, message.amount);
		return {
			action: 'sendResponse',
			status: 'ok'
		};
	}

	if (target === undefined) {
		return {
			action: 'sendResponse',
			status: 'nonexistentTarget'
		};
	}

	if (!isBalanceSufficient) {
		return {
			action: 'sendResponse',
			status: 'insufficientBalance'
		};
	}
}

export const send = sendCoin;

export async function takeCoin(info: Info, message: any): Promise<any> {
	const target = message.target;
	const amount = message.amount;
	const targetUser = await db.user.getByAddress(target);
	if (![db.Permission.teacher, db.Permission.vendor, db.Permission.admin].includes(info.role)) {
		return {
			action: 'take',
			status: 'denied'
		};
	}

	if (typeof targetUser === 'undefined') {
		return {
			action: 'take',
			status: 'nonexistentTarget'
		};
	}

	await db.transaction.add(info.id, targetUser.uuid, amount);
	return {
		action: 'take',
		status: 'ok'
	};
}

export const take = takeCoin;

export async function mintCoin(info: Info, message: any): Promise<any> {
	if (message.amount !== parseInt(message.amount, 10)) {
		return {
			action: 'mintResponse',
			status: 'badInput'
		};
	}

	if ([db.Permission.admin, db.Permission.teacher].includes(info.role)) {
		await db.transaction.add('nobody', info.id, message.amount);
		return {
			action: 'mintResponse',
			status: 'ok'
		};
	}

	console.log(`RECORDS, WARNING: UNAUTHORIZED USER ${info.name} ATTEMPTS TO MINT ${message.amount}`);
	return {
		action: 'mintResponse',
		status: 'denied'
	};
}

export const mint = mintCoin;

export async function getStudents(info: Info, message: any): Promise<any> {
	if ([db.Permission.admin, db.Permission.teacher].includes(info.role)) {
		const classroomAPI = googleapis.classroom({
			version: 'v1',
			auth: info.auth
		});
		const result = await google.getStudents(classroomAPI, message.classID);
		if (result.err) {
			return {
				action: 'getStudentsResponse',
				status: 'ServerError',
				err: result.err
			};
		}

		console.log(result.res.data);
		const {students} = result.res.data;
		return {
			action: 'getStudentsResponse',
			status: 'ok',
			students
		};
	}

	return {
		action: 'getStudentsResponse',
		status: 'denied'
	};
}

export async function voidCoin(info: Info, message: any): Promise<any> {
	if (message.amount !== parseInt(message.amount, 10)) {
		return {
			action: 'voidResponse',
			status: 'badInput'
		};
	}

	if ([db.Permission.admin, db.Permission.teacher].includes(info.role)) {
		await db.transaction.add(info.id, 'nobody', message.amount);
		return {
			action: 'voidResponse',
			status: 'ok'
		};
	}

	console.log(`RECORDS, WARNING: UNAUTHORIZED USER ${info.name} ATTEMPTS TO VOID ${message.amount}`);
	return {
		action: 'voidResponse',
		status: 'denied'
	};
}

export async function getClasses(info: Info): Promise<any> {
	if ([db.Permission.admin, db.Permission.teacher].includes(info.role)) {
		const classroomAPI = googleapis.classroom({
			version: 'v1',
			auth: info.auth
		});
		const result = await google.getCourses(classroomAPI);
		const {courses} = result.res.data;
		if (result.err || courses.length === 0) {
			return {
				action: 'getClassesResponse',
				status: 'ServerError',
				err: result.err
			};
		}

		return {
			action: 'getClassesResponse',
			status: 'ok',
			classes: courses
		};
	}

	return {
		action: 'getClassesResponse',
		status: 'denied'
	};
}

export async function secret(info: Info): Promise<any> {
	return {
		action: 'secret',
		secret: await db.session.add(info.id, info.auth.refresh)
	};
}

export const session = secret;

export async function revokeTransaction(info: Info, message: any): Promise<any> {
	const target = await db.transaction.get(message.target);
	if (target.sender === info.id || target.recipient === info.id) { // This transaction belongs to this user
		await db.transaction.remove(message.target);
		return {
			action: 'revoke',
			status: true
		};
	}

	if (info.role === db.Permission.admin) { // This user is an admin
		await db.transaction.remove(message.target);
		return {
			action: 'revoke',
			status: true
		};
	}

	return {
		action: 'revoke',
		status: false
	};
}

export async function listTransactions(info: Info, message: any): Promise<any> {
	let result;
	if (info.role === db.Permission.admin && message.all) {
		result = await db.transaction.list();
	} else {
		result = await db.transaction.list(info.id);
	}

	return {
		action: 'listTransactions',
		result
	};
}

export async function listSessions(info: Info, message: any): Promise<any> {
	let result;
	if (info.role === db.Permission.admin && message.all) {
		result = await db.session.list();
	} else {
		result = await db.session.list(info.id);
	}

	return {
		action: 'listSessions',
		result
	};
}

export async function pong(): Promise<any> {
	return {};
}
