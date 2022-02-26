import {RemovalPolicy, Stack, StackProps} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import * as kms from 'aws-cdk-lib/aws-kms';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as rds from 'aws-cdk-lib/aws-rds';

export interface DockerStackProps extends StackProps {
  stage: 'testing' | 'dev' | 'demo' | 'prod' | string;
}

export class DockerStack extends Stack {

  private props: DockerStackProps;

  constructor(scope: Construct, id: string, props: DockerStackProps) {
    super(scope, id, props);
    this.props = props;

    this.generateRandomAmountOfDBSecretForTesting();

    // const cluster = new ecs.Cluster(this, 'Cluster');
    // const taskDefinition = new ecs.FargateTaskDefinition(this, 'FargateTaskDefinition');
    // taskDefinition.addContainer('Container', {
    //   image: ecs.ContainerImage.fromAsset('resources/docker'),
    // });
  }

  generateRandomAmountOfDBSecretForTesting() {
    const encryptionKey = new kms.Key(this, 'SecretsManagerKey');
    // Maximum of 3 secrets.
    const amountOfSecrets = Math.ceil(Math.random() * 3);
    for (let i = 0; i < amountOfSecrets; i++) {
      const engine = Math.random() > 0.5 ? 'postgres' : 'mysql';
      new secretsmanager.Secret(this, `TestingSecret${i + 1}`, {
        encryptionKey,
        secretName: `/db-to-sheets/${this.props.stage}/testing-secret-${i + 1}`,
        secretStringBeta1: secretsmanager.SecretStringValueBeta1.fromUnsafePlaintext(JSON.stringify({
          username: 'testing-user',
          engine,
          host: `${engine}.testing.com`,
          port: engine === 'postgres' ? 5432 : 3306,
          dbname: `${engine}_database`,
          password: 'Pa55w0rd',
        })),
        removalPolicy: RemovalPolicy.DESTROY,
      });
    }
  }
}
