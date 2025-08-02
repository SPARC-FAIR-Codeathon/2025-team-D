export default {
  computed: {
    /**
     * Get the file name from the scaffold query parameter.
     * @returns String
     */
    fileName: function() {
      return this.file.name
    },

    /**
     * Return the image file location.
     * @returns String
     */
    filePath: function() {
      return this.file.path
    },

    /**
     * Get the path of the file's parent folder.
     * @returns String
     */
    fileFolderLocation: function() {
      return this.filePath.substring(
        0,
        this.filePath.lastIndexOf(this.fileName)
      )
    },

    /**
     * File breadcrumbs
     * @returns {{ url: String, label: String }[]}
     */
    breadcrumbs: function() {
      return this.fileFolderLocation.split('/').filter(segment => segment)
    }
  }
}
