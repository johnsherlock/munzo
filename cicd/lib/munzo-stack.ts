import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda'
import * as iam from '@aws-cdk/aws-iam';
import * as path from 'path';

export class MunzoStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const lambdaPolicy = new iam.PolicyStatement({
      actions: [
          's3:*'],
      effect: iam.Effect.ALLOW,
      resources: ['*']
    })

    const munzoAPILambaRole = new iam.Role(this, 'munzoAPILambaRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
          iam.ManagedPolicy.fromAwsManagedPolicyName("service-role/AWSLambdaBasicExecutionRole")
      ]
    })

    munzoAPILambaRole.addToPolicy(lambdaPolicy);

    const puppeteerLayer = lambda.LayerVersion.fromLayerVersionArn(this, 'chrome-aws-lambda', 'arn:aws:lambda:eu-west-1:764866452798:layer:chrome-aws-lambda:19')

    const downloadTransactionsHandler = new lambda.Function(this, 'DownloadTransactionsHandler', {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromAsset('../munzo'),
      handler:  'src/lambda/TransactionDownloader.handler',
      role: munzoAPILambaRole,
      layers: [puppeteerLayer],
      memorySize: 2048,
      timeout: cdk.Duration.seconds(30),
      retryAttempts: 0
    });
  }
}
