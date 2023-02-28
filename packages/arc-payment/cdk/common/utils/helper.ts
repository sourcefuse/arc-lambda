export const getResourceName = ({
  namespace,
  environment,
  name,
}: {
  namespace: string;
  environment: string;
  name: string;
}) => `${namespace}-${environment}-${name}`;
