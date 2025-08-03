/**
 * Get the file name from a path.
 *
 * @param {*} str
 * @returns
 */
export const baseName = str => {
  return str
    .split('\\')
    .pop()
    .split('/')
    .pop()
}

// Convert a string to XML Node Structure.
// Returns null on failure.
function textToHTML(text) {
  try {
    let xml = null

    if (window.DOMParser) {
      const parser = new DOMParser()
      xml = parser.parseFromString(text, 'text/html')

      const found = xml.getElementsByTagName('parsererror')

      if (!found || !found.length || !found[0].childNodes.length) {
        return xml
      }

      return null
    } else {
      xml = new ActiveXObject('Microsoft.XMLDOM')

      xml.async = false
      xml.loadXML(text)

      return xml
    }
  } catch (e) {
    // suppress
  }
}

/**
 * Extract a section from a snippet of html.
 * @param {RegExp} section_regex  The regexp for the section to extract.
 * @param {*} html_in The html to extract the section from.
 * @returns The extracted html section as a string, an empty string if no section is extracted.
 */
export const extractSection = (section_regex, html_in) => {
  const doc = textToHTML(html_in)
  const links = doc.querySelectorAll('p')
  let html_section = ''
  links.forEach(paragraph => {
    const match = paragraph.innerText.match(section_regex)
    if (match !== null) {
      html_section = paragraph.innerText.replace(match[0], '')
    }
  })
  return html_section
}

export const extractS3BucketName = uri => {
  if (uri) {
    const substring = uri.split("//")[1]
    if (substring) {
      return substring.split("/")[0]
    }
  }
  return undefined
}

export const getPreviousDate = (currentMonth, currentYear) => {
  const previousMonth = (Number(currentMonth) == 1) ? 12 : currentMonth - 1
  const previousYear = (Number(currentMonth) == 1) ? currentYear - 1 : currentYear

  return {
    year: previousYear,
    month: previousMonth
  }
}
