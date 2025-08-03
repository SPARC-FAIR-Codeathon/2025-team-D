export function useLocalStorage() {
  const storeInLocalStorage = (key, newValue) => {
    if (process.client) {
      const currentValue = localStorage.getItem(key)

      // Check if the value is different or doesn't exist
      if (!currentValue || JSON.stringify(newValue) !== currentValue) {
        // Store the new value in localStorage
        localStorage.setItem(key, JSON.stringify(newValue))
        return true  // Indicates the value was different and has been updated
      }
    }
    return false  // Indicates the value was the same and no update was made
  }

  const getFromLocalStorage = (key, defaultValue = null) => {
    if (process.client) {
      const storedValue = localStorage.getItem(key)
      
      if (storedValue) {
        try {
          return JSON.parse(storedValue)
        } catch (error) {
          console.error('Error parsing localStorage value for key:', key, error)
          return null
        }
      }
    }
    return defaultValue
  }

  // Function to store the time delta and track when it was set via a timestamp set in localStorage
  const storeTimeDelta = (key, timeDeltaInHours) => {
    if (process.client) {
      const currentValue = localStorage.getItem(key)
      // Convert timeDelta from hours to milliseconds (1 hour = 3600000 milliseconds)
      const timeDeltaInMilliseconds = timeDeltaInHours * 3600000
      if (!currentValue || JSON.stringify(timeDeltaInMilliseconds) !== currentValue) {
        // Save the time delta (in milliseconds) and the current timestamp
        localStorage.setItem(key, JSON.stringify(timeDeltaInMilliseconds))
        resetTimestamp(key)
        return true // Value has been updated
      }
    }
    return false;
  }
  
  // Function to check if the time delta has passed since the last timestamp saved in localStorage
  const hasTimeDeltaPassed = (timeDeltaKey) => {
    if (process.client) {
      const timeDeltaTimestampKey = `${timeDeltaKey}_timestamp`
      const storedTimestamp = localStorage.getItem(timeDeltaTimestampKey)
      const storedTimeDelta = localStorage.getItem(timeDeltaKey)
      
      if (storedTimestamp) {
        const currentTimestamp = Date.now()
        const timeElapsed = currentTimestamp - parseInt(storedTimestamp, 10)

        return timeElapsed >= storedTimeDelta;
      }
    }
    return false // If no timestamp exists, assume time hasn't passed
  }

  // Function to reset the timestamp back to the current time
  const resetTimestamp = (key) => {
    if (process.client) {
      const timeDeltaTimestampKey = `${key}_timestamp`
      const currentTimestamp = Date.now()

      // Reset the timestamp by updating the timestamp key in localStorage
      localStorage.setItem(timeDeltaTimestampKey, JSON.stringify(currentTimestamp))
    }
  }

  return {
    storeInLocalStorage,
    getFromLocalStorage,
    storeTimeDelta,
    hasTimeDeltaPassed,
    resetTimestamp
  }
}
