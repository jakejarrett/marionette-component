# Marionette.Component

Re-usable encapsulated views for your MarionetteJS Application `Marionette 3.1 recommended.`

# Usage
Here's a demo usage (Using Webpack)

<small>**note- i still have to finish writing a demo for this**</small>
```Javascript
import { Component, on } from "marionette.component";
import Template from "./index.html";
import Styles from "!css?modules!sass!./style.scss";

/**
 * Entry point for demo-component
 */
class DemoComponent extends Component {

    /**
     * Setup our component.
     */
    constructor (elementName) {
        const renderedTemplate = _.template(Template)();

        /** Initialize component **/
        super({
            elementName: elementName,
            element: renderedTemplate,
            stylesheet: Styles
        });

        return this.element;
    }

    /** Custom annotation - This hooks into this.events **/
    @on("click")
    onUserClick (event) {
        console.log("hello", event);
    }
}

/**
 *  Export the Component
 *
 * @exports DemoComponent
 */
export default DemoComponent;
```

