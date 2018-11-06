/**
 GLOBALCONFIG
 Configuraciones globales del software.

 @author Pablo Pizarro R. @ppizarror.com
 @license MIT
 */

/**
 * ----------------------------------------------------------------------------
 * Configuraciones de conexión con el servidor
 * ----------------------------------------------------------------------------
 */

/**
 * Activa comunicación CORS (Cross-domain)
 * @type {boolean}
 * @const
 * @global
 * @ignore
 */
const cfg_ajax_cors = false;

/**
 * Milisegundos para cancelar la conexión en caso de no comunicación
 * @type {number}
 * @global
 * @ignore
 */
const cfg_href_ajax_timeout = 45000;


/**
 * ----------------------------------------------------------------------------
 * Configuraciones de comportamiento
 * ----------------------------------------------------------------------------
 */

/**
 * Días antes que las cookies expiren
 * @type {number}
 * @const
 * @global
 * @ignore
 */
const cfg_cookie_expire_days = 14;

/**
 * Indica si las cookies se guardan de forma local
 * @type {boolean}
 * @const
 * @global
 * @ignore
 */
const cfg_cookie_local = true;

/**
 * ID de las cookies
 * @type {string}
 * @const
 * @global
 * @ignore
 */
const cfg_cookie_session_id = 'Rx3RTyAZyk';

/**
 * Activa el log en consola
 * @type {boolean}
 * @const
 * @global
 * @ignore
 */
const cfg_verbose = true;


/**
 * ----------------------------------------------------------------------------
 * Configuraciones de interfaz
 * ----------------------------------------------------------------------------
 */

/**
 * Número de mensajes en consola antes de borrar y resetear
 * @type {int}
 * @const
 * @global
 * @ignore
 */
const cfg_total_console_messages_until_wipe = 1000;

/**
 * Tiempo máximo de una capa de carga, pasado ese tiempo se oculta y lanza notificación de error
 * @type {number}
 * @const
 * @global
 * @ignore
 */
const cfg_max_time_loading_layer = 60;

/**
 * Tiempo en milisegundos que debe esperar la capa de carga para mostrarse
 * @type {number}
 * @const
 * @global
 * @ignore
 */
const cfg_init_loading_layer_after = 100;

/**
 * Configuración de popups, valores: bootstrap, dark, light, material, modern, supervan.
 * @type {string}
 * @const
 * @global
 * @ignore
 */
const cfg_popup_theme = 'material';


/**
 * ----------------------------------------------------------------------------
 * Configuración de fechas
 * ----------------------------------------------------------------------------
 */

/**
 * Formato de fechas público para una fecha de día
 * @type {string}
 * @const
 * @global
 * @ignore
 */
const cfg_date_format_public_d = 'dd/MM/yyyy';

/**
 * Formato de hora público para una fecha de día
 * @type {string}
 * @const
 * @global
 * @ignore
 */
const cfg_date_format_public_h = 'HH:mm:ss';