#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { MunzoStack } from '../lib/munzo-stack';

const app = new cdk.App();
new MunzoStack(app, 'MunzoStack');
