import {
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

export function compile (
  node: ChildrenNode | CommentNode | ElementNode | TextNode
): string {
  if (node.type === TEXT_TYPE) {
    return node.text
  } else if (node.type === COMMENT_TYPE) {
    return `<!--${node.comment}-->`
  } else if (node.type === ELEMENT_TYPE) {
    return compileElementNode(node)
  } else {
    return node.children.map(compile).join('')
  }
}

export function compileElementNode (node: ElementNode): string {
  let attributes = ''
  let children = ''
  const name = node.name

  if (node.attributes) {
    const keys = Object.keys(node.attributes)

    if (keys.length) {
      attributes = ' ' + keys.map((key) => {
        const value = node.attributes[key]
        const quote = '"' // TODO: figure out which quote to use based on value
        return value === true ? key : `${key}=${quote}${value}${quote}`
      })
        .join(' ')
    }
  }

  if (Array.isArray(node.children) && node.children.length) {
    children = node.children.map(compile).join('')
  }

  if (!children && SELF_CLOSING_ELEMENTS.indexOf(name) !== -1) {
    return `<${name}${attributes}/>`
  } else {
    return `<${name}${attributes}>${children}</${name}>`
  }
}
