import {
  type ChildrenNode,
  COMMENT_TYPE,
  ELEMENT_TYPE,
  type ElementNode,
  type ParseCommentNodeResponse,
  type ParseElementNodeAttributeResponse,
  type ParseElementNodeResponse,
  type ParseElementOrCommentNodeResponse,
  type ParseNodeResponse,
  type ParseOptions,
  type ParseTextNodeResponse,
  TEXT_TYPE,
  type TextNode,
} from './types'

const WHITESPACE = /\s/

export function parse (
  content: string,
  options?: ParseOptions,
): ChildrenNode | ElementNode | TextNode {
  return parseNode(content, 0, options).node
}

export function parseNode (
  content: string,
  start: number,
  options?: ParseOptions,
): ParseNodeResponse {
  const nodes = []
  let index = start

  options = Object.assign({
    preserveWhitespace: false,
  }, options)

  while (index < content.length) {
    let state

    if (content.length && content[index] === '<') {
      let i = index + 1

      // While not really valid, allowing whitespace between < and / for
      // closing tag
      while (WHITESPACE.test(content[i])) {
        i++
      }

      if (content[i] === '/') {
        index -= 1
        break
      }

      state = parseElementOrCommentNode(content, index, options)
    } else {
      state = parseTextNode(content, index, options)
    }

    if (state.node !== null) {
      nodes.push(state.node)
    }

    index = state.index
  }

  if (nodes.length === 0) {
    return {
      index: index + 1,
      node: null,
    }
  } else if (nodes.length === 1) {
    return {
      index: index + 1,
      node: nodes[0],
    }
  } else {
    return {
      index: index + 1,
      node: {
        children: nodes,
      },
    }
  }
}

export function parseCommentNode (
  content: string,
  start: number,
  options: ParseOptions,
): ParseCommentNodeResponse {
  const buffer = []

  // We add 4 to the start so we can skip the opening markup, <!--
  for (let i = start + 4; i <= content.length; i++) {
    const c = content[i]
    const len = buffer.length

    if (
      len >= 3 &&
      buffer[len - 1] === '>' &&
      buffer[len - 2] === '-' &&
      buffer[len - 3] === '-'
    ) {
      // Remove closing markup, -->, from buffer
      buffer.splice(len - 3, 3)

      if (!options.preserveWhitespace) {
        while (WHITESPACE.test(buffer[buffer.length - 1])) {
          buffer.pop()
        }
      }

      // Return a new comment node
      return {
        index: i++,
        node: {
          comment: buffer.join(''),
          type: COMMENT_TYPE,
        },
      }
    } else if (
      options.preserveWhitespace ||
      buffer.length !== 0 ||
      !WHITESPACE.test(c)
    ) {
      buffer.push(c)
    }
  }

  const comment = content.slice(start)

  throw new Error(
    `Failed to close comment beginning at character ${start}: ${comment}`
  )
}

export function parseElementNode (
  content: string,
  start: number,
  options: ParseOptions,
): ParseElementNodeResponse {
  const node = {
    attributes: {},
    children: [],
    type: ELEMENT_TYPE,
  }
  const buffer = []
  let escapeNextChar = false
  let isSelfClosing = false

  for (let i = start + 1; i < content.length; i++) {
    const c = content[i]

    if (c === '\\' && !escapeNextChar) {
      escapeNextChar = true
    } else if (escapeNextChar) {
      buffer.push(c)
    } else if (c === '/') {
      isSelfClosing = true
    } else if (c === '>') {
      if (!node.name) {
        node.name = buffer.join('')
      }

      if (!Object.keys(node.attributes).length) {
        delete node.attributes
      }

      if (isSelfClosing) {
        if (!node.children.length) {
          delete node.children
        }

        return {
          index: ++i,
          node,
        }
      } else {
        const childrenOptions = Object.assign({}, options)

        // Make sure to preserve whitespace for pre tags since they render
        // whitespace in the DOM
        if (node.name === 'pre') {
          childrenOptions.preserveWhitespace = true
        }

        const state = parseNode(content, i + 1, childrenOptions)

        if (state.node) {
          if (state.node.type) {
            node.children.push(state.node)
          } else {
            state.node.children.forEach((child) => {
              node.children.push(child)
            })
          }
        }

        let j = state.index + 1

        // While not really valid, allowing whitespace between < and / for
        // closing tag
        while (WHITESPACE.test(content[j])) {
          j++
        }

        j += 1 // for /

        // While not really valid, allowing whitespace between / and tag name
        // for closing tag
        while (WHITESPACE.test(content[j])) {
          j++
        }

        j += node.name.length

        // While not really valid, allowing whitespace between tag name and >
        // for closing tag
        while (WHITESPACE.test(content[j])) {
          j++
        }

        j += 1 // For >

        // TODO: verify closing tag is present and throw if not

        if (!node.children.length) {
          delete node.children
        }

        return {
          index: j,
          node,
        }
      }
    } else if (WHITESPACE.test(c)) {
      // Set name, now that we've finished parsing it
      if (buffer.length) {
        node.name = buffer.join('')

      // Ignore whitespace between name/attributes/closing
      } else {
        continue
      }

    // Parse potential attribute since we already have name and aren't closing
    // the current tag
    } else if (node.name) {
      const state = parseElementNodeAttribute(content, i, options)

      if (state.key) {
        node.attributes[state.key] = state.value
      }

      i = state.index - 1

    // Append to name
    } else {
      buffer.push(c)
    }
  }
}

