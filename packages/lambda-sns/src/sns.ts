import { Callback, Context } from 'aws-lambda';
import { LambdaLog } from 'lambda-log';

const logger = new LambdaLog();
const indentation = 4;
export const handler = (
	event: object,
	context: Context,
	callback: Callback
) => {
	logger.info(`Received event: ${JSON.stringify(event, null, indentation)}`);
	callback(null, 'Success');
};
