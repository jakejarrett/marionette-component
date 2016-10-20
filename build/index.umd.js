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

    let Component = function () {

        /**
         * Constructor
         *
         * @param elementName {Object} The custom dom name for your component.
         * @param element {Object} The passthrough object for constructing the Component View.
         * @param stylesheet {Object} The stylesheet for your encapsulated component.
         * @param state {Object} The state object
         */
        function Component({ elementName, element, stylesheet, state } = {}) {
            _classCallCheck(this, Component);

            let that = this;

            if (undefined !== state) this.state = state;
            if (undefined === this.events) this.events = {};

            GlobalElement = {
                elementName: elementName,
                element: element,
                stylesheet: stylesheet
            };

            this.radioChannel = _backbone2.default.channel(`components:${ elementName }`);

            this.radioChannel.on("attached", element => {
                /** If events object isn't empty **/
                if (Object.keys(that.events).length !== 0 && that.events.constructor === Object) {

                    for (let event in that.events) {
                        /** Now that the element is attached to the dom, add in the event listeners **/
                        element.addEventListener(event, e => {
                            that.radioChannel.trigger("eventListenerAdded", that.events[event], e);
                        });
                    }
                }
            });
        }

        /**
         * Initialize the events
         */


        _createClass(Component, [{
            key: "initialize",
            value: function initialize() {
                let that = this;
                this.radioChannel.on("eventListenerAdded", (event, passthroughEvent) => that[event](passthroughEvent));
            }
        }, {
            key: "addEvent",
            value: function addEvent(event, method) {
                this.events[event] = method;
            }
        }, {
            key: "removeEvent",
            value: function removeEvent(event, method) {
                if (undefined !== event && typeof method === "function") {
                    this.element.removeEventListener(event, method);
                    delete this.events[event];
                }
            }
        }, {
            key: "element",
            get: function () {
                return Element;
            }
        }]);

        return Component;
    }();

    let Element = function (_HTMLElement) {
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
                this.createShadowRoot().innerHTML = `<style>${ this.stylesheet.toString() }</style>${ this.element }`;

                /** Reset GlobalElement after we've grabbed all the deets. **/
                if (this.hasUpdated) GlobalElement = undefined;
            }
        }, {
            key: "attachedCallback",
            value: function attachedCallback() {
                _backbone2.default.channel(`components:${ this._elementName }`).trigger("attached", this);
            }
        }, {
            key: "attributeChangedCallback",
            value: function attributeChangedCallback(attrName, oldValue, newValue) {
                _backbone2.default.channel(`components:${ this._elementName }`).trigger("attributeChanged", {
                    attributeName: attrName,
                    previousAttribute: oldValue,
                    newAttribute: newValue
                });
            }
        }, {
            key: "detachedCallback",
            value: function detachedCallback() {
                _backbone2.default.channel(`components:${ this._elementName }`).trigger("detached");
            }
        }, {
            key: "updateElement",
            value: function updateElement(updatedElement, updatedStylesheet) {

                /** Only update if we were passed data **/
                if (undefined !== updatedElement) this.element = updatedElement;
                if (undefined !== updatedElement) this.stylesheet = updatedStylesheet;

                /** If we've triggered a hasUpdated method **/
                if (this.hasUpdated) this.shadowRoot.innerHTML = `<style>${ this.stylesheet.toString() }</style>${ this.element }`;
            }
        }, {
            key: "element",
            set: function (updatedElement) {
                this.hasUpdated = true;
                this._previousElement = this._element;

                this._element = updatedElement;
            },
            get: function () {
                return this._element;
            }
        }, {
            key: "elementName",
            get: function () {
                return this._elementName;
            }
        }, {
            key: "previousElement",
            get: function () {
                return this._previousElement;
            }
        }, {
            key: "stylesheet",
            set: function (stylesheet) {
                this.hasUpdated = true;
                this._previousStylesheet = this._stylesheet;

                this._stylesheet = stylesheet;
            },
            get: function () {
                return this._stylesheet;
            }
        }, {
            key: "hasUpdated",
            set: function (updated) {
                if (typeof updated !== "boolean") {
                    throw new TypeError("Updated can only be a boolean type");
                }

                this._updated = updated;

                if (updated) _backbone2.default.channel(`components:${ this._elementName }`).trigger("updated");
            },
            get: function () {
                return this._updated;
            }
        }]);

        return Element;
    }(HTMLElement);

    exports.default = Component;
});
