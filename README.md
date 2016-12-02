# Marionette.Component

Re-usable encapsulated views for your MarionetteJS Application `Marionette 3.x & Backbone.Radio 2.x required.`

# Installation


# Usage
```Javascript
import { Component, on } from "marionette.component";
import Template from "./index.html";
// This transforms into <style>:host{/* styling */}</style>
import Styles from "!css?modules!sass!./style.scss";

/**
 * Entry point for demo-component
 */
class DemoComponent extends Component {

    /**
     * Setup our component.
     */
    constructor (elementName, props) {
        /** Initialize component **/
        super(elementName);

        // Call render
        this.render(elementName, props);

        // Return the element
        return this.element;
    }

    /**
     * The render method, we'll define what is being rendered onto the dom here.
     */
    render (elementName, props) {
        /**
         * Assume that we're pre-filling the elements with this object.
         */
        let data = {
            elements: {
                input: {
                    placeholder: props.input.placeholder
                },
                textarea: {
                    value: props.textarea.value
                }
            }
        };

         const renderedTemplate = _.template(Template)(data);

        this.renderComponent(elementName, renderedTemplate, Styles);
    }

    /** Custom annotation - This hooks into this.events (You have to support compiling annotations) **/
    @on("change input")
    onInputValueChange (event) {
        // Log out the new value
        console.log(event.path[0].value);
    }
}

/**
 *  Export the Component
 *
 * @exports DemoComponent
 */
export default DemoComponent;
```
