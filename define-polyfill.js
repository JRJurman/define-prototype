async function defineNewElement(definitionElement) {
	// check if we've already defined this element (if we have, we don't need do anything)
	if (definitionElement.elementConstructor) {
		return;
	}

	// get the name for this new element
	const name = definitionElement.getAttribute('name');

	// build the shadowRoot off of the template on the definitionElement
	let shadowRoot = null;
	const shadowRootTemplate = definitionElement.querySelector('template');
	if (shadowRootTemplate) {
		const shadowRootPlaceholder = document.createElement('template');
		shadowRootPlaceholder.setHTMLUnsafe(`<div>${shadowRootTemplate.outerHTML}</div>`)
		shadowRoot = shadowRootPlaceholder.content.children[0].shadowRoot;
	}

	// check if we have a script, if we do, then there is an exported class we want to use as the parent
	let parentClass = HTMLElement;
	const script = definitionElement.querySelector('script');
	if (script) {
		const blob = new Blob([script.textContent], { type: 'text/javascript' });
		const moduleUrl = URL.createObjectURL(blob);
		const module = await import(moduleUrl);
		parentClass = module.default;
	}

	const elementClass = class extends parentClass {
		constructor() {
			super();

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

	customElements.define(name, elementClass);
	definitionElement.elementConstructor = elementClass;
}

new MutationObserver((mutationList) => {
	for (mutation in mutationList) {

	}
})

document.addEventListener("DOMContentLoaded", () => {
	document.querySelectorAll('define').forEach((defineElement) => {
		defineNewElement(defineElement)
	});
});
