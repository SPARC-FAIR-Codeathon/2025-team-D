/**
 * Gets the file extension for a file or path
 * @param path Path or filename
 * @returns String containing the file extension
 */
export const extractExtension = (
  path : string
): string => {
  const split = path.split('.')
  if (split.length > 1) {
    const ext = split.pop()
    return ext || ''
  }
  return ''
}

export const searchQueryReplacements: { [orig: string]: string } = {
  'o2s2parc': 'o\u00b2s\u00b2parc',
  'osparc': 'o\u00b2s\u00b2parc'
}

export const HIGHLIGHT_HTML_TAG = 'b'
/**
 * Function that takes a text and search input and wraps matching substrings with the given HTML tag.
 * @param {String} text Input text to be processed
 * @param {String} search Search terms
 * @returns {String} Output text with matching terms wrapped by given HTML tag. Original text if search is empty.
 */
export const highlightMatches = (text: string, search: string): string => {
  if (text && search) {
    // Replacement fn
    const replaceHtmlTextNoHref = (html: string, term: string) => {
      let savedIndex = 0
      let i = 0
      let j = 0
      let quoteChar = '"'
      let res = ''
      const regExp = new RegExp(term, 'ig')
      while (i < html.length - 6) {
        if (html[i] === 'h' && html[i + 1] === 'r' && html[i + 2] === 'e' && html[i + 3] === 'f' && html[i + 4] === '=') {
          // Found an href
          quoteChar = html[i + 5]
          // Add previous substr with replaced hits
          res += html.slice(savedIndex, i + 6).replace(regExp, `<${HIGHLIGHT_HTML_TAG}>$&</${HIGHLIGHT_HTML_TAG}>`)
          savedIndex = i + 6
          j = savedIndex
          while (j < html.length && html[j] !== quoteChar) {
            j++
          }
          // j contains end of href, add without replacement
          res += html.slice(savedIndex, j)
          savedIndex = i = j
        }
        else {
          i++
        }
      }
      // Add remaining
      res += html.slice(savedIndex).replace(regExp, '<b>$&</b>')
      return res
    }
    const terms = search.split(' ')
    let result = text
    terms.forEach(t => {
      const trimmed = t.replace(/^"|"$/, '') // Trims out double quotes that could be used in searching
      result = replaceHtmlTextNoHref(result, trimmed)
    })
    return result
  }
  return text
}

export const saveForm = (payload: any): void => {
  const { user, ...rest } = payload
  saveJsonToSessionStorage(user, 'userDataForm')
}

export const loadForm = (): any => {
  const user = loadJsonFromSessionStorage('userDataForm')
  if (user == null) {
    return null
  }
  return {
    user
  }
}

export const saveJsonToSessionStorage = (payload: any, storageKey: string): void => {
  try {
    const json = JSON.stringify(payload)
    sessionStorage.setItem(storageKey, json)
  }
  catch {
    console.error('Could not serialize object to JSON for storing it')
  }
}

export const loadJsonFromSessionStorage = (storageKey: string): any => {
  const json = sessionStorage.getItem(storageKey)
  if (json) {
    try {
      return JSON.parse(json)
    }
    catch {
      console.error('Could not deserialize stored form to a JS object')
    }
  }
}

/**
 * Function used in contact form templates to populate the form with the user info
 * coming from its login profile.
 * @param form Form data to populate
 * @param firstName First name of the user as found in log in info
 * @param lastName Last Name of the user as found in log in info
 * @param email Email of the user as found in log in info
 */
export const populateFormWithUserData = (form: any, firstName?: string, lastName?: string, email?: string) => {
  if (form.user) {
    if (firstName) {
      form.user.firstName = firstName
    }
    if (lastName) {
      form.user.lastName = lastName
    }
    if (email) {
      form.user.email = email
    }
  }
}
