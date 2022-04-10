import * as cdk from 'aws-cdk-lib';
import {Template} from 'aws-cdk-lib/assertions';
import {DBToSheetsStack} from '../lib/db-to-sheets-stack';

describe('DB To Sheets Stack', () => {
  let template: cdk.assertions.Template;

  beforeEach(() => {
    const app = new cdk.App();
    const stack = new DBToSheetsStack(app, 'DockerStack', {stage: 'testing'});
    template = Template.fromStack(stack);
  });

  it('should have template', () => {
    expect(template).toBeTruthy();
  });

  it('should have secrets to use for testing', () => {
    const secretsResources = template.findResources('AWS::SecretsManager::Secret');
    const secretsResourcesKeys = Object.keys(secretsResources);
    expect(secretsResourcesKeys.length).toBeGreaterThan(0);
    expect(secretsResourcesKeys.length).toBeLessThanOrEqual(3);
  });

  it('should have s3 resource', () => {
    template.hasResource('AWS::S3::Bucket', {});
  });

  it('should have ECS Cluster resource', () => {
    template.hasResource('AWS::ECS::Cluster', {});
  });

  describe('ECS TaskDefinition', () => {
    const ecsTaskDefinitionType = 'AWS::ECS::TaskDefinition';
    it('should exist', () => {
      template.hasResource(ecsTaskDefinitionType, {});
    });

    it('should have properties', () => {
      template.hasResourceProperties(ecsTaskDefinitionType, {
        RequiresCompatibilities: ['FARGATE'],
        ContainerDefinitions: [{}],
      });
    });
  });
});
