// This file contains abstractions for database calls. It should also  do any injection filtering.
import * as mongo from 'mongodb';
import conf from './config';
import * as cache from './cache';
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
					{role: {$type: 'int'}}
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
		}),
		db.createCollection('events', {
			validator: {
				$or: [
					{uuid: {$type: 'string'}},
					{user: {$type: 'string'}},
					{timestamp: {$type: 'date'}},
					{type: {$type: 'string'}},
					{level: {$type: 'int'}}
				]
			}
		}),
		db.createCollection('purchases', {
			validator: {
				$or: [
					{uuid: {$type: 'string'}},
					{vendor: {$type: 'string'}},
					{customer: {$type: 'string'}},
					{product: {$type: 'string'}},
					{timestamp: {$type: 'date'}}
				]
			}
		}),
		cache.init()
	]);
	console.log('RECORDS, LOGGING: All collections have been created.');
}

export interface Session {
	uuid: string;
	secret: string;
	user: string;
	token: string;
}
export interface Transaction {
	uuid: string;
	timestamp: Date;
	sender: string;
	recipient: string;
	amount: number;
}
export interface User {
	uuid: string;
	address: string;
	name: string;
	role: Permission;
}
export interface Product {
	uuid: string;
	vendor: string;
	name: string;
	description: string;
	price: number;
}
export enum Permission {
	student=0,
	admin,
	teacher,
	vendor,
}
export const transaction = {
	async add(sender: string, recipient: string, amount: number): Promise<void> {
		const transaction: Transaction = {
			uuid: uuid(),
			timestamp: (new Date(Date.now())),
			sender,
			recipient,
			amount
		};
		// Await client.connect();
		const db = client.db(conf.dbName);
		await db.collection('transactions').insertOne(transaction);

		await cache.balance.transaction(transaction);
	},
	async remove(id: string): Promise<void> {
	// Await client.connect();
		const db = client.db(conf.dbName);
		const transactions = db.collection('transactions');
		await transactions.deleteOne({uuid: id});
	},
	async get(uuid: string): Promise<Transaction> {
	// Await client.connect();
		const db = client.db(conf.dbName);
		const transactions = db.collection('transactions');
		const search = await transactions.findOne({uuid});
		if (search) {
			return search;
		}

		return undefined;
	},
	async list(user?: string): Promise<Transaction[]> {
	// Await client.connect();
		const results = [];
		const db = client.db(conf.dbName);
		const transactions = db.collection('transactions');
		let search: mongo.Cursor<Transaction>;
		if (user) {
			search = transactions.find({$or: [{sender: user}, {recipient: user}]});
		} else {
			search = transactions.find({});
		}

		while (await search.hasNext()) {
			results.push(await search.next());
		}

		return results;
	}
};
export const user = {
	async add(id: string, address: string, name: string): Promise<void> {
	// Await client.connect();
		const db = client.db(conf.dbName);
		await db.collection('users').insertOne({
			uuid: id,
			address,
			name,
			role: Permission.student
		});
	},
	async balance(uuid: string): Promise<number> {
		let balance = await cache.balance.get(uuid);
		if (!isNaN(balance)) {
			return balance;
		}

		balance = 0;
		// Await client.connect();
		const db = client.db(conf.dbName);
		const transactions = db.collection('transactions');
		const rec = transactions.find({recipient: uuid});
		const out = transactions.find({sender: uuid});
		while (await rec.hasNext()) {
			const doc = await rec.next();
			balance += doc.amount;
		}

		while (await out.hasNext()) {
			const doc = await out.next();
			balance -= doc.amount;
		}

		cache.balance.set(uuid, balance);

		return balance;
	},
	async list(): Promise<User[]> {
	// Await client.connect();
		const results = [];
		const db = client.db(conf.dbName);
		const users = db.collection('users');
		const search = users.find({});
		while (await search.hasNext()) {
			results.push(await search.next());
		}

		return results;
	},
	async grant(id: string, permission: Permission): Promise<void> {
	// Await client.connect();
		const db = client.db(conf.dbName);
		const users = db.collection('users');
		await users.findOneAndUpdate({uuid: id}, {$set: {role: permission}});
	},
	async getByAddress(address: string): Promise<User> {
	// Await client.connect();
		const db = client.db(conf.dbName);
		const users = db.collection('users');
		const search = await users.findOne({address});
		if (search) {
			return search;
		}

		return undefined;
	},
	async getById(uuid: string): Promise<User> {
	// Await client.connect();
		const db = client.db(conf.dbName);
		const users = db.collection('users');
		const search = await users.findOne({uuid});
		if (search) {
			return search;
		}

		return undefined;
	}
};
export const event = {
	async add(user: string, type: string, level: number): Promise<void> {
		const db = client.db(conf.dbName);
		const events = db.collection('events');
		events.insertOne({
			uuid: uuid(),
			timestamp: (new Date(Date.now())).toISOString(),
			user,
			type,
			level
		});
	}
};
export const session = {
	async add(user: string, token: string): Promise<string> {
	// Await client.connect();
		const db = client.db(conf.dbName);
		const sessions = db.collection('sessions');
		const secret = crypto.randomBytes(1024).toString('base64'); // Brute force attacks can suck it
		sessions.insertOne({
			uuid: uuid(),
			secret,
			user,
			token
		});
		return secret;
	},
	async getById(id: string): Promise<Session> {
	// Await client.connect();
		const db = client.db(conf.dbName);
		const sessions = db.collection('sessions');
		const search = await sessions.findOne({uuid: id});
		if (search) {
			return search;
		}

		return undefined;
	},
	async getBySecret(secret: string): Promise<Session> {
	// Await client.connect();
		const db = client.db(conf.dbName);
		const sessions = db.collection('sessions');
		const search = await sessions.findOne({secret});
		if (search) {
			return search;
		}

		return undefined;
	},
	async list(user?: string): Promise<Session[]> {
	// Await client.connect();
		const results = [];
		const db = client.db(conf.dbName);
		const sessions = db.collection('sessions');
		let search: mongo.Cursor<Session>;
		if (user) {
			search = sessions.find({user});
		} else {
			search = sessions.find({});
		}

		while (await search.hasNext()) {
			results.push(await search.next());
		}

		return results;
	}
};

process.on('SIGINT', () => {
	client.close();
});
