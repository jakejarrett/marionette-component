(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(["exports", "backbone.radio"], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports, require("backbone.radio"));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports, global.backbone);
        global.index = mod.exports;
    }
})(this, function (exports, _backbone) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.Component = undefined;
    exports.on = on;

    var _backbone2 = _interopRequireDefault(_backbone);

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
         */
        function Component() {
            _classCallCheck(this, Component);

            this.radioChannel = _backbone2.default.channel("components:" + elementName);
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


        /**
         * Setup types for variables.
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
                    stylesheet: stylesheet
                };

                this.radioChannel.on("attached", function (element) {
                    /** If events object isn't empty **/
                    if (Object.keys(that.events).length !== 0 && that.events.constructor === Object) {
                        var _loop = function _loop(event) {
                            var eventArray = event.split(" ");
                            var elem = void 0;

                            if (eventArray.length <= 2 && eventArray[1] !== undefined) {
                                /** Now that the element is attached to the dom, add in the event listeners **/
                                element.shadowRoot.querySelector(eventArray[1]).addEventListener(eventArray[0], function (e) {
                                    that.radioChannel.trigger("eventListenerTriggered", that.events[event], e);
                                });
                            } else {
                                /** Now that the element is attached to the dom, add in the event listeners **/
                                element.addEventListener(eventArray[0], function (e) {
                                    that.radioChannel.trigger("eventListenerTriggered", that.events[event], e);
                                });
                            }
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

                /** Add the styles directly into the shadow root & then append the rendered template **/
                // $FlowIgnore: Not part of Flow type yet
                this.createShadowRoot().innerHTML = "<style>" + this.stylesheet.toString() + "</style>" + this.element;
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

                /** Only update if we were passed data **/
                if (undefined !== updatedElement) this.element = updatedElement;
                if (undefined !== updatedElement) this.stylesheet = updatedStylesheet;

                /** If we've triggered a hasUpdated method **/
                // $FlowIgnore: Not part of Flow type yet
                if (this.hasUpdated) this.shadowRoot.innerHTML = "<style>" + this.stylesheet.toString() + "</style>" + this.element;
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
});
