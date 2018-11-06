/**
 MATH
 Funciones utilitarias matemáticas.

 @author Pablo Pizarro R. @ppizarror.com
 @license MIT
 */
"use strict";

/**
 * Redondea un número.
 *
 * @function
 * @param {number} num - Número
 * @param {number} scale - Cantidad de decimales
 * @returns {number} - Número redondeado
 * @since 0.1.3
 */
function roundNumber(num, scale) {
    /* eslint no-implicit-coercion:"off" */

    if (!('' + num).includes('e')) {
        // noinspection JSCheckFunctionSignatures
        return +Number(Math.round(num + 'e+' + scale) + 'e-' + scale);
    }
    let arr = ('' + num).split('e');
    let sig = '';
    if (+arr[1] + scale > 0) {
        sig = '+';
    }
    let i = +arr[0] + 'e' + sig + (+arr[1] + scale);
    // noinspection JSCheckFunctionSignatures
    return +(Math.round(i) + 'e-' + scale);

}