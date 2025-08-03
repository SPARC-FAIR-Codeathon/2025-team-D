import { format, parseISO } from 'date-fns'

/**
 * Format date for display
 * @param {String} date
 * @returns {String}
 */
export function formatDate(date) {
  return date !== '' ? format(parseISO(date), 'MMMM d, yyyy') : ''
}
