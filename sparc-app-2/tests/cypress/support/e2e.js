// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'
import './printLog'

if (Cypress.config('isInteractive')) {
    const logTypes = ['fetch', 'xhr'];
    const originalLog = Cypress.log;
    Cypress.log = function (opts, ...other) {
        if (logTypes.includes(opts.displayName)) {
            return;
        }
        return originalLog(opts, ...other);
    };
}
// Alternatively you can use CommonJS syntax:
// require('./commands')

import { addCompareSnapshotCommand } from 'cypress-visual-regression/dist/command';

addCompareSnapshotCommand({
    capture: 'fullPage', // cypress screenshot option
    errorThreshold: 0.5, // plugin threshold option
    pixelmatchOptions: {
        threshold: 0 // pixelmatch threshold option
    }
})