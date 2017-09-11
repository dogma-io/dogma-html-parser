import {parse} from '../parser'

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
          type: 'text',
        },
      },
      {
        inputs: [
          'Foo bar',
        ],
        tree: {
          text: 'Foo bar',
          type: 'text',
        },
      },
      {
        inputs: [
          'Foo\\< bar',
        ],
        tree: {
          text: 'Foo\\< bar',
          type: 'text',
        },
      },

      // Comments
      {
        inputs: [
          '<!-- foo bar -->',
        ],
        tree: {
          comment: 'foo bar',
          type: 'comment',
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
              type: 'comment',
            },
            {
              comment: 'baz',
              type: 'comment',
            },
          ],
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
              type: 'comment',
            },
          ],
          name: 'div',
          type: 'element',
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
          type: 'element',
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
              type: 'text',
            },
            {
              name: 'input',
              type: 'element',
            },
          ],
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
              type: 'element',
            },
            {
              text: 'Foo bar',
              type: 'text',
            },
          ],
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
          type: 'element',
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
          type: 'element',
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
          type: 'element',
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
          type: 'element',
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
          type: 'element',
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
          type: 'element',
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
              type: 'text',
            },
          ],
          name: 'label',
          type: 'element',
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
              type: 'text',
            },
          ],
          name: 'pre',
          type: 'element',
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
              type: 'element',
            },
          ],
          name: 'div',
          type: 'element',
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
                  type: 'text',
                },
              ],
              name: 'strong',
              type: 'element',
            },
            {
              text: 'bar',
              type: 'text',
            },
          ],
          name: 'p',
          type: 'element',
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
                      type: 'text',
                    },
                  ],
                  name: 'strong',
                  type: 'element',
                },
                {
                  text: 'bar',
                  type: 'text',
                },
              ],
              name: 'p',
              type: 'element',
            },
            {
              children: [
                {
                  text: 'baz',
                  type: 'text',
                },
              ],
              name: 'p',
              type: 'element',
            },
          ],
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
          type: 'element',
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
          type: 'element',
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
