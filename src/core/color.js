/**
 COLOR
 Funciones utilitarias asociadas a la creación y manejo de colores.

 @author Pablo Pizarro R. @ppizarror.com
 @license MIT
 */
"use strict";

/**
 * Retorna true/false si el string es un color.
 *
 * @function
 * @param {object} color - Color
 * @returns boolean - String es un color
 * @since 0.1.3
 */
function isColor(color) {
    return typeof color === 'string' && color.length === 7 && color[0] === '#';
}