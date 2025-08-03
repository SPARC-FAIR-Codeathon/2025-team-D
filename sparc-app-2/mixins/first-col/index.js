export default {
  computed: {
    /**
     * Compute the first column's attributes
     * @returns {Object}
     */
    firstCol() {
      return this.type === 'event' ? { span: 12 } : { span: 12, push: 12 }
    }
  }
}
