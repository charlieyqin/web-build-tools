// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.

import {
  CopyTask,
  copyStaticAssets,
  task,
  watch,
  serial,
  parallel,
  IExecutable,
  setConfig,
  IBuildConfig
} from '@microsoft/gulp-core-build';
import { typescript, tslint, apiExtractor } from '@microsoft/gulp-core-build-typescript';
import { instrument, mocha } from '@microsoft/gulp-core-build-mocha';

export * from '@microsoft/gulp-core-build';
export * from '@microsoft/gulp-core-build-typescript';
export * from '@microsoft/gulp-core-build-mocha';

// pre copy and post copy allows you to specify a map of dest: [sources] to copy from one place to another.
export const preCopy: CopyTask = new CopyTask();
preCopy.name = 'pre-copy';

export const postCopy: CopyTask = new CopyTask();
postCopy.name = 'post-copy';

const PRODUCTION = process.argv.indexOf('--production') !== -1 || process.argv.indexOf('--ship') !== -1;
setConfig({
  production: PRODUCTION,
  shouldWarningsFailBuild: PRODUCTION
});

tslint.mergeConfig({
  displayAsWarning: true
});

const buildSubtask: IExecutable = serial(preCopy, parallel(tslint, typescript, copyStaticAssets), apiExtractor, postCopy);
export const buildTasks: IExecutable = task('build', buildSubtask);
export const testTasks: IExecutable = task('test', serial(buildSubtask, mocha));
export const defaultTasks: IExecutable = task('default', serial(buildSubtask, instrument, mocha));

task('watch', watch('src/**.ts', testTasks));
