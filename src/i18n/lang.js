/**
 LANG
 Maneja las entradas de texto de la aplicación.

 @author Pablo Pizarro R. @ppizarror.com
 @license MIT
 */

/**
 * ----------------------------------------------------------------------------
 * Sección configurable idiomas
 * ----------------------------------------------------------------------------
 */

/**
 * Idioma de la aplicación
 * @type {string}
 * @global
 * @ignore
 */
let cfg_lang = 'es';

/**
 * Idiomas conocidos
 * @const
 * @private
 * @ignore
 */
const lang_avaiable = ['es'];


/**
 * ----------------------------------------------------------------------------
 * Variables y funciones no configurables
 * ----------------------------------------------------------------------------
 */

/**
 * Puntero a idioma cargado en {@link lang_db}
 * @var
 * @global
 */
let lang;

/**
 * Base de datos de idiomas
 * @var
 * @global
 */
let lang_db = {};

/**
 * Función que chequea las cookies de los idiomas
 */
$(function () {

    /**
     * Si no existe la cookie se crea
     */
    let $langvalue = Cookies.get('lang');
    if ($langvalue === undefined) {
        Cookies.set('lang', cfg_lang);
        $langvalue = cfg_lang;
    }

    /**
     * Si el valor del idioma existe se actualiza
     */
    if (lang_avaiable.indexOf($langvalue) !== -1) {
        cfg_lang = $langvalue;
    } else {
        Cookies.set('lang', cfg_lang);
    }

});