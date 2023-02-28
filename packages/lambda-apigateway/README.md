# Lambda-Apigateway

Lambda example with API gateway trigger

## Install dependencies

```sh
npm install
```

## Fix code style and formatting issues

```sh
npm run lint
```

To automatically fix such issues:

```sh
npm run lint:fix
```

# Service deployment in lambda

## <a id="build_step"></a> Build Step

Compile and build the Typescript Lambda code. Navigate to the root of the repo to run the following commands.

1. Create build:
   ```shell
   npm run build
   ```
2. create lambda layers build:
   ```shell
   npm run build:layers
   ```

## Terraform to deploy your Lambda

Once you have completed the steps in [Build Step](#build_step), You can deploy your infrastructure in /cdk folder , checkout the [README.md](https://github.com/sourcefuse/arc-lambda/blob/main/lambda-apigateway/cdk/README.md)
