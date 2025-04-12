# define-dsd-element
Declarative Shadow DOM Definition element - Proposal and Demo

This repo contains a polyfill for the interface described below. You can see the source code in `define-polyfill.js`, and the examples in the `/example` folder.

## Proposal

The intent of this repository is to propose and describe an interface for defining web-components declaratively (aka DCE) using Declarative Shadow DOM as a main building block.

It is based on (but very different from) the work done in [Tram-Deco](https://github.com/Tram-One/tram-deco) and intends to be interoperable with (but is not dependent on) the propsal described in [inert-html-import](https://github.com/JRJurman/inert-html-import).

### Interface

```html
<define name="ELEMENT_NAME" extends="PARENT_TAG_NAME">
  <template shadowrootmode="SHADOW_ROOT_MODE">
    TEMPLATE_CONTENT
  </template>
</define>
```

<dl>
  <dt><code>&lt;define&gt;</code></dt>
  <dd>A new element, which indicates to the browser that a new custom element should be defined to be used elsewhere in the document. It has two parameters, <code>name</code> and <code>extends</code>. It should be excluded from the list of elements that can be valid shadow hosts, but is expected to have a child node that is a template with declarative shadow DOM properties (the template content will in this case be put in a document fragment).</dd>

  <dt><code>name</code></dt>
  <dd>The tag name this new component will be associated with in the custom elements registry. This attribute is required and has no default value.</dd>

  <dt><code>extends</code></dt>
  <dd>An attribute which references another custom element to extend off of. When not provided, the newly defined element extends the <code>HTMLElement</code> class.</dd>
</dl>

### Example

A basic example that needs no javascript:

```html
<define name="web-citation">
  <template shadowrootmode="open">
    <style>
      :host { display: block; }
      #container { display: grid; grid-template-columns: 2em auto; }
      slot[name="published-source"] { font-style: italic; }
    </style>

    <div id="container">
      <div>[<slot name="reference-no"></slot>]</div>
      <div>
        <slot name="authors"></slot>,
        "<slot name="title"></slot>",
        <slot name="published-source"></slot>
      </div>
    </div>
  </template>
</define>

<web-citation>
  <span slot="reference-no">1</span>
  <span slot="authors">J. Jurman</span>
  <span slot="title">Proposal For Declarative Shadow DOM driven definitions</span>
  <span slot="published-source">Github</span>
</web-citation>
```

See a live example here: <a href="https://jrjurman.com/define-dsd-element/example/basic.html">example/basic.html</a>

If we wanted to enhance this with javascript, we could create the following class first, and then use the `extends` property on the definition element:

```html
<script>
class HighlightElement extends HTMLElement {
	connectedCallback() {
		this.addEventListener('click', () => {
			this.style.backgroundColor = 'yellow'
		})
	}
}

customElements.define('highlight-element', HighlightElement)
</script>

<define element="web-citation" extends="highlight-element">
  ...
</define>
```

See a live example here: <a href="https://jrjurman.com/define-dsd-element/example/extends.html">example/extends.html</a>

## Motivation

This proposal represents a small implementation cost to enabling Declarative Custom Elements, that makes use of the existing Declarative Shadow DOM interface. While other proposals for DCE exist, few use Declarative Shadow DOM as a building block, and many emphasize capabilities beyond defining new elements with just HTML. While these other capabilities would be valuable to have in a declarative interface, this proposal focuses on "defining new elements".

## Key Benefits

### Takes Advantage of Existing DSD Attributes

We already have attributes supported on Declarative Shadow DOM, like `shadowRootMode`, `delegatesFocus`, etc, and plan to add more in most proposals / specs related to web-components. By leveraging DSD templates as a child element to the definition, we can leverage these declarative attributes in a syntax that is already familiar with developers today.

### Shadow Roots are already inert on the `<define>` element

For browsers today (without the `<define>` element), adding a template with shadow root properties will not create a live shadow root. This is good because it means that those templates will remain inert (as document fragments) in both old browsers, and new browsers that might implement this proposal.

This behavior will continue to exist so long as `<define>` is not added as a valid target for shadow roots (the list for which is actually [strictly defined in the spec](https://dom.spec.whatwg.org/#valid-shadow-host-name)).

## Open Questions

### Tag-Name for Extends

Ideally we would be able to reference a Class directly, rather than relying on a registered element, however the existing APIs make it relatively simple to do a class name lookup using a string tag name.

If the APIs allow us to pass in a ClassName directly as an attribute, we could imagine that as a more straight-forward interface (not necessitating registering an element), but using a tag-name doesn't feel too in-elegant.

### Custom Element Registries

One clear gap with this implementation is how this would interface with other element registries. We could imagine a new `registry` prop, but that would require passing in a string reference (a similar problem to the `extends` attribute).

One option could also be to use the registry of the element you are extending. For authors that want a totally new registry, they could first register a base element in the registry that they want to populate.

```html
<script>
  const myRegistry = new CustomElementRegistry();
  myRegistry.define('my-registry-base', HTMLElement);
</script>

<define name="web-citation" extends="my-registry-base">
</define>
```

### Importing Element Definitions

In order for authors to feel comfortable building and sharing custom web components, there should be an easy and obvious way to share element definitions. We could imagine a `src` attribute on the template which might load the shadow root content. Conversely, we could also support a `src` attribute on the `<define>` element itself, but what shape that content should be isn't totally clear.

```html
<define name="web-citation">
  <template shadowrootmode="open" src="web-citation.html">
</define>
```
