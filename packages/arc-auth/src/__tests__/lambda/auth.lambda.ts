// /* eslint-disable @typescript-eslint/naming-convention */
import dotenv from 'dotenv';
import {expect} from '@loopback/testlab';
import {AuthenticateErrorKeys} from '@sourceloop/core';
import {AuthErrorKeys} from 'loopback4-authentication';
import {describe, it} from 'mocha';
import request from 'supertest';
import {TestHelperService} from '../fixtures/services';

dotenv.config({
  path: __dirname + '/./../../../.env',
});
const BASE_URL = process.env.LAMBDA_URL;
console.log(__dirname);

describe('Authentication microservice', () => {
  const useragent = 'test';
  const deviceId = 'test';
  const useragentName = 'user-agent';
  const deviceIdName = 'device_id';
  let helper: TestHelperService;

  it('should give status 422 for login request with no client credentials', async () => {
    const reqData = {};
    const response = await request(BASE_URL)
      .post(`/auth/login`)
      .send(reqData)
      .expect(422);
    expect(response).to.have.property('error');
  });
  it('should give status 422 for login request with no user credentials', async () => {
    const reqData = {
      clientId: 'webapp',
      clientSecret: 'saqw21!@',
    };
    const response = await request(BASE_URL)
      .post(`/auth/login`)
      .send(reqData)
      .expect(422);
    expect(response).to.have.property('error');
  });
  it('should give status 401 for login request with wrong client credentials', async () => {
    const reqData = {
      // eslint-disable-next-line
      client_id: 'web1', // eslint-disable-next-line
      client_secret: 'blah1',
      username: 'someuser',
      password: 'somepassword',
    };
    const response = await request(BASE_URL)
      .post(`/auth/login`)
      .send(reqData)
      .expect(401);
    expect(response).to.have.property('error');
  });
  it('should give status 401 for login request with wrong user credentials', async () => {
    const reqData = {
      // eslint-disable-next-line
      client_id: 'webapp', // eslint-disable-next-line
      client_secret: 'saqw21!@',
      username: 'someuser',
      password: 'somepassword',
    };
    const response = await request(BASE_URL)
      .post(`/auth/login`)
      .send(reqData)
      .expect(401);
    expect(response).to.have.property('error');
  });
  it('should give status 401 for login request with user credentials not belonging to client', async () => {
    const reqData = {
      // eslint-disable-next-line
      client_id: 'webapp', // eslint-disable-next-line
      client_secret: 'saqw21!@',
      username: 'test_user',
      password: 'temp123!@',
    };
    const response = await request(BASE_URL)
      .post(`/auth/login`)
      .send(reqData)
      .expect(401);
    expect(response).to.have.property('error');
    expect(response.body.error.message).to.be.equal(
      AuthErrorKeys.ClientInvalid,
    );
  });
  it('should give status 200 for login request', async () => {
    const reqData = {
      // eslint-disable-next-line
      client_id: 'webapp', // eslint-disable-next-line
      client_secret: 'saqw21!@',
      username: 'platform.admin@yopmail.com',
      password: 'test123!@#',
    };
    process.env.JWT_ISSUER = 'sourcefuse';
    await request(BASE_URL).post(`/auth/login`).send(reqData).expect(200);
  });

  it('should return code in response', async () => {
    const reqData = {
      // eslint-disable-next-line
      client_id: 'webapp', // eslint-disable-next-line
      client_secret: 'saqw21!@',
      username: 'platform.admin@yopmail.com',
      password: 'test123!@#',
    };
    process.env.JWT_ISSUER = 'sourcefuse';
    const reqForCode = await request(BASE_URL)
      .post(`/auth/login`)
      .send(reqData)
      .expect(200);
    expect(reqForCode.body).to.have.property('code');
  });

  it('should return refresh token, access token, expires in response', async () => {
    const reqData = {
      // eslint-disable-next-line
      client_id: 'webapp', // eslint-disable-next-line
      client_secret: 'saqw21!@',
      username: 'platform.admin@yopmail.com',
      password: 'test123!@#',
    };
    process.env.JWT_ISSUER = 'sourcefuse';
    process.env.JWT_SECRET = 'test';
    const reqForCode = await request(BASE_URL)
      .post(`/auth/login`)
      .send(reqData)
      .expect(200);
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
      client_secret: 'saqw21!@',
      username: 'platform.admin@yopmail.com',
      password: 'test123!@#',
    };
    process.env.JWT_ISSUER = 'sourcefuse';
    process.env.JWT_SECRET = 'test';
    const reqForCode = await request(BASE_URL)
      .post(`/auth/login`)
      .send(reqData)
      .expect(200);
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
      client_secret: 'saqw21!@',
      username: 'platform.admin@mail.com',
      password: 'test123!@#',
    };
    process.env.JWT_ISSUER = 'sourcefuse';
    process.env.JWT_SECRET = 'test';
    const reqForCode = await request(BASE_URL)
      .post(`/auth/login`)
      .send(reqData)
      .expect(401);

    expect(reqForCode.body.error.message.message).to.equal(
      AuthErrorKeys.InvalidCredentials,
    );
  });

  it('should change password successfully for internal user', async () => {
    const reqData = {
      // eslint-disable-next-line
      client_id: 'webapp', // eslint-disable-next-line
      client_secret: 'saqw21!@',
      username: 'platform.admin@yopmail.com',
      password: 'test123!@#',
    };
    process.env.JWT_ISSUER = 'sourcefuse';
    process.env.JWT_SECRET = 'test';
    const reqForCode = await request(BASE_URL)
      .post(`/auth/login`)
      .send(reqData)
      .expect(200);
    const reqForToken = await request(BASE_URL).post(`/auth/token`).send({
      clientId: 'webapp',
      code: reqForCode.body.code,
    });
    await request(BASE_URL)
      .patch(`/auth/change-password`)
      .set('Authorization', `Bearer ${reqForToken.body.accessToken}`)
      .send({
        username: 'platform.admin@yopmail.com',
        password: 'new_test123!@#',
        refreshToken: reqForToken.body.refreshToken,
      })
      .expect(200);
  });

  it('should return refresh token and access token for token refresh request with new password', async () => {
    const reqData = {
      // eslint-disable-next-line
      client_id: 'webapp', // eslint-disable-next-line
      client_secret: 'saqw21!@',
      username: 'platform.admin@yopmail.com',
      password: 'new_test123!@#',
    };
    process.env.JWT_ISSUER = 'sourcefuse';
    process.env.JWT_SECRET = 'test';
    const reqForCode = await request(BASE_URL)
      .post(`/auth/login`)
      .send(reqData)
      .expect(200);
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
      client_secret: 'saqw21!@',
      username: 'platform.admin@yopmail.com',
      password: 'new_test123!@#',
    };
    process.env.JWT_ISSUER = 'sourcefuse';
    process.env.JWT_SECRET = 'test';
    const reqForCode = await request(BASE_URL)
      .post(`/auth/login`)
      .send(reqData)
      .expect(200);
    const reqForToken = await request(BASE_URL).post(`/auth/token`).send({
      clientId: 'webapp',
      code: reqForCode.body.code,
    });
    await request(BASE_URL)
      .patch(`/auth/change-password`)
      .set('Authorization', `Bearer ${reqForToken.body.accessToken}`)
      .send({
        username: 'platform.admin@yopmail.com',
        password: 'test123!@#',
        refreshToken: reqForToken.body.refreshToken,
      })
      .expect(200);
  });

  it('should return 401 for token refresh request when Authentication token invalid', async () => {
    const reqData = {
      // eslint-disable-next-line
      client_id: 'webapp', // eslint-disable-next-line
      client_secret: 'saqw21!@',
      username: 'platform.admin@yopmail.com',
      password: 'test123!@#',
    };
    process.env.JWT_ISSUER = 'sourcefuse';
    process.env.JWT_SECRET = 'test';
    const reqForCode = await request(BASE_URL)
      .post(`/auth/login`)
      .send(reqData)
      .expect(200);
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
      .expect(401);
  });
  it('should return 401 for token refresh request when Authentication token missing', async () => {
    const reqData = {
      // eslint-disable-next-line
      client_id: 'webapp', // eslint-disable-next-line
      client_secret: 'saqw21!@',
      username: 'platform.admin@yopmail.com',
      password: 'test123!@#',
    };
    process.env.JWT_ISSUER = 'sourcefuse';
    process.env.JWT_SECRET = 'test';
    const reqForCode = await request(BASE_URL)
      .post(`/auth/login`)
      .send(reqData)
      .expect(200);
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
      .expect(401);
  });
  it('should throw error if user does not belong to client id in forgot password request', async () => {
    const reqData = {
      // eslint-disable-next-line
      client_id: 'webapp', // eslint-disable-next-line
      client_secret: 'saqw21!@',
      username: 'platform.admin@yopmail.com',
    };
    process.env.JWT_ISSUER = 'sourcefuse';
    process.env.JWT_SECRET = 'test';
    const response = await request(BASE_URL)
      .post(`/auth/forget-password`)
      .send(reqData)
      .expect(401);
    expect(response.body.error.message.message).to.be.equal(
      AuthErrorKeys.ClientInvalid,
    );
  });

  it('should send forgot password request successfully', async () => {
    const reqData = {
      // eslint-disable-next-line
      client_id: 'webapp', // eslint-disable-next-line
      client_secret: 'saqw21!@',
      username: 'platform.admin@yopmail.com',
    };
    process.env.JWT_ISSUER = 'sourcefuse';
    process.env.JWT_SECRET = 'test';
    await request(BASE_URL)
      .post(`/auth/forget-password`)
      .send(reqData)
      .expect(204);
    const token = helper.get('TOKEN');
    expect(token).to.be.String();
    expect(token).to.not.be.equal('');
  });

  it('should throw error on forgot password request for external user', async () => {
    const reqData = {
      // eslint-disable-next-line
      client_id: 'webapp', // eslint-disable-next-line
      client_secret: 'saqw21!@',
      username: 'test_teacher',
    };
    process.env.JWT_ISSUER = 'sourcefuse';
    process.env.JWT_SECRET = 'test';
    const response = await request(BASE_URL)
      .post(`/auth/forget-password`)
      .send(reqData)
      .expect(400);
    expect(response.body.error.message).to.be.equal(
      AuthenticateErrorKeys.PasswordCannotBeChanged,
    );
  });

  it('should return empty response even if the user does not exist', async () => {
    const reqData = {
      // eslint-disable-next-line
      client_id: 'webapp', // eslint-disable-next-line
      client_secret: 'saqw21!@',
      username: 'testuser',
    };
    const response = await request(BASE_URL)
      .post(`/auth/forget-password`)
      .send(reqData)
      .expect(204);
    expect(response.body).to.be.empty();
  });
  it('should verify reset password token successfully', async () => {
    const reqData = {
      // eslint-disable-next-line
      client_id: 'webapp', // eslint-disable-next-line
      client_secret: 'saqw21!@',
      username: 'platform.admin@yopmail.com',
    };
    process.env.JWT_ISSUER = 'sourcefuse';
    process.env.JWT_SECRET = 'test';
    await request(BASE_URL)
      .post(`/auth/forget-password`)
      .send(reqData)
      .expect(204);
    const token = helper.get('TOKEN');
    expect(token).to.be.String();
    expect(token).to.not.be.equal('');
    await request(BASE_URL)
      .get(`/auth/verify-reset-password-link?token=${token}`)
      .send()
      .expect(200);
  });
  it('should give token missing error when no token passed in verify reset password', async () => {
    const reqData = {
      // eslint-disable-next-line
      client_id: 'webapp', // eslint-disable-next-line
      client_secret: 'saqw21!@',
      username: 'platform.admin@yopmail.com',
    };
    process.env.JWT_ISSUER = 'sourcefuse';
    process.env.JWT_SECRET = 'test';
    await request(BASE_URL)
      .post(`/auth/forget-password`)
      .send(reqData)
      .expect(204);
    const responseToken = await request(BASE_URL)
      .get(`/auth/verify-reset-password-link`)
      .send()
      .expect(400);
    expect(responseToken.body).to.have.properties('error');
  });
  it('should return error for token missing when no token passed in reset password', async () => {
    const reqData = {
      // eslint-disable-next-line
      client_id: 'webapp', // eslint-disable-next-line
      client_secret: 'saqw21!@',
      username: 'platform.admin@yopmail.com',
    };
    process.env.JWT_ISSUER = 'sourcefuse';
    process.env.JWT_SECRET = 'test';
    await request(BASE_URL)
      .post(`/auth/forget-password`)
      .send(reqData)
      .expect(204);
    const requestData = {
      // eslint-disable-next-line
      client_id: 'webapp', // eslint-disable-next-line
      client_secret: 'saqw21!@',
      username: 'platform.admin@yopmail.com',
    };
    await request(BASE_URL)
      .patch(`/auth/reset-password`)
      .send(requestData)
      .expect(422);
  });
  it('should return error for password missing when new password not sent in reset password', async () => {
    const reqData = {
      // eslint-disable-next-line
      client_id: 'webapp', // eslint-disable-next-line
      client_secret: 'saqw21!@',
      username: 'platform.admin@yopmail.com',
    };
    process.env.JWT_ISSUER = 'sourcefuse';
    process.env.JWT_SECRET = 'test';
    await request(BASE_URL)
      .post(`/auth/forget-password`)
      .send(reqData)
      .expect(204);
    const token = helper.get('TOKEN');
    const requestData = {
      // eslint-disable-next-line
      client_id: 'webapp', // eslint-disable-next-line
      client_secret: 'saqw21!@',
      token,
    };
    await request(BASE_URL)
      .patch(`/auth/reset-password`)
      .send(requestData)
      .expect(422);
  });
  it('should throw error when reset password to previous password', async () => {
    const reqData = {
      // eslint-disable-next-line
      client_id: 'webapp', // eslint-disable-next-line
      client_secret: 'saqw21!@',
      username: 'platform.admin@yopmail.com',
    };
    process.env.JWT_ISSUER = 'sourcefuse';
    process.env.JWT_SECRET = 'test';
    await request(BASE_URL)
      .post(`/auth/forget-password`)
      .send(reqData)
      .expect(204);
    const token = helper.get('TOKEN');
    const requestData = {
      // eslint-disable-next-line
      client_id: 'webapp', // eslint-disable-next-line
      client_secret: 'saqw21!@',
      token,
      password: 'test123!@#',
    };
    await request(BASE_URL)
      .patch(`/auth/reset-password`)
      .send(requestData)
      .expect(401);
  });

  it('should reset password successfully', async () => {
    const reqData = {
      // eslint-disable-next-line
      client_id: 'webapp', // eslint-disable-next-line
      client_secret: 'saqw21!@',
      username: 'platform.admin@yopmail.com',
    };
    process.env.JWT_ISSUER = 'sourcefuse';
    process.env.JWT_SECRET = 'test';
    await request(BASE_URL)
      .post(`/auth/forget-password`)
      .send(reqData)
      .expect(204);
    const token = helper.get('TOKEN');
    const requestData = {
      // eslint-disable-next-line
      client_id: 'webapp', // eslint-disable-next-line
      client_secret: 'saqw21!@',
      token,
      password: 'test123#@',
    };
    await request(BASE_URL)
      .patch(`/auth/reset-password`)
      .send(requestData)
      .expect(204);
  });

  it('should return true on logout', async () => {
    const reqData = {
      // eslint-disable-next-line
      client_id: 'webapp', // eslint-disable-next-line
      client_secret: 'saqw21!@',
      username: 'platform.admin@yopmail.com',
      password: 'test123#@',
    };
    process.env.JWT_ISSUER = 'sourcefuse';
    process.env.JWT_SECRET = 'test';
    const reqForCode = await request(BASE_URL)
      .post(`/auth/login`)
      .send(reqData)
      .expect(200);
    const reqForToken = await request(BASE_URL)
      .post(`/auth/token`)
      .set(deviceIdName, deviceId)
      .set(useragentName, useragent)
      .send({
        clientId: 'webapp',
        code: reqForCode.body.code,
      })
      .expect(200);
    await request(BASE_URL)
      .post(`/logout`)
      .set('Authorization', `Bearer ${reqForToken.body.accessToken}`)
      .send({
        refreshToken: reqForToken.body.refreshToken,
      })
      .expect(200);
  });
  it('should return error for wrong token on logout', async () => {
    const reqData = {
      // eslint-disable-next-line
      client_id: 'webapp', // eslint-disable-next-line
      client_secret: 'saqw21!@',
      username: 'platform.admin@yopmail.com',
      password: 'test123#@',
    };
    process.env.JWT_ISSUER = 'sourcefuse';
    process.env.JWT_SECRET = 'test';
    const reqForCode = await request(BASE_URL)
      .post(`/auth/login`)
      .send(reqData)
      .expect(200);
    const reqForToken = await request(BASE_URL)
      .post(`/auth/token`)
      .set(deviceIdName, deviceId)
      .set(useragentName, useragent)
      .send({
        clientId: 'webapp',
        code: reqForCode.body.code,
      })
      .expect(200);
    await request(BASE_URL)
      .post(`/logout`)
      .set('Authorization', `Bearer ${reqForToken.body.accessToken}`)
      .send({
        refreshToken: 'aaaa',
      })
      .expect(401);
  });
});
