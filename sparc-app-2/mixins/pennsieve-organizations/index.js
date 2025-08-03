import { mapState } from 'pinia'
import { useMainStore } from '../../store/index.js'
import { failMessage } from '@/utils/notification-messages'

export default {
  computed: {
    ...mapState(useMainStore, ['userToken']),
  },
  methods: {
    async launchPennsieve() {
      try {
        const intId = this.organizationInfo.intId
        await this.$axios.put(`${this.$config.public.LOGIN_API_URL}/session/switch-organization?organization_id=${intId}&api_key=${this.userToken}`)
        window.open(this.link, '_blank')
      } catch (e) {
        failMessage("Unable to launch Pennsieve at this time")
      }
    }
  }
}
