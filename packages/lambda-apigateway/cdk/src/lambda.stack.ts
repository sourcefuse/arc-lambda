import * as random from "@cdktf/provider-random";
import {TerraformStack} from "cdktf";
import {Construct} from "constructs";
import {ILambdaWithApiGateway, LambdaWithApiGateway} from "sourceloop-cdktf";
import {AwsProvider} from "./awsProvider";

export class LambdaStack extends TerraformStack {
  constructor(
    scope: Construct,
    id: string,
    config: Omit<ILambdaWithApiGateway, "name">
  ) {
    super(scope, id);

    new AwsProvider(this, "aws"); // NOSONAR
    new random.provider.RandomProvider(this, "random"); // NOSONAR

    // Create random value
    const pet = new random.pet.Pet(this, "random-name", {
      length: 2,
    });

    new LambdaWithApiGateway(this, "lambda-apigateway", { // NOSONAR
      ...config,
      name: pet.id,
    });
  }
}
