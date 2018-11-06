/**
 SESSION
 Funciones generales para el tratamiento de la sesión del usuario.

 @author Pablo Pizarro R. @ppizarror.com
 @license MIT
 */
"use strict";

/**
 * Guarda el estado de la sesión.
 *
 * @function
 * @returns {boolean} - Indica el estado de la consulta
 * @since 0.0.1
 */
function updateSessionCookie() {
    try {
        if (!cfg_cookie_local) {
            Cookies.set(cfg_cookie_session_id, sessionCookie, {
                expires: cfg_cookie_expire_days,
            });
        } else {
            localStorage.setItem(cfg_cookie_session_id, JSON.stringify(sessionCookie));
        }
        return true;
    } catch ($e) {
    } finally {
    }
    return false;
}

/**
 * Función que extiende los valores por defecto de las cookies de sesión.
 *
 * @function
 * @param {object} $session - Valor de sesión
 * @since 0.0.1
 */
function extendDefaultSessionValues($session) {
    $.extend($session, {

        /**
         * Valores del visualizador
         */
        lastshader: null

    });
}

/**
 * Carga las cookies de la sesión.
 *
 * @function
 * @returns {object} - Cookie de la sesión
 * @since 0.0.1
 */
function loadSessionCookies() {

    /**
     * Carga las cookies
     */
    let c = Cookies.get(cfg_cookie_session_id);
    if (!notNullUndf(c)) {

        let defvalue = {};
        extendDefaultSessionValues(defvalue);

        /**
         * Si las cookies son locales se guardan en localStorage
         */
        if (cfg_cookie_local) {
            app_console.info(lang.cookie_disabled);

            // Se obtiene las cookies desde la localStorage
            try {
                c = localStorage.getItem(cfg_cookie_session_id);
            } catch (e) {
                // Si las cookies de terceros están desactivadas se retorna nulo
                return null;
            } finally {
            }

            if (!notNullUndf(c)) {
                localStorage.setItem(cfg_cookie_session_id, JSON.stringify(defvalue));
                c = localStorage.getItem(cfg_cookie_session_id);
            }
            c = JSON.parse(c);
            return c;
        }

        /**
         * Si las cookies no son locales se carga la cookie guardada para verificar errores
         */
        Cookies.set(cfg_cookie_session_id, defvalue, {
            expires: cfg_cookie_expire_days,
            path: '/',
        });
        c = Cookies.get(cfg_cookie_session_id);

        /**
         * No se pueden almacenar cookies en el navegador
         */
        if (!notNullUndf(c)) {
            return null;
        }

        /**
         * Retorna las cookies
         */
        try {
            return JSON.parse(c);
        } catch (e) {
            return defvalue;
        } finally {
        }
    }

    /**
     * Fallback, retorna cookies cargadas
     */
    return JSON.parse(c);

}

/**
 * Retorna la cookie de sesión.
 *
 * @function
 * @returns {object}
 * @since 0.0.1
 */
function getSessionCookie() {
    return loadSessionCookies();
}