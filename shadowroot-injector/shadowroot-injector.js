class ShadowRootInjector {
	constructor() {
		// map of known element tag names to shadow root template definitions
		this.shadowRootInjectorElementMap = new Map();

		// Mutation Observer to register templates as known element definitions
		this.templateDefinitionObserver = new MutationObserver((mutationList) => {
			this.checkAndRegisterTemplatesForMutationLists(mutationList);
		});

		// Mutation Observer to look for registered elements with known template definitions
		this.registeredElementObserver = new MutationObserver((mutationList) =>
			this.checkAndInsertShadowRootsForMutationLists(mutationList)
		);
	}

	/** function that attaches a shadow root template to a given node */
	injectShadowRoot(node, template) {
		// build the actual shadow root object in a placeholder (we will copy this later into real elements)
		const shadowRootPlaceholder = document.createElement('template');

		// using setHTMLUnsafe allows us to build the parsed version of the shadowRoot object
		shadowRootPlaceholder.setHTMLUnsafe(`<div>${template.outerHTML}</div>`);
		const shadowRoot = shadowRootPlaceholder.content.children[0].shadowRoot;

		// attach a new shadow to this element using the properties of the shadowroot object that was created
		node.attachShadow(shadowRoot);
		node.shadowRoot.append(template.content.cloneNode(true));
	}

	/** function that registers a template to be used later with custom elements */
	registerTemplateDefinition(template) {
		const tagName = template.getAttribute('sri-tagname');
		// to be able to actually attach a shadowroot, we'll clone and set the shadowroot mode
		const shadowRootTemplate = template.cloneNode(true);
		shadowRootTemplate.setAttribute('shadowrootmode', template.getAttribute('sri-mode'));
		shadowRootTemplate.removeAttribute('sri-tagname');
		shadowRootTemplate.removeAttribute('sri-mode');
		this.shadowRootInjectorElementMap.set(tagName.toUpperCase(), shadowRootTemplate);
	}

	/** function that takes in a mutation list and registers any templates as element definitions */
	checkAndRegisterTemplatesForMutationLists(mutationList) {
		for (const mutation of mutationList) {
			for (const newNode of mutation?.addedNodes || []) {
				// if this is the element AFTER an injectable template, register that template for future elements
				// (this will almost always be a TEXT node, even if the next actual element would be an element)
				const previousNode = newNode.previousSibling;
				if (previousNode && previousNode.tagName === 'TEMPLATE' && previousNode.hasAttribute('sri-mode')) {
					this.registerTemplateDefinition(previousNode);
				}
			}
		}
	}

	/** function that takes in a mutation list and inserts templates for already registered elements */
	checkAndInsertShadowRootsForMutationLists(mutationList) {
		for (const mutation of mutationList) {
			for (const newNode of mutation?.addedNodes || []) {
				const newNodeTagName = newNode.tagName;
				if (this.shadowRootInjectorElementMap.has(newNodeTagName)) {
					const newNodeTemplate = this.shadowRootInjectorElementMap.get(newNodeTagName);
					this.injectShadowRoot(newNode, newNodeTemplate);
				}
			}
		}
	}

	/** function that starts both of the mutation observers */
	start() {
		this.templateDefinitionObserver.observe(document.documentElement, { childList: true, subtree: true });
		this.registeredElementObserver.observe(document.documentElement, { childList: true, subtree: true });
	}

	/** function to stop both of the mutation observers */
	stop() {
		this.templateDefinitionObserver.disconnect();
		this.registeredElementObserver.disconnect();
	}
}

// check if the script tag has a `autostart` attribute (this indicates we should build and start the injector),
// otherwise we'll defer to the user to do this in their own script
if (document.currentScript.hasAttribute('autostart')) {
	window.shadowRootInjector = new ShadowRootInjector();
	window.shadowRootInjector.start();
}
