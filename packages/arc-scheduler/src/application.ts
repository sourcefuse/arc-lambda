// Copyright (c) 2022 Sourcefuse Technologies
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
import { BootMixin } from "@loopback/boot";
import { ApplicationConfig } from "@loopback/core";
import { RepositoryMixin } from "@loopback/repository";
import { RestApplication } from "@loopback/rest";
import {
  RestExplorerBindings,
  RestExplorerComponent,
} from "@loopback/rest-explorer";
import { ServiceMixin } from "@loopback/service-proxy";
import { CoreConfig, LocaleKey, SFCoreBindings } from "@sourceloop/core";
import { SchedulerServiceComponent } from "@sourceloop/scheduler-service";
import * as dotenv from "dotenv";
import * as dotenvExt from "dotenv-extended";
import path from "path";
import { MySequence } from "./sequence";

export { ApplicationConfig };

const port = 3000;
export class SchedulerExampleApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication))
) {
  localeObj: i18nAPI = {} as i18nAPI;

  constructor(options: ApplicationConfig = {}) {
    dotenv.config();
    if (process?.env?.NODE_ENV && process.env.NODE_ENV !== "test") {
      dotenvExt.load({
        schema: ".env.example",
        errorOnMissing: true,
        includeProcessEnv: true,
      });
    } else {
      dotenvExt.load({
        schema: ".env.example",
        errorOnMissing: false,
        includeProcessEnv: true,
      });
    }
    options.rest = options.rest || {};
    options.rest.port = +(process.env.PORT ?? port);
    options.rest.host = process.env.HOST;
    super(options);

    const configObject: CoreConfig["configObject"] = {
      locales: [
        LocaleKey.en,
        LocaleKey.es,
        LocaleKey.ptBr,
        LocaleKey.ptPt,
        LocaleKey.esCo,
      ],
      fallbacks: {
        [LocaleKey.es]: "en",
        [LocaleKey.esCo]: "en",
        [LocaleKey.ptBr]: "en",
        [LocaleKey.ptPt]: "en",
      },
      register: this.localeObj,
      directoryPermissions: "777",
      directory: `/tmp`,
      objectNotation: true,
    };

    this.bind(SFCoreBindings.config).to({ configObject });

    // Set up the custom sequence
    this.sequence(MySequence);

    // Set up default home page
    this.static("/", path.join(__dirname, "../public"));

    // Customize @loopback/rest-explorer configuration here
    this.configure(RestExplorerBindings.COMPONENT).to({
      path: "/explorer",
    });
    this.component(RestExplorerComponent);
    this.component(SchedulerServiceComponent);

    this.projectRoot = __dirname;
    // Customize @loopback/boot Booter Conventions here
    this.bootOptions = {
      controllers: {
        // Customize ControllerBooter Conventions here
        dirs: ["controllers"],
        extensions: [".controller.js"],
        nested: true,
      },
    };
  }
}
