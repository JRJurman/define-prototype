# Upgradable Declarative Custom Elements from DSD Templates

The idea of this example is to demonstrate how we might incrementally introduce a declarative interface for stamp-able
templates by creating an initial web components class for elements that copy a shadow root, and then later can be
upgraded again with JS functionality.

> [!warning]
>
> There are a lot of caveats with the syntax described here. This is purely for demonstration purposes, and should
> certainly be wrapped in different element interfaces if adopted into standards

## Example

You can see the following example live here:

```html
<!-- first, build a component definition with a shadow root template -->
<template tagname="highlightable-title" shadowrootmode="open">
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
  customElements.upgradeClass(
    'highlightable-title',
    class {
      connectedCallback() {
        this.shadowRoot.querySelector('h1').addEventListener('click', () => {
          this.style.background = 'yellow';
        });
      }
    }
  );
</script>
```

The above example is broken into three steps:

1. build an template for a component definition
2. allow component instances in the document
3. upgrade the component with dynamic behavior

## Key Principles

The syntax above is merely for demonstration purposes, the key concepts / questions are the following:

1. Do we want to separate the definition of Shadow Root Templates and other behaviors for DCE?
2. Is upgrading a class that already exists something we want to enable?
