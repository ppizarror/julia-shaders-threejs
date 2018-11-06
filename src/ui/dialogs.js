/**
 DIALOGS
 Funciones varias para administrar diálogos.

 @author Pablo Pizarro R. @ppizarror.com
 @license MIT
 */
"use strict";

/**
 * Clase que maneja los diálogos de la aplicación utilizando la librería Jquery-Confirm.
 *
 * @class
 * @constructor
 * @private
 * @since 0.1.6
 */
function AppDialog() {

    /**
     * Almacena todas las configuraciones posibles de los diálogos
     * @public
     * @ignore
     */
    this.options = {
        animation: {
            BOTTOM: 'bottom',
            LEFT: 'left',
            NONE: 'none',
            OPACITY: 'opacity',
            RIGHT: 'right',
            ROTATE: 'rotate',
            ROTATEX: 'rotateX',
            ROTATEXR: 'rotateXR',
            ROTATEY: 'rotateY',
            ROTATEYR: 'rotateYR',
            SCALE: 'scale',
            SCALEX: 'scaleX',
            SCALEY: 'scaleY',
            TOP: 'top',
            ZOOM: 'zoom',
        },
        buttons: {
            ERROR: 'btn-default', // btn-red
            DEFAULT: 'btn-default',
            INFO: 'btn-blue',
            NONE: 'btn-defauñt',
            OTHER: 'btn-default',
            PURPLE: 'btn-purple',
            SUCCESS: 'btn-success',
            WARNING: 'btn-warning',
        },
        icons: {
            ERROR: 'fas fa-times',
            DEFAULT: '',
            INFO: 'fas fa-info-circle',
            NONE: '',
            OTHER: '',
            PURPLE: '',
            SUCCESS: 'fas fa-check-circle',
            WARNING: 'fas fa-exclamation-triangle',
        },
        size: {
            SMALL: 'DIALOG-SMALL',
            NORMAL: 'DIALOG-NORMAL',
            LARGE: 'DIALOG-LARGE',
            FULL: 'DIALOG-FULL',
        },
        type: {
            ERROR: 'red',
            DEFAULT: '',
            INFO: 'blue',
            NONE: '',
            OTHER: 'dark',
            PURPLE: 'purple',
            SUCCESS: 'green',
            WARNING: 'orange',
        },
    };

    /**
     * Almacena el contenido del último popup, si se lanza uno igual se cancela el actual y lanza uno nuevo
     * @private
     * @ignore
     */
    this._last = {
        destroyed: true,    // Indica si se ha destruido o no
        md5: '',            // MD5 del objeto anterior
        object: null,       // Puntero al último
        options: null,      // Opciones de creación
    };

    /**
     * Puntero al objeto
     * @type {AppDialog}
     * @private
     * @ignore
     */
    let self = this;

    /**
     * Crea un diálogo con un texto y un botón para cerrar (confirmButton).
     *
     * @function
     * @public
     * @param {string} text - Contenido
     * @param {string=} title - Título del popup, opcional
     * @param {object=} options - Opciones de creación, opcional
     */
    this.text = function (text, title, options) {

        /**
         * Valores por defecto de variables sin definir
         */
        if (isNullUndf(options)) options = {};
        if (isNullUndf(title)) title = '';

        /**
         * Parámetros de construcción mensajes
         */
        let $defaults = {
            close: null,
            closeButtonClass: this.options.buttons.DEFAULT,
            closeText: lang.close,
        };
        options = $.extend($defaults, options);

        /**
         * Verifica que no haya error en los parámetros
         */
        if (notNullUndf(options['close']) && !(options['close'] instanceof Function)) {
            app_console.warn(lang.dialog_error_button_function_null.format(options['closeText'].toUpperCase()));
            options['close'] = null;
        }

        options['cancelText'] = null;
        options['onClose'] = options['close'];
        options['confirmButtonClass'] = options['closeButtonClass'];
        options['confirmText'] = options['closeText'];
        delete options['close'];
        delete options['closeButtonClass'];
        delete options['closeText'];

        /**
         * Crea el texto
         */
        this._createDialog(title, text, options);

    };

    /**
     * Diálogo de error.
     *
     * @function
     * @public
     * @param {string} title - Título del popup
     * @param {string} content - Contenido
     * @param {object=} options - Opciones de creación, opcional
     */
    this.error = function (title, content, options) {
        this._ewsioType(title, content, this.options.type.ERROR, this.options.icons.ERROR, this.options.buttons.ERROR, options);
    };

    /**
     * Diálogo de información.
     *
     * @function
     * @public
     * @param {string} title - Título del popup
     * @param {string} content - Contenido
     * @param {object=} options - Opciones de creación, opcional
     */
    this.info = function (title, content, options) {
        this._ewsioType(title, content, this.options.type.INFO, this.options.icons.INFO, this.options.buttons.INFO, options);
    };

    // noinspection JSUnusedGlobalSymbols
    /**
     * Diálogo de advertencia.
     *
     * @function
     * @public
     * @param {string} title - Título del popup
     * @param {string} content - Contenido
     * @param {object=} options - Opciones de creación, opcional
     */
    this.warning = function (title, content, options) {
        this._ewsioType(title, content, this.options.type.WARNING, this.options.icons.WARNING, this.options.buttons.WARNING, options);
    };

    /**
     * Diálogo de éxito.
     *
     * @function
     * @public
     * @param {string} title - Título del popup
     * @param {string} content - Contenido
     * @param {object=} options - Opciones de creación, opcional
     */
    this.success = function (title, content, options) {
        this._ewsioType(title, content, this.options.type.SUCCESS, this.options.icons.SUCCESS, this.options.buttons.SUCCESS, options);
    };

    // noinspection JSUnusedGlobalSymbols
    /**
     * Diálogo tipo 'otros'.
     *
     * @function
     * @public
     * @param {string} title - Título del popup
     * @param {string} content - Contenido
     * @param {object=} options - Opciones de creación, opcional
     */
    this.other = function (title, content, options) {
        this._ewsioType(title, content, this.options.type.OTHER, this.options.icons.OTHER, this.options.buttons.OTHER, options);
    };

    /**
     * Lanza un diálogo convencional de (E)rror, (W)arning, (S)uccess, (I)nfo, (O)ther.
     *
     * @function
     * @private
     * @param {string} title - Título del diálogo
     * @param {string} content - Contenido del diálogo
     * @param {string} type - Tipo de diálogo
     * @param {string} icon - Ícono del título
     * @param {string} buttonClass - Clase del botón
     * @param {object=} options - Opciones de creación
     * @ignore
     */
    this._ewsioType = function (title, content, type, icon, buttonClass, options) {

        /**
         * Valores por defecto de variables sin definir
         */
        if (isNullUndf(options)) options = {};

        /**
         * Parámetros de construcción diálogo confirmación
         */
        let $defaults = {
            close: null,                        // Función al cerrar
            closeButtonClass: buttonClass,      // Clase del botón
            closeText: lang.close,              // Texto en botón confirmar
            icon: icon,                         // Ícono
            size: this.options.size.SMALL,      // Tamaño pequeño
            type: type,                         // Tipo diálogo
            typeAnimated: true,                 // Diálogo animado
        };
        options = $.extend($defaults, options);

        /**
         * Verifica que no haya error en los parámetros
         */
        if (notNullUndf(options['close']) && !(options['close'] instanceof Function)) {
            app_console.warn(lang.dialog_error_button_function_null.format(options['closeText'].toUpperCase()));
            options['close'] = null;
        }

        options['cancelText'] = null;
        options['onClose'] = options['close'];
        options['confirmButtonClass'] = options['closeButtonClass'];
        options['confirmText'] = options['closeText'];
        delete options['close'];
        delete options['closeButtonClass'];
        delete options['closeText'];

        /**
         * Crea el diálogo
         */
        this._createDialog(title, content, options);

    };

    /**
     * Lanza un popup de confirmación, fuerza el foco, requiere que el usuario acepte los botones.
     *
     * @function
     * @public
     * @param {string} title - Título del popup
     * @param {string} content - Contenido del popup
     * @param {object=} options - Opciones de creación, opcional
     */
    this.confirm = function (title, content, options) {

        /**
         * Valores por defecto de variables sin definir
         */
        if (isNullUndf(options)) options = {};

        /**
         * Parámetros de construcción diálogo confirmación
         */
        let $defaults = {
            backgroundDismiss: false,
            closeIcon: false,
            draggable: false,
            escapeCancelKey: false,
            size: this.options.size.SMALL
        };
        options = $.extend($defaults, options);

        /**
         * Crea el diálogo de confirmación
         */
        this._createDialog(title, content, options);

    };

    /**
     * Crea un diálogo de confirmación con estilo de formulario, requiere de dos
     * funciones que se ejecutan al enviar el formulario (submit) o al cancelarlo (cancel).
     * El botón de submit es 'submit', el botón para cancelar es 'cancel'.
     *
     * @function
     * @public
     * @param {string} title - Título del formulario
     * @param {string} content - Contenido del formulario
     * @param {function} submit - Función que se ejecuta al enviar el formulario
     * @param {function | null} cancel - Función que se ejecuta al cancelar el formulario
     * @param {object=} options - Opciones de creación
     */
    this.form = function (title, content, submit, cancel, options) {

        /**
         * Valores por defecto de variables sin definir
         */
        if (isNullUndf(options)) options = {};
        if (isNullUndf(cancel)) cancel = function () {
        };

        /**
         * Si la función para enviar el formulario es nula la deja como vacía y lanza warning
         */
        if (isNullUndf(submit)) {
            app_console.warn(lang.dialog_form_submit_null);
            submit = function () {
            };
        }

        /**
         * Parámetros de construcción diálogo confirmación
         */
        let $defaults = {
            backgroundDismiss: false,
            cancelButtonClass: this.options.buttons.DEFAULT,
            cancelText: lang.dialog_form_cancel,
            closeIcon: false,
            closeAfterSubmit: true,
            escapeCancelKey: false,
            submitButtonClass: this.options.buttons.INFO,
            submitText: lang.dialog_form_send,
        };
        options = $.extend($defaults, options);

        /**
         * Si cierra el diálogo al enviar
         */
        if (options['closeAfterSubmit']) {
            let $prevsubmit = submit;
            submit = function () {
                $prevsubmit();
                let jc = this;
                jc.close();
            }
        }

        options['confirm'] = submit;
        options['cancel'] = cancel;
        options['confirmButtonClass'] = options['submitButtonClass'];
        options['confirmText'] = options['submitText'];
        delete options['submitButtonClass'];
        delete options['submitText'];

        /**
         * Añade función onContentReady
         */
        let $contentReady = function () {
        };
        if (notNullUndf(options['onContentReady']) && options['onContentReady'] instanceof Function) {
            $contentReady = options['onContentReady'];
        }
        options['onContentReady'] = function () {
            $contentReady();

            // Obtiene el contenido
            let $cnt = null;

            // Método 1, prueba con this
            let jc = this;
            if (notNullUndf(jc) && jc.hasOwnProperty('$content')) {
                $cnt = jc.$content;
            }

            // Método 2, prueba buscando por DOM
            if (isNullUndf($cnt)) {
                $cnt = $('.jconfirm-content');
            }

            // Si sigue siendo nulo retorna
            if (isNullUndf($cnt)) return;
            $cnt.find('form').on('submit', function (e) {
                e.preventDefault();
                // noinspection JSUnresolvedVariable
                jc.$$confirm.trigger('click');
            });
        };

        /**
         * Crea el diálogo de confirmación
         */
        this._createDialog(title, content, options);

    };

    /**
     * Crea un diálogo completo, considerando título, texto y dos botones (Aceptar,Cancelar),
     * ofrece distintos tamaños.
     *
     * @function
     * @private
     * @param {string} title - Título del popup
     * @param {string} content - Contenido del popup
     * @param {object} $options - Opciones de creación, obligatorio
     * @ignore
     */
    this._createDialog = function (title, content, $options) {

        /**
         * Opciones de creación del diálogo de confirmación
         */
        let __$defaults = {
            animateFromElement: false,              // Anima desde el elemento
            animation: this.options.animation.ZOOM, // Animación de apertura
            animationBounce: 1,                     // 1,0 Activa bounce
            animationSpeed: 400,                    // Velocidad de la animación
            backgroundDismiss: 'close',             // Evento clickeo fuera del popup
            buttonMaxLength: 30,                    // Largo máximo texto en botones
            cancel: null,                           // Función que se ejecuta al cancelar
            cancelButtonClass: this.options.buttons.DEFAULT, // Estilo botón cancelar
            cancelText: lang.answer_no,             // Texto en botón cancelar
            closeAnimation: this.options.animation.ZOOM, // Animación al cerrar el popup
            closeIcon: true,                        // Ícono para cerrar
            confirm: null,                          // Función que se ejecuta al confirmar
            confirmButtonClass: this.options.buttons.INFO, // Estilo botón confirmar
            confirmText: lang.answer_yes,           // Texto en botón confirmar
            disableSelect: false,                   // Desactiva la selección del texto
            draggable: true,                        // Indica si el popup se puede arrastrar
            dragWindowGap: 0,                       // Borde entre el popup y la ventana al arrastrar
            escapeCancelKey: true,                  // Evento botón ESC (true/false)
            forceCursorDefault: false,              // Fuerza el cursor a ser el default
            icon: this.options.icons.DEFAULT,       // Ícono del título
            lazyOpen: false,                        // Si es true abrir con .openLast()
            onClose: null,                          // Función que se ejecuta al cerrar el popup
            onContentReady: null,                   // Función que se ejecuta cuando contenido está listo
            onDestroy: null,                        // Función que se ejecuta al destruir el popup
            onOpen: null,                           // Función que se ejecuta al abrir el popup
            onOpenBefore: null,                     // Función que se ejecuta antes de abrir el popup
            size: this.options.size.NORMAL,         // Tamaño del popup
            type: this.options.type.DEFAULT,        // Tipo de animación de los popup
            typeAnimated: false,                    // Indica si se anima o no
            useBootstrap: false,                    // Por defecto se usa la configuración 'size'
            watchInterval: 100,                     // Intervalo de observación de eventos
        };

        /**
         * Extiende las opciones pasadas por argumento
         */
        $options = $.extend(__$defaults, $options);

        /**
         * Actualiza parámetros
         */
        if ($options.escapeCancelKey) $options.escapeCancelKey = 'cancel';
        if (!$options.typeAnimated) delete $options['type'];
        if (isNullUndf($options.icon)) $options.icon = this.options.icons.DEFAULT;

        /**
         * Elimina variables peligrosas que hacen que jquery-confirm muera
         */
        if (notNullUndf($options.close)) delete $options['close'];
        if (notNullUndf($options.open)) delete $options['open'];

        /**
         * Aplica configuraciones no cambiables
         */
        $options['theme'] = cfg_popup_theme;

        /**
         * Crea los botones
         */
        let $button = {};

        // Confirmar
        if (notNullUndf($options.confirmText) && $options.confirmText !== '') {
            $options.confirmText = $options.confirmText.toString();
            if ($options.confirmText.length > $options.buttonMaxLength) {
                $options.confirmText = $options.confirmText.substring(0, $options.buttonMaxLength - 3) + '&hellip;';
            }
            if (notNullUndf($options.confirm) && !($options.confirm instanceof Function)) {
                app_console.warn(lang.dialog_error_button_function_null.format($options.confirmText.toUpperCase()));
                $options.confirm = null;
            }
            $button['confirm'] = {
                action: $options.confirm,
                btnClass: $options.confirmButtonClass,
                keys: ['y', 'enter'],
                text: $options.confirmText,
            };
        }

        // Cancelar
        if (notNullUndf($options.cancelText) && $options.cancelText !== '') {
            $options.cancelText = $options.cancelText.toString();
            if ($options.cancelText.length > $options.buttonMaxLength) {
                $options.cancelText = $options.cancelText.substring(0, $options.buttonMaxLength - 3) + '&hellip;';
            }
            if (notNullUndf($options.cancel) && !($options.cancel instanceof Function)) {
                app_console.warn(lang.dialog_error_button_function_null.format($options.cancelText.toUpperCase()));
                $options.cancel = null;
            }
            $button['cancel'] = {
                action: $options.cancel,
                btnClass: $options.cancelButtonClass,
                keys: ['n'],
                text: $options.cancelText,
            };
        }

        // Guarda los botones
        $options['buttons'] = $button;

        /**
         * Define el título y el contenido
         */
        if (notNullUndf(title) && title !== '') $options['title'] = title;
        if (notNullUndf(content) && content !== '') $options['content'] = content;

        /**
         * Define funciones
         */
        if (isNullUndf($options['onClose']) || !($options['onClose'] instanceof Function)) {
            $options['onClose'] = function () {
            };
        }
        if (isNullUndf($options['onContentReady']) || !($options['onContentReady'] instanceof Function)) {
            $options['onContentReady'] = function () {
            };
        }
        if (isNullUndf($options['onDestroy']) || !($options['onDestroy'] instanceof Function)) {
            $options['onDestroy'] = function () {
            };
        }
        if (isNullUndf($options['onOpen']) || !($options['onOpen'] instanceof Function)) {
            $options['onOpen'] = function () {
            };
        }
        if (isNullUndf($options['onOpenBefore']) || !($options['onOpenBefore'] instanceof Function)) {
            $options['onOpenBefore'] = function () {
            };
        }

        /**
         * Crea función que se ejecuta cuando el contenido está listo
         */
        let $prevContentReadyFnc = $options['onContentReady'];
        $options['onContentReady'] = function () {

            // Ejecuta la función original
            $prevContentReadyFnc();

            // Obtiene el jconfirm
            let $jconfirm = $('.jconfirm-box');

            // Aplica noselect
            if ($options.disableSelect) {
                $jconfirm.addClass('noselect');
            }

            // Aplica cursor default
            if ($options.forceCursorDefault) {
                $jconfirm.addClass('jconfirm-default-cursor');
            }

        };

        /**
         * Añade función que establece como destruído el último popup
         */
        let $destroy = $options['onDestroy'];
        $options['onDestroy'] = function () {
            $destroy();
        };

        /**
         * Establece el ancho del popup
         */
        self._dialogSize($options);

        /**
         * Verifica que el MD5 sea el mismo que el anterior (si existe), si es así cierra el último y
         * lo reabre
         */
        let $md5options = $.extend({}, $options);
        delete $md5options['boxWidth'];
        delete $md5options['size'];
        let $md5 = md5(JSON.stringify($options));

        /**
         * Si existe un popup abierto con el mismo contenido lo destruye
         */
        // noinspection JSValidateTypes
        if (notNullUndf(this._last.object) && this._last.md5 === $md5 && !this._last.object.isClosed()) {
            app_console.info(lang.dialog_last_closed_equal_opened);
            self.closeLast();
        }

        /**
         * Crea el popup
         */
        let $confirm = $.confirm($options);
        app_console.info(lang.dialog_popup_created.format($md5));

        /**
         * Guarda el último popup
         */
        this._last.md5 = $md5;
        // noinspection JSValidateTypes
        this._last.$options = $options;
        // noinspection JSUnresolvedVariable
        this._last.object = $confirm;

    };

    /**
     * Función que evalúa el tamaño de un diálogo.
     *
     * @function
     * @private
     * @param {Object} $options - Opciones de creación del diálogo
     */
    this._dialogSize = function ($options) {

        /**
         * Obtiene el ancho de la página
         * @type {number}
         */
        let $width = getElementWidth(app_dom.body);

        /**
         * Itera según el ancho de la página y asigna los porcentajes
         */
        switch ($options['size']) {
            case this.options.size.SMALL:
                if ($width <= 350) {
                    $options['boxWidth'] = '95%';
                } else if ($width <= 400) {
                    $options['boxWidth'] = '57%';
                } else if ($width <= 500) {
                    $options['boxWidth'] = '53%';
                } else if ($width <= 600) {
                    $options['boxWidth'] = '48%';
                } else if ($width <= 700) {
                    $options['boxWidth'] = '43%';
                } else if ($width <= 800) {
                    $options['boxWidth'] = '38%';
                } else if ($width <= 900) {
                    $options['boxWidth'] = '35%';
                } else if ($width <= 1000) {
                    $options['boxWidth'] = '31%';
                } else {
                    $options['boxWidth'] = '30%';
                }
                break;
            case this.options.size.NORMAL:
                if ($width <= 350) {
                    $options['boxWidth'] = '95%';
                } else if ($width <= 400) {
                    $options['boxWidth'] = '67%';
                } else if ($width <= 500) {
                    $options['boxWidth'] = '60%';
                } else if ($width <= 600) {
                    $options['boxWidth'] = '58%';
                } else if ($width <= 700) {
                    $options['boxWidth'] = '54%';
                } else if ($width <= 800) {
                    $options['boxWidth'] = '50%';
                } else if ($width <= 900) {
                    $options['boxWidth'] = '46%';
                } else if ($width <= 1000) {
                    $options['boxWidth'] = '44%';
                } else {
                    $options['boxWidth'] = '37%';
                }
                break;
            case this.options.size.LARGE:
                if ($width <= 350) {
                    $options['boxWidth'] = '95%';
                } else if ($width <= 400) {
                    $options['boxWidth'] = '85%';
                } else if ($width <= 500) {
                    $options['boxWidth'] = '78%';
                } else if ($width <= 600) {
                    $options['boxWidth'] = '74%';
                } else if ($width <= 700) {
                    $options['boxWidth'] = '71%';
                } else if ($width <= 800) {
                    $options['boxWidth'] = '67%';
                } else if ($width <= 900) {
                    $options['boxWidth'] = '63%';
                } else if ($width <= 1000) {
                    $options['boxWidth'] = '60%';
                } else {
                    $options['boxWidth'] = '55%';
                }
                break;
            case this.options.size.FULL:
                $options['boxWidth'] = '95%';
                break;
            default:
                app_console.warn(lang.app_dialog_unknown_size.format($options['size']));
                $options['useBootstrap'] = true;
                delete $options['size'];
                break;
        }

    };

    /**
     * Cierra el último diálogo.
     *
     * @function
     * @public
     */
    this.closeLast = function () {
        if (notNullUndf(self._last.object)) self._last.object.close();
    };

    // noinspection JSUnusedGlobalSymbols
    /**
     * Abre el último diálogo.
     *
     * @function
     * @public
     */
    this.openLast = function () {
        if (notNullUndf(self._last.object)) self._last.object.open();
    };

}

/**
 * Instancia administrador de diálogos
 * @type {AppDialog}
 * @const
 * @global
 */
const app_dialog = new AppDialog();