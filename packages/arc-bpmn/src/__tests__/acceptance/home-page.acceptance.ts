﻿// Copyright (c) 2022 Sourcefuse Technologies
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
import { Client } from "@loopback/testlab";
import { WorkflowHelloworldApplication } from "../..";
import { setupApplication } from "./test-helper";

const okResponseCode = 200;
describe("HomePage", () => {
  let app: WorkflowHelloworldApplication;
  let client: Client;

  before("setupApplication", async () => {
    ({ app, client } = await setupApplication());
  });

  after(async () => {
    await app.stop();
  });

  it("exposes a default home page", async () => {
    await client
      .get("/")
      .expect(okResponseCode)
      .expect("Content-Type", /text\/html/);
  });

  it("exposes self-hosted explorer", async () => {
    await client
      .get("/explorer/")
      .expect(okResponseCode)
      .expect("Content-Type", /text\/html/)
      .expect(/<title>LoopBack API Explorer/);
  });
});
