import { expect } from "@loopback/testlab";
import { describe, it } from "mocha";
import request from "supertest";
import * as jwt from "jsonwebtoken";

const BASE_URL = "https://sl-test-audit-lambda.sfrefarch.com";

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

describe("Audit Microservice", () => {
  it("should return status 200 while fetching audit logs and token is passed", async () => {
    const reqData = {};
    const response = await request(BASE_URL)
      .get("/audit-logs")
      .set("authorization", `Bearer ${token}`)
      .expect(200);

    console.log(response);
  });
});
