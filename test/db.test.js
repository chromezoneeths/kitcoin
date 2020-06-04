const db = require('../dist/db');
const mongo = require('mongodb');
const chai = require('chai');
const expect = chai.expect;
const conf = require('../dist/config');

// Const composeCfg = {
// 	config: [
// 		'docker-compose.yml',
// 		'docker-compose.test.yml'
// 	],
// 	log: false,
// 	commandOptions: [
// 		'--build'
// 	]
// };

describe('Database tests', () => {
	let client;
	before(async () => {
		client = new mongo.MongoClient(conf.dbIP, {useNewUrlParser: true, useUnifiedTopology: true});
		await client.connect();
	});
	it('Database connects', async () => {
		await db.init();
		await client.db(conf.dbName).collection('users').deleteMany();
		await client.db(conf.dbName).collection('transactions').deleteMany();
	});
	describe('User management', () => {
		it('Add user', async () => {
			await db.user.add('cool-nonexistent-user1', 'test-user1@example.com', 'Test1');
			const db_ = client.db(conf.dbName);
			const result = await db_.collection('users').findOne({
				uuid: 'cool-nonexistent-user1',
				address: 'test-user1@example.com',
				name: 'Test1',
				role: db.Permission.student
			});
			expect(result).to.have.property('uuid').equal('cool-nonexistent-user1');
			expect(result).to.have.property('address').equal('test-user1@example.com');
			expect(result).to.have.property('name').equal('Test1');
			expect(result).to.have.property('role').equal(db.Permission.student);
		});
		it('Get balance', async () => {
			const db_ = client.db(conf.dbName);
			await db_.collection('transactions').deleteMany();
			await db_.collection('users').insertOne({
				uuid: 'cool-nonexistent-user2',
				address: 'test-user2@example.com',
				name: 'Test2',
				role: db.Permission.student
			});
			await db_.collection('users').insertOne({
				uuid: 'cool-nonexistent-user3',
				address: 'test-user3@example.com',
				name: 'Test3',
				role: db.Permission.student
			});
			await db_.collection('transactions').insertOne({
				uuid: 'transaction1',
				timestamp: (new Date(Date.now())),
				sender: 'nobody',
				recipient: 'cool-nonexistent-user2',
				amount: 500
			});
			await db_.collection('transactions').insertOne({
				uuid: 'transaction2',
				timestamp: (new Date(Date.now())),
				sender: 'cool-nonexistent-user2',
				recipient: 'cool-nonexistent-user3',
				amount: 300
			});
			const user2Balance = await db.user.balance('cool-nonexistent-user2');
			const user3Balance = await db.user.balance('cool-nonexistent-user3');
			expect(user2Balance).to.equal(200);
			expect(user3Balance).to.equal(300);
		});
		it('List users', async () => {
			const db_ = client.db(conf.dbName);
			await db_.collection('users').insertOne({
				uuid: 'cool-nonexistent-user5',
				address: 'test-user5@example.com',
				name: 'Test5',
				role: db.Permission.student
			});
			await db_.collection('users').insertOne({
				uuid: 'cool-nonexistent-user4',
				address: 'test-user4@example.com',
				name: 'Test4',
				role: db.Permission.student
			});
			const result = await db.user.list();

			for (const i of result) {
				i._id = null;
			}

			expect(result.length).to.equal(5);
			expect(result).to.deep.include({
				_id: null,
				uuid: 'cool-nonexistent-user4',
				address: 'test-user4@example.com',
				name: 'Test4',
				role: db.Permission.student
			});
		});
		it('Grant permissions', async () => {
			const db_ = client.db(conf.dbName);
			await db_.collection('users').insertOne({
				uuid: 'cool-nonexistent-user6',
				address: 'test-user6@example.com',
				name: 'Test6',
				role: db.Permission.student
			});
			await db.user.grant('cool-nonexistent-user6', db.Permission.admin);
			const result = await db_.collection('users').findOne({
				uuid: 'cool-nonexistent-user6'
			});
			expect(result.role).to.equal(db.Permission.admin);
		});
		it('Get by address', async () => {
			const db_ = client.db(conf.dbName);
			await db_.collection('users').insertOne({
				uuid: 'cool-nonexistent-user7',
				address: 'test-user7@example.com',
				name: 'Test7',
				role: db.Permission.student
			});
			const result = await db.user.getByAddress('test-user7@example.com');
			expect(result.uuid).to.equal('cool-nonexistent-user7');
		});
		it('Get by address', async () => {
			const db_ = client.db(conf.dbName);
			await db_.collection('users').insertOne({
				uuid: 'cool-nonexistent-user7',
				address: 'test-user7@example.com',
				name: 'Test7',
				role: db.Permission.student
			});
			const result = await db.user.getById('cool-nonexistent-user7');
			expect(result.address).to.equal('test-user7@example.com');
		});
	});
});

