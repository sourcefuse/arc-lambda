import * as aws from '@cdktf/provider-aws';
import { Construct } from 'constructs';
import { ApiGatewayCustomDomainNameConfig } from '../interfaces';

export class ApiGatewayCustomDomainName extends Construct {
  constructor(
    scope: Construct,
    name: string,
    config: ApiGatewayCustomDomainNameConfig,
  ) {
    super(scope, name);

    const apigatewayv2DomainName =
      new aws.apigatewayv2DomainName.Apigatewayv2DomainName(
        this,
        'api-gw-domain',
        {
          domainName: config.domainName,
          domainNameConfiguration: {
            endpointType: 'REGIONAL',
            certificateArn: config.acmCertificateArn,
            securityPolicy: 'TLS_1_2',
          },
        },
      );

    const apigatewayv2ApiMapping =
      new aws.apigatewayv2ApiMapping.Apigatewayv2ApiMapping(
        this,
        'path-mapping',
        {
          apiId: config.apiId,
          stage: '$default',
          domainName: apigatewayv2DomainName.domainName,
        },
      );

    new aws.route53Record.Route53Record(this, 'app_domain_records', {// NOSONAR
      alias: {
        evaluateTargetHealth: false,
        name: apigatewayv2DomainName.domainNameConfiguration.targetDomainName,
        zoneId: apigatewayv2DomainName.domainNameConfiguration.hostedZoneId,
      },

      name: apigatewayv2ApiMapping.domainName,
      type: 'A',
      zoneId: config.hostedZoneId,
    });
  }
}
