### Sections
- [Introduction](#Introduction)
- [Goal](#Goal)
- [Links](#Links)
- [Example](#Example)
- [Why?](#Why?)

# Note to all
This project is in its early stages and is not well defined yet.
It is fully functional but the interfaces may change.
The name "customElementsNode" is also a working title and is subject to change

# Introduction
This project is meant to serve as a way to use web components in place of a framework. By no means is this meant to act as a replacement for frameworks (React, Angular, Vue, ...). If you are looking for something simple, performant, with server-side rendering support then this project may interest you.

# Goal
To create a set of tools that let you serve web-components from a server, Pre-render templates on the server, and use web-components as a web page.

# Links
[MDZ Web Components](https://developer.mozilla.org/en-US/docs/Web/Web_Components)
[Web Components site](https://www.webcomponents.org/introduction)

# Example:
For a full example take a look at the example folder.
```javascript
  // run example locally
  // clone the repo
  npm i
  npm run example
```

This is a short example of serving a page from an Expess server that can re-render on the font end
```javascript
// express endpoint
app.get('/home', async (req, res) => {
  res.send(pageTemplate(await buildPage()))
});

// page template
const {
  browserScripts,
  html
} = require('customElementsNode');

function pageTemplate({ title, body }) {
  return html`
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <title>${title}</title>
      <meta http-equiv="Cache-Control" content="no-store" />
      <script src="https://unpkg.com/axios/dist/axios.min.js"></script>
      ${browserScripts.include()}
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
} = require('customElementsNode');
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
          <select onchange="$homePage.stateSelectChange(this.value)">
            <option value="" disabled ${this.selectedState === null ? 'selected' : ''}>State...</option>
            ${this.states.map(s => html`
              <option value="${s.name}" ${this.selectedState === s.name ? 'selected' : ''}>${s.name}</option>
            `).join('\n')}
          </select>

          <select onchange="$homePage.citySelectChange(this.value)">
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
  return {
    title: 'Interactive',
    body: page.template({ states })
  };
};
```

# Why?
Many may ask why am I creating this. At the time I created this repo, I was in the process of interviewing for a new job. Almost every person asked me what frameworks I preferred. I started developing in the web prior to any frameworks being available. So when I thought about the question of which framework, the only answer I could confidently say was "I don't prefer any of them". This does not mean I do not see value in frameworks or do not enjoy working in them, because I do see value and have built some great projects with some of them. But the web has progressed and matured, and many of the faults that libraries like JQuery and frameworks like React have done an amazing job at filling, now have native version in the browsers with great compatibility.

So I decided to take a hard look and try my hand at how I might build my next web application. What you see here is the fruits of my research. I realized that web components solve one of the biggest problems that could not be achieved without a framework in the past. The ability to scope code to a block of HTML. Almost all the other features needed to work in the web (querySelector, template literals, ...) are available natively in the majority of browsers today.
