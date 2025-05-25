# ShadowRoot Injector

The idea of this example is to demonstrate how we might incrementally introduce a declarative interface for stamp-able
templates by creating an initial shadow root that is automatically inserted into elements using a mutation observer.
Users can afterwards upgrade the element to a proper custom element using the existing class definition.

## Example

You can see the following example live here:
https://jrjurman.com/define-prototype/shadowroot-injector/example/basic.html

```html
<!-- first, build a template that will be picked up by the ShadowRoot Injector -->
<template sri-tagname="highlightable-title" sri-mode="open">
  <style>
    :host {
      display: block;
    }
  </style>
  <h1>Hello <slot></slot></h1>
</template>

<!-- second, have instances of the component -->
<highlightable-title>World</highlightable-title>

<!-- third, upgrade the component with dynamic behavior -->
<script>
  customElements.define(
    'highlightable-title',
    class extends HTMLElement {
      connectedCallback() {
        this.addEventListener('click', () => {
          this.style.background = 'yellow';
        });
      }
    }
  );
</script>
```
