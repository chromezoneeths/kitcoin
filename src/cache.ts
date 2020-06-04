import {createClient, RedisClient} from 'redis';
import {promisify} from 'util';
import {Transaction} from './db';

const conf = require('./config');

let enabled = typeof conf.redisHost === 'string';

let getAsync: (arg0: string) => string | PromiseLike<string>;
let setAsync: (arg0: string, arg1: number) => any;
let client: RedisClient;

export async function init(): Promise<void> {
	console.log(`Connecting to cache at ${conf.redisHost}`);

	client = createClient({
		host: conf.redisHost,
		port: conf.redisPort
	});
	getAsync = promisify(client.get).bind(client);
	setAsync = promisify(client.set).bind(client);

	client.on('error', error => {
		console.error('redis machine 🅱roke');
		console.error(error);
		console.error('disabling redis for this session');
		enabled = false;
	});
}

export const balance = {
	async get(user: string): Promise<number> {
		if (enabled) {
			return parseInt(await getAsync(`${user}::balance`), 10);
		}

		return NaN;
	},
	async set(user: string, value: number): Promise<void> {
		if (enabled) {
			await setAsync(`${user}::balance`, value);
		}
	},
	async transaction({sender, recipient, amount}: Transaction): Promise<void> {
		if (!enabled) {
			return;
		}

		await Promise.all([
			async () => { // Decrement sender
				const original = await balance.get(sender);
				if (isNaN(original)) {
					return;
				}

				await balance.set(sender, original - amount);
			},
			async () => { // Decrement sender
				const original = await balance.get(sender);
				if (isNaN(original)) {
					return;
				}

				await balance.set(recipient, original + amount);
			}
		]);
	}
};

process.on('SIGINT', () => {
	client.quit();
});
