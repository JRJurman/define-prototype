# HTMLDefinitionElement-prototype

> [!note]
>
> Based on the discussions in the Web Components Community Discord, I'll be updating this proposal to reflect the latest
> feedback and suggestions. You can follow or join the dedicated discussion on discord here:
> [define-prototype - DCE with Declarative Shadow DOM](https://discord.com/channels/767813449048260658/1360794795810881717)

This Repository is a proposal and functional demo of a potential Declarative Custom Elements interface. It strives to be
as minimal as possible, and serve the most immediate needs for discussing possible standards when it comes to building
element definitions declaratively.

## General Interface

```html
<definition name="TAG_NAME">
  <shadowrootoptions DECLARATIVE_SHADOW_DOM_ATTRIBUTES></shadowrootoptions>
  <template> TEMPLATE_CONTENT </template>
  <script type="module">
    export default HTML_ELEMENT_CLASS;
  </script>
</definition>
```

### Example

```html
<proto-definition name="my-title" id="myTitleComponent">
  <proto-shadowrootoptions shadowrootmode="open"></proto-shadowrootoptions>
  <template>
    <style>
      :host {
        display: block;
      }
    </style>
    <span>Title: <slot></slot></span>
  </template>
  <script>
    export default class extends HTMLElement {
      connectedCallback() {
        this.addEventListener('click', () => {
          this.style.fontWeight = 'bold';
        });
      }
    }
  </script>
</proto-definition>

<my-title>My First Web Component</my-title>
```

## Proposed Additions and Changes

### New `HTMLDefintionElement`

A new HTML Element that enables the declarative definition of Web Components. It is responsible for building the class
(if one is not provided), and registering the element to a custom elements registry.

**Attributes**

<dl>
	<dt><code>name</code></dt>
	<dd>A required attribute, it is the name that the new element definition will be registered with.</dd>
</dl>

**Instance Properties**

<dl>
	<dt><code>elementConstructor</code></dt>
	<dd>The class created for the new element definition. This is <code>undefined</code> if the class failed to be created.</dd>
</dl>

**Child Elements**

<dl>
	<dt><code>HTMLShadowRootOptionsElement</code></dt>
	<dd>An optional element which describes what options to be used when building an associated template element when instances of the newly defined web component are created.</dd>
	<dt><code>HTMLTemplateElement</code></dt>
	<dd>An optional element which allows the author to define a shadow root template for instances of their new web component definition. If no template element is defined, then we either use the parent element's template, or the new component will be generated with no content.</dd>
	<dt><code>HTMLScriptElement</code></dt>
	<dd>An optional element which allows the author to define a class to be used as the components class when the element is registered. The type should be <code>module</code> and should have a default export of a class that extends <code>HTMLElement</code></dd>
</dl>

**Open Questions:**

### New `HTMLShadowRootOptionsElement`

A new HTML Element that describes the Shadow Root Properties that will be used for

**Open Questions:**

### Update the Behavior of `HTMLElement` to automatically attach a template

To make the current experience of extending elements easy and obvious, we should build an interface on the base class
for Custom HTML Elements that allows them to automatically attach a template.

This means that any class that is used for Custom Element Definitions (whether they are created ad-hoc or provided) will
work with the new declarative interface.

**Open Questions:**

- Should we have a new base class with this behavior (e.g. `HTMLDeclarativeElement`)?
- Could we instead only provide the shadow template to elements defined with an `HTMLDefinitionElement`?

### Ability to reference exports of inline module scripts

**Open Questions:**
