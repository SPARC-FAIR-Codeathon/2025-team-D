const licenseData = [
  {
    label:
      'Community Data License Agreement – Permissive (CDLA-Permissive-1.0)',
    value: 'Community Data License Agreement – Permissive',
    abbr: 'CDLA-Permissive-1.0',
    link: 'https://cdla.io/permissive-1-0/'
  },
  {
    label: 'Community Data License Agreement – Sharing (CDLA-Sharing-1.0)',
    value: 'Community Data License Agreement – Sharing',
    abbr: 'CDLA-Sharing-1.0',
    link: 'https://cdla.io/sharing-1-0/'
  },
  {
    label: 'Open Data Commons Open Database License (ODbL)',
    value: 'Open Data Commons Open Database',
    abbr: 'ODC-ODbl',
    link: 'https://www.opendatacommons.org/licenses/odbl/1.0/index.html'
  },
  {
    label: 'Open Data Commons Attribution License',
    value: 'Open Data Commons Attribution',
    abbr: 'ODC-BY',
    link: 'https://www.opendatacommons.org/licenses/by/1.0/index.html'
  },
  {
    label: 'Open Data Commons Public Domain Dedication and License (PDDL)',
    value: 'Open Data Commons Public Domain Dedication and License',
    abbr: 'ODC-PDDL',
    link: 'https://www.opendatacommons.org/licenses/pddl/1.0/'
  },
  {
    label: 'Creative Commons Zero 1.0 Universal (CC-0)',
    value: 'Creative Commons Zero 1.0 Universal',
    abbr: 'CC-0-1.0',
    link: 'https://creativecommons.org/publicdomain/zero/1.0/'
  },
  {
    label: 'Creative Commons Attribution (CC-BY)',
    value: 'Creative Commons Attribution',
    abbr: 'CC-BY-4.0',
    link: 'https://creativecommons.org/licenses/by/4.0/'
  },
  {
    label: 'Creative Commons Attribution-ShareAlike (CC-BY-SA)',
    value: 'Creative Commons Attribution - ShareAlike',
    abbr: 'CC-BY-SA-4.0',
    link: 'https://creativecommons.org/licenses/by-sa/4.0/'
  },
  {
    label: 'Apache License 2.0',
    value: 'Apache License 2.0',
    abbr: 'Apache 2.0',
    link: 'https://opensource.org/licenses/Apache-2.0'
  },
  {
    label: 'Apache License 2.0 (Apache-2.0)',
    value: 'Apache 2.0',
    abbr: 'Apache 2.0',
    link: 'https://opensource.org/licenses/Apache-2.0'
  },
  {
    label: 'GNU General Public License (GPL)',
    value: 'GNU General Public License v3.0',
    abbr: 'GPL-3.0',
    link: 'https://www.gnu.org/licenses/gpl-3.0.en.html'
  },
  {
    label: 'GNU Lesser General Public License',
    value: 'GNU Lesser General Public License',
    abbr: 'LGPL-3.0',
    link: 'https://www.gnu.org/licenses/lgpl.html'
  },
  {
    label: 'MIT license (MIT)',
    value: 'MIT License',
    abbr: 'MIT',
    link: 'https://opensource.org/licenses/MIT'
  },
  {
    label: 'Mozilla Public License 2.0 (MPL-2.0)',
    value: 'Mozilla Public License 2.0',
    abbr: 'MPL-2.0',
    link: 'https://www.mozilla.org/en-US/MPL/2.0/'
  }
]

export const getLicenseLink = licenseKey => {
  const license = licenseData.find(license => license.abbr === licenseKey)
  return license ? license.link : ''
}

export const getLicenseAbbr = licenseKey => {
  const license = licenseData.find(license => license.value === licenseKey)
  return license ? license.abbr : ''
}
