# ARC Lambda

This repo manages examples using [lerna-nx](https://lerna.js.org/docs/getting-started) to create ARC backend services and nodejs functions which can be deployed on AWS lambda functions using cdktf and [sourceloop-cdktf](https://www.npmjs.com/package/sourceloop-cdktf)

## <a id="prereqs"></a> Pre-Requisites

- [node.js](https://nodejs.dev/download/)
- [npm](https://docs.npmjs.com/cli/v6/commands/npm-install)
- use [VS code](https://code.visualstudio.com/) for best development experience
- [Terraform](https://www.terraform.io/)
- [cdktf-cli](https://www.npmjs.com/package/cdktf-cli)

## How to use

- Clone the [github repo](https://github.com/sourcefuse/arc-lambda)
- cd into the folder and run `npm i` to install node_modules.
- Run 'npx lerna bootstrap` to install dependencies in workspace folders
- packages/\* contains all the ARC backend services supported by cdktf in AWS lambda.
- To run any service locally update reqd values in .env file (more info env variables in the service readme.md)
- To deploy service on AWS lambda :
  - Run `npm run build:all` to build the lambda layers, code build and migrations for the service
  - cd into cdk folder inside the service and update the .env file
  - Run `npm run deploy`

Checkout out README files inside each example to know more.

## Use Lerna

To generate build for all packages

```
npx lerna run build:all
```

To deploy build single package

```
npx lerna run build:all --scope="service-name"
```

## List of supported services

- arc-audit
- arc-auth
- arc-bpmn
- arc-feature-toggle
- arc-in-mail
- arc-payment
- arc-scheduler
- arc-search
- arc-user-tenant
