import {RemovalPolicy, Stack, StackProps} from 'aws-cdk-lib';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import {Protocol} from 'aws-cdk-lib/aws-ecs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as s3 from 'aws-cdk-lib/aws-s3';
import {Construct} from 'constructs';

export interface DBToSheetsStackProps extends StackProps {
  stage: 'dev' | 'demo' | 'prod' | string;
}

export class DBToSheetsStack extends Stack {

  private props: DBToSheetsStackProps;

  constructor(scope: Construct, id: string, props: DBToSheetsStackProps) {
    super(scope, id, props);
    this.props = props;

    this.createResourcesBucket();
    this.createDockerTaskDefinition();
    this.createLambdaLayers();
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

  createLambdaLayers() {
    new lambda.LayerVersion(this, 'ValidateLayer', {
      code: lambda.Code.fromAsset('resources/layers/validate'),
      compatibleRuntimes: [lambda.Runtime.NODEJS_14_X],
      removalPolicy: RemovalPolicy.DESTROY,
    });

    new lambda.LayerVersion(this, 'DatabaseLayer', {
      code: lambda.Code.fromAsset('resources/layers/database'),
      compatibleRuntimes: [lambda.Runtime.NODEJS_14_X],
      removalPolicy: RemovalPolicy.DESTROY,
    });
  }
}
