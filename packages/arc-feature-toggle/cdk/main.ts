import {App} from 'cdktf';
import * as dotenv from 'dotenv';
import * as dotenvExt from 'dotenv-extended';
import {resolve} from 'path';
import {
  getSecurityGroup,
  getSubnetIds,
  LambdaStack,
  MigrationStack,
} from './common';

dotenv.config();
dotenvExt.load({
  schema: '.env.example',
  errorOnMissing: true,
  includeProcessEnv: true,
});

const app = new App();

new MigrationStack(app, 'migration', {
  // NOSONAR
  codePath: resolve(__dirname, '../migration'),
  handler: 'lambda.handler',
  runtime: 'nodejs16.x',
  vpcConfig: {
    securityGroupIds: getSecurityGroup(),
    subnetIds: getSubnetIds(),
  },
  memorySize: 256,
  invocationData: '{}',
  timeout: 60,
  envVars: {
    DB_HOST: process.env.DB_HOST || '',
    DB_PORT: process.env.DB_PORT || '',
    DB_USER: process.env.DB_USER || '',
    DB_PASSWORD: process.env.DB_PASSWORD || '',
    DB_DATABASE: process.env.DB_DATABASE || '',
  },
  namespace: process.env.NAMESPACE || '',
  environment: process.env.ENV || '',
});

new LambdaStack(app, 'lambda', {
  // NOSONAR
  codePath: resolve(__dirname, '../dist'),
  handler: 'lambda.handler',
  runtime: 'nodejs16.x',
  layerPath: resolve(__dirname, '../layers'),
  vpcConfig: {
    securityGroupIds: getSecurityGroup(),
    subnetIds: getSubnetIds(),
  },
  memorySize: 256,
  timeout: 30,
  envVars: {
    DB_HOST: process.env.DB_HOST || '',
    DB_PORT: process.env.DB_PORT || '',
    DB_USER: process.env.DB_USER || '',
    DB_PASSWORD: process.env.DB_PASSWORD || '',
    DB_DATABASE: process.env.DB_DATABASE || '',
    DB_SCHEMA: process.env.DB_SCHEMA || '',
    JWT_SECRET: process.env.JWT_SECRET || '',
    JWT_ISSUER: 'sourcefuce',
    PORT: '3005',
    LOG_LEVEL: 'info',
    DB_CONNECTOR: 'postgresql',
  },
  customDomainName: {
    domainName: process.env.DOMAIN_NAME || '',
    hostedZoneId: process.env.HOSTED_ZONE_ID || '',
  },
  namespace: process.env.NAMESPACE || '',
  environment: process.env.ENV || '',
});

app.synth();
