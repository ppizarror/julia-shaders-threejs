/**
 HASH
 Funciones de hashing.

 @author Pablo Pizarro R. @ppizarror.com
 @license MIT
 */
"use strict";

/**
 * Genera un string aleatorio.
 *
 * @function
 * @returns {string} - String aleatorio
 * @since 0.1.0
 */
function generateID() {
    /* eslint no-bitwise:"off" */
    /* eslint no-extra-parens:"off" */
    /* eslint no-mixed-operators:"off" */
    /* eslint no-use-before-define:"off" */
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        let r = Math.random() * 16 | 0;
        let v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}