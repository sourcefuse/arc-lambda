import { STATUS_CODE } from "@sourceloop/core";
import dotenv from "dotenv";
import * as jwt from "jsonwebtoken";
import { describe, it } from "mocha";
import request from "supertest";

dotenv.config({
  path: __dirname + "/./../../../.env",
});
const BASE_URL = process.env.LAMBDA_URL;

const testUser = {
  id: "5e6b1a4b-c946-96f5-7e26-9376e657dc0f",
  username: "platform.admin@yopmail.com",
  password: "test123!@#",
  permissions: [
    "ViewAudit",
    "CreateAudit",
    "UpdateAudit",
    "DeleteAudit",
    "1",
    "2",
    "3",
    "4",
  ],
};

const token = jwt.sign(testUser, "test", {
  expiresIn: 180000,
  issuer: "sourcefuse",
});

describe("Audit App", () => {
  it("should expose a self hosted server", async () => {
    await request(BASE_URL)
      .get("/explorer/")
      .expect(STATUS_CODE.OK)
      .expect("Content-Type", /text\/html/)
      .expect(/<title>LoopBack API Explorer/);
  });
});

describe("Audit Microservice", () => {
  it("should return status 200 while fetching audit logs and token is passed", async () => {
    const reqData = {};
    await request(BASE_URL)
      .get("/audit-logs")
      .set("authorization", `Bearer ${token}`)
      .expect(STATUS_CODE.OK);
  });
});
