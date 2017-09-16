import {parse} from '../parser'

import {
  CHILDREN_TYPE,
  COMMENT_TYPE,
  ELEMENT_TYPE,
  TEXT_TYPE,
} from '../types'

function esc (text) {
  return text
    .replace(/\n/g, '\\n')
    .replace(/\t/g, '\\t')
}

describe('parser', () => {
  describe('parses', () => {
    ;[
      // Text
      {
        inputs: [
          'Test',
        ],
        tree: {
          text: 'Test',
          type: TEXT_TYPE,
        },
      },
      {
        inputs: [
          'Foo bar',
        ],
        tree: {
          text: 'Foo bar',
          type: TEXT_TYPE,
        },
      },
      {
        inputs: [
          'Foo\\< bar',
        ],
        tree: {
          text: 'Foo\\< bar',
          type: TEXT_TYPE,
        },
      },

      // Comments
      {
        inputs: [
          '<!-- foo bar -->',
        ],
        tree: {
          comment: 'foo bar',
          type: COMMENT_TYPE,
        },
      },
      {
        inputs: [
          '<!-- foo bar -->\n<!--baz-->',
        ],
        tree: {
          children: [
            {
              comment: 'foo bar',
              type: COMMENT_TYPE,
            },
            {
              comment: 'baz',
              type: COMMENT_TYPE,
            },
          ],
          type: CHILDREN_TYPE,
        },
      },
      {
        inputs: [
          '<div><!-- foo bar --></div>',
        ],
        tree: {
          children: [
            {
              comment: 'foo bar',
              type: COMMENT_TYPE,
            },
          ],
          name: 'div',
          type: ELEMENT_TYPE,
        },
      },

      // Self closing tag without attributes
      {
        inputs: [
          '<input/>',
          '< input/>',
          '<\tinput/>',
          '<\ninput/>',
          '< \t\ninput/>',
          '<input />',
          '<input\t/>',
          '<input\n/>',
          '<input \t\n/>',
        ],
        tree: {
          name: 'input',
          type: ELEMENT_TYPE,
        },
      },

      // Self closing tag without attributes and text before element
      {
        inputs: [
          'Foo bar<input/>',
          'Foo bar< input/>',
          'Foo bar<\tinput/>',
          'Foo bar<\ninput/>',
          'Foo bar< \t\ninput/>',
          'Foo bar<input />',
          'Foo bar<input\t/>',
          'Foo bar<input\n/>',
          'Foo bar<input \t\n/>',
        ],
        tree: {
          children: [
            {
              text: 'Foo bar',
              type: TEXT_TYPE,
            },
            {
              name: 'input',
              type: ELEMENT_TYPE,
            },
          ],
          type: CHILDREN_TYPE,
        },
      },

      // Self closing tag without attributes and text after element
      {
        inputs: [
          '<input/>Foo bar',
          '< input/>Foo bar',
          '<\tinput/>Foo bar',
          '<\ninput/>Foo bar',
          '< \t\ninput/>Foo bar',
          '<input />Foo bar',
          '<input\t/>Foo bar',
          '<input\n/>Foo bar',
          '<input \t\n/>Foo bar',
        ],
        tree: {
          children: [
            {
              name: 'input',
              type: ELEMENT_TYPE,
            },
            {
              text: 'Foo bar',
              type: TEXT_TYPE,
            },
          ],
          type: CHILDREN_TYPE,
        },
      },

      // Self closing tag with boolean attribute
      {
        inputs: [
          '<input autofocus/>',
          '< input autofocus/>',
          '<\tinput autofocus/>',
          '<\ninput autofocus/>',
          '< \t\ninput autofocus/>',
          '<input  autofocus/>',
          '<input\t autofocus/>',
          '<input\n autofocus/>',
          '<input\t\n  autofocus/>',
          '<input \t\n autofocus/>',
          '<input \tautofocus/>',
          '<input \nautofocus/>',
          '<input  \t\nautofocus/>',
          '<input autofocus />',
          '<input autofocus\t/>',
          '<input autofocus\n/>',
          '<input autofocus \t\n/>',
        ],
        tree: {
          attributes: {
            autofocus: true,
          },
          name: 'input',
          type: ELEMENT_TYPE,
        },
      },

      // Self closing tag with attribute with value in single quotes
      {
        inputs: [
          "<input value='test'/>",
        ],
        tree: {
          attributes: {
            value: 'test',
          },
          name: 'input',
          type: ELEMENT_TYPE,
        },
      },

      // Self closing tag with attribute with value in double quoutes
      {
        inputs: [
          '<input value="test"/>',
        ],
        tree: {
          attributes: {
            value: 'test',
          },
          name: 'input',
          type: ELEMENT_TYPE,
        },
      },

      // Self closing tag with attribute with value in single quotes, value
      // containing escaped single quote
      {
        inputs: [
          "<input value='foo\\'bar'/>",
        ],
        tree: {
          attributes: {
            value: "foo\\'bar",
          },
          name: 'input',
          type: ELEMENT_TYPE,
        },
      },

      // Self closing tag with attribute with value in double quoutes, value
      // containing escaped double quote
      {
        inputs: [
          '<input value="foo\\"bar"/>',
        ],
        tree: {
          attributes: {
            value: 'foo\\"bar',
          },
          name: 'input',
          type: ELEMENT_TYPE,
        },
      },

      // Tag with closing tag but no attributes or children
      {
        inputs: [
          '<div></div>',
          '< div></div>',
          '<\tdiv></div>',
          '<\ndiv></div>',
          '< \t\ndiv></div>',
          '<div ></div>',
          '<div\t></div>',
          '<div\n></div>',
          '<div \t\n></div>',
          '<div>< /div>',
          '<div><\t/div>',
          '<div><\n/div>',
          '<div>< \t\n/div>',
          '<div></ div>',
          '<div></\tdiv>',
          '<div></\ndiv>',
          '<div></ \t\ndiv>',
          '<div></div >',
          '<div></div\t>',
          '<div></div\n>',
          '<div></div \t\n>',
          '< \t\ndiv \t\n></div>',
        ],
        tree: {
          name: 'div',
          type: ELEMENT_TYPE,
        },
      },

      // Tag with text contents
      {
        inputs: [
          '<label>Foo</label>',
          '<label> Foo</label>',
          '<label>\tFoo</label>',
          '<label>\nFoo</label>',
          '<label> \t\nFoo</label>',
          '<label>Foo </label>',
          '<label>Foo\t</label>',
          '<label>Foo\n</label>',
          '<label>Foo \t\n</label>',
          '<label> \t\nFoo \t\n</label>',
        ],
        tree: {
          children: [
            {
              text: 'Foo',
              type: TEXT_TYPE,
            },
          ],
          name: 'label',
          type: ELEMENT_TYPE,
        },
      },

      // Pre tag preserves whitespace
      {
        inputs: [
          '<pre>\n\t foo \t\nbar \t\n</pre>',
        ],
        tree: {
          children: [
            {
              text: '\n\t foo \t\nbar \t\n',
              type: TEXT_TYPE,
            },
          ],
          name: 'pre',
          type: ELEMENT_TYPE,
        },
      },

      // Tag with closing tag and self-closing child (no atttributes)
      {
        inputs: [
          '<div><input/></div>',
          '< div><input/></div>',
          '<\tdiv><input/></div>',
          '<\ndiv><input/></div>',
          '<div ><input/></div>',
          '<div\t><input/></div>',
          '<div\n><input/></div>',
          '<div \t\n><input/></div>',
          '<div>< input/></div>',
          '<div><\tinput/></div>',
          '<div><\ninput/></div>',
          '<div>< \t\ninput/></div>',
          '<div><input /></div>',
          '<div><input\t/></div>',
          '<div><input\n/></div>',
          '<div><input \t\n/></div>',
          '<div><input/>< /div>',
          '<div><input/><\t/div>',
          '<div><input/><\n/div>',
          '<div><input/>< \t\n/div>',
          '<div><input/></ div>',
          '<div><input/></\tdiv>',
          '<div><input/></\ndiv>',
          '<div><input/></ \t\ndiv>',
          '<div><input/></div >',
          '<div><input/></div\t>',
          '<div><input/></div\n>',
          '<div><input/></div \t\n>',
        ],
        tree: {
          children: [
            {
              name: 'input',
              type: ELEMENT_TYPE,
            },
          ],
          name: 'div',
          type: ELEMENT_TYPE,
        },
      },

      // Nested elements
      {
        inputs: [
          '<p><strong>Foo</strong>bar</p>',
        ],
        tree: {
          children: [
            {
              children: [
                {
                  text: 'Foo',
                  type: TEXT_TYPE,
                },
              ],
              name: 'strong',
              type: ELEMENT_TYPE,
            },
            {
              text: 'bar',
              type: TEXT_TYPE,
            },
          ],
          name: 'p',
          type: ELEMENT_TYPE,
        },
      },
      {
        inputs: [
          '<p><strong>Foo</strong>bar</p><p>baz</p>',
        ],
        tree: {
          children: [
            {
              children: [
                {
                  children: [
                    {
                      text: 'Foo',
                      type: TEXT_TYPE,
                    },
                  ],
                  name: 'strong',
                  type: ELEMENT_TYPE,
                },
                {
                  text: 'bar',
                  type: TEXT_TYPE,
                },
              ],
              name: 'p',
              type: ELEMENT_TYPE,
            },
            {
              children: [
                {
                  text: 'baz',
                  type: TEXT_TYPE,
                },
              ],
              name: 'p',
              type: ELEMENT_TYPE,
            },
          ],
          type: CHILDREN_TYPE,
        },
      },

      // Element with multiple attributes
      {
        inputs: [
          '<div class="foo" style="color:red"></div>',
        ],
        tree: {
          attributes: {
            'class': 'foo',
            style: 'color:red',
          },
          name: 'div',
          type: ELEMENT_TYPE,
        },
      },

      // Element with multiple attributes
      {
        inputs: [
          '<img ' +
            'data-attachment-id="37" ' +
            'data-permalink="https://caltucky.com/about/hbgrad-32/"' +
          '/>',
        ],
        tree: {
          attributes: {
            'data-attachment-id': '37',
            'data-permalink': 'https://caltucky.com/about/hbgrad-32/',
          },
          name: 'img',
          type: ELEMENT_TYPE,
        },
      },
    ]
      .forEach(({inputs, tree}) => {
        inputs.forEach((input) => {
          it(esc(input), () => {
            expect(parse(input)).toEqual(tree)
          })
        })
      })
  })
})
