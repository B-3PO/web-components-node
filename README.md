### Sections
- [Introduction](#Introduction)
- [Goal](#Goal)
- [Links](#Links)
- [Config](#Config)
- [Example](#Example)
- [Features](#Features)
  - [HTML Templates](#featuer1)
  - [Attach code to an element](#featuer2)
- [Why?](#Why?)

# Note to all
This project is in its early stages
web-components-node is fully functional but the interfaces may change

# Introduction
This project is meant to serve as a way to use web components in place of a framework. By no means is this meant to act as a replacement for frameworks (React, Angular, Vue, ...). If you are looking for something simple, performant, with server-side rendering support then this project may interest you.

# Goal
To create a set of tools that let you serve web-components from a server, Pre-render templates on the server, and use web-components as a web page.

# Links
[MDZ Web Components](https://developer.mozilla.org/en-US/docs/Web/Web_Components)
[Web Components site](https://www.webcomponents.org/introduction)

# Config
```javascript
const { setConfig } = require('web-components-node')

setConfig({
  /*
   * default: 'template'
   * The default method name for templates used by the template renderer
   */
  templateMethod: 'template',

  /*
   * default: true
   * This will memoize certain methods to prevent unnecessary processing
   * This is essantially equal to static file performance after the first request
   */
  memoize: true,

  /*
   * default: true
   * This will minify the js in component script tags and the component tmeplate html
   * This can help redice file size
   */
  minify: true,

  /*
   * default: true
   * user built in service worker to manage cache
   */
  serviceWorker: true
});
```

# Example:
For a full example take a look at the documentation site [github](https://github.com/B-3PO/web-components-node-website)
```bash
  # run example locally
  # clone the repo
  npm i
  npm run example
```

This is a short example of serving a page from an Expess server that can re-render on the font end. This example assumes you have previous knowledge of Node+Expressjs
```javascript
// express endpoint
const { fileHandler } = require('web-components-node');
app.use(fileHandler.expressFileHandler);
app.get('/home', async (req, res) => {
  res.send(pageTemplate(await buildPage()))
});

// page template
const {
  browserScripts,
  html
} = require('web-components-node');

function pageTemplate({ title, head, body }) {
  return html`
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <title>${title}</title>
      <meta http-equiv="Cache-Control" content="no-store" />
      <script src="https://unpkg.com/axios/dist/axios.min.js"></script>
      <link rel="stylesheet" href="/wcn.css">
      <script src="/wcn.js"></script>
      ${head}
    </head>

    <body>
      ${body}
    </body>
  </html>
  `;
}

// page module
const {
  customElements,
  HTMLElement,
  html
} = require('web-components-node');
const { getStates } = require('../services/states');


const page = customElements.defineWithRender('home-page', class extends HTMLElement {
  constructor() {
    super();
    this.list = [];
    this.states = [];
    this.cities = [];
    this.selectedState = null;
    this.selectedCity = null;
  }

  async connectedCallback() {
    const { data } = await axios.get('/api/states');
    this.states = data.states;
    this.render();
  }

  template() {
    return html`
      <div id="content">
        <h2>Interactive</h2>

        <div>
          <select onChange="$homePage.stateSelectChange(this.value)">
            <option value="" disabled ${this.selectedState === null ? 'selected' : ''}>State...</option>
            ${this.states.map(s => html`
              <option value="${s.name}" ${this.selectedState === s.name ? 'selected' : ''}>${s.name}</option>
            `).join('\n')}
          </select>

          <select onChange="$homePage.citySelectChange(this.value)">
            <option value="" disabled ${this.selectedCity === null ? 'selected' : ''}>City...</option>
            ${this.cities.map(c => html`
              <option value="${c.name}" ${this.selectedCity === c.name ? 'selected' : ''}>${c.name}</option>
            `).join('\n')}
          </select>
        </div>
      </div>
    `;
  }

  stateSelectChange(value) {
    this.selectedState = value;
    const state = this.states.find(i => i.name === value);
    if (state) this.cities = state.cities;
    else this.cities = [];
    this.selectedCity = null;
    this.render();
  }

  citySelectChange(value) {
    this.selectedCity = value;
  }
});

async function buildPage() {
  const states = await getStates();
  return page.build({ states }); // { title, body, head }
};
```

# Features
Here is a list of features that frameworks provide. I will show how you can use native web features to achieve them. I will also show how using this library can help make using these features simpler.

#### 1. <a name="featuer1"></a> Templating HTML
There are many ways to Template html. You can use template languages (mustache, ejs, ...) and render on the server-side. You can use one of the many frameworks and create a SPA (single page application). Since ES6 we can now use a native feature called Template literals (AKA template strings) to render our HTML. This means that you can render on both the server and the client because this is just javascript.

**ES6 Template Literals**
```javascript
function template({ title, list }) {
  return html`
    <h2>${title}</h2>

    <ul>
      ${list.map(i => html`
        <li>${i}</li>
      `)}
    </ul>
  `;
}
template({
  title: 'Hello',
  list: [1,2,3]
});
```

#### 2. <a name="featuer2"><a/>Attached code to an Element
Prior to frameworks there was no way to attach a function to an element. The only option was to make everything global. This is one of the biggest problems that frameworks solved. Most frameworks will let you create a custom element and a controller that is attached to it. Now we have web components, and it is now easy to natively attached a class to an element by extending HTMLElement.

**Web Component :  customeElements**
```javascript
customElements.define('some-element', class extends HTMLElement {
  constructor() {
    super();
    this.name = 'the name';
    this.root = this.attachShadow({ mode: 'open' });
    this.root.append(document.querySelector('#someElement').content.cloneNode(true));
  }

  // this method is accessible to an the element
  someMethod() {
    alert('some method called');
  }
});
```

```HTML
<template id="someElement">
  <!-- notice that we are using the template id to access the method on the HTMLElement class -->
  <button onClick="someElement.someMethod()">the button</button>
</template>

<some-element></some-element>
```

# Why?
At the time I created this repo I was in the process of interviewing for a new job. Almost every company asked me what frameworks I preferred. My development experience in the web started prior to frameworks being available, so when I thought about the question of which framework, the only answer I could confidently say was "I don't prefer any of them". This does not mean I do not see value in frameworks or do not enjoy working in them, because I do see value and have built some great projects with some of them. But now you can find native alternatives to many of the features that frameworks fulfilled.

I decided to take a hard look at how I might build my next web application. What you see here is the fruits of my research. I realized that web components solve one of the biggest problems that could not be achieved without a framework in the past. The ability to scope code to a block of HTML. Almost all the other features needed to work in the web (querySelector, template literals, ...) are available natively in the majority of browsers today.
