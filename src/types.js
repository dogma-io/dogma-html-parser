export const COMMENT_TYPE = 'comment'
export const ELEMENT_TYPE = 'element'
export const TEXT_TYPE = 'text'

export type ChildrenNode = {|
  children: Array<*>,
  type: 'children',
|}

export type CommentNode = {|
  comment: string,
  type: 'comment',
|}

export type ElementNode = {|
  children?: Array<*>,
  name: string,
  type: 'element',
|}

export type TextNode = {|
  text: string,
  type: 'text',
|}

export type ParseOptions = {|
  preserveWhitespace?: boolean,
|}

export type ParseElementNodeAttributeResponse =
  | {|
      index: number,
    |}
  | {|
      index: number,
      key: string,
      value: boolean | string,
    |}

export type ParseCommentNodeResponse = {|
  index: number,
  node: ChildrenNode | CommentNode,
|}

export type ParseElementOrCommentNodeResponse = {|
  index: number,
  node: ChildrenNode | CommentNode | ElementNode,
|}

export type ParseElementNodeResponse = {|
  index: number,
  node: ChildrenNode | ElementNode,
|}

export type ParseNodeResponse = {|
  index: number,
  node: ?ChildrenNode | ElementNode | TextNode,
|}

export type ParseTextNodeResponse = {|
  index: number,
  node: ?ChildrenNode | TextNode,
|}
