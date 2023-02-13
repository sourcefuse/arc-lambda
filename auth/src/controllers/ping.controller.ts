import { inject } from '@loopback/core';
import { get, response, ResponseObject } from '@loopback/rest';
import { AuthDbSourceName } from '@sourceloop/authentication-service';
import {
  ILogger,
  LOGGER
} from '@sourceloop/core';
import { authorize } from 'loopback4-authorization';
import { AuthDataSource } from '../datasources';
import { STATUS_CODE } from '../enums/status-codes.enum';

/**
 * OpenAPI response for ping()
 */
const PING_RESPONSE: ResponseObject = {
  description: 'Ping Response',
  content: {
    'application/json': {
      schema: {
        type: 'object',
        title: 'PingResponse',
        properties: {
          greeting: {type: 'string'},
          date: {type: 'string'},
          url: {type: 'string'},
          headers: {
            type: 'object',
            properties: {
              'Content-Type': {type: 'string'},
            },
            additionalProperties: true,
          },
        },
      },
    },
  },
};

/**
 * A simple controller to bounce back http requests
 */
export class PingController {
  constructor(
    @inject(`datasources.${AuthDbSourceName}`)
    private readonly authDataSource: AuthDataSource, 
    @inject(LOGGER.LOGGER_INJECT) private readonly logger: ILogger,
  ) {}

  // Map to `GET /ping`
  @authorize({permissions: ['*']})
  @get('/health')
  @response(STATUS_CODE.OK, PING_RESPONSE)
  async ping(): Promise<object> {
    try {
      await this.authDataSource.ping();
      return {
        greeting: 'Hello from LoopBack',
        date: new Date(),
      };
    } catch (e) {
      this.logger.error(e);
    }
    return {};
  }

  // Map to `GET /ping`
  @authorize({permissions: ['*']})
  @get('/ping')
  @response(STATUS_CODE.OK, PING_RESPONSE)
  async pings(): Promise<object> {
    try {
      return {
        greeting: 'from LoopBack',
        date: new Date(),
      };
    } catch (e) {
      this.logger.error(e);
    }
    return {};
  }
}
