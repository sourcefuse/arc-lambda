import * as aws from "@cdktf/provider-aws";
import * as random from "@cdktf/provider-random";
import { Fn, TerraformIterator, TerraformStack } from "cdktf";
import { Construct } from "constructs";
import { ILambda, Lambda } from "sourceloop-cdktf";
import { AwsProvider } from "./awsProvider";

export class LambdaStack extends TerraformStack {
  constructor(scope: Construct, id: string, config: Omit<ILambda, "name">) {
    super(scope, id);

    new AwsProvider(this, "aws"); // NOSONAR
    new random.provider.RandomProvider(this, "random"); // NOSONAR

    // Create random value
    const pet = new random.pet.Pet(this, "random-name", {
      length: 2,
    });

    const { namespace, environment } = config;

    const dataAwsVpcVpc = new aws.dataAwsVpc.DataAwsVpc(this, "vpc", {
      filter: [
        {
          name: "tag:Name",
          values: [`${namespace}-${environment}-vpc`],
        },
      ],
    });

    const dataAwsSubnetsPrivate = new aws.dataAwsSubnets.DataAwsSubnets(
      this,
      "private",
      {
        filter: [
          {
            name: "tag:Name",
            values: [
              `${namespace}-${environment}-privatesubnet-private-${process.env.AWS_REGION}a`,
              `${namespace}-${environment}-privatesubnet-private-${process.env.AWS_REGION}b`,
            ],
          },
          {
            name: "vpc-id",
            values: [dataAwsVpcVpc.id],
          },
        ],
      }
    );

    const subnetsIterator = TerraformIterator.fromList(
      Fn.toset(dataAwsSubnetsPrivate.ids)
    );

    const dataAwsSubnetSubnet = new aws.dataAwsSubnet.DataAwsSubnet(
      this,
      "subnet",
      {
        forEach: subnetsIterator,
        id: subnetsIterator.value,
      }
    );

    const dataAwsSecurityGroupsRedisUserSg =
      new aws.dataAwsSecurityGroups.DataAwsSecurityGroups(
        this,
        "redis_user_sg",
        {
          filter: [
            {
              name: "tag:redis-user",
              values: ["yes"],
            },
            {
              name: "vpc-id",
              values: [dataAwsVpcVpc.id],
            },
          ],
        }
      );

    const lambda = new Lambda(this, "lambda", {
      ...config,
      name: pet.id,
    });

    const vpcConfig = {
      security_group_ids: dataAwsSecurityGroupsRedisUserSg.ids,
      subnet_ids: `\${[for s in data.${dataAwsSubnetSubnet.terraformResourceType}.${dataAwsSubnetSubnet.friendlyUniqueId} : s.id]}`,
    };

    lambda.lambdaFunc.addOverride("vpc_config", vpcConfig);
  }
}
