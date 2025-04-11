class DefineElement extends HTMLElement {
	connectedCallback() {
		// set the element style to be hidden
		this.style.display = 'none';

		// pull attributes for element definition
		const name = this.getAttribute('name');
		const shadowRoot = this.shadowRoot;
		const parentTag = this.getAttribute('extends');
		const parentClass = parentTag ? customElements.get(parentTag) : HTMLElement;

		// define new element
		customElements.define(name, class extends parentClass {
			constructor() {
				super();
				this.attachShadow(shadowRoot);

				// clone the shadow root content using a document range
				const shadowRootRange = document.createRange();
				shadowRootRange.selectNodeContents(shadowRoot);
				this.shadowRoot.append(shadowRootRange.cloneContents());
			}
		});

	}
}

customElements.define('define-element', DefineElement);
