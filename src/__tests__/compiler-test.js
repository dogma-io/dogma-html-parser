import {compile} from '../compiler'

describe('compiler', () => {
  describe('compile', () => {
    [
      {
        desc: 'text',
        input: {
          text: 'Foo',
          type: 'text',
        },
        output: 'Foo',
      },
      {
        desc: 'text with whitespace',
        input: {
          text: 'Foo \t\nbar',
          type: 'text',
        },
        output: 'Foo \t\nbar',
      },
      {
        desc: 'text with escaped character',
        input: {
          text: 'Foo\\<bar',
          type: 'text',
        },
        output: 'Foo\\<bar',
      },
      {
        desc: 'comment',
        input: {
          comment: 'Foo',
          type: 'comment',
        },
        output: '<!--Foo-->',
      },
      {
        desc: 'comment with whitespace',
        input: {
          comment: ' \t\nFoo \t\nbar \t\n',
          type: 'comment',
        },
        output: '<!-- \t\nFoo \t\nbar \t\n-->',
      },
      {
        desc: 'comment with escaped character',
        input: {
          comment: 'Foo\\<bar',
          type: 'comment',
        },
        output: '<!--Foo\\<bar-->',
      },
      {
        desc: 'multiple comments',
        input: {
          children: [
            {
              comment: 'foo',
              type: 'comment',
            },
            {
              comment: 'bar',
              type: 'comment',
            },
          ],
        },
        output: '<!--foo--><!--bar-->',
      },
      {
        desc: 'multiple comments separated by whitespace text',
        input: {
          children: [
            {
              comment: 'foo',
              type: 'comment',
            },
            {
              text: '\n',
              type: 'text',
            },
            {
              comment: 'bar',
              type: 'comment',
            },
          ],
        },
        output: '<!--foo-->\n<!--bar-->',
      },
      {
        desc: 'div element with not attributes or children',
        input: {
          name: 'div',
          type: 'element',
        },
        output: '<div></div>',
      },
      {
        desc: 'input element with not attributes or children',
        input: {
          name: 'input',
          type: 'element',
        },
        output: '<input/>',
      },
      {
        desc: 'img element with not attributes or children',
        input: {
          name: 'img',
          type: 'element',
        },
        output: '<img/>',
      },
      {
        desc: 'div element containing text child',
        input: {
          children: [
            {
              text: 'Foo bar',
              type: 'text',
            },
          ],
          name: 'div',
          type: 'element',
        },
        output: '<div>Foo bar</div>',
      },
      {
        desc: 'div element containing comment child',
        input: {
          children: [
            {
              comment: 'Foo bar',
              type: 'comment',
            },
          ],
          name: 'div',
          type: 'element',
        },
        output: '<div><!--Foo bar--></div>',
      },
    ]
      .forEach(({desc, input, output}) => {
        it(desc, () => {
          expect(compile(input)).toBe(output)
        })
      })
  })
})
