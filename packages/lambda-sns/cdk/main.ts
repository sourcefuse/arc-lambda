import {App} from "cdktf";
import * as dotenv from "dotenv";
import * as dotenvExt from "dotenv-extended";
import {resolve} from "path";
import {LambdaStack} from "./src/lambda.stack";

dotenv.config();
dotenvExt.load({
  schema: ".env.example",
  errorOnMissing: true,
  includeProcessEnv: true,
});

const app = new App();
new LambdaStack(app, "sns", {// NOSONAR
  codePath: resolve(__dirname, "../dist"),
  layerPath: resolve(__dirname, "../layers"),
  handler: "sns.handler",
  runtime: "nodejs18.x",
  namespace: process.env.NAMESPACE || "",
  environment: process.env.ENV || "",
  kmsMasterKeyId: "alias/aws/sns",
});
app.synth();
