import * as random from "@cdktf/provider-random";
import { TerraformStack } from "cdktf";
import { Construct } from "constructs";
import { ILambdaWithSqs, LambdaWithSqs } from "sourceloop-cdktf";
import { AwsProvider } from "./awsProvider";

export class LambdaStack extends TerraformStack {
  constructor(
    scope: Construct,
    id: string,
    config: Omit<ILambdaWithSqs, "name">
  ) {
    super(scope, id);

    new AwsProvider(this, "aws"); // NOSONAR
    new random.provider.RandomProvider(this, "random"); // NOSONAR

    // Create random value
    const pet = new random.pet.Pet(this, "random-name", {
      length: 2,
    });

    new LambdaWithSqs(this, "lambda-sqs", {
      ...config,
      name: pet.id,
    });
  }
}
