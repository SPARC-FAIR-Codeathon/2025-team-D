<template>
  <el-dialog
    v-model="showModal"
    :show-close="false"
    :append-to-body="true"
    @close="closeDialog"
  >
    <template #header>
      <div class="bf-dialog-header">
        <span class="bf-dialog-header-title">Accessibility Standards</span>
      </div>
    </template>

    <div class="bf-dialog-body">
      <div>
        <p>
          The SPARC Portal is partially conformant with 
          <a
            href="https://www.w3.org/WAI/standards-guidelines/wcag/"
            alt="WCAG Guidelines"
            target="blank"
            >WCAG</a
          >
          guidelines. Partially conformant means that some parts of the content
          do not fully conform to the accessibility standard.
        </p>
        <p>
          We welcome your feedback on the accessibility of SPARC Portal.
          Please let us know if you encounter accessibility barriers on SPARC
          Portal:
        </p>
        <ul>
          <li>
            Email:
            <a href="mailto:support@sparc.science">support@sparc.science</a>
          </li>
        </ul>
        <p>We try to respond to feedback within 3-5 business days.</p>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button class="secondary" @click="closeDialog">
          Close
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script>
export default {
  name: 'AccessibilityDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    showModal() {
      return this.visible
    }
  },

  methods: {
    /**
     * Closes the dialog
     */
    closeDialog: function() {
      this.$emit('close')
    }
  }
}
</script>

<style lang="scss" scoped>
:deep(.el-dialog) {
  width: 75%;
}
.bf-dialog-header {
  text-align: center;
}
.dialog-footer {
  justify-content: center;
}
</style>
