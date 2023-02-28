# authentication-service

This application is generated using [LoopBack 4 CLI](https://loopback.io/doc/en/lb4/Command-line-interface.html) with the
[initial project layout](https://loopback.io/doc/en/lb4/Loopback-application-layout.html).

## Install dependencies

By default, dependencies were installed when this application was generated.
Whenever dependencies in `package.json` are changed, run the following command:

```sh
npm install
```

To only install resolved dependencies in `package-lock.json`:

```sh
npm ci
```

## Run the application

```sh
npm start
```

You can also run `node .` to skip the build step.

Open http://127.0.0.1:3000 in your browser.

## Rebuild the project

To incrementally build the project:

```sh
npm run build
```

To force a full build by cleaning up cached artifacts:

```sh
npm run rebuild
```

## Fix code style and formatting issues

```sh
npm run lint
```

To automatically fix such issues:

```sh
npm run lint:fix
```

## Other useful commands

- `npm run migrate`: Migrate database schemas for models
- `npm run openapi-spec`: Generate OpenAPI spec into a file

## Tests

```sh
npm test
```

## Installation

1. Create a postgres database _(checkout [README.md](https://github.com/sourcefuse/arc-lambda/blob/main/dependencies/db/README.md))_
2. Provide Redis and Postgres envs
3. Provide JWT secret and issuer

## Environment

- `DB_HOST`: Postgres Database host
- `DB_PORT`: Postgres port
- `DB_USER`: Postgres user
- `DB_PASSWORD`: Postgres password
- `DB_DATABASE`: Postgres database
- `DB_SCHEMA`: Postgres auth
- `REDIS_HOST`: Redis host
- `REDIS_PORT`: Redis port
- `REDIS_URL`: Redis connection string
- `REDIS_PASSWORD`: Redis password if set
- `REDIS_DATABASE`: Redis database if set
- `JWT_SECRET`: For JWT token
- `JWT_ISSUER`: For JWT token
- `AZURE_AUTH_ENABLED`: keep it `true`
- `AZURE_IDENTITY_METADATA`: this will be standard url `https://login.microsoftonline.com/common/.well-known/openid-configuration`
- `AZURE_AUTH_CLIENT_ID`: this is client id of application created on azure
- `AZURE_AUTH_CLIENT_SECRET`: this is secret of same client id
- `AZURE_AUTH_REDIRECT_URL`: this will be authentication service url like `http://{{AUTHENTICATION_SERVICE_URL}}/auth/azure-oauth-redirect`
- `AZURE_AUTH_ALLOW_HTTP_REDIRECT`: keep it `true`
- `AZURE_AUTH_COOKIE_INSTEAD_SESSION`: keep it `true`
- `AZURE_AUTH_PASS_REQ_CALLBACK`: keep it blank
- `AZURE_AUTH_VALIDATE_ISSUER`: keep it blank
- `AZURE_AUTH_COOKIE_KEY`: 32 bit string key for encryption
- `AZURE_AUTH_COOKIE_IV`: 12 bit string key for encryption
-

## What's next

Please check out [LoopBack 4 documentation](https://loopback.io/doc/en/lb4/) to
understand how you can continue to add features to this application.

[![LoopBack](<https://github.com/loopbackio/loopback-next/raw/master/docs/site/imgs/branding/Powered-by-LoopBack-Badge-(blue)-@2x.png>)](http://loopback.io/)

# Service deployment in lambda

## <a id="build_step"></a> Build Step

Compile and build the Typescript Lambda code. Navigate to the root of the repo to run the following commands.

1. Create loopback build:
   ```shell
   npm run build
   ```
2. create lambda layers build:
   ```shell
   npm run build:layers
   ```
3. create migrations lambda build:
   ```shell
   npm run build:migrations
   ```

## Terraform to deploy your Lambda

Once you have completed the steps in [Build Step](#build_step), You can deploy your infrastructure.

- For Postgres DB deployement checkout [README.md](https://github.com/sourcefuse/arc-lambda/blob/main/dependencies/db/README.md)
- For code and migration deployment checkout [README.md](https://github.com/sourcefuse/arc-lambda/blob/main/arc-auth/cdk/README.md)
