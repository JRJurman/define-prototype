class HTMLDeclarativeCustomElement extends HTMLElement {
	constructor() {
		super();

		const shadowRoot = this.constructor.prototype.shadowRootTemplate;
		// attach and clone the shadow root from the definition element
		if (shadowRoot) {
			// the shadowRoot object has all the properties we want to pass in here
			this.attachShadow(shadowRoot);

			// clone the shadow root content using a document range
			const shadowRootRange = document.createRange();
			shadowRootRange.selectNodeContents(shadowRoot);
			this.shadowRoot.append(shadowRootRange.cloneContents());
		}

	}
}

async function defineNewElement(definitionElement) {
	// check if we've already defined this element (if we have, we don't need do anything)
	if (definitionElement.elementConstructor) {
		return;
	}

	// get the name for this new element
	const name = definitionElement.getAttribute('name');

	// check if we have a script, if we do, then there is an exported class we want to use for this element
	// if we don't have a script, we'll want to build a class on the spot based on HTMLDeclarativeCustomElement
	let componentClass = null;
	const script = definitionElement.querySelector('script');
	if (script) {
		const blob = new Blob([script.textContent], { type: 'text/javascript' });
		const moduleUrl = URL.createObjectURL(blob);
		const module = await import(moduleUrl);
		componentClass = module.default;
	} else {
		componentClass = class extends HTMLDeclarativeCustomElement {};
	}

	// build the shadowRoot off of the template on the definitionElement
	const shadowRootTemplate = definitionElement.querySelector('template');
	if (shadowRootTemplate) {
		const shadowRootPlaceholder = document.createElement('template');
		shadowRootPlaceholder.setHTMLUnsafe(`<div>${shadowRootTemplate.outerHTML}</div>`)
		const shadowRoot = shadowRootPlaceholder.content.children[0].shadowRoot;
		componentClass.prototype.shadowRootTemplate = shadowRoot;
	}


	customElements.define(name, componentClass);
	definitionElement.elementConstructor = componentClass;
}

const defineElementObserver = new MutationObserver((mutationList) => {
	for (const mutation in mutationList) {
		for (const newNode of mutation?.addedNodes || []) {
			const previousNode = newNode.previousElementSibling
			if (previousNode.tagName === 'DEFINE') {
				defineNewElement(previousNode);
			}
		}
	}
});
defineElementObserver.observe(document.documentElement, { childList: true, subtree: true });

document.addEventListener("DOMContentLoaded", () => {
	document.querySelectorAll('define').forEach((defineElement) => {
		defineNewElement(defineElement)
	});
	defineElementObserver.disconnect()
});
