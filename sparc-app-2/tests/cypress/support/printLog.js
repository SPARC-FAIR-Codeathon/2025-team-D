const baseStyles = [
    {
        name: 'info',
        color: '#cbd5e1',
    },
    {
        name: 'success',
        color: '#10b981',
    },
    {
        name: 'warning',
        color: '#fbbf24',
    },
    {
        name: 'error',
        color: '#dc2626',
    },
]

/**
 *  Helper function to convert hex colors to rgb
 * @param {string} hex - hex color
 * @returns {string}
 *
 * @example
 * // returns "255 255 255"
 * hex2rgb("#ffffff")
 */
function hex2rgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)

    return `${r} ${g} ${b}`
}

baseStyles.forEach((style) => {
    createCustomLog(style.name, style.color)
})

/**
 * Create a custom log
 * @param {string} name - Name of the custom log
 * @param {string} baseColor - Base color of the custom log in hex format
 *
 * @example
 * // Create a custom log with name "misc" and base color "#9333ea"
 * createCustomLog("misc", "#9333ea")
 */
export function createCustomLog(name, baseColor) {
    if (!name || !baseColor) {
        throw new Error('Missing parameters')
    }

    const logStyle = document.createElement('style')

    logStyle.textContent = `
        .command.command-name-ptf-${name} span.command-method {
            margin-right: 0.5rem;
            min-width: 10px;
            border-radius: 0.125rem;
            border-width: 1px;
            padding-left: 0.375rem;
            padding-right: 0.375rem;
            padding-top: 0.125rem;
            padding-bottom: 0.125rem;
            text-transform: uppercase;

            border-color: rgb(${hex2rgb(baseColor)} / 1);
            background-color: rgb(${hex2rgb(baseColor)} / 0.2);
            color: rgb(${hex2rgb(baseColor)} / 1) !important;
        }

        .command.command-name-ptf-${name} span.command-message{
            color: rgb(${hex2rgb(baseColor)} / 1);
            font-weight: normal;
        }

        .command.command-name-ptf-${name} span.command-message strong,
        .command.command-name-ptf-${name} span.command-message em { 
            color: rgb(${hex2rgb(baseColor)} / 1);
        }
    `

    Cypress.$(window.top.document.head).append(logStyle)
}

/**
 * Print a message with a formatted style
 * @param {Object} log - The message to be printed.
 * @param {string} log.title - The title of the message.
 * @param {string} log.message - The content of the message.
 * @param {('info' | 'warning' | 'error' | 'success')} log.type - The type of the message.
 *
 * @example
 * // Print a message with a formatted style e.g. success
 * cy.print({ title: 'foo', message: 'bar', type: 'success' })
 */
function cyPrint({ title, message, type }) {
    Cypress.log({
        name: `ptf-${type}`,
        displayName: `${title}`,
        message,
    })
}

Cypress.Commands.add('print', cyPrint)