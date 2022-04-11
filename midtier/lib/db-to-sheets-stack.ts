import {RemovalPolicy, Stack, StackProps} from 'aws-cdk-lib';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import {Protocol} from 'aws-cdk-lib/aws-ecs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import {Construct} from 'constructs';

export interface DBToSheetsStackProps extends StackProps {
  stage: 'dev' | 'demo' | 'prod' | string;
}

export class DBToSheetsStack extends Stack {

  private props: DBToSheetsStackProps;
  private helperLayer: lambda.LayerVersion;

  constructor(scope: Construct, id: string, props: DBToSheetsStackProps) {
    super(scope, id, props);
    this.props = props;

    this.createResourcesBucket();
    this.createDockerTaskDefinition();
    this.createLambdaLayer();
    this.createLambda();
  }

  createResourcesBucket() {
    new s3.Bucket(this, 'S3Bucket', {
      bucketName: 'db-to-sheets-resources',
      removalPolicy: RemovalPolicy.DESTROY,
    });
  }

  createDockerTaskDefinition() {
    const taskDefinition = new ecs.FargateTaskDefinition(this, 'TaskDefinition');
    const container = taskDefinition.addContainer('DockerContainer', {
      image: ecs.ContainerImage.fromAsset('resources/docker'),
      logging: ecs.LogDrivers.awsLogs({
        streamPrefix: 'db-to-sheets-container',
      }),
    });
    container.addPortMappings({
      containerPort: 5432,
      hostPort: 5432,
      protocol: Protocol.TCP,
    });
  }

  createLambdaLayer() {
    this.helperLayer = new lambda.LayerVersion(this, 'HelpersLayer', {
      code: lambda.Code.fromAsset('resources/layers/helpers'),
      compatibleRuntimes: [lambda.Runtime.NODEJS_14_X],
      removalPolicy: RemovalPolicy.DESTROY,
    });
  }

  createLambda() {
    new lambda.Function(this, 'Lambda', {
      handler: 'index.handler',
      code: lambda.Code.fromAsset('resources/lambdas/report'),
      runtime: lambda.Runtime.NODEJS_14_X,
      layers: [this.helperLayer],
    });
  }
}
