import { defineStore } from 'pinia'

type TRemoteApp = {
    name: string;
    path: string;
    expose: string;
    description: string;
}
export const useRemoteAppStore = defineStore('remoteApp', {
  state: () => ({
    remoteApp: null as null | TRemoteApp
  }),
  actions: {
    setRemoteApp(app: TRemoteApp) {
      this.remoteApp = app;
    }
  },
   persist: true 
})
