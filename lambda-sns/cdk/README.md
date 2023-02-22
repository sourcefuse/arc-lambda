# CDK Module

We can use the Cloud Development Kit for Terraform (CDKTF) to define advanced deployment configurations.

CDKTF stacks let us manage multiple Terraform configurations in the same CDKTF application. They can save us from writing repetitive CDKTF code, while allowing us to independently manage the resources in each stack. we can also use the outputs of one stack as inputs for another.

## Getting Started

1. Create a dot env file:

```shell
touch .env
```

3. Configure the following keys in the `.env` file:

- **AWS_REGION**: _aws_region_
- **AWS_ACCESS_KEY_ID**: _aws_access_key_
- **AWS_SECRET_ACCESS_KEY**: _aws_secret_key_
- **AWS_ROLE_ARN**: _role_arn_
- **AWS_PROFILE**: _aws_profile_
- **SUBNET_IDS**: _subnet ids eg ["subnet-012", "subnet-123"]_
- **SECURITY_GROUPS**: _security group ids eg ["sg-123"]_
- **NAMESPACE**
- **ENV**

Note: if You want to use _ **AWS_ACCESS_KEY_ID** and _ **AWS_SECRET_ACCESS_KEY** then keep

- **AWS_PROFILE** as blank.

3. Run _npm install_ to install the dependency packages for cdktf. Now you are ready to go with cdktf commands.

## How to Run

This module gives us several commands for the aws lambda function.

- Download all required providers and modules.
  ```shell
  cdktf get
  ```
- List all the stacks defined in your CDKTF application.

  ```shell
  cdktf list
  ```

- To deploy lambda on aws and remember to confirm the deploy with a yes._(Make sure to run npm run build:layers in root folder to create required lambda layers)_

  ```shell
  cdktf deploy
  ```

- To destroy the Infrastructure that you deployed on aws.
  ```shell
  cdktf destroy
  ```
