# define-dsd-element
Declarative Shadow DOM Definition element - Proposal and Demo

## Proposal

The intent of this repository is to propose and describe an interface for defining web-components using Declarative Shadow DOM as a main building block.

It is based on (but very different from) the work done in [Tram-Deco](https://github.com/Tram-One/tram-deco) and intends to be interoperable with (but is not dependent on) the propsal described in [inert-html-import](https://github.com/JRJurman/inert-html-import).

### Interface

```html
<define-element name="ELEMENT_NAME" extends="PARENT_TAG_NAME">
  <template shadowrootmode="SHADOW_ROOT_MODE">
    TEMPLATE_CONTENT
  </template>
</define-element>
```

<dl>
  <dt><code>&lt;define-element&gt;</code></dt>
  <dd>A new element, which indicates to the browser that an HTML element should be defined to be used elsewhere in the document. It has two parameter, <code>element</code> and <code>extends</code>. For the purposes of the demo, this is a hyphenated web-component.</dd>

  <dt><code>name</code></dt>
  <dd>An attribute which describes the tag name used to create instances of this element. This attribute is required and has no default value.</dd>

  <dt><code>extends</code></dt>
  <dd>An attribute which references another web-component tag to extend off of. When not provided, the newly defined element extends the HTMLElement class.</dd>
</dl>

### Example

A basic example that needs no javascript:

```html
<define-element name="web-citation">
  <template shadowrootmode="open">
    <style>
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
</define-element>

<web-citation>
  <span slot="reference-no">1</span>
  <span slot="authors">J. Jurman</span>
  <span slot="title">Proposal For Declarative Shadow DOM driven definitions</span>
  <span slot="published-source">Github</span>
</web-citation>
```

See a live example here: <a href="jrjurman.com/define-dsd-element/example/basic.html">example/basic.html</a>

If we wanted to enhance this with javascript, we could create the following class first, and then use the `extends` property on the definition element:

```html
<script>
class CopyableElement extends HTMLElement {
  connectedCallback() {
    this.addEventListener('click', () => {
      navigator.clipboard.writeText(this.textContent);
    })
  }
}

customElements.define('copyable-element', CopyableElement)
</script>

<define element="web-citation" extends="copyable-element">
  ...
</define>
```

See a live example here: <a href="jrjurman.com/define-dsd-element/example/extends.html">example/extends.html</a>
