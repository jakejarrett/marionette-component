/* @flow */

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
export function on(eventName: string) {
    /**
     * Return a decorator function
     */
    return function(target: Object, name: string, descriptor: Object){

        /** Guard conditions **/
        if(!target.events) target.events = {};
        if(typeof target.events === "function") throw new Error("The on decorator is not compatible with an events method");
        if(!eventName) throw new Error("The on decorator requires an eventName argument");

        target.addEvent(eventName, name, target);

        return descriptor;
    };
}

// Provide context from one class to another
var GlobalElement: Object;

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
     * Setup types for variables.
     */
    radioChannel: Object;
    state: Object;
    events: Object;

    /**
     * Constructor
     *
     * @param elementName {string} The name for your custom element (Web Component).
     * @param element {Object} The pass through object for constructing the Component View.
     * @param stylesheet {Object} The stylesheet for your encapsulated component.
     * @param state {Object} The state object
     */
    constructor(elementName: string, element: Object, stylesheet: Object, state: Object) {
        let that: Object = this;

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
                    const eventArray = event.split(" ");
                    let elem;

                    if(eventArray.length <= 2 && eventArray[1] !== undefined) {
                        elem = element.shadowRoot.querySelector(evtArr[1]);
                    } else {
                        elem = element;
                    }

                    console.log(elem);

                    /** Now that the element is attached to the dom, add in the event listeners **/
                    elem.addEventListener(eventArray[0], function (e) {
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
        // $FlowIgnore: This is registered dynamically, so static typing can't detect this.
        this.radioChannel.on("eventListenerTriggered", (event, passthroughEvent) => that[event](passthroughEvent));
    }

    /**
     * Add an event listener.
     *
     * @param event {String} The event you're listening to
     * @param method {String} The method that will be called
     */
    addEvent(event: String, method: string) {
        this.events[event] = method;
    }

    /**
     * Remove an event listener
     *
     * @param event {String} The event that the method is listening to (EG/ click)
     * @param method {String} The method you want to remove
     */
    removeEvent (event: string, method: string) {
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
    // $FlowIgnore: We don't want to pre-initialize the element!
    get element () : Element {
        return Element;
    }
}

/**
 * Create the custom element with shadow dom support for true encapsulation!
 */
class Element extends HTMLElement {

    /**
     * Setup types for variables.
     */
    _previousElement: HTMLElement;
    _element: HTMLElement;
    _elementName: string;
    _previousStylesheet: Object;
    _stylesheet: Object;
    _updated: boolean;

    /**
     * Set the element
     *
     * @param updatedElement {HTMLElement} The new element you're setting
     */
    set element (updatedElement: HTMLElement) {
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
    set stylesheet (stylesheet: Object) {
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
    set hasUpdated (updated: boolean) {
        if(typeof updated  !== "boolean") throw new TypeError("Updated can only be a boolean type");

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
     * Get the instance of the radio channel that's used to communicate events.
     *
     * @returns {Backbone.Radio} An instance of Backbone radio.
     */
    get radio () {
        return Radio.channel(`components:${this._elementName}`);
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
        // $FlowIgnore: Not part of Flow type yet
        this.createShadowRoot().innerHTML = `<style>${this.stylesheet.toString()}</style>${this.element}`;
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
    attributeChangedCallback (attrName: string, oldValue: string, newValue: string) {
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
    updateElement (updatedElement: HTMLElement, updatedStylesheet: Object) {

        /** Only update if we were passed data **/
        if(undefined !== updatedElement) this.element = updatedElement;
        if(undefined !== updatedElement) this.stylesheet = updatedStylesheet;

        /** If we've triggered a hasUpdated method **/
        // $FlowIgnore: Not part of Flow type yet
        if (this.hasUpdated) this.shadowRoot.innerHTML = `<style>${this.stylesheet.toString()}</style>${this.element}`;

    }

}
