/**
 SHADERVIEWER VIEWER
 Administra el visualizador con Three.js.

 @author Pablo Pizarro R. @ppizarror.com
 @license MIT
 */
"use strict";

/**
 * Crea el visualizador de shaders.
 *
 * @class
 * @constructor
 * @since 0.1.0
 */
function ShaderViewer() {

    /**
     * ------------------------------------------------------------------------
     * Variables del visualizador
     * ------------------------------------------------------------------------
     */

    /**
     * ID del canvas
     * @type {string}
     * @private
     */
    this.id = generateID();

    /**
     * DIV que contiene el canvas
     * @type {JQuery | jQuery | HTMLElement | null}
     * @protected
     */
    this._canvasParent = null;

    /**
     * Puntero al objeto
     * @type {ShaderViewer}
     */
    let self = this;

    /**
     * Selector del shader
     * @type {null | JQuery<HTMLElement> | HTMLElement}
     * @private
     */
    this._shaderSelector = null;

    /**
     * Puntero al menú
     * @type {JQuery | jQuery | HTMLElement | null}
     * @protected
     */
    this._menuContainer = null;

    /**
     * Contiene los identificadores de los valores del campo complejo
     * @private
     */
    this._infoID = {
        ln: null,               // Largo de la ventana
        maxir: null,            // Mayor valor del plano imaginario
        maxzr: null,            // Mayor valor del plano real
        minir: null,            // Menor valor del plano imaginario
        minzr: null,            // Menor valor del plano real
        zoomlevel: null,        // Nivel de zoom
    };

    /**
     * Contiene los input de los valores de julia (constantes)
     * @private
     */
    this._juliaInputs = {
        re: null,
        im: null,
    };

    /**
     * Datos del visualizador
     * @private
     */
    this._shaderObject = {
        color: {                // Colores
            r_min: 0.00,
            r_max: 1.00,
            g_min: 0.00,
            g_max: 1.00,
            b_min: 0.00,
            b_max: 1.00,
        },
        datashader: {           // Contiene los datos cargados del shader
            f: '',
            v: '',
        },
        geometry: null,         // Geometría
        init: {                 // Valores iniciales del shader
            zi: 0,
            zr: 0,
            range: 2,
        },
        iters: 1000,            // Número de iteraciones del shader
        julia: {                // Valores iniciales C julia
            im: 0.0,
            re: 0.0,
        },
        material: null,         // Material del shader
        mesh: null,             // Contiene la geometría + material
        plotz: 0.0,             // Altura del objeto
        vertex: {               // Contiene los vértices
            zi: 0,
            zr: 0,
        },
    };

    // noinspection JSUnusedGlobalSymbols
    /**
     * ID de la GUI
     * @type {object | string}
     * @protected
     */
    this._guiID = 'viewer-gui';

    /**
     * Define el bound potencial del zoom
     * @private
     */
    this._bound = {
        hide: false,            // Indica que el borde está oculto
        linecolor: 0xFFFFFF,    // Color del borde
        linez: 0.005,           // Altura de la línea
        max_zi: 0,              // Máximo valor absoluto de zi (imaginario)
        max_zr: 0,              // Máximo valor absoluto de zr (real)
        mesh: null,             // Contiene los mesh de los bordes
        mid_zi: 0,              // Punto medio coordenada imaginaria
        mid_zr: 0,              // Punto medio coordenada real
        range: 2,               // Define el rango inicial
        zi: 0,                  // Coordenada imaginaria
        zoomfactor: 0.50,       // Factor del zoom
        zr: 0,                  // Coordenada real
    };


    /**
     * ------------------------------------------------------------------------
     * Eventos
     * ------------------------------------------------------------------------
     */

    // noinspection JSUnusedGlobalSymbols
    /**
     * Indica si se mantiene un botón presionado
     * @type {boolean}
     * @private
     */
    this._hasKeyPressed = false;

    // noinspection JSUnusedGlobalSymbols
    /**
     * Indica si el mouse está sobre el canvas
     * @type {boolean}
     * @private
     */
    this._hasMouseOver = false;

    /**
     * Indica si el mouse se mantiene presionado
     * @type {boolean}
     * @private
     */
    this._hasMousePressed = false;

    /**
     * El mouse se presiona y mueve
     * @type {boolean}
     * @private
     */
    this._mouseMoveDrag = false;

    // noinspection JSUnusedGlobalSymbols
    /**
     * Si el mouse no intersecta el plano no se muestra la región del zoom
     * @type {boolean}
     * @private
     */
    this._hasMouseIntersectPlane = false;

    /**
     * ID del evento de mousemove en la ventana
     * @type {string}
     * @private
     */
    this._windowMouseMoveEvent = 'mousemove.rectzoom';

    // noinspection JSUnusedGlobalSymbols
    /**
     * Indica que el mouse está presionado
     * @type {boolean}
     * @private
     */
    this._mouseKeepPressed = false;

    /**
     * Contiene identificadores de los eventos
     * @private
     */
    this._eventID = {
        click: 'click.canvas',
        contextmenu: 'contextmenu.canvas',
        keydown: 'keydown.canvas',
        keyup: 'keyup.canvas',
        mousedown: 'mousedown.canvas',
        mouseout: 'mouseout.canvas',
        mouseover: 'mouseover.canvas',
        mouseup: 'mouseup.canvas',
        mousewheel: 'mousewheel.canvas',
        wheel: 'wheel.canvas',
    };


    /**
     * ------------------------------------------------------------------------
     * Objetos de Three.js
     * ------------------------------------------------------------------------
     */

    /**
     * Indica que la animación está activa
     * @type {boolean}
     * @private
     */
    this._animateThread = false;

    /**
     * Three.js helpers
     * @protected
     */
    this.threejs_helpers = {

        /**
         * Helpers, estado
         */
        axis: false,                     // Muestra los ejes en el plano
        cameratarget: false,             // Muestra el objetivo de la cámara
        fpsmeter: false,                 // Indicador de FPS
        grid: true,                      // Muestra grilla en plano
        gui: false,                      // Muestra una gui por defecto (modificable)
        planes: false,                   // Dibuja los planos
        worldlimits: false,              // Límites del mundo

        /**
         * Parámetros de los helpers
         */
        axissize: 0.40,                 // Tamaño de los ejes en comparación al tamaño del mundo (menor)
        cameratargetcolor: 0X0000FF,    // Color del target
        cameratargetsize: 0.02,         // Tamaño del punto del objetivo de la cámara (% tamaño mundo)
        griddist: 0.03,                 // % Cubierto por líneas
        guistartclosed: true,           // La gui si se autoinicia aparece cerrada
        guicloseafterpopup: false,      // La gui se cierra al abrir un popup
        planecolorx: 0X0000FF,          // Color plano x
        planecolory: 0XFF0000,          // Color plano y
        planecolorz: 0X00FF00,          // Color plano z
        planeopacity: 0.5,              // Opacidad del plano
        worldlimitscolor: 0X444444,     // Colores límite del mundo

    };

    /**
     * Contiene funciones de actualización de los helpers, se extiende en @drawHelpers
     * @type {Array}
     * @private
     */
    this._helpersUpdate = [];

    /**
     * Instancias de cada helper, son únicos, se eliminan o añaden en @drawHelpers
     * @private
     */
    this._helperInstances = {
        axis: null,
        cameratarget: null,
        fpsmeter: null,
        grid: null,
        planes: null,
        worldlimits: null,
    };

    /**
     * Nombres globales, usados para identificar determinados elementos preestablecidos
     * @protected
     */
    this._globals = {
        contour: '__CONTOUR',
        helper: '__HELPER',
        plane: '__PLANE',
        shader: 'SHADERPLANE',
    };

    /**
     * Propiedades de los objetos del mundo
     * @protected
     */
    this.objects_props = {

        /**
         * Plano de la escena
         */
        plane: {
            color: 0x222222,        // Color del plano
            dithering: false,       // Aplica dithering al material
            obj: null,              // Almacena el objeto
        },

        /**
         * Cámara
         */
        camera: {
            angle: 56,                          // Ángulo de la cámara (FOV)
            autorotate: false,                  // Rotar automáticamente en torno al objetivo
            far: 9.000,                         // Plano lejano de la cámara (% diagonal larga)
            light: {                            // Luz pegada a la cámara
                color: 0X181818,
                decay: 1.500,
                distance: 0.483,
                intensity: 0.600,
            },
            maxdistance: 2.500,                 // Distancia máxima (% diagonal larga)
            maxpolarangle: 1.000,               // Máximo ángulo que puede alcanzar la cámara (Por pi/2)
            near: 0.001,                        // Plano cercano de la cámara
            nopan: true,                        // Activa/desactiva el PAN del mouse
            posx: 0.400,                        // Posición inicial en x (% dimensión del mundo)
            posy: -0.600,                       // Posición inicial en y (% dimensión del mundo)
            posz: 1.500,                        // Posición inicial en z
            rotationx: -1.000,                  // Rotación inicial con respecto al eje x (Por pi/2)
            rotationy: -1.300,                  // Rotación inicial con respecto al eje y (Por pi/2)
            rotationz: -0.500,                  // Rotación inicial con respecto al eje z (Por pi/2)
            target: {                           // Target de la cámara, posición inicial con respecto a la dimensión
                x: 0.000,
                y: 0.000,
                z: 0.000,
            },
            targetMoveCamera: true,             // Al mover el target también se mueve la cámara
            targetMoveCameraFlipByPos: true,    // Invierte el sentido según la posición de la cámara
            targetSpeed: {                      // Velocidad de cambio del target como % de cada eje
                angular: 0.05,                  // Velocidad angular [rad]
                x: 0.010,
                y: 0.010,
                z: 0.050,
            },
            zoom: 1.000,                        // Factor de zoom
        },

    };

    /**
     * Límites del mundo, modificar
     */
    this._worldsize = {
        x: 1.000,
        y: 1.000,
        z: 1.000,
    };

    /**
     * Lista con meshes colisionables
     * @type {Array}
     * @private
     */
    this._collaidableMeshes = [];

    /**
     * Coordenadas del mouse dentro de la ventana, usado principalmente por el tooltip
     * @private
     */
    this._mouse = {
        x: 0,           // Posición dentro del canvas en x
        y: 0,           // Posición dentro del canvas en y
    };


    /**
     * ------------------------------------------------------------------------
     * Métodos del visualizador, funciones generales
     * ------------------------------------------------------------------------
     */

    /**
     * Reajusta el canvas al cambiar el tamaño.
     *
     * @function
     * @protected
     * @param {boolean} type - Indica tipo de carga, si es true se añade evento, si es false se borra
     * @since 0.1.0
     */
    this._threeResize = function (type) {

        /**
         * Nombre del evento
         * @type {string}
         */
        let $ev = 'resize.shaderviewer' + this.id;

        /**
         * Activa el evento
         */
        if (type) {
            let $f = function (e) {

                /**
                 * Previene otros cambios, útil por ThreeControls
                 */
                if (notNullUndf(e)) e.preventDefault();

                /**
                 * Se obtiene el ancho y el alto del DIV
                 */
                let $w = Math.ceil(getElementWidth(self.maindiv));
                let $h = Math.ceil(getElementHeight(self.maindiv));

                /**
                 * Actualiza el aspecto del canvas
                 */
                self.objects_props.camera.aspect = $w / $h;

                /**
                 * Actualiza Three.js
                 */
                self._three_camera.aspect = $w / $h;
                self._three_camera.updateProjectionMatrix();
                self._renderer.setSize($w, $h); // Actualiza el render
                self._renderer.setPixelRatio(window.devicePixelRatio);

                /**
                 * Redibuja
                 */
                self._animateFrame();

            };
            app_dom.window.on($ev, $f);
            $f();
        }

        /**
         * Desactiva el evento
         */
        else {
            app_dom.window.off($ev);
        }

    };

    /**
     * Inicia Three.js.
     *
     * @function
     * @private
     * @since 0.1.0
     */
    this._initThree = function () {

        /**
         * --------------------------------------------------------------------
         * Calcula límites del mapa
         * --------------------------------------------------------------------
         */
        this._worldsize.diagl = Math.sqrt(Math.pow(2 * this._worldsize.x, 2) + Math.pow(2 * this._worldsize.y, 2) + Math.pow(this._worldsize.z, 2));
        this._worldsize.diagx = Math.sqrt(Math.pow(2 * this._worldsize.x, 2) + Math.pow(this._worldsize.z, 2));
        this._worldsize.diagy = Math.sqrt(Math.pow(2 * this._worldsize.y, 2) + Math.pow(this._worldsize.z, 2));

        /**
         * --------------------------------------------------------------------
         * Setea cámara
         * --------------------------------------------------------------------
         */

        // Restricciones de la cámara
        this.objects_props.camera.far *= this._worldsize.diagl;
        this.objects_props.camera.maxdistance *= this._worldsize.diagl;
        this.objects_props.camera.maxpolarangle *= Math.PI / 2;

        // Posición inicial de la cámara
        this.objects_props.camera.posx *= this._worldsize.x;
        this.objects_props.camera.posy *= this._worldsize.y;
        this.objects_props.camera.posz *= this._worldsize.z;

        // Rotaciones iniciales
        this.objects_props.camera.rotationx *= Math.PI / 2;
        this.objects_props.camera.rotationy *= Math.PI / 2;
        this.objects_props.camera.rotationz *= Math.PI / 2;

        // Target de la cámara
        this.objects_props.camera.target.x *= this._worldsize.x;
        this.objects_props.camera.target.y *= this._worldsize.y;
        this.objects_props.camera.target.z *= this._worldsize.z;

        // Velocidad de movimiento del target en actualización de controles
        this.objects_props.camera.targetSpeed.x *= this._worldsize.x;
        this.objects_props.camera.targetSpeed.y *= this._worldsize.y;
        this.objects_props.camera.targetSpeed.z *= this._worldsize.z;
        this.objects_props.camera.targetSpeed.xy = this._dist2(this.objects_props.camera.targetSpeed.x, this.objects_props.camera.targetSpeed.y);

        // Suma el target a la cámara para mantener distancias
        this.objects_props.camera.posx += this.objects_props.camera.target.x;
        this.objects_props.camera.posy += this.objects_props.camera.target.y;
        this.objects_props.camera.posz += this.objects_props.camera.target.z;

        // Posición inicial de la cámara
        self.objects_props.camera.initialTarget = {
            x: this.objects_props.camera.target.x,
            y: this.objects_props.camera.target.y,
            z: this.objects_props.camera.target.z
        };

        /**
         * --------------------------------------------------------------------
         * Setea propiedades de las luces
         * --------------------------------------------------------------------
         */
        this.objects_props.camera.light.distance *= this._worldsize.diagl;

        /**
         * --------------------------------------------------------------------
         * Inicia el render de Three.js
         * --------------------------------------------------------------------
         */
        this._renderer = new THREE.WebGLRenderer({

            // Activa las transparencias
            alpha: true,

            // Antialias
            antialias: true,

            // Tiene un búffer de profundidad de 16 bits
            depth: true,

            // Búffer de profundidad logarítmico, usado cuando hay mucha diferencia en la escena
            logarithmicDepthBuffer: false,

            // Preferencia de WebGL, puede ser "high-performance", "low-power" ó "default"
            powerPreference: "high-performance",

            // Precisión
            precision: 'highp',

            // Los colores ya tienen incorporado las transparencias
            premultipliedAlpha: true,

            // Para capturas, si molesta deshabilitar
            preserveDrawingBuffer: false,

            // El búffer de dibujo tiene un stencil de 8 bits
            stencil: false,

        });

        /**
         * --------------------------------------------------------------------
         * Crea la escena
         * --------------------------------------------------------------------
         */
        this._scene = new THREE.Scene();
        this._scene.name = 'VIEWER-3D-SCENE';

        /**
         * --------------------------------------------------------------------
         * Modifica el render para las luces
         * --------------------------------------------------------------------
         */
        this._renderer.shadowMap.enabled = true;
        this._renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this._renderer.gammaInput = true;
        this._renderer.gammaOutput = true;

        /**
         * --------------------------------------------------------------------
         * Crea la cámara
         * --------------------------------------------------------------------
         * @private
         */
        this._three_camera = new THREE.PerspectiveCamera(
            self.objects_props.camera.angle,
            self.objects_props.camera.aspect,
            self.objects_props.camera.near,
            self.objects_props.camera.far,
        );
        this._three_camera.zoom = this.objects_props.camera.zoom;

        // noinspection JSUnusedGlobalSymbols
        this._cameralight = new THREE.PointLight();
        this._cameralight.color.setHex(this.objects_props.camera.light.color);
        this._cameralight.decay = this.objects_props.camera.light.decay;
        this._cameralight.distance = this.objects_props.camera.light.distance;
        this._cameralight.intensity = this.objects_props.camera.light.intensity;
        this._three_camera.add(this._cameralight);

        /**
         * --------------------------------------------------------------------
         * Añade el render al div
         * --------------------------------------------------------------------
         * @private
         */
        this.maindiv = $(self.id);
        this.maindiv.append(this._renderer.domElement);
        this._canvasParent.attr('tabindex', '1');

        /**
         * --------------------------------------------------------------------
         * Añade la cámara al escenario
         * --------------------------------------------------------------------
         */
        this._scene.add(this._three_camera);

        /**
         * --------------------------------------------------------------------
         * Crea los controles
         * --------------------------------------------------------------------
         */
        this._controls = new THREE.OrbitControls(this._three_camera, this._renderer.domElement);
        this._controls.addEventListener('change', this._render);

        // El pan sólo está disponible en móvil, en escritorio usar teclado
        this._controls.enablePan = true;

        // Desactiva las fechas
        this._controls.enableKey = false;

        // Autorotar (?) esta característica funciona sólo con requestAnimateFrame()
        this._controls.autoRotate = this.objects_props.camera.autorotate;

        // Define límites de la camara
        this._controls.maxPolarAngle = this.objects_props.camera.maxpolarangle;
        this._controls.maxDistance = this.objects_props.camera.maxdistance;

        /**
         * --------------------------------------------------------------------
         * Setea posición inicial de la cámara
         * --------------------------------------------------------------------
         */
        this._setInitialCameraPosition();

        // noinspection JSUnusedGlobalSymbols
        /**
         * --------------------------------------------------------------------
         * Crea el raycaster
         * --------------------------------------------------------------------
         */
        this._raycaster = new THREE.Raycaster();

        /**
         * --------------------------------------------------------------------
         * Inicia la GUI
         * --------------------------------------------------------------------
         */
        if (this.threejs_helpers.gui) {
            this.threejs_helpers.gui = false;
            this._toggleGUI();
        }

    };

    /**
     * Define la posición inicial de la cámara.
     *
     * @function
     * @private
     * @since 0.1.0
     */
    this._setInitialCameraPosition = function () {

        /**
         * Setea posición inicial
         */
        this._three_camera.position.x = this.objects_props.camera.posy;
        this._three_camera.position.y = this.objects_props.camera.posz;
        this._three_camera.position.z = this.objects_props.camera.posx;

        /**
         * Setea ángulo inicial
         */
        this._three_camera.rotation.x = this.objects_props.camera.rotationy;
        this._three_camera.rotation.y = this.objects_props.camera.rotationz;
        this._three_camera.rotation.z = this.objects_props.camera.rotationx;

        /**
         * Target inicial
         */
        this.objects_props.camera.target.x = self.objects_props.camera.initialTarget.x;
        this.objects_props.camera.target.y = self.objects_props.camera.initialTarget.y;
        this.objects_props.camera.target.z = self.objects_props.camera.initialTarget.z;

        /**
         * Actualiza la cámara
         */
        this._setCameraTarget();

    };

    /**
     * Setea el target de la cámara.
     *
     * @function
     * @private
     * @since 0.1.0
     */
    this._setCameraTarget = function () {
        // noinspection JSSuspiciousNameCombination
        self._controls.target.set(self.objects_props.camera.target.y, self.objects_props.camera.target.z, self.objects_props.camera.target.x);
        self._controls.update();
    };

    /**
     * Verifica que el target de la cámara se encuentre entre los límites del mundo,
     * desde la versión 2.00 se verifica si colisiona en modo walkingCamera.
     *
     * @function
     * @private
     * @param {string} axis - Eje actualizado
     * @param {number} min - Valor mínimo de la posición
     * @param {number} max - Valor máximo de la posición
     * @returns {boolean} - Indica si la cámara se puede mover
     * @since 0.1.0
     */
    this._checkCameraTargetLimits = function (axis, min, max) {
        let $pos = self.objects_props.camera.target[axis];
        if (min <= $pos && $pos <= max) {
            return true;
        }
        self.objects_props.camera.target[axis] = Math.min(max, Math.max($pos, min));
        return false;
    };

    /**
     * Calcula la distancia entre dos puntos.
     *
     * @function
     * @private
     * @param {number} a - Número
     * @param {number} b - Número
     * @returns {number}
     * @since 0.1.0
     */
    this._dist2 = function (a, b) {
        return Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2));
    };

    /**
     * Verifica que el target de la cámara se encuentre entre los límites del mundo,
     * desde la versión 2.00 se verifica si colisiona en modo walkingCamera.
     *
     * @function
     * @private
     * @param {string} axis - Eje actualizado
     * @param {number} min - Valor mínimo de la posición
     * @param {number} max - Valor máximo de la posición
     * @returns {boolean} - Indica si la cámara se puede mover
     * @since 0.1.0
     */
    this._checkCameraTargetLimits = function (axis, min, max) {
        let $pos = self.objects_props.camera.target[axis];
        if (min <= $pos && $pos <= max) {
            return true;
        }
        self.objects_props.camera.target[axis] = Math.min(max, Math.max($pos, min));
        return false;
    };

    /**
     * Chequea que el target de la cámara no colisione.
     *
     * @function
     * @private
     * @param {string} axis - Eje a comprobar
     * @param {number} val - valor A sumar
     * @returns {boolean} - Indica si no se colisiona (true) o no (false)
     * @since 0.1.0
     */
    this._checkCameraTargetCollision = function (axis, val) {

        /**
         * Suma al eje
         */
        self.objects_props.camera.target[axis] += val;
        return true;

    };

    /**
     * Incrementa el target de la cámara en un valor.
     *
     * @function
     * @private
     * @param {string} dir - Dirección
     * @param {number} val - Incremento de la dirección
     * @param {boolean=} flipSignPos - Cambia el sentido del incremento según la posición de la cámara
     * @param {boolean=} setTarget - Establece el target de la cámara
     * @since 0.1.0
     */
    this._updateCameraTarget = function (dir, val, flipSignPos, setTarget) {

        let $factor = 1.0;
        switch (dir) {
            case 'x':
                if (flipSignPos) { // Se actualiza el factor dependiendo de la ubicación de la cámara
                    $factor = Math.sign(self._three_camera.position.z);
                }
                val *= $factor;

                // Actualiza el target y la cámara
                if (self._checkCameraTargetCollision(dir, val) && self._checkCameraTargetLimits(dir, -self._worldsize.x, self._worldsize.x) && self.objects_props.camera.targetMoveCamera) {
                    self._three_camera.position.z += val;
                }
                break;
            case 'y':
                if (flipSignPos) { // Se actualiza el factor dependiendo de la ubicación de la cámara
                    $factor = Math.sign(self._three_camera.position.x);
                }
                val *= $factor;

                // Actualiza el target y la cámara
                if (self._checkCameraTargetCollision(dir, val) && self._checkCameraTargetLimits(dir, -self._worldsize.y, self._worldsize.y) && self.objects_props.camera.targetMoveCamera) {
                    self._three_camera.position.x += val;
                }
                break;
            case 'z':
                if (flipSignPos) { // Se actualiza el factor dependiendo de la ubicación de la cámara
                    // noinspection JSSuspiciousNameCombination
                    $factor = Math.sign(self._three_camera.position.y);
                }
                val *= $factor;

                // Actualiza el target y la cámara
                if (self._checkCameraTargetCollision(dir, val) && self._checkCameraTargetLimits(dir, 0.00001, self._worldsize.z) && self.objects_props.camera.targetMoveCamera) {
                    self._three_camera.position.y += val;
                }
                break;
            default: // Se ignoran otras situaciones
                break;
        }
        if (setTarget) self._setCameraTarget();

    };

    /**
     * Renderiza el contenido de Three.js.
     *
     * @function
     * @private
     * @since 0.1.0
     */
    this._render = function () {

        /**
         * Renderiza
         */
        self._renderer.render(self._scene, self._three_camera);

        /**
         * Actualiza los helpers
         */
        for (let i = 0; i < self._helpersUpdate.length; i += 1) {
            self._helpersUpdate[i].update();
        }
        if (notNullUndf(self._gui)) {
            self._guiCameraParams.posx = roundNumber(self._three_camera.position.z, 3);
            self._guiCameraParams.posy = roundNumber(self._three_camera.position.x, 3);
            self._guiCameraParams.posz = roundNumber(self._three_camera.position.y, 3);
            self._guiCameraParams.rotationx = roundNumber(self._three_camera.rotation.z, 3);
            self._guiCameraParams.rotationy = roundNumber(self._three_camera.rotation.x, 3);
            self._guiCameraParams.rotationz = roundNumber(self._three_camera.rotation.y, 3);
        }

    };

    /**
     * Actualiza controles y renderiza.
     *
     * @function
     * @private
     * @since 0.1.0
     */
    this._animateFrame = function () {

        /**
         * Actualiza los controles
         */
        this._controls.update();

        /**
         * Renderiza un cuadro
         */
        this._render();

    };

    /**
     * Thread de animación, dibuja mediante {@link requestAnimationFrame}.
     *
     * @function
     * @private
     * @since 0.1.0
     */
    this._animationThread = function () {
        if (!self._animateThread) return;
        requestAnimationFrame(self.initAnimate);
        self._animateFrame();
    };

    /**
     * Inicia el thread de actualizaciones.
     *
     * @function
     * @protected
     * @since 0.1.0
     */
    this.initAnimate = function () {
        self._animateThread = true;
        self._animationThread();
    };

    /**
     * Añade objetos a la escena.
     *
     * @function
     * @private
     * @since 0.1.0
     */
    this._initWorldObjects = function () {

        /**
         * Añade los helpers
         */
        this._drawHelpers();

        /**
         * Establece el target de la cámara si es que se cambió en initObjectModel
         */
        this._setCameraTarget();

        /**
         * Guarda valores iniciales
         */
        this._saveInitialStatus();

    };

    /**
     * Guarda algunas variables iniciales antes de renderizar, utiliza valores desde initObjectModel.
     *
     * @function
     * @private
     * @since 0.1.0
     */
    this._saveInitialStatus = function () {
        self.objects_props.camera.initialTarget.x = self.objects_props.camera.target.x;
        self.objects_props.camera.initialTarget.y = self.objects_props.camera.target.y;
        self.objects_props.camera.initialTarget.z = self.objects_props.camera.target.z;
    };

    /**
     * Mueve la cámara en dirección paralela al rayo entre la posición de la cámara y el target.
     *
     * @function
     * @private
     * @param {number} direction - Dirección de avance (1, -1)
     * @since 0.1.0
     */
    this._moveParallel = function (direction) {

        /**
         * Calcula el ángulo de avance
         * @type {number}
         */
        let $ang = Math.atan2(self._three_camera.position.x - self.objects_props.camera.target.y, self._three_camera.position.z - self.objects_props.camera.target.x);

        /**
         * Calcula las componentes de avance en x/y
         */
        let $dx, $dy;
        $dx = self.objects_props.camera.targetSpeed.x * Math.cos($ang) * direction;
        $dy = self.objects_props.camera.targetSpeed.y * Math.sin($ang) * direction;

        /**
         * Suma las componentes
         */
        self._updateCameraTarget('x', $dx, false, false);
        self._updateCameraTarget('y', $dy, false, true);

    };

    /**
     * Mueve la cámara en dirección ortogonal al rayo entre la posición de la cámara y el target.
     *
     * @function
     * @private
     * @param {number} direction - Dirección de avance (1, -1)
     * @since 0.1.0
     */
    this._moveOrtho = function (direction) {

        /**
         * Calcula el ángulo de avance
         * @type {number}
         */
        let $ang = Math.atan2(self._three_camera.position.x - self.objects_props.camera.target.y, self._three_camera.position.z - self.objects_props.camera.target.x);
        $ang += Math.PI / 2;

        /**
         * Calcula las componentes de avance en x/y
         */
        let $dx, $dy;
        $dx = self.objects_props.camera.targetSpeed.x * Math.cos($ang) * direction;
        $dy = self.objects_props.camera.targetSpeed.y * Math.sin($ang) * direction;

        /**
         * Suma las componentes, sólo en el segundo cambio se actualiza
         */
        self._updateCameraTarget('x', $dx, false, false);
        self._updateCameraTarget('y', $dy, false, true);

    };

    /**
     * Mueve la cámara de manera vertical en el eje +-Z.
     *
     * @function
     * @private
     * @param {number} direction - Dirección de avance
     * @since 0.1.0
     */
    this._moveVertical = function (direction) {

        /**
         * Mueve la cámara
         */
        self._updateCameraTarget('z', self.objects_props.camera.targetSpeed.z * direction, false, true);

    };

    /**
     * Rota el objetivo de la cámara en torno a la posición de la cámara.
     *
     * @function
     * @private
     * @param {number} direction - Dirección de avance
     * @since 0.1.0
     */
    this._rotateTarget = function (direction) {

        /**
         * Obtiene ángulo
         * @type {number}
         */
        let $ang = Math.PI + Math.atan2(self._three_camera.position.x - self.objects_props.camera.target.y, self._three_camera.position.z - self.objects_props.camera.target.x);

        /**
         * Suma velocidad angular
         */
        $ang += direction * self.objects_props.camera.targetSpeed.angular;

        /**
         * Obtiene radio de giro
         */
        let $r = self._dist2(self._three_camera.position.x - self.objects_props.camera.target.y, self._three_camera.position.z - self.objects_props.camera.target.x);

        /**
         * Obtiene nuevas posiciones
         */
        self.objects_props.camera.target.x = self._three_camera.position.z + $r * Math.cos($ang);
        self.objects_props.camera.target.y = self._three_camera.position.x + $r * Math.sin($ang);

        /**
         *  Verifica límites
         */
        self._checkCameraTargetLimits('x', -self._worldsize.x, self._worldsize.x);
        self._checkCameraTargetLimits('y', -self._worldsize.y, self._worldsize.y);

        /**
         * Actualiza la cámara y renderiza
         */
        self._setCameraTarget();
        self._render();

    };

    /**
     * Mueve la cámara al frente.
     *
     * @function
     * @private
     * @since 0.1.0
     */
    this._moveForward = function () {
        this._moveParallel(-1);
    };

    /**
     * Mueve la cámara hacia atrás.
     *
     * @function
     * @private
     * @since 0.1.0
     */
    this._moveBackward = function () {
        this._moveParallel(1);
    };

    /**
     * Mueve la cámara a la izquierda.
     *
     * @function
     * @private
     * @since 0.1.0
     */
    this._moveLeft = function () {
        this._moveOrtho(-1);
    };

    /**
     * Mueve la cámara a la derecha.
     *
     * @function
     * @private
     * @since 0.1.0
     */
    this._moveRight = function () {
        this._moveOrtho(1);
    };

    /**
     * Mueve la cámara en la coordenada +Z.
     *
     * @function
     * @private
     * @since 0.1.0
     */
    this._moveUp = function () {
        this._moveVertical(1);
    };

    /**
     * Mueve la cámara en la coordenada -Z.
     *
     * @function
     * @private
     */
    this._moveDown = function () {
        this._moveVertical(-1);
    };

    /**
     * Rota la cámara hacia la izquierda.
     *
     * @function
     * @private
     * @since 0.1.0
     */
    this._rotateLeft = function () {
        this._rotateTarget(1);
    };

    /**
     * Rota la cámara hacia la derecha.
     *
     * @function
     * @private
     * @since 0.1.0
     */
    this._rotateRight = function () {
        this._rotateTarget(-1);
    };

    /**
     * Forza el foco en la aplicación.
     *
     * @function
     * @private
     * @since 0.1.0
     */
    this.focus = function () {
        self._canvasParent.trigger('focus'); // Atrapa focus
        self._menuContainer.css('opacity', 0.75); // Saca opacidad al menú
    };

    /**
     * Guarda la referencia al menú.
     *
     * @function
     * @param {JQuery<HTMLElement>} menu - Menú de la aplicación
     */
    this.setMenuPanel = function (menu) {
        self._menuContainer = menu;
    };

    /**
     * Inicia los eventos, se puede reemplazar por otra función.
     *
     * @function
     * @protected
     * @since 0.1.0
     */
    this._initEvents = function () {

        /**
         * Si el div del mapa no ha sido definido se termina la función
         */
        if (isNullUndf(this._canvasParent)) return;

        /**
         * Evento scroll renderiza (orbitControls) en canvas
         */
        this._canvasParent.on(self._eventID.mousewheel, function (e) {
            stopWheelEvent(e);
            e.preventDefault();
            self._animateFrame();
        });

        /**
         * Click izquierdo y derecho desactivan eventos originales en el canvas
         */
        this._canvasParent.on(self._eventID.mousedown, function (e) {
            e.preventDefault();
            self.focus();
            self._animateFrame();
            self._hasMouseOver = true;
            self._hasMousePressed = true;
        });

        /**
         * Ganar-perder foco
         */
        this._canvasParent.on('blur', function () {
            self._menuContainer.css('opacity', 1.00);
        });

        /**
         * Mouse entra sobre el canvas
         */
        this._canvasParent.on(self._eventID.mouseover, function () {
            self._hasMouseOver = true;
        });
        this._canvasParent.on(self._eventID.mouseout, function () {
            self._hasMouseOver = false;
        });

        /**
         * Presionar el mouse
         */
        this._canvasParent.on('mousedown.canvas', function (e) {
            e.preventDefault();
            self._hasMousePressed = true;
        });

        /**
         * Se suelta el click
         */
        this._canvasParent.on('mouseup.canvas', function (e) {
            e.preventDefault();
            self._hasMousePressed = false;
            setTimeout(function () {self._mouseMoveDrag = false;}, 50);
        });


        /**
         * Click izquierdo sobre el canvas, hace zoom (+)
         */
        this._canvasParent.on(self._eventID.click, function (e) {
            e.preventDefault();
            self._zoomIn();
        });

        /**
         * Click derecho sobre el canvas, hace zoom (-)
         */
        this._canvasParent.on(self._eventID.contextmenu, function (e) {
            e.preventDefault();
            self._zoomOut();
        });

        /**
         * Mueve el mouse sobre el canvas
         */
        app_dom.window.on(self._windowMouseMoveEvent, function (e) {

            /**
             * Si se hace esto se pierde la posibilidad de seleccionar texto en toda la aplicación
             */
            // e.preventDefault();
            self._mouseMoveDrag = self._hasMousePressed && true;
            self._drawZoomRegion(e);

        });

        /**
         * Presión de botones sobre el canvas al tener el foco activo
         */
        this._canvasParent.on(self._eventID.keydown, function (e) {
            e.preventDefault(); // Cancela todos los botones por defecto
            e.stopPropagation();

            // Setea como key presionado
            self._hasKeyPressed = true;

            // Si se mantiene presionado el mouse retorna
            if (self._hasMousePressed) return;

            switch (e.which) {
                case 87: // [W] Avanza la cámara
                    self._moveForward();
                    break;
                case 83: // [S] Retrocede la cámara
                    self._moveBackward();
                    break;
                case 65: // [A] Mueve la cámara a la izquierda
                    self._moveLeft();
                    break;
                case 68: // [D] Mueve la cámara a la derecha
                    self._moveRight();
                    break;
                case 38: // [FLECHA ARRIBA] Avanza la cámara
                    self._moveForward();
                    break;
                case 40: // [FLECHA ABAJO] Retrocede la cámara
                    self._moveBackward();
                    break;
                case 37: // [FLECHA IZQUIERDA] Rota el target hacia la izquierda
                    self._rotateLeft();
                    break;
                case 39: // [->] Rota el target hacia la derecha
                    self._rotateRight();
                    break;
                case 81: // [Q] Avanza el target de la cámara en el eje -Z
                    self._moveDown();
                    break;
                case 69: // [E] Avanza el target de la cámara en el eje +Z
                    self._moveUp();
                    break;
                default: // Se ignoran otros input
                    break;
            }
        });
        this._canvasParent.on(self._eventID.keyup, function () {
            self._hasKeyPressed = false;
        });

        /**
         * Ajuste automático de la pantalla
         */
        this._threeResize(true);

    };

    // noinspection JSUnusedGlobalSymbols
    /**
     * Detiene el thread de actualización.
     *
     * @function
     * @protected
     * @since 0.1.0
     */
    this.stopAnimate = function () {
        self._animateThread = false;
    };

    // noinspection JSUnusedGlobalSymbols
    /**
     * Resetea la cámara.
     *
     * @function
     * @private
     * @since 0.1.0
     */
    this._resetCamera = function () {
        self._setInitialCameraPosition();
        self._animateFrame();
    };

    /**
     * Activa/Desactiva un helper.
     *
     * @function
     * @private
     * @since 0.1.0
     */
    this._toggleHelper = function () {
        self._drawHelpers();
        self._animateFrame();
        self.focus();
    };

    // noinspection JSUnusedGlobalSymbols
    /**
     * Oculta/Muestra los ejes.
     *
     * @function
     * @private
     * @since 0.1.0
     */
    this._toggleAxis = function () {
        self.threejs_helpers.axis = !self.threejs_helpers.axis;
        self._toggleHelper();
    };

    // noinspection JSUnusedGlobalSymbols
    /**
     * Oculta/Muestra la grilla.
     *
     * @function
     * @private
     * @since 0.1.0
     */
    this._toggleGrid = function () {
        self.threejs_helpers.grid = !self.threejs_helpers.grid;
        self._toggleHelper();
    };

    // noinspection JSUnusedGlobalSymbols
    /**
     * Oculta/Muestra los límites del mundo.
     *
     * @function
     * @private
     * @since 0.1.0
     */
    this._toggleWorldLimits = function () {
        self.threejs_helpers.worldlimits = !self.threejs_helpers.worldlimits;
        self._toggleHelper();
    };

    // noinspection JSUnusedGlobalSymbols
    /**
     * Oculta/Muestra el objetivo de la cámara.
     *
     * @function
     * @private
     * @since 0.1.0
     */
    this._toggleCameraTarget = function () {
        self.threejs_helpers.cameratarget = !self.threejs_helpers.cameratarget;
        self._toggleHelper();
    };

    // noinspection JSUnusedGlobalSymbols
    /**
     * Oculta/Muestra los planos.
     *
     * @function
     * @private
     * @since 0.1.0
     */
    this._togglePlanes = function () {
        self.threejs_helpers.planes = !self.threejs_helpers.planes;
        self._toggleHelper();
    };

    /**
     * Oculta/Muestra la GUI.
     *
     * @function
     * @private
     * @since 0.1.0
     */
    this._toggleGUI = function () {
        self.threejs_helpers.gui = !self.threejs_helpers.gui;
        if (self.threejs_helpers.gui) {
            self._buildGUI();
        } else {
            self._destroyGUI();
        }
    };

    /**
     * Construye una interfaz gráfica para el render.
     *
     * @function
     * @private
     * @since 0.1.0
     */
    this._buildGUI = function () {

        /**
         * Crea una GUI
         */
        this._gui = new dat.GUI({autoPlace: false});

        /**
         * --------------------------------------------------------------------
         * Carpeta cámara
         * --------------------------------------------------------------------
         */
        let camerafolder = this._gui.addFolder(lang.viewer_3d_gui_camera);
        this._guiCameraParams = {
            fov: self._three_camera.fov,
            far: self._three_camera.far,
            zoom: self._three_camera.zoom,
            maxdistance: self._controls.maxDistance,
            maxpolarangle: self._controls.maxPolarAngle,
            posx: self._three_camera.position.z,
            posy: self._three_camera.position.x,
            posz: self._three_camera.position.y,
            rotationx: Number(self._three_camera.rotation.z) + 0.01,
            rotationy: Number(self._three_camera.rotation.x) + 0.01,
            rotationz: Number(self._three_camera.rotation.y) + 0.01
        };
        camerafolder.add(this._guiCameraParams, 'fov', 1, 179).onChange(function (val) {
            self._three_camera.fov = val;
            self._three_camera.updateProjectionMatrix();
            self._animateFrame();
        });
        camerafolder.add(this._guiCameraParams, 'far', 100, 10000).onChange(function (val) {
            self._three_camera.far = val;
            self._three_camera.updateProjectionMatrix();
            self._animateFrame();
        });
        camerafolder.add(this._guiCameraParams, 'zoom', 0.1, 10).onChange(function (val) {
            self._three_camera.zoom = val;
            self._three_camera.updateProjectionMatrix();
            self._animateFrame();
        });
        camerafolder.add(this._guiCameraParams, 'maxdistance', 100, 5 * self._worldsize.diagl).onChange(function (val) {
            self._controls.maxDistance = val;
            self._animateFrame();
        });
        camerafolder.add(this._guiCameraParams, 'maxpolarangle', 0, Math.PI).onChange(function (val) {
            self._controls.maxPolarAngle = val;
            self._animateFrame();
        });
        camerafolder.add(this._guiCameraParams, 'posx', 1, 2 * self._worldsize.diagl).onChange(function (val) {
            self._three_camera.position.z = val;
            self._animateFrame();
        }).listen();
        camerafolder.add(this._guiCameraParams, 'posy', 1, 2 * self._worldsize.diagl).onChange(function (val) {
            self._three_camera.position.x = val;
            self._animateFrame();
        }).listen();
        camerafolder.add(this._guiCameraParams, 'posz', 1, 2 * self._worldsize.diagl).onChange(function (val) {
            self._three_camera.position.y = val;
            self._animateFrame();
        }).listen();
        camerafolder.add(this._guiCameraParams, 'rotationx', -Math.PI, Math.PI).onChange(function (val) {
            self._three_camera.rotation.z = val;
            self._animateFrame();
        }).listen();
        camerafolder.add(this._guiCameraParams, 'rotationy', -Math.PI, Math.PI).onChange(function (val) {
            self._three_camera.rotation.x = val;
            self._animateFrame();
        }).listen();
        camerafolder.add(this._guiCameraParams, 'rotationz', -Math.PI / 2, Math.PI / 2).onChange(function (val) {
            self._three_camera.rotation.y = val;
            self._animateFrame();
        }).listen();

        /**
         * Añade la GUI al div
         */
        $('#' + this._guiID).append(this._gui.domElement);

        /**
         * Inicia la GUI cerrada
         */
        if (this.threejs_helpers.guistartclosed) {
            this._gui.close();
        }

    };

    /**
     * Destruye la GUI.
     *
     * @function
     * @private
     * @since 0.1.0
     */
    this._destroyGUI = function () {
        if (notNullUndf(self._gui)) {
            self._gui.destroy();
            self._gui = null;
            $('#' + self._guiID).empty();
        }
    };

    // noinspection JSUnusedGlobalSymbols
    /**
     * Añade visualizador de FPS.
     *
     * @function
     * @private
     * @since 0.1.0
     */
    this._toggleFPSMeter = function () {

        /**
         * Si no se ha activado retorna
         */
        if (!self.threejs_helpers.fpsmeter) return;

        /**
         * Si no se ha creado el FPS
         */
        if (isNullUndf(self._helperInstances.fpsmeter)) {
            let stats = new Stats();
            self._canvasParent.append(stats.dom);
            requestAnimationFrame(function loop() {
                stats.update();
                requestAnimationFrame(loop);
            });
            self._helperInstances.fpsmeter = stats;
        }

        /**
         * Si se creó se elimina del DOM (toggle)
         */
        else {
            self._helperInstances.fpsmeter.dom.remove();
            self._helperInstances.fpsmeter = null;
        }

    };

    /**
     * Dibuja los helpers de Three.js según configuración.
     *
     * @function
     * @private
     * @since 0.1.0
     */
    this._drawHelpers = function () {

        /**
         * Variable local helper
         */
        let helper;

        /**
         * --------------------------------------------------------------------
         * Dibuja ejes
         * --------------------------------------------------------------------
         */
        if (this.threejs_helpers.axis) {
            if (isNullUndf(this._helperInstances.axis)) {
                let $helpersize = Math.min(self._worldsize.x, self._worldsize.y, self._worldsize.z) * self.threejs_helpers.axissize;
                helper = new THREE.AxesHelper($helpersize);
                self._addMeshToScene(helper, this._globals.helper, false);
                // noinspection JSValidateTypes
                this._helperInstances.axis = helper; // Añade la instancia
            }
        } else { // Se elimina el helper si es que se instanció
            if (notNullUndf(this._helperInstances.axis)) {
                self._scene.remove(this._helperInstances.axis);
            }
            this._helperInstances.axis = null;
        }


        /**
         * --------------------------------------------------------------------
         * Dibuja planos x, y, z
         * --------------------------------------------------------------------
         */
        if (this.threejs_helpers.planes) {
            if (isNullUndf(this._helperInstances.planes)) {
                let $planes = [];

                // Colores de los planos
                let materialx = new THREE.MeshBasicMaterial({
                    color: self.threejs_helpers.planecolorx,
                    opacity: self.threejs_helpers.planeopacity,
                });
                let materialy = new THREE.MeshBasicMaterial({
                    color: self.threejs_helpers.planecolory,
                    opacity: self.threejs_helpers.planeopacity,
                });
                let materialz = new THREE.MeshBasicMaterial({
                    color: self.threejs_helpers.planecolorz,
                    opacity: self.threejs_helpers.planeopacity,
                });
                materialx.wireframe = true;
                materialx.aoMapIntensity = self.threejs_helpers.planeopacity;
                materialy.wireframe = true;
                materialy.aoMapIntensity = self.threejs_helpers.planeopacity;
                materialz.wireframe = true;
                materialz.aoMapIntensity = self.threejs_helpers.planeopacity;

                // Geometrías de los plannos
                let geometry, plane;

                // Plano x
                geometry = new THREE.Geometry();
                geometry.vertices.push(
                    this._newThreePoint(this._worldsize.x, 0, 0),
                    this._newThreePoint(-this._worldsize.x, 0, 0),
                    this._newThreePoint(-this._worldsize.x, 0, this._worldsize.z),
                    this._newThreePoint(this._worldsize.x, 0, this._worldsize.z)
                );
                geometry.faces.push(new THREE.Face3(0, 1, 2));
                geometry.faces.push(new THREE.Face3(0, 2, 3));
                plane = new THREE.Mesh(geometry, materialx);
                plane.position.y = 0;
                self._addMeshToScene(plane, this._globals.helper, false);
                $planes.push(plane);

                // Plano y
                geometry = new THREE.Geometry();
                geometry.vertices.push(
                    this._newThreePoint(0, -this._worldsize.y, 0),
                    this._newThreePoint(0, this._worldsize.y, 0),
                    this._newThreePoint(0, this._worldsize.y, this._worldsize.z),
                    this._newThreePoint(0, -this._worldsize.y, this._worldsize.z)
                );
                geometry.faces.push(new THREE.Face3(0, 1, 2));
                geometry.faces.push(new THREE.Face3(0, 2, 3));
                plane = new THREE.Mesh(geometry, materialy);
                plane.position.y = 0;
                self._addMeshToScene(plane, this._globals.helper, false);
                $planes.push(plane);

                // Plano z
                geometry = new THREE.Geometry();
                geometry.vertices.push(
                    this._newThreePoint(this._worldsize.x, this._worldsize.y, 0),
                    this._newThreePoint(-this._worldsize.x, this._worldsize.y, 0),
                    this._newThreePoint(-this._worldsize.x, -this._worldsize.y, 0),
                    this._newThreePoint(this._worldsize.x, -this._worldsize.y, 0)
                );
                geometry.faces.push(new THREE.Face3(0, 1, 2));
                geometry.faces.push(new THREE.Face3(0, 2, 3));
                plane = new THREE.Mesh(geometry, materialz);
                plane.position.y = 0;
                self._addMeshToScene(plane, this._globals.helper, false);
                $planes.push(plane);

                // noinspection JSValidateTypes
                this._helperInstances.planes = $planes; // Añade instancia
            }
        } else { // Se elimina el helper si es que se instanció
            if (notNullUndf(this._helperInstances.planes)) {
                let $planes = this._helperInstances.planes;
                for (let i = 0; i < $planes.length; i += 1) {
                    this._scene.remove($planes[i]);
                }
            }
            this._helperInstances.planes = null;
        }

        /**
         * --------------------------------------------------------------------
         * Dibuja grilla en el plano
         * --------------------------------------------------------------------
         */
        if (this.threejs_helpers.grid) {
            if (isNullUndf(this._helperInstances.grid)) {
                let $mapsize = 2 * Math.max(this._worldsize.x, this._worldsize.y);
                let $griddist = Math.floor(2 / this.threejs_helpers.griddist);
                helper = new THREE.GridHelper($mapsize, $griddist);
                helper.position.y = 0;
                helper.material.opacity = 0.1;
                helper.material.transparent = true;
                self._addMeshToScene(helper, this._globals.helper, false);
                // noinspection JSValidateTypes
                this._helperInstances.grid = helper; // Añade la instancia
            }
        } else { // Se elimina el helper si es que se instanció
            if (notNullUndf(this._helperInstances.grid)) {
                this._scene.remove(this._helperInstances.grid);
            }
            this._helperInstances.grid = null;
        }

        /**
         * --------------------------------------------------------------------
         * Dibuja límites del mapa
         * --------------------------------------------------------------------
         */
        if (this.threejs_helpers.worldlimits) {
            if (isNullUndf(this._helperInstances.worldlimits)) {
                let material = new THREE.MeshBasicMaterial({
                    color: self.threejs_helpers.worldlimitscolor,
                    opacity: self.threejs_helpers.planeopacity
                });
                material.wireframe = true;
                material.aoMapIntensity = 0.5;
                let geometry = new THREE.Geometry();
                geometry.vertices.push(
                    // Plano +x
                    this._newThreePoint(this._worldsize.x, -this._worldsize.y, 0),
                    this._newThreePoint(this._worldsize.x, this._worldsize.y, 0),
                    this._newThreePoint(this._worldsize.x, this._worldsize.y, this._worldsize.z),
                    this._newThreePoint(this._worldsize.x, -this._worldsize.y, this._worldsize.z),

                    // Plano +y
                    this._newThreePoint(this._worldsize.x, this._worldsize.y, 0),
                    this._newThreePoint(-this._worldsize.x, this._worldsize.y, 0),
                    this._newThreePoint(-this._worldsize.x, this._worldsize.y, this._worldsize.z),
                    this._newThreePoint(this._worldsize.x, this._worldsize.y, this._worldsize.z),

                    // Plano -x
                    this._newThreePoint(-this._worldsize.x, -this._worldsize.y, 0),
                    this._newThreePoint(-this._worldsize.x, this._worldsize.y, 0),
                    this._newThreePoint(-this._worldsize.x, this._worldsize.y, this._worldsize.z),
                    this._newThreePoint(-this._worldsize.x, -this._worldsize.y, this._worldsize.z),

                    // Plano -y
                    this._newThreePoint(this._worldsize.x, -this._worldsize.y, 0),
                    this._newThreePoint(-this._worldsize.x, -this._worldsize.y, 0),
                    this._newThreePoint(-this._worldsize.x, -this._worldsize.y, this._worldsize.z),
                    this._newThreePoint(this._worldsize.x, -this._worldsize.y, this._worldsize.z),

                    // Plano z
                    this._newThreePoint(this._worldsize.x, -this._worldsize.y, this._worldsize.z),
                    this._newThreePoint(this._worldsize.x, this._worldsize.y, this._worldsize.z),
                    this._newThreePoint(-this._worldsize.x, this._worldsize.y, this._worldsize.z),
                    this._newThreePoint(-this._worldsize.x, -this._worldsize.y, this._worldsize.z)
                );
                for (let j = 0; j <= 4; j += 1) {
                    geometry.faces.push(new THREE.Face3(4 * j, 4 * j + 1, 4 * j + 2));
                    geometry.faces.push(new THREE.Face3(4 * j, 4 * j + 2, 4 * j + 3));
                }
                let cube = new THREE.Mesh(geometry, material);
                cube.position.y = 0;
                self._addMeshToScene(cube, this._globals.helper, false);
                // noinspection JSValidateTypes
                this._helperInstances.worldlimits = cube; // Añade la instancia
            }
        } else { // Se elimina el helper si es que se instanció
            if (notNullUndf(this._helperInstances.worldlimits)) {
                this._scene.remove(this._helperInstances.worldlimits);
            }
            this._helperInstances.worldlimits = null;
        }

        /**
         * --------------------------------------------------------------------
         * Dibuja el objetivo de la cámara
         * --------------------------------------------------------------------
         */
        if (this.threejs_helpers.cameratarget) {
            if (isNullUndf(this._helperInstances.cameratarget)) {
                let $targetsize = Math.min(self._worldsize.x, self._worldsize.y, self._worldsize.z) * self.threejs_helpers.cameratargetsize / 2;
                let sphereGeometry = new THREE.SphereGeometry($targetsize, 16, 8);
                let wireframeMaterial = new THREE.MeshBasicMaterial(
                    {
                        color: self.threejs_helpers.cameratargetcolor,
                        transparent: true,
                        wireframe: true,
                    });
                let mesh = new THREE.Mesh(sphereGeometry, wireframeMaterial);
                let $update = function () {
                    // noinspection JSSuspiciousNameCombination
                    mesh.position.x = self.objects_props.camera.target.y;
                    mesh.position.y = self.objects_props.camera.target.z;
                    mesh.position.z = self.objects_props.camera.target.x;
                };
                $update();
                self._addMeshToScene(mesh, this._globals.helper, false);
                this._helpersUpdate.push({
                    update: $update,
                });

                // noinspection JSValidateTypes
                this._helperInstances.cameratarget = { // Añade la instancia
                    update: this._helpersUpdate.length - 1,
                    obj: mesh
                }
            }
        } else { // Se elimina el helper si es que se instanció
            if (notNullUndf(this._helperInstances.cameratarget)) {
                this._helpersUpdate.splice(this._helperInstances.cameratarget.update, 1);
                this._scene.remove(this._helperInstances.cameratarget.obj);
            }
            this._helperInstances.cameratarget = null;
        }

    };

    /**
     * Añade un mesh a la escena.
     *
     * @function
     * @private
     * @param {Object3D} mesh - Mesh
     * @param {string} name - Nombre del objeto
     * @param {boolean=} collaidable - Indica si el objeto es colisionable o no
     * @since 0.1.0
     */
    this._addMeshToScene = function (mesh, name, collaidable) {

        /**
         * Se aplican propiedades
         */
        mesh.name = name;

        /**
         * Se añade el mesh a la escena
         */
        self._scene.add(mesh);

        /**
         * Material colisionable o no
         */
        if (collaidable) self._addToCollidable(mesh);

    };

    /**
     * Añade un mesh a la lista de objetos colisionables.
     *
     * @function
     * @private
     * @param {object} mesh - Mesh con características colisionables
     * @since 0.1.0
     */
    this._addToCollidable = function (mesh) {
        this._collaidableMeshes.push(mesh);
    };

    /**
     * Inserta un punto en (x,y,z).
     *
     * @function
     * @private
     * @param {number} x - Coordenada en x
     * @param {number} y - Coordenada en y
     * @param {number} z - Coordenada en z
     * @return {Vector3}
     * @since 0.1.0
     */
    this._newThreePoint = function (x, y, z) {
        return new THREE.Vector3(y, z, x);
    };


    /**
     * ------------------------------------------------------------------------
     * Funciones visualizador del shader
     * ------------------------------------------------------------------------
     */

    /**
     * Inicia el visualizador.
     *
     * @function
     * @public
     * @param {string} parentElement - Contenedor del visualizador
     * @since 0.1.3
     */
    this.init = function (parentElement) {
        self.id = parentElement;
        self._canvasParent = $(parentElement);
        self._initThree();
        self._initWorldObjects();
        self._initEvents();
        self._animateFrame();
    };

    /**
     * Ejecuta el shader seleccionado desde el menú.
     *
     * @function
     * @public
     * @since 0.1.6
     */
    this.loadSelectedShader = function () {

        /**
         * Inicia capa de carga
         */
        loadingHandler(true);

        /**
         * Obtiene los archivos del shader
         */
        let $shader = self._shaderSelector.val();
        $shader = shader_lib[$shader];
        app_console.info(lang.loading_shader.format($shader.name));

        /**
         * Modifica los parámetros de la constante de julia (si existe)
         */
        if (notNullUndf($shader['julia'])) {
            self._juliaInputs.re.val($shader['julia'].re);
            self._shaderObject.julia.re = $shader['julia'].re;
            self._juliaInputs.im.val($shader['julia'].im);
            self._shaderObject.julia.im = $shader['julia'].im;
        }

        /**
         * Carga el shader
         */
        load_shader($shader.files.vert, $shader.files.frag, self._loadSelectedShaderHandler);

    };

    /**
     * Función que recibe los datos cargados de los shaders y ejecuta la función.
     * @function
     * @private
     * @param {object} data - Datos descargados desde ajax
     * @since 0.2.1
     */
    this._loadSelectedShaderHandler = function (data) {

        /**
         * Guarda los datos al shader
         */
        self._shaderObject.datashader.f = data.fragment;
        self._shaderObject.datashader.v = data.vertex;

        /**
         * Inicia el shader
         */
        self._initShaderObject();

        /**
         * Desactiva capa de carga
         */
        loadingHandler(false);

    };

    /**
     * Define el selector del shader.
     *
     * @function
     * @public
     * @param {JQuery<HTMLElement>, HTMLElement} selector - Selector del shader
     * @since 0.1.6
     */
    this.setShaderSelector = function (selector) {
        self._shaderSelector = selector;
    };

    /**
     * Inicia el objeto de dibujo del shader.
     *
     * @function
     * @private
     * @since 0.1.6
     */
    this._initShaderObject = function () {

        /**
         * Si el objeto ya existía se elimina
         */
        if (notNullUndf(self._shaderObject.mesh)) {
            this._scene.remove(self._shaderObject.mesh);
        }
        if (notNullUndf(self._bound.mesh)) {
            this._scene.remove(self._bound.mesh);
        }

        /**
         * Crea la geometría
         */
        self._shaderObject.geometry = new THREE.BufferGeometry();

        /**
         * Inicia los valores iniciales del shader complejo
         */
        self._shaderObject.vertex.zi = new Float32Array(6);
        self._shaderObject.vertex.zr = new Float32Array(6);

        /**
         * Dibuja la figura
         */
        let vertices = new Float32Array(18);
        vertices[0] = -1.0;
        vertices[1] = -1.0;
        vertices[2] = self._shaderObject.plotz;

        vertices[3] = 1.0;
        vertices[4] = 1.0;
        vertices[5] = self._shaderObject.plotz;

        vertices[6] = -1.0;
        vertices[7] = 1.0;
        vertices[8] = self._shaderObject.plotz;

        // Second triangle.
        vertices[9] = -1.0;
        vertices[10] = -1.0;
        vertices[11] = self._shaderObject.plotz;

        vertices[12] = 1.0;
        vertices[13] = 1.0;
        vertices[14] = self._shaderObject.plotz;

        vertices[15] = 1.0;
        vertices[16] = -1.0;
        vertices[17] = self._shaderObject.plotz;

        /**
         * Crea el material
         */
        try {
            self._shaderObject.material = new THREE.ShaderMaterial({
                'fragmentShader': self._shaderObject.datashader.f,
                'side': THREE.DoubleSide,
                'uniforms': {
                    'r_min': {
                        'type': 'f',
                        'value': self._shaderObject.color.r_min,
                    },
                    'r_max': {
                        'type': 'f',
                        'value': self._shaderObject.color.r_max,
                    },
                    'g_min': {
                        'type': 'f',
                        'value': self._shaderObject.color.g_min,
                    },
                    'g_max': {
                        'type': 'f',
                        'value': self._shaderObject.color.g_max,
                    },
                    'b_min': {
                        'type': 'f',
                        'value': self._shaderObject.color.b_min,
                    },
                    'b_max': {
                        'type': 'f',
                        'value': self._shaderObject.color.b_max,
                    },
                    'max_iterations': {
                        'type': 'i',
                        'value': self._shaderObject.iters,
                    },
                    'j_im': {
                        'type': 'f',
                        'value': self._shaderObject.julia.im,
                    },
                    'j_re': {
                        'type': 'f',
                        'value': self._shaderObject.julia.re,
                    },
                },
                'vertexShader': self._shaderObject.datashader.v,
            });
        } catch ($e) {
            app_dialog.error(lang.error_shader_compile, lang.error_shader_compile_info);
        } finally {
        }

        /**
         * Crea la geometría
         * @type {BufferGeometry}
         */
        self._shaderObject.geometry = new THREE.BufferGeometry();
        self._shaderObject.geometry.addAttribute('position', new THREE.BufferAttribute(vertices, 3));
        self._shaderObject.geometry.addAttribute('vertex_z_r', new THREE.BufferAttribute(self._shaderObject.vertex.zr, 1));
        self._shaderObject.geometry.addAttribute('vertex_z_i', new THREE.BufferAttribute(self._shaderObject.vertex.zi, 1));

        // Rota la geometría para dejarla coplanar
        self._shaderObject.geometry.rotateX(-Math.PI / 2);
        self._shaderObject.geometry.rotateY(-Math.PI / 2);

        /**
         * Crea el mesh
         * @type {Mesh}
         */
        self._shaderObject.mesh = new THREE.Mesh(
            self._shaderObject.geometry,
            self._shaderObject.material
        );
        self._addMeshToScene(self._shaderObject.mesh, self._globals.shader, true);

        /**
         * Genera el mesh del recuadro de zoom
         */
        let material = new THREE.LineBasicMaterial({color: self._bound.linecolor, transparent: true});
        let geometry; // Geometrías de las líneas

        geometry = new THREE.Geometry();
        geometry.vertices.push(
            this._newThreePoint(-this._bound.zoomfactor * this._worldsize.x,
                -this._bound.zoomfactor * this._worldsize.y, this._bound.linez),
            this._newThreePoint(this._bound.zoomfactor * this._worldsize.x,
                -this._bound.zoomfactor * this._worldsize.y, this._bound.linez),
            this._newThreePoint(this._bound.zoomfactor * this._worldsize.x,
                this._bound.zoomfactor * this._worldsize.y, this._bound.linez),
            this._newThreePoint(-this._bound.zoomfactor * this._worldsize.x,
                this._bound.zoomfactor * this._worldsize.y, this._bound.linez),
            this._newThreePoint(-this._bound.zoomfactor * this._worldsize.x,
                -this._bound.zoomfactor * this._worldsize.y, this._bound.linez)
        );
        self._bound.mesh = new THREE.Line(geometry, material);
        self._addMeshToScene(self._bound.mesh, this._globals.helper, false);

        /**
         * Calcula los límites
         */
        self._bound.max_zr = this._worldsize.x * (1 - this._bound.zoomfactor);
        self._bound.max_zi = this._worldsize.y * (1 - this._bound.zoomfactor);
        self._bound.range = this._shaderObject.init.range;

        /**
         * Ajusta el zoom
         */
        self._updateBoundZoom(0, 0);
        /**
         * Dibuja de manera inicial
         */
        self._setPlotBounds(self._shaderObject.init.zi, self._shaderObject.init.zr, self._shaderObject.init.range);

    };

    /**
     * Define los bordes del shader y ejecuta un nuevo cuadro.
     *
     * @function
     * @private
     * @param {number} z_i - Valor medio de Zi
     * @param {number} z_r - Valor medio de zr
     * @param {number} range - Rango del gráfico
     * @since 0.1.6
     */
    this._setPlotBounds = function (z_r, z_i, range) {

        /**
         * Obtiene los atributos del shader para modificarlos
         */
        let attrib_z_r = self._shaderObject.mesh.geometry.attributes.vertex_z_r.array;
        let attrib_z_i = self._shaderObject.mesh.geometry.attributes.vertex_z_i.array;

        /**
         * Primer triángulo
         */
        attrib_z_r[0] = z_r - range;
        attrib_z_i[0] = z_i - range;

        attrib_z_r[1] = z_r + range;
        attrib_z_i[1] = z_i + range;

        attrib_z_r[2] = z_r - range;
        attrib_z_i[2] = z_i + range;

        /**
         * Segundo triángulo
         */
        attrib_z_r[3] = z_r - range;
        attrib_z_i[3] = z_i - range;

        attrib_z_r[4] = z_r + range;
        attrib_z_i[4] = z_i + range;

        attrib_z_r[5] = z_r + range;
        attrib_z_i[5] = z_i - range;

        /**
         * Guarda el punto medio
         */
        self._bound.mid_zi = z_i;
        self._bound.mid_zr = z_r;

        /**
         * Anima un nuevo cuadro
         */
        self._shaderObject.mesh.geometry.attributes.vertex_z_r.needsUpdate = true;
        self._shaderObject.mesh.geometry.attributes.vertex_z_i.needsUpdate = true;
        this._printCoords();
        this._animateFrame();

    };

    /**
     * Dibuja la región del zoom.
     *
     * @function
     * @param {object} e - Evento
     * @private
     * @since 0.2.1
     */
    this._drawZoomRegion = function (e) {

        /**
         * Se define como no intersectado
         */
        self._hasMouseIntersectPlane = false;

        /**
         * Si el mouse no está encima entonces retorna
         */
        if (!self._hasMouseOver || self._hasMousePressed) {
            self._hideZoomPlane();
            return;
        }

        /**
         * Obtiene dimensiones generales
         */
        let $offset = self._canvasParent.offset();
        let $wh = self._canvasParent.innerHeight();
        let $ww = self._canvasParent.innerWidth();

        /**
         * Posición del mouse dentro de la ventana
         */
        let $x = e.clientX - $offset.left + app_dom.window.scrollLeft();
        let $y = e.clientY - $offset.top + app_dom.window.scrollTop();

        /**
         * Actualiza el mouse
         */
        self._mouse.x = (($x / $ww) * 2) - 1;
        self._mouse.y = (-($y / $wh) * 2) + 1;

        /**
         * Se aplica raycasting, intersecta y busca el objeto intersectado
         */
        self._raycaster.setFromCamera(self._mouse, self._three_camera);
        let intersects = self._raycaster.intersectObjects(self._scene.children, false);

        /**
         * Se calculan resultados
         */
        if (!isNullUndf(intersects) || intersects.length === 0) {

            /**
             * Se busca el primer punto del plano del shader, resultados ordenados por distancia
             */
            let shaderIntersect = -1;
            for (let j = 0; j < intersects.length; j += 1) {
                if (intersects[j].object.name === self._globals.shader) {
                    shaderIntersect = j;
                    break;
                }
            }

            /**
             * Si no se encontró
             */
            if (shaderIntersect === -1) {
                self._hideZoomPlane();
                return;
            }

            /**
             * Obtiene las coordenadas reales e imaginarias (eje x, y)
             */
            let zr, zi;
            zr = intersects[shaderIntersect].point.z;
            zi = intersects[shaderIntersect].point.x;
            self._hasMouseIntersectPlane = true;

            /**
             * Ajusta el recuadro del zoom
             */
            this._updateBoundZoom(zr, zi);
            self._showZoomPlane();

        } else {
            self._hideZoomPlane();
        }

    };

    /**
     * Oculta el plano de zoom
     *
     * @function
     * @private
     * @since 0.4.1
     */
    this._hideZoomPlane = function () {
        if (self._bound.hide) return;
        self._bound.hide = true;
        self._hasMouseIntersectPlane = false;
        if (isNullUndf(self._bound.mesh)) return;
        self._bound.mesh.material.opacity = 0.0;
        this._animateFrame();
        app_console.info(lang.viewer_hide_zoom);
    };

    /**
     * Muestra el plano de zoom
     *
     * @function
     * @private
     * @since 0.4.1
     */
    this._showZoomPlane = function () {
        if (!self._bound.hide) return;
        self._bound.hide = false;
        if (isNullUndf(self._bound.mesh)) return;
        self._bound.mesh.material.opacity = 1.0;
        this._animateFrame();
        app_console.info(lang.viewer_show_zoom);
    };

    /**
     * Ajusta el recuadro de zoom.
     *
     * @function
     * @param {number} zr - Coordenada real
     * @param {number} zi - Coordenada imaginaria
     * @private
     * @since 0.2.1
     */
    this._updateBoundZoom = function (zr, zi) {

        /**
         * Ajusta los máximos
         */
        if (zr < 0) {
            zr = Math.max(zr, -self._bound.max_zr);
        } else {
            zr = Math.min(zr, self._bound.max_zr);
        }
        if (zi < 0) {
            zi = Math.max(zi, -self._bound.max_zi);
        } else {
            zi = Math.min(zi, self._bound.max_zi);
        }

        /**
         * Mueve al recuadro
         */
        this._bound.mesh.position.z = zr;
        this._bound.mesh.position.x = zi;

        /**
         * Actualiza los límites
         */
        this._bound.zi = zi;
        this._bound.zr = zr;

        this._animateFrame();

    };

    /**
     * Hace un zoom (+), ajusta el recuadro y redibuja.
     *
     * @function
     * @private
     * @since 0.2.2
     */
    this._zoomIn = function () {

        /**
         * Si se tiene el mouse presionado retorna
         */
        if (self._mouseMoveDrag || !self._hasMouseOver) return;

        /**
         * Calcula el nuevo punto medio
         */
        let mid_zr = self._bound.mid_zr + this._bound.zr * this._bound.range;
        let mid_zi = self._bound.mid_zi + this._bound.zi * this._bound.range;

        /**
         * Aumenta el zoom del rango
         */
        this._bound.range *= this._bound.zoomfactor;

        /**
         * Redibuja
         */
        this._setPlotBounds(mid_zr, mid_zi, this._bound.range);

    };

    /**
     * Hace un zoom (-), ajusta el recuadro y redibuja.
     *
     * @function
     * @private
     * @since 0.2.2
     */
    this._zoomOut = function () {

        /**
         * Si se tiene el mouse presionado retorna
         */
        if (self._mouseMoveDrag || !self._hasMouseOver) return;

        /**
         * Aumenta el zoom del rango
         */
        this._bound.range /= this._bound.zoomfactor;
        this._bound.range = Math.min(this._shaderObject.init.range, this._bound.range);

        if (this._bound.range === this._shaderObject.init.range) {
            self._setPlotBounds(self._shaderObject.init.zi, self._shaderObject.init.zr, self._shaderObject.init.range);
            return;
        }

        /**
         * Calcula el nuevo punto medio
         */
        let mid_zr = self._bound.mid_zr - this._bound.zr * this._bound.range;
        let mid_zi = self._bound.mid_zi - this._bound.zi * this._bound.range;

        /**
         * Redibuja
         */
        this._setPlotBounds(mid_zr, mid_zi, this._bound.range);

    };

    /**
     * Escribe los datos del plano complejo en el menú.
     *
     * @function
     * @private
     * @since 0.2.2
     */
    this._printCoords = function () {

        /**
         * Obtiene los atributos
         */
        let z_r = this._shaderObject.mesh.geometry.attributes.vertex_z_r.array;
        let z_i = this._shaderObject.mesh.geometry.attributes.vertex_z_i.array;

        /**
         * Escribe los datos
         */
        let $round = 12;
        this._infoID.minzr.text(roundNumber(z_r[0], $round));
        this._infoID.maxzr.text(roundNumber(z_r[1], $round));
        this._infoID.minir.text(roundNumber(z_i[0], $round));
        this._infoID.maxir.text(roundNumber(z_i[1], $round));
        this._infoID.ln.text(roundNumber(self._bound.range, $round));
        this._infoID.zoomlevel.text(roundNumber(self._shaderObject.init.range / self._bound.range, 0));

    };

    /**
     * Define la ventana de información del shader en el plano complejo.
     *
     * @function
     * @param {JQuery<HTMLElement> | HTMLElement} window - Ventana de información
     * @since 0.2.2
     */
    this.setComplexInfoWindow = function (window) {

        /**
         * Limpia la ventana
         */
        window.empty();

        /**
         * Escribe los campos
         */
        let $rmax = generateID();
        let $rmin = generateID();
        let $imax = generateID();
        let $imin = generateID();
        let $length = generateID();
        let $zoomlevel = generateID();

        window.append('Re(z): <span id="{0}"></span>, <span id="{1}"></span><br>Im(z): <span id="{2}"></span>, <span id="{3}"></span><br>{5}: <span id="{4}"></span><br>{7}: <span id="{6}"></span>'.format($rmin, $rmax, $imin, $imax, $length, lang.shader_data_length, $zoomlevel, lang.shader_zoom_count));

        /**
         * Guarda los campos
         */
        this._infoID.minzr = $('#' + $rmin);
        this._infoID.maxzr = $('#' + $rmax);
        this._infoID.minir = $('#' + $imin);
        this._infoID.maxir = $('#' + $imax);
        this._infoID.ln = $('#' + $length);
        this._infoID.zoomlevel = $('#' + $zoomlevel);

    };

    /**
     * Actualiza un color.
     *
     * @function
     * @param {string} color - Nombre del color
     * @param {number} value - Valor del color
     * @since 0.2.5
     */
    this.updateShaderColor = function (color, value) {
        this._shaderObject.color[color] = value;
        this._shaderObject.material.uniforms[color].value = value;
        this._animateFrame();
    };

    /**
     * Retorna el color inicial del shader.
     *
     * @function
     * @param {string} color - Nombre del color
     * @returns {number}
     * @since 0.2.5
     */
    this.getShaderColor = function (color) {
        return this._shaderObject.color[color];
    };

    /**
     * Modifica el número de iteraciones del shader.
     *
     * @function
     * @param {number} value - Número
     */
    this.updateItersNumber = function (value) {
        // noinspection JSCheckFunctionSignatures
        value = parseInt(value);
        value = Math.max(0, Math.min(value, 65536));
        this._shaderObject.material.uniforms.max_iterations.value = value;
        this._shaderObject.iters = value;
        this._animateFrame();
    };

    /**
     * Retorna el valor del número de iteraciones.
     *
     * @function
     * @returns {number}
     */
    this.getMaxIterations = function () {
        return this._shaderObject.iters;
    };

    /**
     * Retorna la constante compleja de julia
     *
     * @function
     * @return {number[]}
     */
    this.getJuliaConstant = function () {
        return [self._shaderObject.julia.re, self._shaderObject.julia.im];
    };

    /**
     * Define el valor de la constante de julia.
     *
     * @function
     * @param {string} m - Indica si es real o imaginario
     * @param {number} val - Valor
     */
    this.updateJuliaConstant = function (m, val) {

        // noinspection JSCheckFunctionSignatures
        /**
         * Convierte a flotante
         */
        val = parseFloat(val);

        /**
         * Modifica el valor en el shader
         */
        if (m === 're') {
            this._shaderObject.material.uniforms.j_re.value = val;
            this._shaderObject.julia.re = val;
        } else if (m === 'im') {
            this._shaderObject.material.uniforms.j_im.value = val;
            this._shaderObject.julia.im = val;
        }

        /**
         * Redibuja
         */
        this._animateFrame();

    };

    /**
     * Define los input de los valores de julia.
     *
     * @function
     * @param {JQuery<HTMLElement>} re - Input real
     * @param {JQuery<HTMLElement>} im - Input real
     * @since 0.3.0
     */
    this.setJuliaInputs = function (re, im) {
        this._juliaInputs.re = re;
        this._juliaInputs.im = im;
    };

}