import Marionette, { Object } from "marionette";
import Radio from "backbone.radio";

/**
 * Marionette Components.
 *
 * Re-usable encapsulated views for use in Marionette.
 *
 * Based on marionette.component by jfairbank.
 * @see https://github.com/jfairbank/marionette.component
 */
class Component extends Object {

    /**
     *
     * @param model {Backbone.Model} The Backbone model
     * @param collection {Backbone.Collection} The backbone Collection
     * @param element {Object} The passthrough object for constructing the Component View.
     */
    constructor ({ model, collection, element }={}) {
        super(arguments);

        this.model = model;
        this.collection = collection;

        this.element = new Element(element);
    }

    /**
     * Where we are showing the component.
     *
     * @param region {Element|Marionette.Region} The view we're adding this view into
     */
    showIn (region) {
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

    /**
     * Destroy the component and its view
     *
     * todo- refactor this to support ShadowDOM
     */
    destroy () {
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

    /**
     * Show the view in the region.
     *
     * @private
     */
    _showView () {
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

    /**
     * Get an instance of the view to display
     *
     * @returns {Component} Returns an instance of itself.
     * @private
     */
    get _getView () {
        const ViewClass = this.viewClass;

        if (!ViewClass) {
            throw new Error("You must specify a viewClass for your component.");
        }

        return new ViewClass({
            model: this.model,
            collection: this.collection
        });
    }

    /**
     * Set up events from the `viewEvents` hash
     *
     * @private
     */
    _initializeViewEvents () {
        if (this.viewEvents) {
            this.bindEvents(this.view, this.viewEvents);
        }
    }

    /**
     * Destroy a view by emptying the region
     *
     * @private
     */
    _destroyViewThroughRegion () {
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

    /**
     * Remove references to all attached objects
     *
     * @private
     */
    _removeReferences () {
        delete this.model;
        delete this.collection;
        delete this.region;
        delete this.view;
    }

    set element (element) {
        this._element = element;
    }

    get element () {
        return this._element;
    }
}

class Element extends HTMLElement {

    /**
     * What type of element we're going to construct
     *
     * @param elementName {String} The element name (eg/ login-form)
     * @param element {HTMLElement} The contents of the component (Pre-rendered)
     * @param stylesheet {Object} The stylesheet object.
     */
    constructor ({ elementName, element, stylesheet }={}) {
        super(arguments);

        /** Setup initial state **/
        this._elementName = elementName;
        this._element = element;
        this._stylesheet = stylesheet;
    }

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
        /** Add the styles directly into the shadow root & then append the rendered template **/
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

export default Component;
