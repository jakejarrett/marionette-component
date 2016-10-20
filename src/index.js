/** Only real dependency atm is backbone radio. **/
import Radio from "backbone.radio";

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
class Component {

    /**
     * Constructor
     *
     * @param elementName {Object} The custom dom name for your component.
     * @param element {Object} The passthrough object for constructing the Component View.
     * @param stylesheet {Object} The stylesheet for your encapsulated component.
     * @param state {Object} The state object
     */
    constructor({ elementName, element, stylesheet, state } = {}) {
        if (undefined !== state) this.state = state;

        GlobalElement = {
            elementName: elementName,
            element: element,
            stylesheet: stylesheet
        };
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
     * @returns {*}
     */
    get elementName () {
        return this._elementName;
    }

    /**
     * Returns the previous element (Only set after update).
     *
     * @returns {*|HTMLElement}
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

export default {Component, GlobalElement, Element};
