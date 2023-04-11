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
new LambdaStack(app, "cron", { // NOSONAR
  codePath: resolve(__dirname, "../dist"),
  layerPath: resolve(__dirname, "../layers"),
  handler: "cron.handler",
  runtime: "nodejs16.x",
  namespace: process.env.NAMESPACE || "",
  environment: process.env.ENV || "",
  scheduleExpression: "rate(1 day)",
});
app.synth();
