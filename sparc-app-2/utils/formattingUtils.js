import { marked } from 'marked'
import DOMPurify from 'isomorphic-dompurify'

/**
 * Parse markdown
 * @param {String} markdown
 * @returns {HTML}
 */
export function parseMarkdown(markdown = '', purifyOptions = {}) {
  purifyOptions = {...purifyOptions, ADD_ATTR: ['target']}
  return DOMPurify.sanitize(marked(markdown), purifyOptions)
}
