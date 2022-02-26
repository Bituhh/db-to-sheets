import * as cdk from 'aws-cdk-lib';
import {Template} from 'aws-cdk-lib/assertions';
import {DockerStack} from '../lib/docker.stack';

describe('Docker Stack', () => {
  let template: cdk.assertions.Template;

  beforeEach(() => {
    const app = new cdk.App();
    const stack = new DockerStack(app, 'DockerStack', {stage: 'testing'});
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

  // it('should have ECS Cluster resource', () => {
  //   template.hasResource('AWS::ECS::Cluster', {});
  // });
  //
  // describe('ECS TaskDefinition', () => {
  //   const ecsTaskDefinitionType = 'AWS::ECS::TaskDefinition';
  //   it('should exist', () => {
  //     template.hasResource(ecsTaskDefinitionType, {});
  //   });
  //
  //   it('should have properties', () => {
  //     template.hasResourceProperties('AWS::ECS::TaskDefinition', {
  //       RequiresCompatibilities: ['FARGATE'],
  //       ContainerDefinitions: [{}],
  //     });
  //   });
  // });
});
