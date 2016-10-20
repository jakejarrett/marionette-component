(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(["exports", "marionette", "backbone.radio"], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports, require("marionette"), require("backbone.radio"));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports, global.marionette, global.backbone);
        global.index = mod.exports;
    }
})(this, function (exports, _marionette, _backbone) {
    "use strict";

    _marionette.Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _marionette2 = _interopRequireDefault(_marionette);

    var _backbone2 = _interopRequireDefault(_backbone);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
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

                _marionette.Object.defineProperty(target, descriptor.key, descriptor);
            }
        }

        return function (Constructor, protoProps, staticProps) {
            if (protoProps) defineProperties(Constructor.prototype, protoProps);
            if (staticProps) defineProperties(Constructor, staticProps);
            return Constructor;
        };
    }();

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

        subClass.prototype = _marionette.Object.create(superClass && superClass.prototype, {
            constructor: {
                value: subClass,
                enumerable: false,
                writable: true,
                configurable: true
            }
        });
        if (superClass) _marionette.Object.setPrototypeOf ? _marionette.Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
    }

    let Component = function (_Object) {
        _inherits(Component, _Object);

        /**
         *
         * @param model {Backbone.Model} The Backbone model
         * @param collection {Backbone.Collection} The backbone Collection
         * @param element {Object} The passthrough object for constructing the Component View.
         */
        function Component({ model, collection, element } = {}) {
            _classCallCheck(this, Component);

            var _this = _possibleConstructorReturn(this, (Component.__proto__ || _marionette.Object.getPrototypeOf(Component)).call(this, arguments));

            _this.model = model;
            _this.collection = collection;

            _this.element = new Element(element);
            return _this;
        }

        /**
         * Where we are showing the component.
         *
         * @param region {Element|Marionette.Region} The view we're adding this view into
         */


        _createClass(Component, [{
            key: "showIn",
            value: function showIn(region) {
                if (this._isShown) {
                    throw new Error("This component is already shown in a region.");
                }

                if (!region) {
                    throw new Error("Please supply a region to show inside.");
                }

                this.region = region;

                /** Trigger default marionette events **/
                this.triggerMethod("before:show");

                this._showView();
                this._isShown = true;

                this.triggerMethod("show");
            }
        }, {
            key: "destroy",
            value: function destroy() {
                if (this._isDestroyed) {
                    return;
                }

                /** Trigger default marionette events **/
                this.triggerMethod("before:destroy");

                this._destroyViewThroughRegion();
                this._removeReferences();

                this.triggerMethod("destroy");
                this.stopListening();

                this._isDestroyed = true;
            }
        }, {
            key: "_showView",
            value: function _showView() {
                const view = this.view = this._getView();

                this._initializeViewEvents();

                /** Trigger show:view after the view is shown in the region **/
                this.listenTo(view, "show", _.partial(this.triggerMethod, "show:view"));

                /** Trigger before:show before the region shows the view **/
                this.triggerMethod("before:show:view");

                /** Show the view in the region **/
                this.region.show(view);

                /** Destroy the component if the region is emptied because it destroys the view **/
                this.listenToOnce(this.region, "empty", this.destroy);
            }
        }, {
            key: "_initializeViewEvents",
            value: function _initializeViewEvents() {
                if (this.viewEvents) {
                    this.bindEvents(this.view, this.viewEvents);
                }
            }
        }, {
            key: "_destroyViewThroughRegion",
            value: function _destroyViewThroughRegion() {
                const region = this.region;

                // Don't do anything if there isn't a region or view.
                // We need to check the view or we could empty the region before we've
                // shown the component view. This would destroy an existing view in the
                // region.
                if (!region || !this.view) {
                    return;
                }

                // Remove listeners on region, so we don't call `destroy` a second time
                this.stopListening(region);

                // Destroy the view by emptying the region
                region.empty();
            }
        }, {
            key: "_removeReferences",
            value: function _removeReferences() {
                delete this.model;
                delete this.collection;
                delete this.region;
                delete this.view;
            }
        }, {
            key: "_getView",
            get: function () {
                const ViewClass = this.viewClass;

                if (!ViewClass) {
                    throw new Error("You must specify a viewClass for your component.");
                }

                return new ViewClass({
                    model: this.model,
                    collection: this.collection
                });
            }
        }, {
            key: "element",
            set: function (element) {
                this._element = element;
            },
            get: function () {
                return this._element;
            }
        }]);

        return Component;
    }(_marionette.Object);

    let Element = function (_HTMLElement) {
        _inherits(Element, _HTMLElement);

        /**
         * What type of element we're going to construct
         *
         * @param elementName {String} The element name (eg/ login-form)
         * @param element {HTMLElement} The contents of the component (Pre-rendered)
         * @param stylesheet {Object} The stylesheet object.
         */
        function Element({ elementName, element, stylesheet } = {}) {
            _classCallCheck(this, Element);

            var _this2 = _possibleConstructorReturn(this, (Element.__proto__ || _marionette.Object.getPrototypeOf(Element)).call(this, arguments));

            /** Setup initial state **/
            _this2._elementName = elementName;
            _this2._element = element;
            _this2._stylesheet = stylesheet;
            return _this2;
        }

        /**
         * Set the element
         *
         * @param updatedElement {HTMLElement} The new element you're setting
         */


        _createClass(Element, [{
            key: "createdCallback",
            value: function createdCallback() {
                /** Add the styles directly into the shadow root & then append the rendered template **/
                this.createShadowRoot().innerHTML = `<style>${ this.stylesheet.toString() }</style>${ this.element }`;
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
