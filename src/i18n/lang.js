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
 * Idiomas conocidos
 * @const
 * @private
 * @ignore
 */
const lang_avaiable = ['en', 'es'];

/**
 * Return default language from navigator settings, if not valid returns english (en).
 *
 * @function
 * @returns {string}
 */
function get_default_language() {

    // https://tools.ietf.org/html/rfc5646
    let get_first_browser_language = function () {
        let nav = window.navigator,
            browserLanguagePropertyKeys = ['language', 'browserLanguage', 'systemLanguage', 'userLanguage'],
            i,
            language;
        if (Array.isArray(nav.languages)) {
            for (i = 0; i < nav.languages.length; i += 1) {
                language = nav.languages[i];
                if (language && language.length) {
                    return language;
                }
            }
        }
        for (i = 0; i < browserLanguagePropertyKeys.length; i += 1) {
            language = nav[browserLanguagePropertyKeys[i]];
            if (language && language.length) {
                return language;
            }
        }
        return null;
    };

    let $lang = get_first_browser_language();
    let $langk = $lang.split('-');
    if ($langk.length > 1) $lang = $langk[0];
    $lang = $lang.toString().toLowerCase();

    if (lang_avaiable.includes($lang)) return $lang;
    return 'en';

}

/**
 * Idioma de la aplicación
 * @type {string}
 * @global
 * @ignore
 */
let cfg_lang = get_default_language();

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