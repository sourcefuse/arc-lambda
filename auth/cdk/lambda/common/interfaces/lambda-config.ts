import { XOR } from 'ts-essentials';
import { ApiGatewayCustomDomainNameBaseConfig } from './apiGatewayCustomDomainName-config';

type LambdaFunctionBaseConfig = {
  path: string;
  handler: string;
  runtime: string;
  version: string;
  memorySize?: number;
  envVars?: {
    [x: string]: string;
  };
  layerPath?: string;
  isApiRequired?: boolean;
  invocationData?: string;
  timeout?: number;
  customDomainName?: Omit<
    ApiGatewayCustomDomainNameBaseConfig,
    'acmCertificateArn'
  > & {acmCertificateArn?: string};
  namespace: string;
  environment: string;
};

export type LambdaFunctionConfig = XOR<
  LambdaFunctionBaseConfig & {
    securityGroupIds: string[];
    subnetIds: string[];
  },
  LambdaFunctionBaseConfig
>;
