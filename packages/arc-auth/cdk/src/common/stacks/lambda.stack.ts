import * as random from '@cdktf/provider-random';
import {ILambdaWithApiGateway, LambdaWithApiGateway} from 'arc-cdk';
import {TerraformStack} from 'cdktf';
import {Construct} from 'constructs';
import {getEnv, getSecurityGroup, getSubnetIds} from '../../env';
import {AwsProvider} from '../constructs/awsProvider';
import path = require('path');

export class LambdaStack extends TerraformStack {
  constructor(
    scope: Construct,
    id: string,
    config: Omit<ILambdaWithApiGateway, 'name' | 'envVars' | 'namespace' | 'environment'>,
  ) {
    super(scope, id);

    new AwsProvider(this, 'aws'); // NOSONAR
    new random.provider.RandomProvider(this, 'random'); // NOSONAR

    // Create random value
    const pet = new random.pet.Pet(this, 'random-name', {
      length: 2,
    });
    const env = getEnv(this);
    // overwrite codePath based on useImage as deploy via docker needs different codePath
    config.codePath = path.resolve(
      config.codePath,
      `../${config.useImage ? '' : 'dist'}`,
    );

    new LambdaWithApiGateway(this, 'lambda-apiGateway', {
      // NOSONAR
      ...config,
      name: pet.id,
      vpcConfig: {
        securityGroupIds: getSecurityGroup(this),
        subnetIds: getSubnetIds(this),
      },
      envVars: {
        DB_HOST: env.DB_HOST || '',
        DB_PORT: env.DB_PORT || '',
        DB_USER: env.DB_USER || '',
        DB_PASSWORD: env.DB_PASSWORD || '',
        DB_DATABASE: env.DB_DATABASE || '',
        DB_SCHEMA: env.DB_SCHEMA || '',
        JWT_SECRET: env.JWT_SECRET || '',
        JWT_ISSUER: 'sourcefuse',
        PORT: '3005',
        LOG_LEVEL: 'info',
        DB_CONNECTOR: 'postgresql',
      },
      customDomainName: {
        domainName: env.DOMAIN_NAME || '',
        hostedZoneId: env.HOSTED_ZONE_ID || '',
      },
      namespace: env.NAMESPACE || '',
      environment: env.ENV || '',
    });
  }
}
