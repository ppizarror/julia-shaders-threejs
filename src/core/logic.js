/**
 LOGIC
 Operadores lógicos generales utilizados por la aplicación.

 @author Pablo Pizarro R. @ppizarror.com
 @license MIT
 */
"use strict";

/**
 * Retorna verdadero si el objeto es nulo o indefinido.
 *
 * @function
 * @param {object} obj - Objeto a comprobar
 * @returns {boolean} - Indica si el objeto es nulo o indefinido
 * @since 0.0.1
 */
function isNullUndf(obj) {
    return obj === null || obj === undefined;
}

/**
 * Retorna verdadero si el objeto no es nulo e indefinido.
 *
 * @function
 * @param {object} obj - Objeto a comprobar
 * @returns {boolean} - Booleano de comprobación
 * @since 0.0.1
 */
function notNullUndf(obj) {
    return obj !== null && obj !== undefined;
}

/**
 * Retorna true/false si el objeto es un string.
 *
 * @function
 * @param {object} s - Objeto a verificar
 * @returns {boolean}
 * @since 0.0.1
 */
function isString(s) {
    return typeof s === 'string' || s instanceof String;
}

/**
 * Retorna true/false si el objeto es una función.
 *
 * @function
 * @param {object} s - Objeto a verificar
 * @returns {boolean}
 * @since 0.1.5
 */
function isFunction(s) {
    return typeof s === 'function' || s instanceof Function;
}