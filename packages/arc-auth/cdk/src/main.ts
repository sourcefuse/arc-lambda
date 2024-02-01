import {App} from 'cdktf';
import * as dotenv from 'dotenv';
import * as dotenvExt from 'dotenv-extended';
import {resolve} from 'path';
import {LambdaStack, MigrationStack, RedisStack} from './common';

dotenv.config();
dotenvExt.load({
  schema: '.env.example',
  errorOnMissing: true,
  includeProcessEnv: true,
});

const app = new App();



new MigrationStack(app, 'migration', {
  // NOSONAR
  codePath: resolve(__dirname, '../../migration'),
  handler: 'lambda.handler',
  runtime: 'nodejs18.x',
  memorySize: 256,
  invocationData: '{}',
  timeout: 60,
});

new LambdaStack(app, 'lambda', {
  // NOSONAR
  s3Bucket: process.env.S3_BUCKET!,
  codePath: resolve(__dirname, '../'),
  handler: 'lambda.handler',
  runtime: 'nodejs18.x',
  layerPath: resolve(__dirname, '../../layers'),

  memorySize: 256,
  timeout: 30,

  useImage: true,
});

new RedisStack(app, 'redis');

app.synth();
