# define-dsd-element
Declarative Shadow DOM Definition element - Proposal and Demo

This repo contains a polyfill for the interface described below. You can see the source code in `define-polyfill.js`, and the examples in the `/example` folder.

## Proposal

The intent of this repository is to propose and describe an interface for defining web-components declaratively (aka DCE) using Declarative Shadow DOM as a main building block.

It is based on (but very different from) the work done in [Tram-Deco](https://github.com/Tram-One/tram-deco) and intends to be interoperable with (but is not dependent on) the propsal described in [inert-html-import](https://github.com/JRJurman/inert-html-import).

In many ways, this is an implementation and modernization of the proposal described in <a href="https://github.com/WICG/webcomponents/blob/gh-pages/proposals/Declarative-Custom-Elements-Strawman.md">WICG/webcomponents: Declarative Syntax for Custom Elements</a> (however this implementation does not handle the templating referenced in that proposal).

### Interface

```html
<define name="ELEMENT_NAME">
  <template shadowrootmode="SHADOW_ROOT_MODE">
    <!-- TEMPLATE_CONTENT -->
  </template>
  <script type="module">
    export default class extends HTMLElement {
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
  The <code>define</code> element can (optionally) have a single <code>template</code> child node and a single <code>script</code> child node. These nodes define the shadow root template and parent class for the new custom element.</dd>

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
  <dd>A child <code>script</code> element with a class definition and export. Like the template element, this element is optional, but if it does exist it needs to be of type <code>module</code> and should have a default export of a class that extends HTMLElement. This class will be used as a parent class.</dd>
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

_IDEs today may warn on multiple script tags having a default export, however this is incorrect, as module script tags operate independently._

## Open Questions

### Custom Element Registries

One clear gap with this implementation is how this would interface with other custom element registries.
One option could be a named export from the script tag included in the definition.

```html
<define name="web-citation">
  <script type="module">
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

There is a reality where HTML Modules would slot nicely as an interface for the `<define>` element.

## Tradeoffs

### Templating API

Most developers agree that something missing from Web Components today is a Templating API. Since this interface makes use of the existing Declarative Shadow DOM APIs, that we almost certainly would also would like to take advantage of a Templating API, this shouldn't be blocking to those proposals. Any interfaces that we'd want to build for DSD should be able to slot in nicely here.

If we decided that Declarative Shadow DOM templates don't need (or shouldn't) have access to these Templating APIs, we should decide and make clear what features DSD should have going forward.

### Reliance on JS Class Definitions

It could be argued that this implementation does too little, and doesn't on its own offer enough to developers. Many other proposals propose features that would allow us to lean less heavily on Javascript for dynamic behavior.

Certainly for security inclined developers, it would be nice to have a totally javascript free interface for complex component behaviors.

The reality however is that the space for those features is not formally defined yet, and may never be defined clearly until we have a platform interface that gives developers a space to explore declarative element creation. Today, every Proof of Concept requires some polyfill or script to enable declarative element definitions, so developers that would be interested in building JS-free components can't even start because the platform does not natively allow a starting place here.
