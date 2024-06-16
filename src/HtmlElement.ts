import { Reactive } from "./Reactive";

/**
 * Represents an HTML element and provides a fluent API for manipulating its properties and behavior.
 */
export class HtmlElement {
    element: HTMLElement;

    constructor(tag: string) {
        this.element = document.createElement(tag);
    }

    setAttribute(attr: string, value: string): this {
        this.element.setAttribute(attr, value);
        return this;
    }

    setTextContent(text: string): this {
        this.element.textContent = text;
        return this;
    }

    bindTextContent<T>(property: keyof T, reactiveData: any): this {
        Reactive.effect(() => {
            this.setTextContent(String(reactiveData[property]));
        });
        return this;
    }

    setId(id: string): this {
        this.element.id = id;
        return this;
    }

    getId(): string {
        return this.element.id;
    }

    setStyle(styleObj: Partial<CSSStyleDeclaration>): this {
        Object.assign(this.element.style, styleObj);
        return this;
    }

    bindStyle<T>(property: keyof T, reactiveData: any, styleProperty: keyof CSSStyleDeclaration): this {
        Reactive.effect(() => {
            this.setStyle({ [styleProperty]: String(reactiveData[property]) } as Partial<CSSStyleDeclaration>);
        });
        return this;
    }

    appendChild(child: HtmlElement | HTMLElement | string): this {
        if (child instanceof HtmlElement) {
          this.element.appendChild(child.element);
        } else if (child instanceof HTMLElement) {
          this.element.appendChild(child);
        } else {
          this.element.appendChild(document.createTextNode(child));
        }
        return this;
      }

    appendTo(parent: HtmlElement | HTMLElement | string): this {
        if (parent instanceof HtmlElement) {
            parent.element.appendChild(this.element);
        } else if (parent instanceof HTMLElement) {
            parent.appendChild(this.element);
        } else {
            document.querySelector(parent)!.appendChild(this.element);
        }
        return this;
    }

    addEventListener(event: string, handler: EventListenerOrEventListenerObject): this {
        this.element.addEventListener(event, handler);
        return this;
    }

    addClass(className: string | string[]): this {
        if (Array.isArray(className)) {
          className.forEach(cls => this.element.classList.add(cls));
        } else {
          this.element.classList.add(className);
        }
        return this;
      }
    
      removeClass(className: string | string[]): this {
        if (Array.isArray(className)) {
          className.forEach(cls => this.element.classList.remove(cls));
        } else {
          this.element.classList.remove(className);
        }
        return this;
      }
    
      toggleClass(className: string | string[]): this {
        if (Array.isArray(className)) {
          className.forEach(cls => this.element.classList.toggle(cls));
        } else {
          this.element.classList.toggle(className);
        }
        return this;
      }
    
      bindClass<T extends object>(property: keyof T, reactiveData: any): this {
        Reactive.effect(() => {
          this.element.className = String(reactiveData[property]);
        });
        return this;
      }

      bindForEach<T>(property: keyof T, reactiveData: any, renderItem: (item: any) => HtmlElement): this {
        const update = () => {
          this.element.innerHTML = '';
          const items = reactiveData[property];
          if (Array.isArray(items)) {
            items.forEach(item => {
              this.element.appendChild(renderItem(item).element);
            });
          }
        };
    
        Reactive.effect(update);
        return this;
      }
}

/**
 * Represents a button HTML element with additional functionality.
 */
export class Button extends HtmlElement {
    constructor() {
        super('button');
    }

    onClick(handler: (this: HTMLButtonElement, ev: MouseEvent) => any): this {
        (this.element as HTMLButtonElement).addEventListener('click', handler);
        return this;
    }

    setDisabled(isDisabled: boolean): this {
        (this.element as HTMLButtonElement).disabled = isDisabled;
        return this;
    }

    bindDisabled<T>(property: keyof T, reactiveData: any): this {
        Reactive.effect(() => {
            this.setDisabled(Boolean(reactiveData[property]));
        });
        return this;
    }
}

/**
 * Represents a vertical stack layout for HTML elements.
 * The `VStack` class extends the `HtmlElement` class and provides a fluent API
 * for creating and configuring a vertically stacked layout of HTML elements.
 */
export class VStack extends HtmlElement {

    constructor() {
        super('div');
        this.setStyle({ display: 'flex', flexDirection: 'column' });
    }

    gap(newGap: string): this {
        this.setStyle({ gap: newGap } as Partial<CSSStyleDeclaration>);
        return this;
    }

    center({ x, y }: { x: boolean, y: boolean }): this {
        if (x) {
            this.setStyle({ justifyContent: 'center' } as Partial<CSSStyleDeclaration>);
        }
        if (y) {
            this.setStyle({ alignItems: 'center' } as Partial<CSSStyleDeclaration>);
        }
        return this;
    }


}
  
/**
 * Represents a horizontal stack layout for HTML elements.
 * The `HStack` class extends the `HtmlElement` class and provides a fluent API
 * for creating and configuring a horizontally stacked layout of HTML elements.
 */
export class HStack extends HtmlElement {
    constructor() {
        super('div');
        this.setStyle({ display: 'flex', flexDirection: 'row' });
    }

    gap(newGap: string): this {
        this.setStyle({ gap: newGap } as Partial<CSSStyleDeclaration>);
        return this;
    }

    center({ x, y }: { x: boolean, y: boolean }): this {
        if (x) {
            this.setStyle({ justifyContent: 'center' } as Partial<CSSStyleDeclaration>);
        }
        if (y) {
            this.setStyle({ alignItems: 'center' } as Partial<CSSStyleDeclaration>);
        }
        return this;
    }
}

export class Input extends HtmlElement {
    constructor() {
      super('input');
    }
  
    setValue(value: string): this {
      (this.element as HTMLInputElement).value = value;
      return this;
    }
  
    bindValue<T extends object>(property: keyof T, reactiveData: any): this {
      Reactive.effect(() => {
        (this.element as HTMLInputElement).value = String(reactiveData[property]);
      });
      return this;
    }
  
    setType(type: string): this {
      (this.element as HTMLInputElement).type = type;
      return this;
    }
  
    setPlaceholder(placeholder: string): this {
      (this.element as HTMLInputElement).placeholder = placeholder;
      return this;
    }
  
    onInput(handler: (this: HTMLInputElement, ev: Event) => any): this {
      (this.element as HTMLInputElement).addEventListener('input', handler);
      return this;
    }
  
    bindPlaceholder<T extends object>(property: keyof T, reactiveData: any): this {
      Reactive.effect(() => {
        (this.element as HTMLInputElement).placeholder = String(reactiveData[property]);
      });
      return this;
    }

    bindChecked<T extends object>(property: keyof T, reactiveData: any): this {
        Reactive.effect(() => {
          (this.element as HTMLInputElement).checked = Boolean(reactiveData[property]);
        });
        return this;
      }
  }
  
/**
 * A collection of factory functions for creating common HTML elements.
 * These functions return instances of the `HtmlElement` class, which provides
 * a fluent API for building and manipulating HTML elements.
 */
export const h = {
    div: () => new HtmlElement('div'),
    p: () => new HtmlElement('p'),
    span: () => new HtmlElement('span'),
    h1: () => new HtmlElement('h1'),
    h2: () => new HtmlElement('h2'),
    h3: () => new HtmlElement('h3'),
    ul: () => new HtmlElement('ul'),
    li: () => new HtmlElement('li'),
    a: () => new HtmlElement('a'),
    img: () => new HtmlElement('img'),
    button: () => new Button(),
    input: () => new Input(),
    VStack: () => new VStack(),
    HStack: () => new HStack(),
};
  