(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(["exports", "backbone.radio", "marionette"], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports, require("backbone.radio"), require("marionette"));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports, global.backbone, global.marionette);
        global.index = mod.exports;
    }
})(this, function (exports, _backbone, _marionette) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.View = exports.Component = undefined;
    exports.on = on;

    var _backbone2 = _interopRequireDefault(_backbone);

    var _marionette2 = _interopRequireDefault(_marionette);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    function _possibleConstructorReturn(self, call) {
        if (!self) {
            throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        }

        return call && (typeof call === "object" || typeof call === "function") ? call : self;
    }

    function _inherits(subClass, superClass) {
        if (typeof superClass !== "function" && superClass !== null) {
            throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
        }

        subClass.prototype = Object.create(superClass && superClass.prototype, {
            constructor: {
                value: subClass,
                enumerable: false,
                writable: true,
                configurable: true
            }
        });
        if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
    }

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var _createClass = function () {
        function defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || false;
                descriptor.configurable = true;
                if ("value" in descriptor) descriptor.writable = true;
                Object.defineProperty(target, descriptor.key, descriptor);
            }
        }

        return function (Constructor, protoProps, staticProps) {
            if (protoProps) defineProperties(Constructor.prototype, protoProps);
            if (staticProps) defineProperties(Constructor, staticProps);
            return Constructor;
        };
    }();

    /**
     * Event decorator
     *
     * Event listeners for components.
     *
     * @param eventName {String} The event you want to bind (EG/ "click div")
     * @returns {Function} The "on" decorator (@on)
     */
    function on(eventName) {
        /**
         * Return a decorator function
         */
        return function (target, name, descriptor) {

            /** Guard conditions **/
            if (!target.events) target.events = {};
            if (typeof target.events === "function") throw new Error("The on decorator is only compatible with an events object");
            if (!eventName) throw new Error("The on decorator requires an eventName argument");

            target.addEvent(eventName, name, target);

            return descriptor;
        };
    }

    // Provide context from one class to another
    var GlobalElement;

    /**
     * Marionette Components.
     *
     * Re-usable encapsulated views for use in your framework of choice.
     *
     * Based on marionette.component by jfairbank.
     * @see https://github.com/jfairbank/marionette.component
     */

    var Component = exports.Component = function () {

        /**
         * Constructor
         *
         * @param elementName {String} The name of the element (We register the radio channel with it here)
         * @param localRegistrationName {String} The unique identifier for this component
         * @param options {Object} Optional settings
         */


        /**
         * Setup types for variables.
         */
        function Component(elementName, localRegistrationName, options) {
            _classCallCheck(this, Component);

            this.__disableShadowDOM = false;

            this.radioChannel = _backbone2.default.channel("components:" + localRegistrationName);
            this.elementChannel = _backbone2.default.channel("elements:" + elementName);
            var optionsPresent = undefined !== options;

            if (optionsPresent && options.disableShadowDOM) {
                this.__disableShadowDOM = true;
            }

            this.initialize();
        }

        /**
         * Render the component.
         *
         * @param elementName {string} The name for your custom element (Web Component).
         * @param element {Object} The pass through object for constructing the Component View.
         * @param stylesheet {Object} The stylesheet for your encapsulated component.
         * @param state {Object} The state object
         */


        _createClass(Component, [{
            key: "renderComponent",
            value: function renderComponent(elementName, element, stylesheet, state) {
                /** Setup Component **/
                var that = this;

                if (undefined !== state) this.state = state;
                if (undefined === this.events) this.events = {};

                GlobalElement = {
                    elementName: elementName,
                    element: element,
                    stylesheet: stylesheet,
                    disableShadowDOM: that.__disableShadowDOM
                };

                this.radioChannel.on("attached", function (element) {
                    /** If events object isn't empty **/
                    if (Object.keys(that.events).length !== 0 && that.events.constructor === Object) {
                        var _loop = function _loop(event) {
                            var eventArray = event.split(" ");

                            /** Now that the element is attached to the dom, add in the event listeners **/
                            element.addEventListener(eventArray[0], function (e) {
                                if (eventArray.length <= 2 && eventArray[1] !== undefined) {
                                    var elem = element;

                                    if (!that.__disableShadowDOM) {
                                        elem = element.shadowRoot;
                                    }

                                    if (elem.querySelector(eventArray[1]).length <= 1) {

                                        // Only run if we've matched the same element.
                                        if (e.path && e.path[0] === elem.querySelector(eventArray[1])) {
                                            that.radioChannel.trigger("eventListenerTriggered", that.events[event], e);
                                        }
                                    } else {
                                        elem.querySelectorAll(eventArray[1]).forEach(function (element) {
                                            // Only run if we've matched the same element.
                                            if (e.path && e.path[0] === element) {
                                                that.radioChannel.trigger("eventListenerTriggered", that.events[event], e);
                                            }
                                        });
                                    }
                                } else {
                                    that.radioChannel.trigger("eventListenerTriggered", that.events[event], e);
                                }
                            });
                        };

                        for (var event in that.events) {
                            _loop(event);
                        }
                    }
                });
            }

            /**
             * Initialize the events
             */

        }, {
            key: "initialize",
            value: function initialize() {
                var that = this;
                // $FlowIgnore: This is registered dynamically, so static typing can't detect this.
                this.radioChannel.on("eventListenerTriggered", function (event, passthroughEvent) {
                    return that[event](passthroughEvent);
                });
            }

            /**
             * Add an event listener.
             *
             * @param event {String} The event you're listening to
             * @param method {String} The method that will be called
             */

        }, {
            key: "addEvent",
            value: function addEvent(event, method) {
                this.events[event] = method;
            }

            /**
             * Remove an event listener
             *
             * @param event {String} The event that the method is listening to (EG/ click)
             * @param method {String} The method you want to remove
             */

        }, {
            key: "removeEvent",
            value: function removeEvent(event, method) {
                if (undefined !== event && typeof method === "function") {
                    this.element.removeEventListener(event, method);
                    delete this.events[event];
                }
            }

            /**
             * Return the Element class.
             *
             * @returns {Element}
             */
            // $FlowIgnore: We don't want to pre-initialize the element!

        }, {
            key: "element",
            get: function get() {
                return Element;
            }

            /**
             * Return the Element class.
             */
            // $FlowIgnore: We don't want to pre-initialize the element!
            ,
            set: function set(elem) {
                Element = elem;
            }
        }]);

        return Component;
    }();

    var Element = function (_HTMLElement) {
        _inherits(Element, _HTMLElement);

        function Element() {
            _classCallCheck(this, Element);

            return _possibleConstructorReturn(this, (Element.__proto__ || Object.getPrototypeOf(Element)).apply(this, arguments));
        }

        _createClass(Element, [{
            key: "createdCallback",
            value: function createdCallback() {
                /** Initial time running, so its not technically updating **/
                this._element = GlobalElement.element;
                this._stylesheet = GlobalElement.stylesheet;
                this._elementName = GlobalElement.elementName;
                this._hasShadowRoot = !GlobalElement.disableShadowDOM;

                var element = this;

                /** Add the styles directly into the shadow root & then append the rendered template **/
                // $FlowIgnore: Not part of Flow type yet
                if (this._hasShadowRoot) {
                    element = this.createShadowRoot();
                }

                element.innerHTML = "<style>" + this.stylesheet.toString() + "</style>" + this.element;
            }
        }, {
            key: "attachedCallback",
            value: function attachedCallback() {
                _backbone2.default.channel("components:" + this._elementName).trigger("attached", this);
            }
        }, {
            key: "attributeChangedCallback",
            value: function attributeChangedCallback(attrName, oldValue, newValue) {
                _backbone2.default.channel("components:" + this._elementName).trigger("attributeChanged", {
                    attributeName: attrName,
                    previousAttribute: oldValue,
                    newAttribute: newValue
                });
            }
        }, {
            key: "detachedCallback",
            value: function detachedCallback() {
                _backbone2.default.channel("components:" + this._elementName).trigger("detached");
            }
        }, {
            key: "updateElement",
            value: function updateElement(updatedElement, updatedStylesheet) {

                var hasShadowDom = this._hasShadowRoot;
                var element = this;

                if (hasShadowDom) {
                    element = this.shadowRoot;
                }

                /** Only update if we were passed data **/
                if (undefined !== updatedElement) this.element = updatedElement;
                if (undefined !== updatedElement) this.stylesheet = updatedStylesheet;

                /** If we've triggered a hasUpdated method **/
                // $FlowIgnore: Not part of Flow type yet
                if (this.hasUpdated) element.innerHTML = "<style>" + this.stylesheet.toString() + "</style>" + this.element;
            }
        }, {
            key: "element",
            set: function set(updatedElement) {
                this.hasUpdated = true;
                this._previousElement = this._element;

                this._element = updatedElement;
            },
            get: function get() {
                return this._element;
            }
        }, {
            key: "elementName",
            get: function get() {
                return this._elementName;
            }
        }, {
            key: "previousElement",
            get: function get() {
                return this._previousElement;
            }
        }, {
            key: "stylesheet",
            set: function set(stylesheet) {
                this.hasUpdated = true;
                this._previousStylesheet = this._stylesheet;

                this._stylesheet = stylesheet;
            },
            get: function get() {
                return this._stylesheet;
            }
        }, {
            key: "hasUpdated",
            set: function set(updated) {
                if (typeof updated !== "boolean") throw new TypeError("Updated can only be a boolean type");

                this._updated = updated;

                if (updated) _backbone2.default.channel("components:" + this._elementName).trigger("updated");
            },
            get: function get() {
                return this._updated;
            }
        }, {
            key: "radio",
            get: function get() {
                return _backbone2.default.channel("components:" + this._elementName);
            }
        }]);

        return Element;
    }(HTMLElement);

    var View = exports.View = function (_Marionette$View) {
        _inherits(View, _Marionette$View);

        function View() {
            var _ref;

            var _temp, _this2, _ret2;

            _classCallCheck(this, View);

            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }

            return _ret2 = (_temp = (_this2 = _possibleConstructorReturn(this, (_ref = View.__proto__ || Object.getPrototypeOf(View)).call.apply(_ref, [this].concat(args))), _this2), _this2._components = {}, _this2._componentChannels = {}, _this2._count = {}, _temp), _possibleConstructorReturn(_this2, _ret2);
        }

        _createClass(View, [{
            key: "getComponent",


            /**
             * Lookup a component by its name & get an object containing its radioChannel & the component.
             *
             * @param componentName {String} The name of the component you registered
             * @returns {Object} References to the radio channel & itself.
             */
            value: function getComponent(componentName) {
                return {
                    component: this._components[componentName],
                    radioChannel: this._componentChannels[componentName]
                };
            }

            /**
             * Register the component.
             *
             * @param componentRegistrar {Object} The singleton component registrar that holds components (outside of the view preferably)
             * @param componentName {String} Name the component will be registered under.
             * @param component {HTMLElement} The component you're registering.
             * @param el {HTMLElement|jQuery} Container/Element you're putting the component into.
             * @param properties {Object} Properties you wish to apply to the component.
             */

        }, {
            key: "registerComponent",
            value: function registerComponent(componentRegistrar, componentName, component, el, properties) {
                var localCompName = void 0;

                /** Conflict detection **/
                if (undefined !== this._components[componentName]) {

                    if (undefined === this._count[componentName]) {
                        this._count[componentName] = 0;
                    }

                    localCompName = componentName + "-" + this._count[componentName];
                    this._count[componentName]++;
                } else {
                    localCompName = componentName;
                }

                /** Store a reference to the returned element **/
                var local = componentRegistrar.register(componentName, component, properties, localCompName);
                var componentObject = componentRegistrar.getComponent(localCompName);

                /** Store references to the component & radio channels **/
                this._components[localCompName] = {
                    element: componentObject.component,
                    module: componentObject.componentModule
                };

                this._componentChannels[localCompName] = componentObject.radioChannel || {};

                /** Append the returned element to the DOM **/
                if (undefined !== el.jquery) {
                    el.append(local);
                } else {
                    el.appendChild(local);
                }

                return localCompName;
            }

            /**
             * Delete a component
             *
             * @param componentName {String} Name of the component
             */

        }, {
            key: "deleteComponent",
            value: function deleteComponent(componentName) {
                delete this._components[componentName];
                delete this._componentChannels[componentName];
            }

            /**
             * Clear all the components out of memory.
             */

        }, {
            key: "clearComponents",
            value: function clearComponents() {
                for (var key in this._components) {
                    /** Loop through and delete all props **/
                    if (this._components.hasOwnProperty(key)) {
                        delete this._components[key];
                        delete this._componentChannels[key];
                    }
                }

                for (var _key2 in this._count) {
                    if (this._count.hasOwnProperty(_key2)) {
                        delete this._count[_key2];
                    }
                }
            }
        }]);

        return View;
    }(_marionette2.default.View);
});
