/**
 * @flow
 */

export const CHILDREN_TYPE = 'children'
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
  attributes?: {[key: string]: string | bool},
  children?: Array<*>,
  name: string,
  type: 'element',
|}

export type TextNode = {|
  text: string,
  type: 'text',
|}

export type ParseOptions = {
  preserveWhitespace?: boolean,
}

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

export type ParseElementNodeResponse = {|
  index: number,
  node: ElementNode,
|}

export type ParseElementOrCommentNodeResponse =
  ParseCommentNodeResponse | ParseElementNodeResponse

export type ParseNodeResponse = {|
  index: number,
  node: ChildrenNode | CommentNode | ElementNode | TextNode | null,
|}

export type ParseTextNodeResponse = {|
  index: number,
  node: ChildrenNode | TextNode | null,
|}
