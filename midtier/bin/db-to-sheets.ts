#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import {DBToSheetsStack} from '../lib/db-to-sheets-stack';
const stage = process.env.stage ?? 'dev';

const app = new cdk.App();
new DBToSheetsStack(app, 'DBToSheetsStack', {stage});

