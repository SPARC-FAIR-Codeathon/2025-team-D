import { Auth } from '@aws-amplify/auth'
import { Hub } from '@aws-amplify/core'
import { useMainStore } from "@/store"
import { pathOr, propOr } from 'ramda'
import axios from 'axios'

Hub.listen('auth', async (data) => {
  switch (data.payload.event) {
    case 'cognitoHostedUI':
      const cognitoUser = await Auth.currentAuthenticatedUser()
      const profile = await getPennsieveUserProfile(cognitoUser)
      const cognitoId = propOr(null, 'username', cognitoUser)
      const token = pathOr(null, ['signInUserSession', 'accessToken', 'jwtToken'], cognitoUser)
      const unixExpirationDate = pathOr('', ['signInUserSession', 'accessToken', 'payload', 'exp'], cognitoUser)
      const expirationDate = unixExpirationDate ? new Date(unixExpirationDate * 1000) : null
      useMainStore().setUserProfile({ ...profile, 'cognitoId': cognitoId, 'token': token, 'tokenExp': expirationDate })
      const { $updatePennsieveApiClient } = useNuxtApp()
      $updatePennsieveApiClient(createClient(token))
      break;
  }
})
// The Pennsieve user profile
async function getPennsieveUserProfile(cognitoUser) {
  const config = useRuntimeConfig()
  if (cognitoUser) {
    const userToken = pathOr('', ['signInUserSession', 'accessToken', 'jwtToken'], cognitoUser)
    if (userToken) {
      const url = `${config.public.LOGIN_API_URL}/user?api_key=${userToken}`
      return await axios.get(url).then(({ data }) => {
        return data
      })
        .catch(err => {
          console.log(`Error retrieving pennsieve user: ${err}`)
          return null
        })
    }
  } else {
    return null
  }
}
function createClient(accessToken) {
  let params = {}
  if (accessToken && accessToken !== '') {
    params.api_key = `${accessToken}`;
  }
  return axios.create({
    params: params
  })
}

const user = async() => {
  try {
    const user = await Auth.currentAuthenticatedUser()
    return user
  } catch (err) {
    console.log("Could not get user: ", err)
    return null
  }
}

const login = async (providerName) => {
  const signInCookie = useCookie('sign-in-redirect-url', { default: () => null })
  await Auth.federatedSignIn({ customProvider: providerName }).then(() => {
    signInCookie.value = useRoute().fullPath
  }).catch((err) => {
    signInCookie.value = null
    console.log("Error signing in: ", err)
  })
}

const logout = async() => {
  try {
    useMainStore().setUserProfile(null)
    const signOutCookie = useCookie('sign-out-redirect-url', { default: () => null })
    signOutCookie.value = useRoute().fullPath
    await Auth.signOut()
  } catch (err) {
    console.log("Error signing out: ", err)
  }
}

export default {
  login,
  logout,
  user
}
