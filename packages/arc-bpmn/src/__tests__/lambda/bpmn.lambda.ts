import { describe, it } from "mocha";
import request from "supertest";
import dotenv from "dotenv";

dotenv.config({
  path: __dirname + "/./../../../.env",
});
const BASE_URL = process.env.LAMBDA_URL;

describe("BPMN App", () => {
  it("should expose a self hosted server", async () => {
    await request(BASE_URL)
      .get("/explorer/")
      .expect(200)
      .expect("Content-Type", /text\/html/)
      .expect(/<title>LoopBack API Explorer/);
  });
});
