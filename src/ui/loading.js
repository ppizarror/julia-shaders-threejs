/**
 LOADING
 Funciones de barras y paneles de carga.

 @author Pablo Pizarro R. @ppizarror.com
 @license MIT
 */
"use strict";

/**
 * Clase que maneja el spinner de carga de pantalla completa.
 *
 * @class
 * @constructor
 * @private
 * @since 0.1.1
 */
function FullPageLoadingSpinner() {

    /**
     * Spiner de carga
     * @type {Spinner | null}
     * @private
     */
    this._loading_spiner = null;

    /**
     * Indica el estado del spinner
     * @type {boolean}
     * @private
     */
    this._enabled = false;

    /**
     * Duración máxima del spinner de carga, pasado ese tiempo se oculta
     * @type {number}
     * @private
     * @ignore
     */
    this._maxDurationSpinner = cfg_max_time_loading_layer;

    /**
     * ID del thread que oculta el spinner
     * @type {number}
     * @private
     * @ignore
     */
    this._maxDurationThread = 0;

    /**
     * Función que realiza el cambio, el layer sólo se activa tras {@link cfg_init_loading_layer_after} milisegundos
     * @type {number}
     * @private
     * @ignore
     */
    this._threadChange = -1;

    /**
     * Puntero al objeto
     * @type {FullPageLoadingSpinner}
     * @private
     * @ignore
     */
    let self = this;

    /**
     * Muestra el spinner.
     *
     * @function
     * @public
     * @since 0.1.4
     */
    this.start = function () {

        /**
         * Si ya estaba esperando retorna
         */
        if (self._threadChange !== -1) return;

        /**
         * Si ya está iniciado retorna
         */
        if (self._enabled) return;

        /**
         * Inicia un nuevo thread
         */
        self._threadChange = setTimeout(function () {
            if (!self._enabled) self._loadFullpageSpinner(true);
            self._threadChange = -1;
        }, cfg_init_loading_layer_after);

    };

    /**
     * Detiene el spinner.
     *
     * @function
     * @public
     * @since 0.1.4
     */
    this.stop = function () {

        /**
         * Borra el thread anterior
         */
        if (self._threadChange !== -1) {
            clearTimeout(self._threadChange);
            self._threadChange = -1;
        }
        self._loadFullpageSpinner(false)

    };

    /**
     * Muestra una pantalla de carga.
     *
     * @function
     * @private
     * @param {boolean} checker - Indica el estado
     * @param {Function=} callback - Función que se llama tras la función
     * @ignore
     */
    this._loadFullpageSpinner = function (checker, callback) {
        /* eslint callback-return:"off" */

        /**
         * Variables locales
         */
        let h, hh, w, posX, posY;

        /**
         * Obtiene dimensiones de la página
         */
        h = getElementHeight(app_dom.window);
        hh = getElementHeight(app_dom.body);
        hh = Math.max(h, hh) - 0.1;
        w = getElementWidth(app_dom.window);
        posX = (w - 69) / 2;
        posY = (h - 69) / 2;

        /**
         * --------------------------------------------------------------------
         * Mostrar el spinner
         * --------------------------------------------------------------------
         */
        if (checker) {

            /**
             * No se ha creado aún el objeto
             */
            if (isNullUndf(document.getElementById('LoadingDivLayer'))) {

                // Mensaje en consola
                app_console.info(lang.building_full_loading_layer);

                // Añade el objeto
                app_dom.body.prepend('<div id="LoadingDivLayer" class="LoadingDivLayerClass noselect"><div class="LoadingForeground"><div class="LoadingBox"><div id="spinnerSpin"></div></div></div><div class="LoadingBackground"></div></div>');

                // Inicia el spinner
                let opts = {
                    animation: 'spinner-line-fade-more',
                    className: 'spinner',
                    color: '#ffffff',
                    corners: 0.95,
                    direction: 1,
                    fadeColor: 'transparet',
                    left: '50%',
                    length: 35,
                    lines: 11,
                    position: 'absolute',
                    radius: 45,
                    rotate: 0,
                    scale: 0.23,
                    shadow: '0 0 1px transparent',
                    speed: 1.0,
                    top: '50%',
                    width: 16,
                    zIndex: 2e9,
                };
                this._spinnerContainer = document.getElementById('spinnerSpin');
                self._loading_spiner = new Spinner(opts);

            }

            /**
             * Cambia las alturas del loadinglayer
             */
            let $loadinglayer = $('#LoadingDivLayer');
            $loadinglayer.css('height', String(hh) + 'px');
            $loadinglayer.find('.LoadingForeground').css('height', String(hh) + 'px');
            $loadinglayer.find('.LoadingForeground .LoadingBox').css({
                'top': String(posY) + 'px',
                'left': String(posX) + 'px',
            });
            $loadinglayer.find('.LoadingBackground').css('height', String(hh) + 'px');
            $loadinglayer.fadeIn(350, function () {
                if (notNullUndf(callback)) callback();
            });

            /**
             * Vuelve a iniciar el spinner
             */
            self._loading_spiner.spin(self._spinnerContainer);

            /**
             * Si existe scroll se desactiva
             */
            if (app_dom.body.height() > app_dom.window.height()) {
                // noinspection JSUnresolvedVariable
                $.extScrollLock.enable('loading');
            }

            /**
             * Inicia thread que oculta el spinner
             */
            if (self._maxDurationSpinner > 0) {
                self._maxDurationThread = setTimeout(function () {
                    self.stop();
                    self._maxDurationThread = 0;
                    clearTimeout(self._threadChange);
                    self._threadChange = -1;
                }, self._maxDurationSpinner * 1000);
            }

            /**
             * Marca como iniciado
             */
            self._enabled = true;

        }

        /**
         * --------------------------------------------------------------------
         * Ocultar el spinner
         * --------------------------------------------------------------------
         */
        else {

            /**
             * Cancela el timeout
             */
            if (self._maxDurationThread !== 0) {
                clearTimeout(self._maxDurationThread);
                self._maxDurationThread = 0;
            }

            /**
             * Oculta el objeto
             */
            $('#LoadingDivLayer').hide();

            /**
             * Detiene el spinner
             */
            if (notNullUndf(this._loading_spiner)) self._loading_spiner.stop();

            /**
             * Marca como oculto
             */
            self._enabled = false;

            /**
             * Ejecuta el callback
             */
            if (notNullUndf(callback)) callback();

        }

    };

    /**
     * Añade evento de redimensionado del objeto loadingDiv
     */
    app_dom.window.on('resize.FullPageLoadingDivLayer', function (e) {
        e.preventDefault();
        if (!self._enabled) return;
        let h, hh, w, posX, posY;
        if (document.getElementById('LoadingDivLayer') !== null) {
            h = getElementHeight(app_dom.window);
            hh = getElementHeight(app_dom.body);
            hh = Math.max(h, hh);
            w = getElementWidth(app_dom.window);
            posX = (w - 69) / 2;
            posY = (h - 69) / 2;
            let $loadinglayer = $('#LoadingDivLayer');
            $loadinglayer.css({
                height: String(hh) + 'px',
            });
            $loadinglayer.find('> .LoadingForeground').css({
                height: String(hh) + 'px',
            });
            $loadinglayer.find('> .LoadingBackground').css({
                height: String(hh) + 'px',
            });
            $loadinglayer.find('> .LoadingForeground > .LoadingBox').css({
                left: String(posX) + 'px',
            });
            $('.LoadingBox').css({
                'left': posX + 'px',
                'top': posY + 'px',
            });
        }

    });

}

/**
 * Inicia el objeto de loading
 * @type {FullPageLoadingSpinner}
 * @ignore
 * @private
 * @since 0.1.1
 */
const _app_loading_layer = new FullPageLoadingSpinner();

/**
 * Handler de la función loading.
 *
 * @function
 * @param {boolean} status - Indica si se muestra o no el spinner de carga
 * @returns {boolean} - Retorna true/false dependiendo si se cargó o no el spinner
 * @since 0.1.1
 */
function loadingHandler(status) {

    /**
     * Se oculta el loading
     */
    if (!status) {
        _app_loading_layer.stop();
    }

    /**
     * Se muestra el spinner
     */
    else {
        _app_loading_layer.start();
    }
    return true;

}