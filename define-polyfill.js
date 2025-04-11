function defineNewElement(definitionElement) {
	// get the name for this new element
	const name = definitionElement.getAttribute('name');

	// build the shadowRoot off of the template on the definitionElement
	const shadowRootTemplate = definitionElement.children[0];
	const shadowRootPlaceholder = document.createElement('template');
	shadowRootPlaceholder.setHTMLUnsafe(`<div>${shadowRootTemplate.outerHTML}</div>`)
	const shadowRoot = shadowRootPlaceholder.content.children[0].shadowRoot;

	// determine if we want to extend another class
	const parentTag = definitionElement.getAttribute('extends');
	const parentClass = parentTag ? customElements.get(parentTag) : HTMLElement;

	customElements.define(name, class extends parentClass {
		constructor() {
			super();

			// attach the shadow root, with the options used in the created declarative shadow DOM
			this.attachShadow(shadowRoot);

			// clone the shadow root content using a document range
			const shadowRootRange = document.createRange();
			shadowRootRange.selectNodeContents(shadowRoot);
			this.shadowRoot.append(shadowRootRange.cloneContents());
		}
	});
}

document.addEventListener("DOMContentLoaded", () => {
	document.querySelectorAll('define').forEach((defineElement) => {
		defineNewElement(defineElement)
	});
});
