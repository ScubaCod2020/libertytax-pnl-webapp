module.exports = function (config) {
  config.set({
    browsers: ['ChromeHeadless'],
    singleRun: true,
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    reporters: ['progress', 'coverage'],
    coverageReporter: {
      type: 'text-summary',
      dir: require('path').join(__dirname, './coverage'),
      check: {
        global: { statements: 60, branches: 45, functions: 60, lines: 60 },
      },
    },
  });
};
