import {Transaction} from './db';

import * as conf from './config';

let enabled = Boolean(conf.redisHost);

import {createClient} from 'redis';
const client = createClient({
	host: conf.redisHost,
	port: conf.redisPort
});
import {promisify} from 'util';
const getAsync = promisify(client.get).bind(client);
const setAsync = promisify(client.set).bind(client);

client.on('error', error => {
	console.error('redis machine 🅱roke');
	console.error(error);
	console.error('disabling redis for this session');
	enabled = false;
});

export const balance = {
	async get(user: string): Promise<number> {
		if (enabled) {
			return parseInt(await getAsync(`${user}::balance`), 10);
		}

		return NaN;
	},
	async set(user: string, value: string): Promise<void> {
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

				await balance.set(sender, (original - amount).toString());
			},
			async () => { // Decrement sender
				const original = await balance.get(sender);
				if (isNaN(original)) {
					return;
				}

				await balance.set(recipient, (original + amount).toString());
			}
		]);
	}
};

process.on('SIGINT', () => {
	client.quit();
});
