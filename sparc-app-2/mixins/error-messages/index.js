export default {
  methods: {
    /**
     * The following is a list of methods returning error 
     * messages for different services.
     */
    pennsieveFile: function() {
    return 'Sorry, we have encountered an unexpected \
      error while trying to load the file information. \
      Please try again later.'
    },
    contentful: function() {
      return 'Sorry, the resource you are looking for is \
      currently unavailable, please try again later.'
    },
    biolucida: function() {
      return 'Sorry, the image you are looking for is currently \
        unavailable, please try again later.'
    },
    crosscite: function() {
      return 'Sorry, we cannot retrieve the information on \
      citations at this moment, please try again later.'
    },
    scicrunch: function() {
      return 'Sorry, some gallery items may not be available at \
        this moment, please try again later.'
    },
    discover: function() {
      return 'Sorry, we have encountered an unexpected error \
        while trying to load the information. Please try again later.'
    },
    metrics: function() {
      return 'Sorry, we have encountered an unexpected error \
        while trying to load the portal metrics. Please try again later.'
    },
  }
}
