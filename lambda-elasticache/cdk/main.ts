import { App } from "cdktf";
import * as dotenv from "dotenv";
import * as dotenvExt from "dotenv-extended";
import { resolve } from "path";
import { LambdaStack } from "./src/lambda.stack";

dotenv.config();
dotenvExt.load({
  schema: ".env.example",
  errorOnMissing: true,
  includeProcessEnv: true,
});

const app = new App();
new LambdaStack(app, "elasticache", {
  codePath: resolve(__dirname, "../dist"),
  layerPath: resolve(__dirname, "../layers"),
  runtime: "nodejs16.x",
  namespace: process.env.NAMESPACE || "",
  environment: process.env.ENV || "",
  handler: "elasticache.handler",
  envVars: {
    redisEndpoint: process.env.REDIS_ENDPOINT || "",
  },
});
app.synth();
