# define-dsd-element
Declarative Shadow DOM Definition element - Proposal and Demo

> [!important]
> At this point, this repository represents a proposal only. A demo implementation will (hopefully) be coming soon.

## Proposal

The intent of this repository is to propose and describe an interface for defining web-components using Declarative Shadow DOM as a main building block.

It is based on (but very different from) the work done in [Tram-Deco](https://github.com/Tram-One/tram-deco) and intends to be interoperable with (but is not dependent on) the propsal described in [inert-html-import](https://github.com/JRJurman/inert-html-import).

### Interface

```html
<define element="ELEMENT_NAME" extends="CLASS_NAME">
  <template shadowrootmode="SHADOW_ROOT_MODE">
    TEMPLATE_CONTENT
  </template>
</define>
```

<dl>
  <dt><code>&lt;define&gt;</code></dt>
  <dd>A new element, which indicates to the browser that an HTML element should be defined to be used elsewhere in the document. It has two parameter, <code>element</code> and <code>extends</code>.</dd>

  <dt><code>element</code></dt>
  <dd>An attribute which describes the tag name used to create instances of this element. This attribute is required and has no default value.</dd>
  
  <dt><code>extends</code></dt>
  <dd>An attribute which describes what class to base this element definition off of. The default value should be <code>HTMLElement</code>.</dd>
</dl>

### Example

A basic example that needs no javascript:

```html
<define element="web-citation">
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
</define>

<web-citation>
  <span slot="reference-no">1</span>
  <span slot="authors">J. Jurman</span>
  <span slot="title">Proposal For Declarative Shadow DOM driven definitions</span>
  <span slot="published-source">Github</span>
</web-citation>
```

If we wanted to enhance this with javascript, we could create the following class first, and then use the `extends` property on the `<define>` element:

```html
<script>
class CopyableElement extends HTMLElement {
  connectedCallback() {
    this.addEventListener('click', () => {
      navigator.clipboard.writeText(this.textContent);
    })
  }
}
</script>

<define element="web-citation" extends="CopyableElement">
  ...
</define>
```
