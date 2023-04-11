// Copyright (c) 2022 Sourcefuse Technologies
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
import { Client, expect } from "@loopback/testlab";
import { WorkflowHelloworldApplication } from "../..";
import { setupApplication } from "./test-helper";

const okResponseCode = 200;
describe("PingController", () => {
  let app: WorkflowHelloworldApplication;
  let client: Client;

  before("setupApplication", async () => {
    ({ app, client } = await setupApplication());
  });

  after(async () => {
    await app.stop();
  });

  it("invokes GET /ping", async () => {
    const res = await client.get("/ping?msg=world").expect(okResponseCode);
    expect(res.body).to.containEql({ greeting: "Hello from LoopBack" });
  });
});
