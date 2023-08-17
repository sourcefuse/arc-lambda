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
new LambdaStack(app, "sqs", {// NOSONAR
  codePath: resolve(__dirname, "../dist"),
  layerPath: resolve(__dirname, "../layers"),
  handler: "sqs.handler",
  runtime: "nodejs18.x",
  namespace: process.env.NAMESPACE || "",
  environment: process.env.ENV || "",
  delaySeconds: 90,
  maxMessageSize: 2048,
  batchSize: 10,
  messageRetentionSeconds: 86400,
  receiveWaitTimeSeconds: 10,
  maxReceiveCount: 5,
  kmsMasterKeyId: "alias/aws/sqs",
  kmsDataKeyReusePeriodSeconds: 300,
});
app.synth();
