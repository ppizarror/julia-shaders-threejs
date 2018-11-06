/**
 DOM
 Funciones asociadas a la administración de los objetos en el DOM de la aplicación, funciones de caracter general.

 @author Pablo Pizarro R. @ppizarror.com
 @license MIT
 */
"use strict";

// noinspection JSCheckFunctionSignatures
/**
 * Obtiene los distintos objetos de la aplicación relacionados con el DOM
 * @global
 * @since 0.1.1
 */
let app_dom = {
    body: null,
    document: $(document),
    head: null,
    html: null,
    window: $(window),
};

$(function () {
    app_dom.body = $('body');
    app_dom.head = $('head');
    app_dom.html = $('html');
});

/**
 * Retorna la altura en px del elemento en el DOM.
 *
 * @function
 * @param {Object} elem - Elemento jQuery
 * @returns {number} - Altura
 * @since 0.1.1
 */
function getElementHeight(elem) {
    try {
        // noinspection JSValidateTypes
        return elem.outerHeight();
    } catch (e) {
        return -1;
    } finally {
    }
}

/**
 * Retorna el ancho en px del elemento en el DOM.
 *
 * @function
 * @param {Object} elem - Elemento jQuery
 * @returns {number} - Ancho
 * @since 0.1.1
 */
function getElementWidth(elem) {
    try {
        // noinspection JSValidateTypes
        return elem.outerWidth();
    } catch (e) {
        return -1;
    } finally {
    }
}

/**
 * Desactiva el scroll.
 *
 * @function
 * @param {object} e - Evento scrollwheel
 */
function stopWheelEvent(e) {

    /**
     * IE7, IE8, Chrome, Safari
     */
    if (!e) e = window.event;

    /**
     * Chrome, Safari, Firefox
     */
    if (e.preventDefault) e.preventDefault();

    /**
     * IE7, IE8
     */
    e.returnValue = false;

}