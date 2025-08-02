import { propOr } from 'ramda'
export default {
  data() {
    return {
      consortiaStyle: {}
    }
  },
  methods: {
    /**
     * Fetch dataset information from discover api with dataset id and version
     */
    async fetchConsortiaStyle(consortiaId) {
      const consortiaItem =
        await this.$contentfulClient.getEntries({
          content_type: this.$config.public.ctf_consortia_content_type_id,
          'fields.title[match]': consortiaId
        }).then(response => {
          return propOr([], 'items', response)[0]
        }).catch(() => { })
      const { firstColor, secondColor, thirdColor, buttonAndLinkColor } = propOr('', 'fields', consortiaItem)
      let style = thirdColor == undefined && secondColor == undefined ?
        { backgroundColor: `#${firstColor}` } : thirdColor == undefined ?
        { backgroundImage: `linear-gradient(#${firstColor}, #${secondColor}` } :    
        { backgroundImage: `linear-gradient(#${firstColor}, #${secondColor}, #${thirdColor}` }
      style = { ...style, '--button-and-link-color': `#${buttonAndLinkColor}`, '--button-and-link-secondary-color': `#${buttonAndLinkColor}16` }
      this.consortiaStyle = style
    },
  }
}
