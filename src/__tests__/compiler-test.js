import compile from '../compiler'

import {
  CHILDREN_TYPE,
  COMMENT_TYPE,
  ELEMENT_TYPE,
  TEXT_TYPE,
} from '../types'

describe('compiler', () => {
  describe('compile', () => {
    [
      {
        desc: 'text',
        input: {
          text: 'Foo',
          type: TEXT_TYPE,
        },
        output: 'Foo',
      },
      {
        desc: 'text with whitespace',
        input: {
          text: 'Foo \t\nbar',
          type: TEXT_TYPE,
        },
        output: 'Foo \t\nbar',
      },
      {
        desc: 'text with escaped character',
        input: {
          text: 'Foo\\<bar',
          type: TEXT_TYPE,
        },
        output: 'Foo\\<bar',
      },
      {
        desc: 'comment',
        input: {
          comment: 'Foo',
          type: COMMENT_TYPE,
        },
        output: '<!--Foo-->',
      },
      {
        desc: 'comment with whitespace',
        input: {
          comment: ' \t\nFoo \t\nbar \t\n',
          type: COMMENT_TYPE,
        },
        output: '<!-- \t\nFoo \t\nbar \t\n-->',
      },
      {
        desc: 'comment with escaped character',
        input: {
          comment: 'Foo\\<bar',
          type: COMMENT_TYPE,
        },
        output: '<!--Foo\\<bar-->',
      },
      {
        desc: 'multiple comments',
        input: {
          children: [
            {
              comment: 'foo',
              type: COMMENT_TYPE,
            },
            {
              comment: 'bar',
              type: COMMENT_TYPE,
            },
          ],
          type: CHILDREN_TYPE,
        },
        output: '<!--foo--><!--bar-->',
      },
      {
        desc: 'multiple comments separated by whitespace text',
        input: {
          children: [
            {
              comment: 'foo',
              type: COMMENT_TYPE,
            },
            {
              text: '\n',
              type: TEXT_TYPE,
            },
            {
              comment: 'bar',
              type: COMMENT_TYPE,
            },
          ],
          type: CHILDREN_TYPE,
        },
        output: '<!--foo-->\n<!--bar-->',
      },
      {
        desc: 'div element with not attributes or children',
        input: {
          name: 'div',
          type: ELEMENT_TYPE,
        },
        output: '<div></div>',
      },
      {
        desc: 'input element with not attributes or children',
        input: {
          name: 'input',
          type: ELEMENT_TYPE,
        },
        output: '<input/>',
      },
      {
        desc: 'img element with not attributes or children',
        input: {
          name: 'img',
          type: ELEMENT_TYPE,
        },
        output: '<img/>',
      },
      {
        desc: 'div element containing text child',
        input: {
          children: [
            {
              text: 'Foo bar',
              type: TEXT_TYPE,
            },
          ],
          name: 'div',
          type: ELEMENT_TYPE,
        },
        output: '<div>Foo bar</div>',
      },
      {
        desc: 'div element containing comment child',
        input: {
          children: [
            {
              comment: 'Foo bar',
              type: COMMENT_TYPE,
            },
          ],
          name: 'div',
          type: ELEMENT_TYPE,
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
