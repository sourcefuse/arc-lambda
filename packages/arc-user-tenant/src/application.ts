import {BootMixin} from '@loopback/boot';
import {ApplicationConfig} from '@loopback/core';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {
  RestExplorerBindings,
  RestExplorerComponent,
} from '@loopback/rest-explorer';
import {ServiceMixin} from '@loopback/service-proxy';
import {AuthenticationServiceComponent} from '@sourceloop/authentication-service';
import {CoreConfig, LocaleKey, SFCoreBindings} from '@sourceloop/core';
import {UserTenantServiceComponent} from '@sourceloop/user-tenant-service';
import * as dotenv from 'dotenv';
import * as dotenvExt from 'dotenv-extended';
import * as path from 'path';
import {MySequence} from './sequence';

export {ApplicationConfig};

export class UserTenantApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  localeObj: i18nAPI = {} as i18nAPI;

  constructor(options: ApplicationConfig = {}) {
    dotenv.config();
    if (process?.env?.NODE_ENV && process.env.NODE_ENV !== 'test') {
      dotenvExt.load({
        schema: '.env.example',
        errorOnMissing: true,
        includeProcessEnv: true,
      });
    } else {
      dotenvExt.load({
        schema: '.env.example',
        errorOnMissing: false,
        includeProcessEnv: true,
      });
    }
    super(options);

    // Set up the custom sequence
    this.sequence(MySequence);

    const configObject: CoreConfig['configObject'] = {
      locales: [
        LocaleKey.en,
        LocaleKey.es,
        LocaleKey.ptBr,
        LocaleKey.ptPt,
        LocaleKey.esCo,
      ],
      fallbacks: {
        [LocaleKey.es]: 'en',
        [LocaleKey.esCo]: 'en',
        [LocaleKey.ptBr]: 'en',
        [LocaleKey.ptPt]: 'en',
      },
      register: this.localeObj,
      directoryPermissions: '777',
      directory: `/tmp`,
      objectNotation: true,
    };

    this.bind(SFCoreBindings.config).to({configObject});

    // Set up default home page
    this.static('/', path.join(__dirname, '../public'));

    // Customize @loopback/rest-explorer configuration here
    this.configure(RestExplorerBindings.COMPONENT).to({
      path: '/explorer',
    });
    this.component(RestExplorerComponent);

    this.component(AuthenticationServiceComponent);
    this.component(UserTenantServiceComponent);

    this.projectRoot = __dirname;
    // Customize @loopback/boot Booter Conventions here
    this.bootOptions = {
      controllers: {
        // Customize ControllerBooter Conventions here
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
    };
  }
}
