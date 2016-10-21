/** Only real dependency atm is backbone radio. **/
import Radio from "backbone.radio";

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
    return function(target, name, descriptor){
        console.log(target, name, descriptor);
        if(!target.events) {
            target.events = {};
        }

        if(_.isFunction(target.events)) {
            throw new Error("The on decorator is not compatible with an events method");
            return;
        }

        if(!eventName) {
            throw new Error("The on decorator requires an eventName argument");
        }

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
export class Component {

    /**
     * Constructor
     *
     * @param elementName {string} The custom dom name for your component.
     * @param element {Object} The passthrough object for constructing the Component View.
     * @param stylesheet {Object} The stylesheet for your encapsulated component.
     * @param state {Object} The state object
     */
    constructor({ elementName, element, stylesheet, state } = {}) {
        let that = this;

        if (undefined !== state) this.state = state;
        if (undefined === this.events) this.events = {};

        GlobalElement = {
            elementName: elementName,
            element: element,
            stylesheet: stylesheet
        };

        this.radioChannel = Radio.channel(`components:${elementName}`);

        this.radioChannel.on("attached", element => {
            /** If events object isn't empty **/
            if(Object.keys(that.events).length !== 0 && that.events.constructor === Object) {

                for (let event in that.events) {
                    /** Now that the element is attached to the dom, add in the event listeners **/
                    element.addEventListener(event, (e) => {
                        that.radioChannel.trigger("eventListenerTriggered", that.events[event], e);
                    });
                }

            }
        });

        this.initialize();
    }

    /**
     * Initialize the events
     */
    initialize () {
        let that = this;
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
    removeEvent (event, method) {
        if(undefined !== event && typeof method === "function") {
            this.element.removeEventListener(event, method);
            delete this.events[event];
        }
    }

    /**
     * Return the Element class.
     *
     * @returns {Element}
     */
    get element () {
        return Element;
    }
}

/**
 * Create the custom element with shadow dom support for true encapsulation!
 */
class Element extends HTMLElement {

    /**
     * Set the element
     *
     * @param updatedElement {HTMLElement} The new element you're setting
     */
    set element (updatedElement) {
        this.hasUpdated = true;
        this._previousElement = this._element;

        this._element = updatedElement;
    }

    /**
     * Get the element.
     *
     * @returns {HTMLElement}
     */
    get element () {
        return this._element;
    }

    /**
     * Returns the registered name for this component.
     *
     * @returns {String}
     */
    get elementName () {
        return this._elementName;
    }

    /**
     * Returns the previous element (Only set after update).
     *
     * @returns {HTMLElement}
     */
    get previousElement () {
        return this._previousElement;
    }

    /**
     * Set the stylesheet
     *
     * @param stylesheet {Object}
     */
    set stylesheet (stylesheet) {
        this.hasUpdated = true;
        this._previousStylesheet = this._stylesheet;

        this._stylesheet = stylesheet;
    }

    /**
     * Get the stylesheet
     *
     * @returns {Object}
     */
    get stylesheet () {
        return this._stylesheet;
    }

    /**
     * Sets the updated attribute
     *
     * @param updated {boolean}
     */
    set hasUpdated (updated) {
        if(typeof updated  !== "boolean") {
            throw new TypeError("Updated can only be a boolean type");
        }

        this._updated = updated;

        if (updated) Radio.channel(`components:${this._elementName}`).trigger("updated");
    }

    /**
     * Returns the boolean value of the updated attribute.
     *
     * @returns {boolean} True if it has updated
     */
    get hasUpdated () {
        return this._updated;
    }

    /**
     * When the element is initialized, we'll create the element
     */
    createdCallback () {
        /** Initial time running, so its not technically updating **/
        this._element = GlobalElement.element;
        this._stylesheet = GlobalElement.stylesheet;
        this._elementName = GlobalElement.elementName;

        /** Add the styles directly into the shadow root & then append the rendered template **/
        this.createShadowRoot().innerHTML = `<style>${this.stylesheet.toString()}</style>${this.element}`;

        /** Reset GlobalElement after we've grabbed all the deets. **/
        if(this.hasUpdated) GlobalElement = undefined;
    }

    /**
     * When the component has been painted to the DOM
     */
    attachedCallback () {
        Radio.channel(`components:${this._elementName}`).trigger("attached", this);
    }

    /**
     * When attributes have changed
     *
     * @param attrName {String} Name of the attribute that changed
     * @param oldValue {String} Old value of the attribute
     * @param newValue {String} New value of the attribute
     */
    attributeChangedCallback (attrName, oldValue, newValue) {
        Radio.channel(`components:${this._elementName}`).trigger("attributeChanged", {
            attributeName: attrName,
            previousAttribute: oldValue,
            newAttribute: newValue
        });
    }

    /**
     * When the component has been removed from the DOM
     */
    detachedCallback () {
        Radio.channel(`components:${this._elementName}`).trigger("detached");
    }

    /**
     * Provide a method to update the element
     *
     * @param updatedElement {HTMLElement} The new contents of the HTML
     * @param updatedStylesheet {Object} The new stylesheet
     * @public
     */
    updateElement (updatedElement, updatedStylesheet) {

        /** Only update if we were passed data **/
        if(undefined !== updatedElement) this.element = updatedElement;
        if(undefined !== updatedElement) this.stylesheet = updatedStylesheet;

        /** If we've triggered a hasUpdated method **/
        if (this.hasUpdated) this.shadowRoot.innerHTML = `<style>${this.stylesheet.toString()}</style>${this.element}`;

    }

}
