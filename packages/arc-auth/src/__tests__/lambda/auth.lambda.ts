// /* eslint-disable @typescript-eslint/naming-convention */
import {expect} from '@loopback/testlab';
import {STATUS_CODE} from '@sourceloop/core';
import dotenv from 'dotenv';
import {AuthErrorKeys} from 'loopback4-authentication';
import {describe, it} from 'mocha';
import request from 'supertest';

dotenv.config({
  path: __dirname + '/./../../../.env',
});
const BASE_URL = process.env.LAMBDA_URL;
const username = 'platform.admin@yopmail.com';
const password = 'test123!@#'; //NOSONAR
const newPassword = 'new_test123!@#';

describe('Authentication microservice', () => {
  const useragent = 'test';
  const deviceId = 'test';
  const useragentName = 'user-agent';
  const deviceIdName = 'device_id';

  it('should give status 422 for login request with no client credentials', async () => {
    const reqData = {};
    const response = await request(BASE_URL)
      .post(`/auth/login`)
      .send(reqData)
      .expect(STATUS_CODE.UNPROCESSED_ENTITY);
    expect(response).to.have.property('error');
  });
  it('should give status 422 for login request with no user credentials', async () => {
    const reqData = {
      clientId: 'webapp',
    };
    const response = await request(BASE_URL)
      .post(`/auth/login`)
      .send(reqData)
      .expect(STATUS_CODE.UNPROCESSED_ENTITY);
    expect(response).to.have.property('error');
  });
  it('should give status 401 for login request with wrong client credentials', async () => {
    const reqData = {
      // eslint-disable-next-line
      client_id: 'web1', // eslint-disable-next-line
      username: 'someuser',
      password: 'somepassword', //NOSONAR
    };
    const response = await request(BASE_URL)
      .post(`/auth/login`)
      .send(reqData)
      .expect(STATUS_CODE.UNAUTHORISED);
    expect(response).to.have.property('error');
  });
  it('should give status 401 for login request with wrong user credentials', async () => {
    const reqData = {
      // eslint-disable-next-line
      client_id: 'webapp', // eslint-disable-next-line
      username: 'someuser',
      password: 'somepassword', //NOSONAR
    };
    const response = await request(BASE_URL)
      .post(`/auth/login`)
      .send(reqData)
      .expect(STATUS_CODE.UNAUTHORISED);
    expect(response).to.have.property('error');
  });
  it('should give status 200 for login request', async () => {
    const reqData = {
      // eslint-disable-next-line
      client_id: 'webapp', // eslint-disable-next-line
      username,
      password,
    };
    process.env.JWT_ISSUER = 'sourcefuse';
    await request(BASE_URL)
      .post(`/auth/login`)
      .send(reqData)
      .expect(STATUS_CODE.OK);
  });

  it('should return code in response', async () => {
    const reqData = {
      // eslint-disable-next-line
      client_id: 'webapp', // eslint-disable-next-line
      username,
      password,
    };
    process.env.JWT_ISSUER = 'sourcefuse';
    const reqForCode = await request(BASE_URL)
      .post(`/auth/login`)
      .send(reqData)
      .expect(STATUS_CODE.OK);
    expect(reqForCode.body).to.have.property('code');
  });

  it('should return refresh token, access token, expires in response', async () => {
    const reqData = {
      // eslint-disable-next-line
      client_id: 'webapp', // eslint-disable-next-line
      username,
      password,
    };
    process.env.JWT_ISSUER = 'sourcefuse';
    process.env.JWT_SECRET = 'test';
    const reqForCode = await request(BASE_URL)
      .post(`/auth/login`)
      .send(reqData)
      .expect(STATUS_CODE.OK);
    const response = await request(BASE_URL)
      .post(`/auth/token`)
      .set(deviceIdName, deviceId)
      .set(useragentName, useragent)
      .send({
        clientId: 'webapp',
        code: reqForCode.body.code,
      });
    expect(response.body).to.have.properties([
      'accessToken',
      'refreshToken',
      'expires',
    ]);
  });

  it('should return refresh token and access token for token refresh request', async () => {
    const reqData = {
      // eslint-disable-next-line
      client_id: 'webapp', // eslint-disable-next-line
      username,
      password,
    };
    process.env.JWT_ISSUER = 'sourcefuse';
    process.env.JWT_SECRET = 'test';
    const reqForCode = await request(BASE_URL)
      .post(`/auth/login`)
      .send(reqData)
      .expect(STATUS_CODE.OK);
    const reqForToken = await request(BASE_URL)
      .post(`/auth/token`)
      .set(deviceIdName, deviceId)
      .set(useragentName, useragent)
      .send({
        clientId: 'webapp',
        code: reqForCode.body.code,
      });
    const response = await request(BASE_URL)
      .post(`/auth/token-refresh`)
      .send({refreshToken: reqForToken.body.refreshToken})
      .set('Authorization', `Bearer ${reqForToken.body.accessToken}`);
    expect(response.body).to.have.properties(['accessToken', 'refreshToken']);
  });

  it('should throw error when login for external user', async () => {
    const reqData = {
      // eslint-disable-next-line
      client_id: 'webapp', // eslint-disable-next-line
      username: 'platform.admin@mail.com',
      password,
    };
    process.env.JWT_ISSUER = 'sourcefuse';
    process.env.JWT_SECRET = 'test';
    const reqForCode = await request(BASE_URL)
      .post(`/auth/login`)
      .send(reqData)
      .expect(STATUS_CODE.UNAUTHORISED);

    expect(reqForCode.body.error.message.message).to.equal(
      AuthErrorKeys.InvalidCredentials,
    );
  });

  it('should change password successfully for internal user', async () => {
    const reqData = {
      // eslint-disable-next-line
      client_id: 'webapp', // eslint-disable-next-line
      username,
      password,
    };
    process.env.JWT_ISSUER = 'sourcefuse';
    process.env.JWT_SECRET = 'test';
    const reqForCode = await request(BASE_URL)
      .post(`/auth/login`)
      .send(reqData)
      .expect(STATUS_CODE.OK);
    const reqForToken = await request(BASE_URL).post(`/auth/token`).send({
      clientId: 'webapp',
      code: reqForCode.body.code,
    });
    await request(BASE_URL)
      .patch(`/auth/change-password`)
      .set('Authorization', `Bearer ${reqForToken.body.accessToken}`)
      .send({
        username,
        password: newPassword,
        refreshToken: reqForToken.body.refreshToken,
      })
      .expect(STATUS_CODE.OK);
  });

  it('should return refresh token and access token for token refresh request with new password', async () => {
    const reqData = {
      // eslint-disable-next-line
      client_id: 'webapp', // eslint-disable-next-line
      username,
      password: newPassword,
    };
    process.env.JWT_ISSUER = 'sourcefuse';
    process.env.JWT_SECRET = 'test';
    const reqForCode = await request(BASE_URL)
      .post(`/auth/login`)
      .send(reqData)
      .expect(STATUS_CODE.OK);
    const reqForToken = await request(BASE_URL)
      .post(`/auth/token`)
      .set(deviceIdName, deviceId)
      .set(useragentName, useragent)
      .send({
        clientId: 'webapp',
        code: reqForCode.body.code,
      });
    const response = await request(BASE_URL)
      .post(`/auth/token-refresh`)
      .send({refreshToken: reqForToken.body.refreshToken})
      .set('Authorization', `Bearer ${reqForToken.body.accessToken}`);
    expect(response.body).to.have.properties(['accessToken', 'refreshToken']);
  });

  it('should revert to previous password successfully for internal user', async () => {
    const reqData = {
      // eslint-disable-next-line
      client_id: 'webapp', // eslint-disable-next-line
      username,
      password: newPassword,
    };
    process.env.JWT_ISSUER = 'sourcefuse';
    process.env.JWT_SECRET = 'test';
    const reqForCode = await request(BASE_URL)
      .post(`/auth/login`)
      .send(reqData)
      .expect(STATUS_CODE.OK);
    const reqForToken = await request(BASE_URL).post(`/auth/token`).send({
      clientId: 'webapp',
      code: reqForCode.body.code,
    });
    await request(BASE_URL)
      .patch(`/auth/change-password`)
      .set('Authorization', `Bearer ${reqForToken.body.accessToken}`)
      .send({
        username,
        password,
        refreshToken: reqForToken.body.refreshToken,
      })
      .expect(STATUS_CODE.OK);
  });

  it('should return 401 for token refresh request when Authentication token invalid', async () => {
    const reqData = {
      // eslint-disable-next-line
      client_id: 'webapp', // eslint-disable-next-line
      username,
      password,
    };
    process.env.JWT_ISSUER = 'sourcefuse';
    process.env.JWT_SECRET = 'test';
    const reqForCode = await request(BASE_URL)
      .post(`/auth/login`)
      .send(reqData)
      .expect(STATUS_CODE.OK);
    const reqForToken = await request(BASE_URL)
      .post(`/auth/token`)
      .set(deviceIdName, deviceId)
      .set(useragentName, useragent)
      .send({
        clientId: 'webapp',
        code: reqForCode.body.code,
      });
    await request(BASE_URL)
      .post(`/auth/token-refresh`)
      .send({refreshToken: reqForToken.body.refreshToken})
      .set('Authorization', 'Bearer abc')
      .expect(STATUS_CODE.UNAUTHORISED);
  });
  it('should return 401 for token refresh request when Authentication token missing', async () => {
    const reqData = {
      // eslint-disable-next-line
      client_id: 'webapp', // eslint-disable-next-line
      username,
      password,
    };
    process.env.JWT_ISSUER = 'sourcefuse';
    process.env.JWT_SECRET = 'test';
    const reqForCode = await request(BASE_URL)
      .post(`/auth/login`)
      .send(reqData)
      .expect(STATUS_CODE.OK);
    const reqForToken = await request(BASE_URL)
      .post(`/auth/token`)
      .set(deviceIdName, deviceId)
      .set(useragentName, useragent)
      .send({
        clientId: 'webapp',
        code: reqForCode.body.code,
      });
    await request(BASE_URL)
      .post(`/auth/token-refresh`)
      .send({refreshToken: reqForToken.body.refreshToken})
      .expect(STATUS_CODE.UNAUTHORISED);
  });
});
