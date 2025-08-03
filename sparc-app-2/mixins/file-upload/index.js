const kB_IN_MB = 1024;
const MAX_FILE_SIZE_IN_MB = 5;
const MAX_FILE_SIZE = kB_IN_MB * MAX_FILE_SIZE_IN_MB;
import { failMessage } from '@/utils/notification-messages'

export default {
  data() {
    return {
      limit: 1,
      allowVideos: false,
      file: {}
    }
  },
  computed: {
    hasAttachment: function() {
      return this.file !== ''
    }
  },
  methods: {
    isFileSizeTooLarge(file) {
      return ( file.size / kB_IN_MB ) >= MAX_FILE_SIZE
    },
    handleExceed(files, fileList) {
      failMessage(`The limit is ${this.limit}, you selected ${files.length} files this time, add up to ${files.length + fileList.length} totally`)
    },
    onUploadChange(file)
    {
      if (!file) {
        return
      }
      const isImage = (file.raw.type === 'image/jpeg' || file.raw.type === 'image/png'|| file.raw.type === 'image/gif')
      const isVideo = (file.raw.type === 'video/mp4')
      const isFileSizeTooLarge = this.isFileSizeTooLarge(file)
      if (!isImage && !this.allowVideos) {
        failMessage('Upload file must be an image!')
        this.$refs.fileUploader.clearFiles()
        return false
      }
      else if (!isImage && !isVideo && this.allowVideos) {
        failMessage('Upload file must be an image or video!')
        this.$refs.fileUploader.clearFiles()
        return false
      }
      if (isFileSizeTooLarge) {
        failMessage(`Upload file size cannot exceed ${MAX_FILE_SIZE_IN_MB} MB!`)
        this.$refs.fileUploader.clearFiles()
        return false
      }
      this.file = file.raw
    },
    beforeRemove(file) {
      const isFileSizeTooLarge = this.isFileSizeTooLarge(file)
      if (isFileSizeTooLarge) {
        return true
      }
      return this.$confirm(`Remove ${ file.name } ?`);
    },
    onRemove() {
      this.file = {}
    },
    beforeUpload(file)
    {
      const isFileSizeTooLarge = this.isFileSizeTooLarge(file)
      if (isFileSizeTooLarge) {
        failMessage(`Upload file size cannot exceed ${MAX_FILE_SIZE_IN_MB} MB!`)
      }
      return !isFileSizeTooLarge
    }
  }
}
