import { Client } from '@loopback/testlab';
import { AuthenticationServiceApplication } from '../..';
import { STATUS_CODE } from '../../enums/status-codes.enum';
import { setupApplication } from './test-helper';


describe('HomePage', () => {
  let app: AuthenticationServiceApplication;
  let client: Client;

  before('setupApplication', async () => {
    ({app, client} = await setupApplication());
  });

  after(async () => {
    await app.stop();
  });

  it('exposes a default home page', async () => {
    await client
      .get('/')
      .expect(STATUS_CODE.OK)
      .expect('Content-Type', /text\/html/);
  });

  it('exposes self-hosted explorer', async () => {
    await client
      .get('/explorer/')
      .expect(STATUS_CODE.OK)
      .expect('Content-Type', /text\/html/)
      .expect(/<title>LoopBack API Explorer/);
  });
});
