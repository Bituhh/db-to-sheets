#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import {DockerStack} from '../lib/docker.stack';

const app = new cdk.App();
new DockerStack(app, 'DockerStack', {stage: process.env.stage ?? 'dev'});