export function parseElementNodeAttribute (
  content: string,
  start: number,
  options: ParseOptions,
): ?ParseElementNodeAttributeResponse {
  const buffer = []
  const response = {}
  let escapeNextChar = false
  let quote

  for (let i = start; i < content.length; i++) {
    const c = content[i]

    if (escapeNextChar) {
      buffer.push('\\', c)
      escapeNextChar = false
    } else if (c === '\\') {
      escapeNextChar = true
    } else if (!quote && ['/', '>'].indexOf(c) !== -1) {
      // Returning boolean attribute (attribute with no value assigned)
      if (buffer.length) {
        return Object.assign(response, {
          index: i,
          key: buffer.join(''),
          value: true,
        })
      }

      // False alarm, no attribute here
      return Object.assign(response, {
        index: i,
      })
    } else if (['"', "'"].indexOf(c) !== -1) {
      // If starting quote
      if (!quote) {
        if (buffer[buffer.length - 1] !== '=') {
          const code = content.slice(start, i)

          throw new Error(
            `Missing = between key and starting quote at index ${start}: ${code}`
          )
        }

        quote = c
        response.key = buffer.splice(0, buffer.length - 1).join('')
        buffer.pop() // Remove = from buffer

      // If ending quote
      } else if (quote === c) {
        return Object.assign(response, {
          index: ++i,
          value: buffer.join(''),
        })

      // If not a delimeter quote
      } else {
        buffer.push(c)
      }
    } else if (WHITESPACE.test(c)) {
      // Keep whitespace in value
      if (quote) {
        buffer.push(c)

      // Returning boolean attribute (attribute with no value assigned)
      } else if (buffer.length) {
        return Object.assign(response, {
          index: ++i,
          key: buffer.join(''),
          value: true,
        })

      // Ignore whitespace before key
      } else {
        continue
      }
    } else {
      buffer.push(c)
    }
  }

  response.index = content.length + 1

  return response
}

export function parseElementOrCommentNode (
  content: string,
  start: number,
  options: ParseOptions,
): ParseElementOrCommentNodeResponse {
  if (
    content[start + 1] === '!' &&
    content[start + 2] === '-' &&
    content[start + 3] === '-'
  ) {
    return parseCommentNode(content, start, options)
  }

  return parseElementNode(content, start, options)
}

export function parseTextNode (
  content: string,
  start: number,
  options: ParseOptions,
): ParseTextNodeResponse {
  const buffer = []
  let escapeNextChar = false

  for (let i = start; i < content.length; i++) {
    const c = content[i]

    if (c === '\\' && !escapeNextChar) {
      escapeNextChar = true
    } else if (escapeNextChar) {
      escapeNextChar = false
      buffer.push('\\', c)
    } else if (c === '<') {
      const text = buffer.join('')

      return {
        index: i,
        node: buffer.length
          ? {
            text: options.preserveWhitespace ? text : text.trim(),
            type: TEXT_TYPE,
          }
          : null,
      }
    } else if (
      options.preserveWhitespace ||
      buffer.length !== 0 ||
      !WHITESPACE.test(c)
    ) {
      buffer.push(c)
    }
  }

  return {
    index: content.length + 1,
    node: buffer.length
      ? {
        text: buffer.join(''),
        type: TEXT_TYPE,
      }
      : null,
  }
}
