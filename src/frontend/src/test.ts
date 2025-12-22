// This file is required by karma.conf.js and loads recursively all the .spec and framework files

import 'zone.js/testing';
import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';

declare const require: {
  context(path: string, deep?: boolean, filter?: RegExp): {
    keys(): string[];
    <T>(id: string): T;
  };
};

// This is here to make tests fail when you get errors such as:
// Can't bind to 'fleetCanNotViewComponent' since it isn't a known property of 'div'
// GitHub issue: https://github.com/angular/angular/issues/36430
console.error = (message?: any, ...optionalParams: any[]): void => {
  const params = optionalParams ? `\nParams: ${optionalParams}` : '';
  fail(`Test contained console error:\n${message}${params}`);
};

// This is here to make tests fail when you get any warnings such as:
// TypeError: You provided 'undefined' where a stream was expected.
console.warn = (message?: any, ...optionalParams: any[]): void => {
  const params = optionalParams ? `\nParams: ${optionalParams}` : '';
  fail(`Test contained console warning:\n${message}${params}`);
};

// First, initialize the Angular testing environment.
getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting(), {
    teardown: { destroyAfterEach: false }
}
);
// Then we find all the tests.
const context = require.context('./', true, /\.spec\.ts$/);
// And load the modules.
context.keys().forEach(context);
