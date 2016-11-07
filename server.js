require('jsdom-global')();
require('raf').polyfill();
require('document-register-element/build/document-register-element');
require('@webcomponents/shadydom');



// Skate

const { Component, define, h, prop, ready } = require('./dist/index-with-deps');


function stringify (node) {
  const { ELEMENT_NODE, TEXT_NODE } = Node;
  const { nodeType } = node;

  if (nodeType === TEXT_NODE) {
    return node.textContent;
  } else if (nodeType !== ELEMENT_NODE) {
    return '';
  }

  const { shadowRoot } = node;

  let att = node.attributes;
  let str = '';
  let tag = node.tagName.toLowerCase();

  att = [].map.call(att, a => `${a.name}="${a.value}"`);
  att = att.join(' ');
  att = att ? ` ${att}` : '';

  const chs = [].map.call(node.childNodes, stringify);
  const shr = shadowRoot ? `
    <script>
      var el = document.currentScript.previousElementSibling;
      el.attachShadow({ mode: 'open' });
      el.shadowRoot.innerHTML = '${[].map.call(shadowRoot.childNodes, stringify)}';
    </script>
  ` : '';

  return `<${tag}${att}>${chs}</${tag}>${shr}`;
}

function render (Root, callback) {
  const root = new Root();
  document.body.appendChild(root);
  setTimeout(() => {
    callback(stringify(root));
  }, 10);
}

const Comp1 = define('x-test1', class extends Component {
  static get props () {
    return {
      test1: prop.string({ default: 'test1' })
    };
  }
  static render (elem) {
    return h(Comp2, 'test');
  }
});

const Comp2 = define('x-test2', class extends Component {
  static get props () {
    return {
      test2: prop.string({ default: 'test2' })
    };
  }
  static render (elem) {
    return h(Comp3, h('slot'));
  }
});

const Comp3 = define('x-test3', class extends Component {
  static get props () {
    return {
      test3: prop.string({ default: 'test3' })
    };
  }
  static render (elem) {
    return h('span', h('slot'));
  }
});

render(Comp1, (str) => {
  console.log(str);
});
