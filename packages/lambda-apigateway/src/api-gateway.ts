import { APIGatewayEvent, Callback, Context } from 'aws-lambda';
import { LambdaLog } from 'lambda-log';
import { STATUS_CODES } from './constants';

const logger = new LambdaLog();
const indentation = 2;

export class LambdaFunction {
	context?: Context;
	event: APIGatewayEvent;

	constructor(event: APIGatewayEvent, context?: Context) {
		this.context = context;
		this.event = event;
	}

	main() {
		logger.info(`Event: ${JSON.stringify(this.event, null, indentation)}`);
		logger.info(`Context: ${JSON.stringify(this.context, null, indentation)}`);

		return {
			statusCode: STATUS_CODES.OK,
			body: JSON.stringify({
				message: 'hello world',
			}),
		};
	}
}

export const handler = (
	event: APIGatewayEvent,
	context: Context,
	callback: Callback
) => {
	const lambdaFunction = new LambdaFunction(event, context);
	try {
		callback(null, lambdaFunction.main());
	} catch (error) {
		const message =
      error instanceof Error ? error.message : 'something went bad';
		logger.error(message);
		callback(null, {
			statusCode: STATUS_CODES.INTERNAL_SERVER,
			body: JSON.stringify({
				message,
			}),
		});
	}
};
