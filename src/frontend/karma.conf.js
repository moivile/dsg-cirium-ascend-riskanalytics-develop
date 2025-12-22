// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
      require('@angular-devkit/build-angular/plugins/karma'),
      require('karma-teamcity-reporter')
    ],
    client: {
      clearContext: false // leave Jasmine Spec Runner output visible in browser
    },
    coverageReporter: {
      dir: require('path').join(__dirname, './coverage/riskanalytics'),
      reporters: [
        { type: 'html' },
        { type: 'lcovonly' },
        { type: 'text-summary' },
        { type: 'teamcity' },
      ],
      fixWebpackSourcePaths: true
    },
    reporters: ['progress', 'kjhtml', 'teamcity'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['chrome_no_sandbox'],
    customLaunchers: {
      chrome_no_sandbox: {
        base: 'ChromeHeadless',
        flags: [
          '--no-sandbox',
          '--disable-dev-shm-usage',
          '--disable-setuid-sandbox',
          '--disable-gpu',
        ],
      },
    },
    singleRun: true
  });
};
