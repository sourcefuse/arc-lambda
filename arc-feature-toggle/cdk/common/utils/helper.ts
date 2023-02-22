export const getResourceName = ({
  namespace,
  environment,
  name,
}: {
  namespace: string;
  environment: string;
  name: string;
}) => `${namespace}-${environment}-${name}`;

export const getSubnetIds = () => {
  try {
    const subnetIds = process.env?.SUBNET_IDS || '';
    return JSON.parse(subnetIds);
  } catch (e) {
    console.error(e); // NOSONAR
  }
  return [];
};

export const getSecurityGroup = () => {
  try {
    const securityGroup = process.env?.SECURITY_GROUPS || '';
    return JSON.parse(securityGroup);
  } catch (e) {
    console.error(e); // NOSONAR
  }
  return [];
};
