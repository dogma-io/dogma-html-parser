# dogma-html-parser

HTML parser and compiler.

## Parser

To parse an HTML string into an AST you can do the following:

```js
import {parse} from 'dogma-html-parser'

const html = '<div class="test">Foo bar</div>'
const ast = parse(html)
```

The above example will set the constant **ast** to the following AST:

```json
{
  "attributes": {
    "class": "test"
  },
  "children": [
    {
      "text": "Foo bar",
      "type": "text"
    }
  ],
  "name": "div",
  "type": "element"
}
```

It is worth noting the parser tries to be forgiving in terms of invalid
whitespace, and by default will strip out unnecessary whitespace that doesn't
actually get rendered by browsers. For example if you parse then compile the
following:

```html
< div > Test < /div >
```

You'll end up with:

```html
<div>Test</div>
```

## Compiler

The compiler simply takes an AST and converts it to an HTML string like so:

```js
import {compile} from 'dogma-html-parser'

const ast = {
  attributes: {
    'class': 'test',
  },
  children: [
    {
      text: 'Foo bar',
      type: 'text',
    },
  ],
  name: 'div',
  type: 'element',
}

const html = compile(ast)
```

The above example will set the constant **html** to the following HTML string:

```html
<div class="test">Foo bar</div>
```
