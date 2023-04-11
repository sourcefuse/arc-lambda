import dotenv from 'dotenv';
import {describe, it} from 'mocha';
import request from 'supertest';

dotenv.config({
  path: __dirname + '/./../../../.env',
});
const BASE_URL = process.env.LAMBDA_URL;
const okResponseCode = 200;

describe('User Tenant App', () => {
  it('should expose a self hosted server', async () => {
    await request(BASE_URL)
      .get('/explorer/')
      .expect(okResponseCode)
      .expect('Content-Type', /text\/html/)
      .expect(/<title>LoopBack API Explorer/);
  });
});
