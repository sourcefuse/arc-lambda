import {DataAwsSecurityGroup} from '@cdktf/provider-aws/lib/data-aws-security-group';
import {DataAwsSsmParameter} from '@cdktf/provider-aws/lib/data-aws-ssm-parameter';
import {DataAwsSubnets} from '@cdktf/provider-aws/lib/data-aws-subnets';
import {TerraformStack} from 'cdktf';
import {readFileSync} from 'fs';

export const env = {
  AWS_REGION: "",
  DB_HOST: "",
  DB_PORT: 5432,
  DB_USER: "",
  DB_PASSWORD: "",
  DB_DATABASE: "",
  DB_SCHEMA: "",
  JWT_SECRET: "",
  ACM_CERTIFICATE_ARN: "",
  HOSTED_ZONE_ID: "",
  DOMAIN_NAME: "",
  NAMESPACE: "",
  ENV: "",
  S3_BUCKET: ""
};

interface EnvVar {
  [key: string]: string;
}

export const getSubnetIds = (scope: TerraformStack) => {
  const subnets = new DataAwsSubnets(scope, "private_subnets", {
    filter: [
      {
        name: "tag:Name",
        values: ['demoTagName'],    //Replace demoTagName by Name Tag of subnet id
      },
    ],
  });
  return subnets.ids;
}

export const getSecurityGroup = (scope: TerraformStack) => {
  const sgroup = new DataAwsSecurityGroup(scope, "security_group", {
    filter: [
      {
        name: "tag:Name",
        values: ['demoTagName'],    //Replace demoTagName by Name Tag of security group
      },
    ],
  });
  return [sgroup.id];
};


export const getEnv = (scope: TerraformStack) => {
  let envVar: EnvVar = {};
  checkEnv();

  for (const key in process.env) {
    // Check if the property is directly defined on the object (not inherited)
    if (process.env.hasOwnProperty(key)) {
      //read value from ssm
      const ssm = new DataAwsSsmParameter(scope, "db_admin_username_ssm_param", {
        name: process.env[key] ?? '',
        withDecryption: true
      });
      // Copy the value from process.env to envVar
      envVar[key] = ssm.value;
    }
  }

  return envVar;
}


export const checkEnv = () => {
  let envToCheck = readFileSync('../.env.schema', "utf8").split(/[\n =]/).filter(Boolean);
  envToCheck.forEach(key => {
    if (!env.hasOwnProperty(key)) {
      throw new Error(`env is missing- ${key}`);
    }
  })
}
