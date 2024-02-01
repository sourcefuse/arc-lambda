import * as random from '@cdktf/provider-random';
import {ILambda, Lambda} from 'arc-cdk';
import {TerraformStack} from 'cdktf';
import {Construct} from 'constructs';
import {getEnv, getSecurityGroup, getSubnetIds} from '../../env';
import {AwsProvider} from '../constructs/awsProvider';

export class MigrationStack extends TerraformStack {
  constructor(scope: Construct, id: string, config: Omit<ILambda, 'name' | 'envVars' | 'namespace' | 'environment'>) {
    super(scope, id);

    new AwsProvider(this, 'aws'); // NOSONAR
    new random.provider.RandomProvider(this, 'random'); // NOSONAR

    // Create random value
    const pet = new random.pet.Pet(this, 'random-name', {
      length: 2,
    });
    const env = getEnv(this);

    new Lambda(this, 'lambda', {
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
      },
      namespace: env.NAMESPACE || '',
      environment: env.ENV || '',
    });
  }
}
