# @catsjs/core

The core module pulls in mocha, mochawesome, chai and @catsjs/report.

It wraps mochawesome to support custom html reports.

It creates a custom mocha interface to support an options object as parameter to `describe` instead of just the title.

It provides an `init` function to specs that loads `.catsrc.js` and initializes and returns the defined plugins.
