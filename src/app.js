/**
 APP
 Inicia la aplicación.

 @author Pablo Pizarro R. @ppizarror.com
 @license MIT
 */
"use strict";

$(function () {

    /**
     * ------------------------------------------------------------------------
     * Muestra el acerca de en consola
     * ------------------------------------------------------------------------
     */
    app_console.aboutInfo();

    /**
     * ------------------------------------------------------------------------
     * Carga las configuraciones
     * ------------------------------------------------------------------------
     */
    lang = lang_db[cfg_lang]; // Se carga el idioma


    /**
     * ------------------------------------------------------------------------
     * Carga las cookies
     * ------------------------------------------------------------------------
     */
    sessionCookie = getSessionCookie();
    if (isNullUndf(sessionCookie)) { // Si no se pueden guardar cookies se termina la carga de la página
        app_console.error(lang.error_cookie_load);
        return;
    }
    updateSessionCookie();

    /**
     * ------------------------------------------------------------------------
     * Inicia el visualizador
     * ------------------------------------------------------------------------
     */
    loadingHandler(true); // Inicia panel de carga
    let ui = new BuildUI();
    ui.init('#viewer-left-panel', '#viewer-right-panel');

});