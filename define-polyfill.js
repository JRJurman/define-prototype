// polyfill for <define>

async function defineNewElement(definitionElement) {
	// check if we've already defined this element (if we have, we don't need do anything)
	if (definitionElement.elementConstructor) {
		return;
	}

	// get the name for this new element
	const name = definitionElement.getAttribute('name');

	// check if we have a script, if we do, then there is an exported class we want to use for this element
	// if we don't have a script, we'll want to build a class on the spot based on HTMLDeclarativeCustomElement
	let parentClass = HTMLElement;
	const script = definitionElement.querySelector('script');
	if (script) {
		// default exports are normally accessible, so we create an object URL to pull it from
		const blob = new Blob([script.textContent], { type: 'text/javascript' });
		const moduleUrl = URL.createObjectURL(blob);
		const module = await import(moduleUrl);
		parentClass = module.default;
	}

	const componentClass = class extends parentClass {
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
		}
	};

	// build the shadowRoot off of the template on the definitionElement
	const shadowRootTemplate = definitionElement.querySelector('template');
	if (shadowRootTemplate) {
		const shadowRootPlaceholder = document.createElement('template');

		// using setHTMLUnsafe allows us to build the parsed version of the shadowRoot object
		shadowRootPlaceholder.setHTMLUnsafe(`<div>${shadowRootTemplate.outerHTML}</div>`);
		const shadowRoot = shadowRootPlaceholder.content.children[0].shadowRoot;

		// attach this shadowRoot object to the class prototype, so it can be attached by the constructor
		componentClass.prototype.shadowRootTemplate = shadowRoot;
	}

	customElements.define(name, componentClass);

	// attach the class to `elementConstructor` so it can be reference in the page
	definitionElement.elementConstructor = componentClass;
}

// below are mutation observers and event listeners to detect the Define element in the document
const defineElementObserver = new MutationObserver((mutationList) => {
	for (const mutation in mutationList) {
		for (const newNode of mutation?.addedNodes || []) {
			// we actually are looking for when we've just-passed the define element,
			// otherwise we might catch it before its children have been added to the document
			const previousNode = newNode.previousElementSibling;
			if (previousNode.tagName === 'DEFINE') {
				defineNewElement(previousNode);
			}
		}
	}
});
defineElementObserver.observe(document.documentElement, { childList: true, subtree: true });

document.addEventListener('DOMContentLoaded', () => {
	// if this was added at the end of the document, pick up any define elements now
	document.querySelectorAll('define').forEach((defineElement) => {
		defineNewElement(defineElement);
	});
	defineElementObserver.disconnect();
});
