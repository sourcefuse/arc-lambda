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
import { AuditServiceComponent } from "@sourceloop/audit-service";
import { CoreConfig, LocaleKey, SFCoreBindings } from "@sourceloop/core";
import * as dotenv from "dotenv";
import * as dotenvExt from "dotenv-extended";
import * as path from "path";
import { MySequence } from "./sequence";

export { ApplicationConfig };

export class AuditExampleApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication))
) {
  localeObj: i18nAPI = {} as i18nAPI;

  constructor(options: ApplicationConfig = {}) {
    const port = 3000;
    dotenv.config();
    dotenvExt.load({
      schema: ".env.example",
      errorOnMissing: process.env.NODE_ENV !== "test",
      includeProcessEnv: true,
    });
    options.rest = options.rest ?? {};
    options.rest.port = +(process.env.PORT ?? port);
    options.rest.openApiSpec = {
      endpointMapping: {
        [`${options.rest.basePath}/openapi.json`]: {
          version: "3.0.0",
          format: "json",
        },
      },
    };

    super(options);

    // Set up the custom sequence
    this.sequence(MySequence);

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

    // Set up default home page
    this.static("/", path.join(__dirname, "../public"));

    // Customize @loopback/rest-explorer configuration here
    this.configure(RestExplorerBindings.COMPONENT).to({
      path: "/explorer",
    });
    this.component(RestExplorerComponent);
    this.component(AuditServiceComponent);

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
