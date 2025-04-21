// utility function to patch classes
function patchClass(target, source) {
	const protoDescriptors = Object.getOwnPropertyDescriptors(source.prototype);
	delete protoDescriptors.constructor;
	Object.defineProperties(target.prototype, protoDescriptors);

	const staticDescriptors = Object.getOwnPropertyDescriptors(source);
	delete staticDescriptors.prototype;
	delete staticDescriptors.name;
	delete staticDescriptors.length;
	Object.defineProperties(target, staticDescriptors);
}

// custom function to upgrade an existing tag definition with new behavior
customElements.upgradeClass = (tagName, classDefinition) => {
	const originalClass = customElements.get(tagName);

	patchClass(originalClass, classDefinition);

	const existingElements = document.querySelectorAll(tagName);
	[...existingElements].forEach((element) => {
		element.connectedCallback();
	});
};

// base class to use for our first pass implementation of components
// with shadow root templates.
class HTMLDeclarativeElement extends HTMLElement {
	constructor() {
		super();

		const shadowRoot = this.constructor.prototype.shadowRootTemplate;
		// if we had a defined shadowRootTemplate on this class, attach and clone it
		if (shadowRoot) {
			// check if we already have a shadow root - if we do, we'll want to clear it out now,
			// otherwise we'll attach a new shadow root based on the properties of this one.
			if (this.shadowRoot) {
				this.shadowRoot.replaceChildren();
			} else {
				// passing a shadowRoot object into attachShadow is valid, and causes it to
				// inherit all of it's properties (e.g. shadowRootMode, delegatesFocus, etc)
				this.attachShadow(shadowRoot);
			}

			// clone the shadow root content using a document range
			const shadowRootRange = document.createRange();
			shadowRootRange.selectNodeContents(shadowRoot);
			this.shadowRoot.append(shadowRootRange.cloneContents());
		}

		this.originalConnectedCallbackCalled = false;
	}
	connectedCallback() {
		if (!this.originalConnectedCallbackCalled) {
			this.originalConnectedCallbackCalled = true;

			// if this element has been patched, this.connectedCallback will be different from this method
			this.connectedCallback();
		}
	}
}

// if we need a wrapper for our templates (to ensure the templates stay as inert templates)
// we can use a `<proto-definition>` element to wrap it
class HTMLDefinitionElement extends HTMLElement {
	static disabledFeatures = ['shadow'];
}
customElements.define('proto-definition', HTMLDefinitionElement);

// function to take a template with a tag name and build a first-pass component class and register it
function defineNewElement(shadowRootTemplate) {
	// check if this element has already been defined
	if (shadowRootTemplate.__defined) {
		return undefined;
	}

	// get the name for this new element
	const name = shadowRootTemplate.getAttribute('tagname');

	const componentClass = class extends HTMLDeclarativeElement {};

	if (shadowRootTemplate) {
		const shadowRootPlaceholder = document.createElement('template');

		// using setHTMLUnsafe allows us to build the parsed version of the shadowRoot object
		shadowRootPlaceholder.setHTMLUnsafe(`<div>${shadowRootTemplate.outerHTML}</div>`);
		const shadowRoot = shadowRootPlaceholder.content.children[0].shadowRoot;

		// attach this shadowRoot object to the class prototype, so it can be attached by the constructor
		componentClass.prototype.shadowRootTemplate = shadowRoot;
	}

	customElements.define(name, componentClass);
	shadowRootTemplate.__defined = true;
}

// below are mutation observers and event listeners to detect the definitions in the document
const defineElementObserver = new MutationObserver((mutationList) => {
	for (const mutation of mutationList) {
		for (const newNode of mutation?.addedNodes || []) {
			// we actually are looking for when we've just-passed the definitions,
			// otherwise we might catch it before its content has been added to the document
			const previousNode = newNode.previousElementSibling;
			if (previousNode && previousNode.tagName === 'TEMPLATE' && previousNode.hasAttribute('tagname')) {
				defineNewElement(previousNode);
			}
		}
	}
});
defineElementObserver.observe(document.documentElement, { childList: true, subtree: true });
