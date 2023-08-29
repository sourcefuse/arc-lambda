import {Callback, Context} from 'aws-lambda';
import {createClient} from 'redis';

const client = createClient({
	url: process.env.redisEndpoint,
});

client.on('error', err => console.error('Redis Client Error', err)); //NOSONAR

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
exports.handler = async(
	event: object,
	context: Context,
	callback: Callback,
) => {
	await client.connect();
	await client.set('key', 'value');
	callback(null, 'Success');
};
