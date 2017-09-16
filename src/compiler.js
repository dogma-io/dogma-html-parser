/**
 * @flow
 */

import {
  CHILDREN_TYPE,
  type ChildrenNode,
  COMMENT_TYPE,
  type CommentNode,
  ELEMENT_TYPE,
  type ElementNode,
  TEXT_TYPE,
  type TextNode,
} from './types'

const SELF_CLOSING_ELEMENTS = [
  'img',
  'input',
]

export default function compile (
  node: ChildrenNode | CommentNode | ElementNode | TextNode
): string {
  switch (node.type) {
    case CHILDREN_TYPE:
      return node.children.map(compile).join('')

    case COMMENT_TYPE:
      return `<!--${node.comment}-->`

    case ELEMENT_TYPE:
      return compileElementNode(node)

    case TEXT_TYPE:
      return node.text

    default:
      throw new Error(`Unknown type ${node.type}`)
  }
}

function compileElementNode (node: ElementNode): string {
  let attrString = ''
  let children = ''
  const name = node.name
  const attributes = node.attributes || {}

  const keys = Object.keys(attributes)

  if (keys.length) {
    attrString = ' ' + keys.map((key: string) => {
      const value = attributes[key]

      switch (typeof value) {
        case 'boolean':
          return key

        case 'string':
          const quote = '"' // TODO: figure out which quote to use based on value
          return `${key}=${quote}${value}${quote}`

        default:
          throw new Error(
            `Expected value to be a string or boolean but got a ${typeof value}`
          )
      }
    })
      .join(' ')
  }

  if (Array.isArray(node.children) && node.children.length) {
    children = node.children.map(compile).join('')
  }

  if (!children && SELF_CLOSING_ELEMENTS.indexOf(name) !== -1) {
    return `<${name}${attrString}/>`
  } else {
    return `<${name}${attrString}>${children}</${name}>`
  }
}
