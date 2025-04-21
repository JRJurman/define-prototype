// monkey patch HTMLElement so that it can attach templates defined on the prototype
const originalHTMLElement = HTMLElement;
window.HTMLElement = class extends originalHTMLElement {
	constructor() {
		super();

		// if this was a declaratively created class, then build the shadow root and template
		// based on properties on the class prototype
		if (this.constructor.prototype.__isDeclarativelyDefinedElement) {
			// if we have shadowRootOptions, attach a shadow root with those options
			const shadowRootOptions = this.constructor.prototype.__shadowRootOptions;
			if (shadowRootOptions) {
				this.attachShadow(shadowRootOptions);
			}

			// if we have a component template, append that to the shadow root
			const webcomponentTemplate = this.constructor.prototype.__webcomponentTemplate;
			if (webcomponentTemplate) {
				if (shadowRootOptions) {
					this.shadowRoot.append(webcomponentTemplate.content.cloneNode(true));
				}
			}
		}
	}
};

// New HTMLShadowRootOptionsElement for building a set of shadow root option configurations
class HTMLShadowRootOptionsElement extends HTMLElement {
	connectedCallback() {
		// build a parsed version of this node as an actual shadow root template, so we can build an options object
		const shadowRootPlaceholder = document.createElement('div');
		const mockTemplateNode = this.outerHTML.replace('proto-shadowrootoptions', 'template');
		shadowRootPlaceholder.setHTMLUnsafe(`<div>${mockTemplateNode}</div>`);

		// store the parsed options on a `.shadowRootOptions` object to be pulled from by a definition element
		this.shadowRootOptions = shadowRootPlaceholder.children[0].shadowRoot;
	}
}
customElements.define('proto-shadowrootoptions', HTMLShadowRootOptionsElement);

// New HTMLDefinitionElement for creating and registering Web Components
class HTMLDefinitionElement extends HTMLElement {
	async connectedCallback() {
		// get the name for the component we'll be defining
		const name = this.getAttribute('name');

		// check if we have a script, if we do, then there is an exported class we want to use for this element
		// if we don't have a script, we'll want to build a class on the spot based on HTMLDeclarativeCustomElement
		let componentClass;
		const scriptNode = this.querySelector('script');
		if (scriptNode) {
			// default exports are normally inaccessible, so we create an object URL to pull it from
			// ideally this behavior would be part of existing script elements
			const blob = new Blob([scriptNode.textContent], { type: 'text/javascript' });
			const moduleUrl = URL.createObjectURL(blob);
			const scriptNodeModule = await import(moduleUrl);
			componentClass = scriptNodeModule.default;
		} else {
			componentClass = class extends HTMLElement {};
		}
		componentClass.prototype.__isDeclarativelyDefinedElement = true;

		// check if we have shadowRootOptions, if we do, then we'll want to use those when creating a shadow root template
		let shadowRootOptions;
		const shadowRootOptionsNode = this.querySelector('proto-shadowrootoptions');
		if (shadowRootOptionsNode) {
			shadowRootOptions = shadowRootOptionsNode.shadowRootOptions;
		}
		componentClass.prototype.__shadowRootOptions = shadowRootOptions;

		// check if we have a template, if we do, then we'll want to use that as the template for the web component
		const webcomponentTemplate = this.querySelector('template');
		componentClass.prototype.__webcomponentTemplate = webcomponentTemplate;

		customElements.define(name, componentClass);

		// attach the class to the `elementConstructor` so it can be referenced in the page
		this.elementConstructor = componentClass;
	}
}

customElements.define('proto-definition', HTMLDefinitionElement);
