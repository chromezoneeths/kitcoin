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
	const balance = await db.getBalance(info.id);
	return {
		action: 'balance',
		balance
	};
}

export async function sendCoin(info: Info, message: any): Promise<any> {
	const targetAddress = message.target;
	const balance = await db.getBalance(info.id);
	const isBalanceSufficient = balance > message.amount;
	const target = await db.getUserByAddress(targetAddress);
	if (message.amount !== parseInt(message.amount, 10) || !/[A-Za-z\d]*@[A-Za-z\d]*\.[a-z]{3}/.test(message.target)) {
		return {
			action: 'sendResponse',
			status: 'badInput'
		};
	}

	if (isBalanceSufficient && target) {
		await db.addTransaction(info.id, target.uuid, message.amount);
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

export async function mintCoin(info: Info, message: any): Promise<any> {
	if (message.amount !== parseInt(message.amount, 10)) {
		return {
			action: 'mintResponse',
			status: 'badInput'
		};
	}

	if ([db.Permission.admin, db.Permission.teacher].includes(info.role)) {
		await db.addTransaction('nobody', info.id, message.amount);
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
		await db.addTransaction(info.id, 'nobody', message.amount);
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
		secret: await db.addSession(info.id, info.auth.refresh)
	};
}

export async function pong(): Promise<any> {
	return {};
}
