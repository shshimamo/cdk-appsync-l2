#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CdkAppsyncL2Stack } from '../lib/cdk-appsync-l2-stack';

const app = new cdk.App();
new CdkAppsyncL2Stack(app, 'CdkAppsyncL2Stack', {
    
});