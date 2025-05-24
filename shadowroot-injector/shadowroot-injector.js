// function to build template-specific mutation observers
const injectShadowRoot = (node, template) => {
	// build the actual shadow root object in a placeholder (we will copy this later into real elements)
	const shadowRootPlaceholder = document.createElement('template');

	// using setHTMLUnsafe allows us to build the parsed version of the shadowRoot object
	shadowRootPlaceholder.setHTMLUnsafe(`<div>${template.outerHTML}</div>`);
	const shadowRoot = shadowRootPlaceholder.content.children[0].shadowRoot;

	// attach a new shadow to this element using the properties of the shadowroot object that was created
	node.attachShadow(shadowRoot);
	node.shadowRoot.append(template.content.cloneNode(true));
};

const shadowRootInjectorElementMap = new Map();

// Mutation Observer to look for Templates with sri-mode,
// these are templates that we want to copy over to new elements
const shadowrootInjectorWatcher = new MutationObserver((mutationList) => {
	for (const mutation of mutationList) {
		for (const newNode of mutation?.addedNodes || []) {
			// if this element is one that we've registered a shadow root for, attach it
			const newNodeTagName = newNode.tagName?.toUpperCase();
			if (shadowRootInjectorElementMap.has(newNodeTagName)) {
				const newNodeTemplate = shadowRootInjectorElementMap.get(newNodeTagName);
				injectShadowRoot(newNode, newNodeTemplate);
			}

			// if this is the element AFTER an injectable template, register that template for future elements
			// (this will almost always be a TEXT node, even if the next actual element would be an element)
			const previousNode = newNode.previousSibling;
			if (previousNode && previousNode.tagName === 'TEMPLATE' && previousNode.hasAttribute('sri-mode')) {
				const tagName = previousNode.getAttribute('sri-tagname');
				previousNode.setAttribute('shadowrootmode', previousNode.getAttribute('sri-mode'));
				shadowRootInjectorElementMap.set(tagName.toUpperCase(), previousNode);
			}
		}
	}
});
shadowrootInjectorWatcher.observe(document.documentElement, { childList: true, subtree: true });
