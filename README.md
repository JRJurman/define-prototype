# define-polyfill

Declarative Shadow DOM Definition element - Proposal and Demo

This repo contains a polyfill for the interface described below. You can see the source code in `define-polyfill.js`,
and the examples in the `/example` folder.

## Proposal

The intent of this repository is to propose and describe an interface for defining web-components declaratively (aka
DCE) using Declarative Shadow DOM as a main building block.

It is based on (but very different from) the work done in [Tram-Deco](https://github.com/Tram-One/tram-deco) and intends
to be interoperable with (but is not dependent on) the propsal described in
[inert-html-import](https://github.com/JRJurman/inert-html-import).

In many ways, this is an implementation and modernization of the proposal described in
<a href="https://github.com/WICG/webcomponents/blob/gh-pages/proposals/Declarative-Custom-Elements-Strawman.md">WICG/webcomponents:
Declarative Syntax for Custom Elements</a> (however this implementation does not handle the templating referenced in
that proposal).

### Interface

```html
<define name="ELEMENT_NAME">
  <template shadowrootmode="SHADOW_ROOT_MODE">
    <!-- TEMPLATE_CONTENT -->
  </template>
  <script type="module">
    export default class extends HTMLDeclarativeCustomElement {
      /* property and method definitions */
    }
  </script>
</define>
```

<dl>
  <dt><code>&lt;define&gt;</code></dt>
  <dd>A new element, which indicates to the browser that a new custom element definition should be created and registered in the custom elements registry to be used for the rest of the document.
  <br><br>
  It has a single parameter, <code>name</code>. It has a single javascript attribute, <code>elementConstructor</code>.
  <br><br>
  The <code>define</code> element can (optionally) have a single <code>template</code> child node and a single <code>script</code> child node. These nodes define the shadow root template and the class for the new custom element definition.</dd>

  <dt><code>name</code></dt>
  <dd>The tag name this new component will be associated with in the custom elements registry. This attribute is required and has no default value.</dd>

  <dt><code>elementConstructor</code></dt>
  <dd>A reference to the class used when creating instances of this element. This is undefined if the class failed to be created.</dd>

  <dt><code>&lt;template shadowrootmode="SHADOW_ROOT_MODE"&gt;</code></dt>
  <dd>A child <code>template</code> element with declarative shadow DOM properties. The template itself is optional, but if it does exist it needs a valid <code>shadowRootMode</code>. Any other DSD attributes are also supported, and will be used for the shadow root created in the newly defined web-component.
  <br><br>
  The <code>define</code> element should be excluded from the list of elements that can be valid shadow hosts - the template content will in this case be put in an inert document fragment for the <code>define</code> element, but a live shadow root for instances of the newly defined web component.
  </dd>

  <dt><code>&lt;script type="module"&gt;</code></dt>
  <dd>A child <code>script</code> element with a class definition and export. Like the template element, this element is optional, but if it does exist it needs to be of type <code>module</code> and should have a default export of a class that extends HTMLDeclarativeCustomElement.
  <br><br>
  The exported class will be the class of the web component. If one is not provided, then the <code>define</code> element will create a class that extends <code>HTMLDeclarativeCustomElement</code> on the spot and use that for the component definition.
  </dd>

  <dt><code>HTMLDeclarativeCustomElement</code></dt>
  <dd><code>HTMLDeclarativeCustomElement</code> is a new class that extends the HTMLElement class and provides the default behavior for declaratively defined web-components. Specifically it has an updated constructor that copies a <code>.shadowRootTemplate</code> from the <code>define</code> element.</dd>
</dl>

### Example

#### Simple Template Example

```html
<define name="web-citation">
  <template shadowrootmode="open">
    <style>
      :host {
        display: block;
      }
      #container {
        display: grid;
        grid-template-columns: 2em auto;
      }
      slot[name='published-source'] {
        font-style: italic;
      }
    </style>

    <div id="container">
      <div>[<slot name="reference-no"></slot>]</div>
      <div>
        <slot name="authors"></slot>, "<slot name="title"></slot>",
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

See a live example here: <a href="https://jrjurman.com/define-polyfill/example/basic.html">example/basic.html</a>

#### Javascript Enhanced Example

If we wanted to enhance this with javascript, we can include a script inside the component with an exported class.

```html
<define name="web-citation">
  <template shadowrootmode="open">
    <style>
      :host {
        display: block;
      }
      #container {
        display: grid;
        grid-template-columns: 2em auto;
      }
      slot[name='published-source'] {
        font-style: italic;
      }
    </style>

    <div id="container">
      <div>[<slot name="reference-no"></slot>]</div>
      <div>
        <slot name="authors"></slot>, "<slot name="title"></slot>",
        <slot name="published-source"></slot>
      </div>
    </div>
  </template>

  <script type="module">
    export default class extends HTMLDeclarativeCustomElement {
      connectedCallback() {
        this.addEventListener('click', () => {
          this.style.backgroundColor = 'yellow';
        });
      }
    }
  </script>
</define>
```

See a live example here: <a href="https://jrjurman.com/define-polyfill/example/extends.html">example/extends.html</a>

## Motivation

This proposal represents a small implementation cost to enabling Declarative Custom Elements, that makes use of the
existing Declarative Shadow DOM interface. While other proposals for DCE exist, few use Declarative Shadow DOM as a
building block, and many emphasize capabilities beyond defining new elements with just HTML. While these other
capabilities would be valuable to have in a declarative interface, this proposal focuses on "defining new elements".

## Key Benefits

### Takes Advantage of Existing DSD Attributes

We already have attributes supported on Declarative Shadow DOM, like `shadowRootMode`, `delegatesFocus`, etc, and plan
to add more in most proposals / specs related to web-components. By leveraging DSD templates as a child element to the
definition, we can leverage these declarative attributes in a syntax that is already familiar with developers today.

### Interface is safe for browsers today

For browsers today (without the `<define>` element), adding a template with shadow root properties will not create a
live shadow root. This is good because it means that those templates will remain inert (as document fragments) in both
old browsers, and new browsers that might implement this proposal.

_On chromium browsers this does throw an error in the browser console, but is otherwise safe, and has no user-facing
side-effects._

The script tag with a default export is also safe for browsers today, and doesn't currently cause unintended
side-effects or errors today.

_IDEs today may warn on multiple script tags having a default export, however this is incorrect, as module script tags
operate independently._

## Open Questions & Tradeoffs

### New HTMLDeclarativeCustomElement class with ShadowRootTemplate

The implementation provided here has the following behavior:

1. If a script is provided, then we use that class directly. That class needs to extend `HTMLDeclarativeCustomElement`
   if it wants to have the template populated with the template element in the `<define>` element.
2. If a script is not provided, then we build a class on-the-spot that extends `HTMLDeclarativeCustomElement`.

In an earlier version of this proposal we **always** created a new class that implemented the behavior of
`HTMLDeclarativeCustomElement` (although it was unnamed). This however meant that developers could not override
templates in new component definitions, and meant that even when a developer would provide a class, it was always
overridden by the on-the-spot class created for the shadow root constructor.

### Support for extending components declaratively

Today, to extend another declarative component, a JS script needs to be included. In a previous implementation, this
wasn't required though and instead developers could use an `extends` attribute:

```html
<define name="web-citation" extends="highlightable-element"></define>
```

This has both pros and cons though. While it allows us to declaratively extend elements already defined in the registry,
it complicates the API in scenarios that only actually matter if you have JS:

- If you want to copy the template from the element you are extending, you can only then expand on the javascript
- If you want to copy the script (and include your own shadowRoot), then you are already relying on a JS-enabled
  environment

If we ever wanted to enable extending native elements (a la custom built-ins), we could imagine this as an interface to
that, however those APIs still have yet to be fully defined.

## Interoperability of yet-to-be-spec'd APIs and Features

### Custom Element Registries

One clear gap with this implementation is how this would interface with other custom element registries. One option
could be a named export from the script tag included in the definition.

```html
<define name="web-citation">
  <script type="module">
    const myRegistry = new CustomElementRegistry();
    export { myRegistry as elementRegistry };
  </script>
</define>
```

### Support for Light DOM children

Many DCE implementations offer an ability to define non-shadow-root DOM (light DOM). For the purposes of this polyfill,
that is deemed out of scope, since the Web Components API does not natively expose a way to define light DOM children.

If we wanted to consider cloning children elements into the light DOM, we could imagine the exclusion of a
`shadowRootMode` in the template child node as an indication that those nodes should be directly appended on the element
being connected.

```html
<define name="my-logo">
  <template>
    <img src="/my-logo.png" />
  </template>
</define>

<my-logo>
  <!-- automatically inserted img in light DOM -->
  <img src="/my-logo.png" />
</my-logo>
```

### Importing Element Definitions

In order for authors to feel comfortable building and sharing custom web components, there should be an easy and obvious
way to share element definitions. We could imagine a `src` attribute on the template which might load the shadow root
content. Conversely, we could also support a `src` attribute on the `<define>` element itself, but what shape that
content should be isn't totally clear.

```html
<define name="web-citation">
  <template shadowrootmode="open" src="web-citation.html"></template>
  <script type="module" src="web-citation.js"></script>
</define>
```

There is a reality where HTML Modules would slot nicely as an interface for the `<define>` element.

### Templating API

Most developers agree that something missing from Web Components today is a Templating API. Since this interface makes
use of the existing Declarative Shadow DOM APIs, that we almost certainly would also would like to take advantage of a
Templating API, this shouldn't be blocking to those proposals. Any interfaces that we'd want to build for DSD should be
able to slot in nicely here.

If we decided that Declarative Shadow DOM templates don't need (or shouldn't) have access to these Templating APIs, we
should decide and make clear what features DSD should have going forward.

### Reliance on JS Class Definitions

It could be argued that this implementation does too little, and doesn't on its own offer enough to developers. Many
other proposals propose features that would allow us to lean less heavily on Javascript for dynamic behavior.

Certainly for security inclined developers, it would be nice to have a totally javascript free interface for complex
component behaviors.

The reality however is that the space for those features is not formally defined yet, and may never be defined clearly
until we have a platform interface that gives developers a space to explore declarative element creation. Today, every
Proof of Concept requires some polyfill or script to enable declarative element definitions, so developers that would be
interested in building JS-free components can't even start because the platform does not natively allow a starting place
here.
