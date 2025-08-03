/**
 * A `before()` alternative that gets run when a failing test is retried.
 *
 * By default cypress `before()` isn't run when a test below it fails
 * and is retried. Because we use `before()` as a place to setup state
 * before running assertions inside `it()` this means we can't make use
 * of cypress retry functionality to make our suites more reliable.
 *
 * https://github.com/cypress-io/cypress/issues/19458
 * https://stackoverflow.com/questions/71285827/cypress-e2e-before-hook-not-working-on-retries
 */
const retryableBefore = (fn) => {
    let shouldRun = true;

    // we use beforeEach as cypress will run this on retry attempt
    // we just abort early if we detected that it's already run
    beforeEach(() => {
        if (!shouldRun) return;
        shouldRun = false;
        fn();
    });

    // When a test fails we flip the `shouldRun` flag back to true
    // so when cypress retries and runs the `beforeEach()` before
    // the test that failed, we'll run the `fn()` logic once more.
    Cypress.on("test:after:run", (result) => {
        if (result.state === "failed") {
            if (result.currentRetry < result.retries) {
                shouldRun = true;
            }
        }
    });
};


const stringToArray = (stringToSplit, separator) => {

    const array = stringToSplit.split(separator); // split string by separator

    const trimmedArray = array.map((item) => item.trim()); // remove leading/trailing white spaces

    const validArray = trimmedArray.filter((item) => item); // remove empty strings

    const uniqueArray = [...new Set(validArray)]; // remove duplicates

    return shuffle(uniqueArray);

};

/**
 * Returns a random integer between min (inclusive) and max (inclusive).
 * The value is no lower than min (or the next integer greater than min
 * if min isn't an integer) and no greater than max (or the next integer
 * lower than max if max isn't an integer).
 * Using Math.round() will give you a non-uniform distribution!
 */
const randomInteger = (min, max) => {

    min = Math.ceil(min);

    max = Math.floor(max);

    return Math.floor(Math.random() * (max - min + 1)) + min;

}

const nameCombination = (name, minSize = 2) => {
  const words = name.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z]/gi, ' ').split(/\s+/);
  const result = [];

  function combine(prefix, remaining) {
    if (prefix.length >= minSize) {
      result.push(prefix.join(".*"));
    }
    for (let i = 0; i < remaining.length; i++) {
      combine([...prefix, remaining[i]], remaining.slice(0, i).concat(remaining.slice(i + 1)));
    }
  }

  combine([], words);
  return result;
}

export { retryableBefore, stringToArray, randomInteger, nameCombination }

const shuffle = (array) => {

    for (let i = array.length - 1; i > 0; i--) {

        const j = Math.floor(Math.random() * (i + 1));

        [array[i], array[j]] = [array[j], array[i]];

    }

    return array;

}; 