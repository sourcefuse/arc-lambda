import * as aws from '@cdktf/provider-aws';
import { LambdaFunctionVpcConfig } from '@cdktf/provider-aws/lib/lambda-function';
import * as random from '@cdktf/provider-random';
import {
  AssetType,
  TerraformAsset,
  TerraformOutput,
  TerraformStack
} from 'cdktf';
import { Construct } from 'constructs';
import { AcmCertificate } from '../constructs/acmCertificate';
import { ApiGatewayCustomDomainName } from '../constructs/apiGatewayCustomDomainName';
import { LambdaFunctionConfig } from '../interfaces';
import {
  iamRolePolicy,
  lambdaAction,
  lambdaPrincipal,
  lambdaRolePolicy
} from '../utils';
import { defaultLambdaMemory } from '../utils/constants';
import { getResourceName } from '../utils/helper';

export class LambdaStack extends TerraformStack {
  constructor(scope: Construct, id: string, config: LambdaFunctionConfig) {
    super(scope, id);

    new aws.provider.AwsProvider(this, 'aws', {// NOSONAR
      region: process.env.AWS_REGION,
      accessKey: process.env.AWS_ACCESS_KEY_ID,
      secretKey: process.env.AWS_SECRET_ACCESS_KEY,
      profile: process.env.AWS_PROFILE,
      assumeRole: [
        {
          roleArn: process.env.AWS_ROLE_ARN,
        },
      ],
    });
    new random.provider.RandomProvider(this, 'random');// NOSONAR

    // Create random value
    const pet = new random.pet.Pet(this, 'random-name', {
      length: 2,
    });

    const name = getResourceName({
      namespace: config.namespace,
      environment: config.environment,
      randomName: pet.id,
    });

    // Creating Archive of Lambda
    const asset = new TerraformAsset(this, 'lambda-asset', {
      path: config.path,
      type: AssetType.ARCHIVE, // if left empty it infers directory and file
    });

    const layers = [];
    if (config.layerPath) {
      // Creating Archive of Lambda Layer
      const layerAsset = new TerraformAsset(this, 'lambda-layer-asset', {
        path: config.layerPath,
        type: AssetType.ARCHIVE, // if left empty it infers directory and file
      });
      // Create Lambda Layer for function
      const lambdaLayers = new aws.lambdaLayerVersion.LambdaLayerVersion(
        this,
        'lambda-layer',
        {
          filename: layerAsset.path,
          layerName: name,
        },
      );

      layers.push(lambdaLayers.arn);
    }

    // Create Lambda role
    const role = new aws.iamRole.IamRole(this, 'lambda-exec', {
      name,
      assumeRolePolicy: JSON.stringify(iamRolePolicy),
    });

    const lambdaRole = new aws.iamPolicy.IamPolicy(this, 'lambda-policy', {
      policy: JSON.stringify(lambdaRolePolicy),
    });

    // Add execution role for lambda to write to CloudWatch logs
    new aws.iamRolePolicyAttachment.IamRolePolicyAttachment(// NOSONAR
      this,
      'lambda-managed-policy',
      {
        policyArn: lambdaRole.arn,
        role: role.name,
      },
    );

    // Create Lambda function
    const lambdaFunc = new aws.lambdaFunction.LambdaFunction(
      this,
      'lambda-function',
      {
        functionName: name,
        filename: asset.path,
        handler: config.handler,
        runtime: config.runtime,
        role: role.arn,
        memorySize: config.memorySize || defaultLambdaMemory,
        layers: layers.length ? layers : undefined,
        environment: {variables: config.envVars},
        timeout: config.timeout,
      },
    );

    if (config.invocationData) {
      new aws.dataAwsLambdaInvocation.DataAwsLambdaInvocation(// NOSONAR
        this,
        'invocation',
        {
          functionName: lambdaFunc.functionName,
          input: config.invocationData,
        },
      );
    }

    //Putting VPC config to lambda function if subnetIds and securityGroupIds exist

    if (config.subnetIds && config.securityGroupIds) {
      const vpcConfig: LambdaFunctionVpcConfig = {
        subnetIds: config.subnetIds,
        securityGroupIds: config.securityGroupIds,
      };
      lambdaFunc.putVpcConfig(vpcConfig);
    }

    if (config.isApiRequired) {
      // Create and configure API gateway
      const api = new aws.apigatewayv2Api.Apigatewayv2Api(this, 'api-gw', {
        name,
        protocolType: 'HTTP',
        target: lambdaFunc.arn,
      });

      new aws.lambdaPermission.LambdaPermission(// NOSONAR
        this,
        'apigw-lambda-permission',
        {
          functionName: lambdaFunc.functionName,
          action: lambdaAction,
          principal: lambdaPrincipal,
          sourceArn: `${api.executionArn}/*/*`,
        },
      );

      if (config.customDomainName) {
        const customDomainName = {
          ...config.customDomainName,
          acmCertificateArn: config.customDomainName.acmCertificateArn || '',
        };
        if (!customDomainName.acmCertificateArn) {
          const acmCertificate = new AcmCertificate(this, 'acmCertificate', {
            domainName: customDomainName.domainName,
            hostedZoneId: customDomainName.hostedZoneId,
          });
          customDomainName.acmCertificateArn = acmCertificate.acmArn;
        }
        new ApiGatewayCustomDomainName(this, 'api-gateway-custom-domain-name', {// NOSONAR
          apiId: api.id,
          ...customDomainName,
        });
      }

      new TerraformOutput(this, 'url', {// NOSONAR
        value: config.customDomainName
          ? config.customDomainName.domainName
          : api.apiEndpoint,
      });
    }

    new TerraformOutput(this, 'function', {// NOSONAR
      value: lambdaFunc.arn,
    });
  }
}
