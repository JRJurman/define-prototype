# define-dsd-element
Declarative Shadow DOM Definition element - Proposal and Demo

This repo contains a polyfill for the interface described below. You can see the source code in `define-polyfill.js`, and the examples in the `/example` folder.

## Proposal

The intent of this repository is to propose and describe an interface for defining web-components declaratively (aka DCE) using Declarative Shadow DOM as a main building block.

It is based on (but very different from) the work done in [Tram-Deco](https://github.com/Tram-One/tram-deco) and intends to be interoperable with (but is not dependent on) the propsal described in [inert-html-import](https://github.com/JRJurman/inert-html-import).

### Interface

```html
<define name="ELEMENT_NAME">
  <template shadowrootmode="SHADOW_ROOT_MODE">
    TEMPLATE_CONTENT
  </template>
</define>
```

<dl>
  <dt><code>&lt;define&gt;</code></dt>
  <dd>A new element, which indicates to the browser that a new custom element should be defined to be used elsewhere in the document. It has a single parameter, <code>name</code>. The <code>define</code> element should be excluded from the list of elements that can be valid shadow hosts, but is expected to have a child node that is a template with declarative shadow DOM properties (the template content will in this case be put in an inert document fragment).</dd>

  <dt><code>name</code></dt>
  <dd>The tag name this new component will be associated with in the custom elements registry. This attribute is required and has no default value.</dd>
</dl>

### Example

#### Simple Template Example

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

#### Javascript Enhanced Example

If we wanted to enhance this with javascript, we can include a script inside the component with an exported class.

```html
<define element="web-citation">
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

  <script type="module">
    export default class extends HTMLElement {
      connectedCallback() {
        this.addEventListener('click', () => {
          this.style.backgroundColor = 'yellow'
        })
      }
    }
  </script>
</define>
```

See a live example here: <a href="https://jrjurman.com/define-dsd-element/example/extends.html">example/extends.html</a>

## Motivation

This proposal represents a small implementation cost to enabling Declarative Custom Elements, that makes use of the existing Declarative Shadow DOM interface. While other proposals for DCE exist, few use Declarative Shadow DOM as a building block, and many emphasize capabilities beyond defining new elements with just HTML. While these other capabilities would be valuable to have in a declarative interface, this proposal focuses on "defining new elements".

## Key Benefits

### Takes Advantage of Existing DSD Attributes

We already have attributes supported on Declarative Shadow DOM, like `shadowRootMode`, `delegatesFocus`, etc, and plan to add more in most proposals / specs related to web-components. By leveraging DSD templates as a child element to the definition, we can leverage these declarative attributes in a syntax that is already familiar with developers today.

### Interface is safe for browsers today

For browsers today (without the `<define>` element), adding a template with shadow root properties will not create a live shadow root. This is good because it means that those templates will remain inert (as document fragments) in both old browsers, and new browsers that might implement this proposal.

_On chromium browsers this does throw an error in the browser console, but is otherwise safe, and has no user-facing side-effects._

The script tag with a default export is also safe for browsers today, and doesn't currently cause unintended side-effects or errors today.

###

## Open Questions

### Templating API

Most developers agree that something missing from Web Components today is a Templating API. Since this interface makes use of the existing Declarative Shadow DOM APIs, that we almost certainly would also want to take advantage of a Templating API, this shouldn't be blocking to those proposals. Any interfaces that we'd want to build for DSD should be able to slot in nicely here.

### Custom Element Registries

One clear gap with this implementation is how this would interface with other custom element registries.
One option could be a named export from the script tag included in the definition.

```html
<define name="web-citation">
  <script>
    const myRegistry = new CustomElementRegistry();
    export { myRegistry as elementRegistry }
  </script>
</define>
```

### Importing Element Definitions

In order for authors to feel comfortable building and sharing custom web components, there should be an easy and obvious way to share element definitions. We could imagine a `src` attribute on the template which might load the shadow root content. Conversely, we could also support a `src` attribute on the `<define>` element itself, but what shape that content should be isn't totally clear.

```html
<define name="web-citation">
  <template shadowrootmode="open" src="web-citation.html"></template>
  <script type="module" src="web-citation.js"></script>
</define>
```
