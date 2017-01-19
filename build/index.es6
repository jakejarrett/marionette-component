

/** Only real dependency atm is backbone radio. **/
import Radio from "backbone.radio";
import Marionette from "backbone.marionette";

/**
 * Event decorator
 *
 * Event listeners for components.
 *
 * @param eventName {String} The event you want to bind (EG/ "click div")
 * @returns {Function} The "on" decorator (@on)
 */
export function on(eventName) {
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
 * Re-usable components for Marionette JS.
 *
 * @param elementName {String} The name of the element (We register the radio channel with it here)
 * @param localRegistrationName {String} The unique identifier for this component
 * @param options {Object} Optional settings
 */
export class Component {

    /**
     * Construct your component, Only requires elementName & localRegistration name (Which is usually handled by your component registrar)
     *
     * @param elementName {String} The name of the element (We register the radio channel with it here)
     * @param localRegistrationName {String} The unique identifier for this component
     * @param options {Object} Optional settings
     */
    constructor(elementName, localRegistrationName, options) {
        this.__disableShadowDOM = false;

        this.radioChannel = Radio.channel(`components:${ localRegistrationName }`);
        this.elementChannel = Radio.channel(`elements:${ elementName }`);
        const optionsPresent = undefined !== options;

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


    /**
     * Setup types for variables.
     */
    renderComponent(elementName, element, stylesheet, state) {
        /** Setup Component **/
        let that = this;

        if (undefined !== state) this.state = state;
        if (undefined === this.events) this.events = {};

        GlobalElement = {
            elementName: elementName,
            element: element,
            stylesheet: stylesheet,
            disableShadowDOM: that.__disableShadowDOM
        };

        this.radioChannel.on("attached", element => {
            /** If events object isn't empty **/
            if (Object.keys(that.events).length !== 0 && that.events.constructor === Object) {

                for (let event in that.events) {
                    const eventArray = event.split(" ");

                    /** Now that the element is attached to the dom, add in the event listeners **/
                    element.addEventListener(eventArray[0], function (e) {
                        if (eventArray.length <= 2 && eventArray[1] !== undefined) {
                            let elem = element;

                            if (!that.__disableShadowDOM) {
                                elem = element.shadowRoot;
                            }

                            if (elem.querySelector(eventArray[1]).length <= 1) {

                                // Only run if we've matched the same element.
                                if (e.path && e.path[0] === elem.querySelector(eventArray[1])) {
                                    that.radioChannel.trigger("eventListenerTriggered", that.events[event], e);
                                }
                            } else {
                                elem.querySelectorAll(eventArray[1]).forEach(element => {
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
                }
            }
        });
    }

    /**
     * Initialize the events
     */
    initialize() {
        let that = this;
        // $FlowIgnore: This is registered dynamically, so static typing can't detect this.
        this.radioChannel.on("eventListenerTriggered", (event, passthroughEvent) => that[event](passthroughEvent));
    }

    /**
     * Add an event listener.
     *
     * @param event {String} The event you're listening to
     * @param method {String} The method that will be called
     */
    addEvent(event, method) {
        this.events[event] = method;
    }

    /**
     * Remove an event listener
     *
     * @param event {String} The event that the method is listening to (EG/ click)
     * @param method {String} The method you want to remove
     */
    removeEvent(event, method) {
        if (undefined !== event && typeof method === "function") {
            this.element.removeEventListener(event, method);
            delete this.events[event];
        }
    }

    /**
     * Returns the element that is registered to the component
     *
     * @returns {Element}
     */
    // $FlowIgnore: We don't want to pre-initialize the element!
    get element() {
        return Element;
    }

    /**
     * Change the component at run time.
     *
     * @param elem {Element|HTMLElement} The element you're setting it to.
     */
    // $FlowIgnore: We don't want to pre-initialize the element!
    set element(elem) {
        Element = elem;
    }
}

/**
 * Custom elements with optional shadow dom support.
 *
 * @extends HTMLElement
 */
class Element extends HTMLElement {

    /**
     * Set the element
     *
     * @param updatedElement {HTMLElement} The new element you're setting
     */
    set element(updatedElement) {
        this.hasUpdated = true;
        this._previousElement = this._element;

        this._element = updatedElement;
    }

    /**
     * Get the element.
     *
     * @returns {HTMLElement}
     */
    get element() {
        return this._element;
    }

    /**
     * Returns the registered name for this component.
     *
     * @returns {String}
     */
    get elementName() {
        return this._elementName;
    }

    /**
     * Returns the previous element (Only set after update).
     *
     * @returns {HTMLElement}
     */
    get previousElement() {
        return this._previousElement;
    }

    /**
     * Set the stylesheet
     *
     * @param stylesheet {Object}
     */
    set stylesheet(stylesheet) {
        this.hasUpdated = true;
        this._previousStylesheet = this._stylesheet;

        this._stylesheet = stylesheet;
    }

    /**
     * Get the stylesheet
     *
     * @returns {Object}
     */
    get stylesheet() {
        return this._stylesheet;
    }

    /**
     * Sets the updated attribute
     *
     * @param updated {boolean}
     */
    set hasUpdated(updated) {
        if (typeof updated !== "boolean") throw new TypeError("Updated can only be a boolean type");

        this._updated = updated;

        if (updated) Radio.channel(`components:${ this._elementName }`).trigger("updated");
    }

    /**
     * Returns the boolean value of the updated attribute.
     *
     * @returns {boolean} True if it has updated
     */
    get hasUpdated() {
        return this._updated;
    }

    /**
     * Get the instance of the radio channel that's used to communicate events.
     *
     * @returns {Backbone.Radio} An instance of Backbone radio.
     */
    get radio() {
        return Radio.channel(`components:${ this._elementName }`);
    }

    /**
     * When the element is initialized, we'll create the element
     */
    createdCallback() {
        this._element = GlobalElement.element;
        this._stylesheet = GlobalElement.stylesheet;
        this._elementName = GlobalElement.elementName;
        this._hasShadowRoot = !GlobalElement.disableShadowDOM;

        let element = this;

        /** Add the styles directly into the shadow root & then append the rendered template **/
        if (this._hasShadowRoot) {
            element = this.createShadowRoot();
        }

        element.innerHTML = `<style>${ this.stylesheet.toString() }</style>${ this.element.toString() }`;
    }

    /**
     * When the component has been painted to the DOM
     */
    attachedCallback() {
        Radio.channel(`components:${ this._elementName }`).trigger("attached", this);
    }

    /**
     * When attributes have changed
     *
     * @param attrName {String} Name of the attribute that changed
     * @param oldValue {String} Old value of the attribute
     * @param newValue {String} New value of the attribute
     */
    attributeChangedCallback(attrName, oldValue, newValue) {
        Radio.channel(`components:${ this._elementName }`).trigger("attributeChanged", {
            attributeName: attrName,
            previousAttribute: oldValue,
            newAttribute: newValue
        });
    }

    /**
     * When the component has been removed from the DOM
     */
    detachedCallback() {
        Radio.channel(`components:${ this._elementName }`).trigger("detached");
    }

    /**
     * Provide a method to update the element
     *
     * @param updatedElement {HTMLElement} The new contents of the HTML
     * @param updatedStylesheet {Object} The new stylesheet
     * @public
     */
    updateElement(updatedElement, updatedStylesheet) {
        let hasShadowDom = this._hasShadowRoot;
        let element = this;

        if (hasShadowDom) {
            /* $FlowIgnore: shadowRoot is spec compliant */
            element = this.shadowRoot;
        }

        /** Only update if we were passed data **/
        if (undefined !== updatedElement) this.element = updatedElement;
        if (undefined !== updatedElement) this.stylesheet = updatedStylesheet;

        /** If we've triggered a hasUpdated method **/
        // $FlowIgnore: Not part of Flow type yet
        if (this.hasUpdated) element.innerHTML = `<style>${ this.stylesheet.toString() }</style>${ this.element }`;
    }

}

/**
 * Export an abstracted Marionette View to provide helpers for registering & maintaining components.
 *
 * @extends Marionette.View
 */
export class View extends Marionette.View {
    constructor(...args) {
        var _temp;

        return _temp = super(...args), this._components = {}, this._componentChannels = {}, this._count = {}, _temp;
    }

    /**
     * Lookup a component by its name & get an object containing its radioChannel & the component.
     *
     * @param componentName {String} The name of the component you registered
     * @returns {Object} References to the radio channel & itself.
     */
    getComponent(componentName) {
        return {
            component: this._components[componentName],
            radioChannel: this._componentChannels[componentName]
        };
    }

    /**
     * Conflict detection
     *
     * @param componentName {string} The component name
     * @returns {string} Conflict free name, (EG/ property-01)
     */
    noConflict(componentName) {
        let localCompName = componentName;
        const isPredefined = undefined !== this._components[componentName];

        if (isPredefined) {
            this._count[componentName] = this._count[componentName] || 0;

            localCompName = `${ componentName }-${ this._count[componentName] }`;
            this._count[componentName]++;
        }

        return localCompName;
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
    registerComponent(componentRegistrar, componentName, component, el, properties) {

        let localCompName = this.noConflict(componentName);

        /** Store a reference to the returned element **/
        const local = componentRegistrar.register(componentName, component, properties, localCompName);
        const componentObject = componentRegistrar.getComponent(localCompName);

        /** Store references to the component & radio channels **/
        this._components[localCompName] = {
            element: componentObject.component,
            module: componentObject.componentModule
        };

        this._componentChannels[localCompName] = componentObject.radioChannel || {};

        let elAppend = el.appendChild;

        /** Append the returned element to the DOM **/
        if (undefined !== el.jquery) {
            /* $FlowIgnore: Support jQuery */
            elAppend = el.append;
        }

        elAppend(local);

        return localCompName;
    }

    /**
     * Delete a component
     *
     * @param componentName {String} Name of the component
     */
    deleteComponent(componentName) {
        delete this._components[componentName];
        delete this._componentChannels[componentName];
    }

    /**
     * Remove all the components.
     *
     * Dangerous function!!
     */
    clearComponents() {
        for (let key in this._components) {
            /** Loop through and delete all props **/
            if (this._components.hasOwnProperty(key)) {
                delete this._components[key];
                delete this._componentChannels[key];
            }
        }

        for (let key in this._count) {
            if (this._count.hasOwnProperty(key)) {
                delete this._count[key];
            }
        }
    }

}
