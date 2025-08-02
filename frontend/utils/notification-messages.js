/**
 * Success notification message object
 * @param {String} message
 * @return {Object}
 */
export const successMessage = message => {
  ElMessage({
    showClose: true,
    message: message,
    type: 'success',
    duration: 5000
  })
}

/**
 * Failure notification message object
 * @param {String} message
 * @return {Object}
 */
export const failMessage = message => {
  ElMessage({
    showClose: true,
    message: message,
    type: 'error',
    duration: 5000
  })
}

/**
 * Failure notification message object
 * @param {String} message
 * @return {Object}
 */
export const infoMessage = message => {
  ElMessage({
    showClose: true,
    message: message,
    type: 'info',
    duration: 5000
  })
}

/**
 * Custom notification message object
 * @param {Object} Object containing required data for ElMessage
 * @return {Object}
 */
export const customMessage = data => {
  ElMessage(data)
}
