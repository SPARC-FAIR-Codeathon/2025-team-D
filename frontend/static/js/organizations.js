const organizationsData = [
  {
    name: 'SPARC',
    intId: 367,
    id: 'N:organization:618e8dd9-f8d2-4dc4-9abb-c6aaab2e78a0',
    logo: new URL('@/assets/logo-sparc-wave-primary.svg', import.meta.url).href
  },
  {
    name: 'RE-JOIN',
    intId: 661,
    id: 'N:organization:f08e188e-2316-4668-ae2c-8a20dc88502f',
    logo: new URL('@/assets/rejoin.jpg', import.meta.url).href
  },
  {
    name: 'HEAL PRECISION',
    intId: 666,
    id: 'N:organization:98d6e84c-9a27-48f8-974f-93c0cca15aae',
    logo: new URL('@/assets/precision.png', import.meta.url).href
  }
]

//.net test organization info for testing during development
/*const organizationsData = [
  {
    name: 'SPARC',
    intId: 28,
    id: 'N:organization:df3d6291-7fc7-4bb4-b916-5eca3a026380',
    logo: new URL('@/assets/logo-sparc-wave-primary.svg', import.meta.url).href
  },
  {
    name: 'RE-JOIN',
    intId: 42,
    id: 'N:organization:71a68685-af7d-4d50-8caf-74dd03176a65',
    logo: new URL('@/assets/rejoin.jpg', import.meta.url).href
  },
  {
    name: 'HEAL PRECISION',
    intId: 43,//666,
    id: 'N:organization:10defbb6-2b18-4c2a-a857-44b53d65a5c7',
    logo: new URL('@/assets/precision.png', import.meta.url).href
  }
]*/

export const getOrganizationInfo = id => {
  const org = organizationsData.find(org => org.id == id)
  return org ? org : null
}

export const getOrganizationStatus = org => {
  if (org.isOwner)
    return 'Owner'
  else if (org.isAdmin)
    return 'Admin'
  else if (org.isGuest)
    return 'Guest'
  else
    return 'Collaborator'
}