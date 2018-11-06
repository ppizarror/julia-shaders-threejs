/**
 DATE
 Colección de funciones asociadas al manejos de fechas.

 @author Pablo Pizarro R. @ppizarror.com
 @license MIT
 */
"use strict";

/**
 * Retorna los segundos entre dos fechas.
 *
 * @function
 * @param {Date} finish - Fecha final
 * @param {Date} init - Fecha inicial
 * @returns {number} - Número de segundos
 * @since 0.0.1
 */
function getSecondsBetween(finish, init) {
    return (finish.getTime() - init.getTime()) / 1000;
}

/**
 * Retorna los segundos desde una fecha.
 * @function
 * @param {Date} time - Fecha inicial
 * @returns {number} - Número de segundos
 * @since 0.0.1
 */
function getSecondsFrom(time) {
    return getSecondsBetween(new Date(), time);
}

/**
 * Formatea una fecha con un formato específico.
 *
 * @function
 * @param {Date} date - Fecha
 * @param {string} format - Formato
 * @returns {string} - Fecha formateada
 * @since 0.0.1
 */
function dateFormat(date, format) {
    let $datestring = date.toString();
    let $splitted = $datestring.split(' ');
    let $newstrdate = '';
    for (let i = 0; i < Math.min(6, $splitted.length); i += 1) {
        $newstrdate += $splitted[i] + ' ';
    }
    // noinspection JSUnresolvedVariable
    return $.format.date($newstrdate, format);
}