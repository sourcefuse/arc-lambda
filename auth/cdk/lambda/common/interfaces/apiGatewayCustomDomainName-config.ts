export type ApiGatewayCustomDomainNameBaseConfig = {
  domainName: string;
  acmCertificateArn: string;
  hostedZoneId: string;
};

export type ApiGatewayCustomDomainNameConfig = {
  apiId: string;
} & ApiGatewayCustomDomainNameBaseConfig;
