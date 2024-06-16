import { HtmlElement } from "./HtmlElement";


/**
 * Represents an HTML document with a main element.
 * The `HtmlDocument` class manages the main element of an HTML document,
 * providing a convenient way to append it to the document body.
 */
export class HtmlDocument {

    mainElement: HtmlElement = null as unknown as HtmlElement;

    constructor(mainElement: HtmlElement) {
        this.mainElement = mainElement;
        this.mainElement.appendTo(document.body);
    }
}