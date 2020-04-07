// This file contains abstractions for database calls. It should also  do any injection filtering.
import * as mongo from 'mongodb';
import * as conf from './config';
import {v4 as uuid} from 'uuid';
import * as crypto from 'crypto';
let client: mongo.MongoClient;
export async function init(): Promise<void> {
	console.log(`Waiting ${conf.waitTime} seconds for db`);
	await new Promise(resolve => setTimeout(resolve, conf.waitTime * 1000));
	console.log('RECORDS, LOGGING: Connecting to database at ' + conf.dbIP);
	client = new mongo.MongoClient(conf.dbIP, {useNewUrlParser: true, useUnifiedTopology: true});
	await client.connect();
	console.log('RECORDS, LOGGING: Connection successful, ensuring everything is ready');
	const db = client.db(conf.dbName);
	await Promise.all([
		db.createCollection('users', {
			validator: {
				$or: [
					{uuid: {$type: 'string'}},
					{address: {$regex: /[A-Za-z\d]*@[A-Za-z\d]*\.[a-z]*/}},
					{name: {$type: 'string'}},
					{role: {$in: ['student', 'teacher', 'vendor', 'admin', 'sadmin']}}
				]
			}
		}),
		db.createCollection('transactions', {
			validator: {
				$or: [
					{uuid: {$type: 'string'}},
					{timestamp: {$type: 'date'}},
					{sender: {$type: 'string'}},
					{recipient: {$type: 'string'}},
					{amount: {$type: 'int'}}
				]
			}
		}),
		db.createCollection('products', {
			validator: {
				$or: [
					{uuid: {$type: 'string'}},
					{vendor: {$type: 'string'}},
					{name: {$type: 'string'}},
					{description: {$type: 'string'}},
					{price: {$type: 'int'}}
				]
			}
		}),
		db.createCollection('sessions', {
			validator: {
				$or: [
					{uuid: {$type: 'string'}},
					{user: {$type: 'string'}},
					{secret: {$type: 'string'}},
					{token: {$type: 'string'}}
				]
			}
		})
	]);
	console.log('RECORDS, LOGGING: All collections have been created.');
}

interface Session {
	uuid: string;
	secret: string;
	user: string;
	token: string;
}
interface Transaction {
	uuid: string;
	timestamp: Date;
	sender: string;
	recipient: string;
	amount: number;
}
interface User {
	uuid: string;
	address: string;
	name: string;
	role: Permission;
}
interface Product {
	uuid: string;
	vendor: string;
	name: string;
	description: string;
	price: number;
}

export async function addUser(id, address, name): Promise<void> {
	await client.connect();
	const db = client.db(conf.dbName);
	await db.collection('users').insertOne({
		uuid: id,
		address,
		name,
		role: 'student'
	});
}

export async function addTransaction(sender, recipient, amount): Promise<void> {
	await client.connect();
	const db = client.db(conf.dbName);
	await db.collection('transactions').insertOne({
		uuid: uuid(),
		timestamp: (new Date(Date.now())).toISOString(),
		sender,
		recipient,
		amount
	});
}

export async function getBalance(uuid): Promise<number> {
	let balance = 0;
	await client.connect();
	const db = client.db(conf.dbName);
	const transactions = db.collection('transactions');
	const rec = transactions.find({recipient: uuid});
	const out = transactions.find({sender: uuid});
	await Promise.all([
		async () => {
			while (await rec.hasNext()) {
				const doc = await rec.next();
				balance += doc.amount;
			}
		},
		async () => {
			while (await out.hasNext()) {
				const doc = await out.next();
				balance -= doc.amount;
			}
		}
	]);
	return balance;
}

export async function getUserByAddress(address: string): Promise<User> {
	await client.connect();
	const db = client.db(conf.dbName);
	const users = db.collection('users');
	const search = users.find({address});
	if (await search.hasNext()) {
		return search.next();
	}

	throw new Error('User not found.');
}

export async function getUserByID(uuid: string): Promise<User> {
	await client.connect();
	const db = client.db(conf.dbName);
	const users = db.collection('users');
	const search = users.find({uuid});
	if (await search.hasNext()) {
		return search.next();
	}

	throw new Error('User not found.');
}

export async function listUsers(): Promise<User[]> {
	await client.connect();
	const results = [];
	const db = client.db(conf.dbName);
	const users = db.collection('users');
	const search = users.find({});
	while (await search.hasNext()) {
		results.push(await search.next());
	}

	return results;
}

export async function listTransactions(): Promise<Transaction[]> {
	await client.connect();
	const results = [];
	const db = client.db(conf.dbName);
	const transactions = db.collection('transactions');
	const search = transactions.find({});
	while (await search.hasNext()) {
		results.push(await search.next());
	}

	return results;
}

export enum Permission {
	admin,
	teacher,
	vendor,
}

export async function grant(id: string, _permission: Permission): Promise<void> {
	await client.connect();
	const db = client.db(conf.dbName);
	const users = db.collection('users');
	await users.findOneAndUpdate({uuid: id}, {$set: {role: _permission}});
}

export async function degrant(id: string, _permission: string): Promise<void> {
	await client.connect();
	const db = client.db(conf.dbName);
	const users = db.collection('users');
	await users.findOneAndUpdate({uuid: id}, {$set: {role: 'student'}});
}

export async function exec(statement: string): Promise<void> {
	throw new Error(`User attempted illegal SQL statement ${statement}`);
}

export async function revoke(id: string): Promise<void> {
	await client.connect();
	const db = client.db(conf.dbName);
	const transactions = db.collection('transactions');
	await transactions.deleteOne({uuid: id});
}

export async function getSession(secret: string): Promise<Session> {
	await client.connect();
	const db = client.db(conf.dbName);
	const sessions = db.collection('sessions');
	const search = sessions.find({secret});
	if (await search.hasNext()) {
		return search.next();
	}

	throw new Error('Session not found');
}

export async function addSession(token: string, user: string): Promise<string> {
	await client.connect();
	const db = client.db(conf.dbName);
	const sessions = db.collection('sessions');
	const secret = crypto.randomBytes(1024).toString('base64'); // Brute force attacks can suck it
	sessions.insertOne({ // Clients probably won't need to re-login within milliseconds, so we can let this run a bit late.
		uuid: uuid(),
		secret,
		user,
		token
	});
	return secret;
}
