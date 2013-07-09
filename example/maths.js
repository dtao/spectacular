/**
 * A utility library for doing basic math.
 */
var Maths = {
  /**
   * Adds up all of the numbers in an array.
   *
   * @param {Array.<number>} numbers The numbers to sum up.
   * @return {number} The sum of the numbers.
   *
   * @examples
   * Maths.sum([])        // => 0
   * Maths.sum([1])       // => 1
   * Maths.sum([1, 2, 3]) // => 6
   */
  sum: function(numbers) {
    var sum = 0;
    for (var i = 0; i < numbers.length; ++i) {
      sum += numbers[i];
    }
    return sum;
  },

  /**
   * Computes the mean (average value) of an array of numbers.
   *
   * @param {Array.<number>} numbers The numbers to average.
   * @return {number} The mean of the numbers.
   *
   * @examples
   * Maths.mean([])        // => undefined
   * Maths.mean([1])       // => 1
   * Maths.mean([1, 2, 3]) // => 2
   */
  mean: function(numbers) {
    return Maths.sum(numbers) / numbers.length || undefined;
  },

  /**
   * Computes the median (middle value) of an array of numbers.
   *
   * @param {Array.<number>} numbers The numbers to average.
   * @return {number} The median of the numbers. In the case of an even number of
   *     numbers (when there is no middle value), returns the mean of the two
   *     middle values.
   *
   * @examples
   * Maths.median([])             // => undefined
   * Maths.median([1])            // => 1
   * Maths.median([5, 8, 13])     // => 8
   * Maths.median([5, 8, 13, 21]) // => 10.5
   */
  median: function(numbers) {
    if (numbers.length < 2) {
      return numbers[0];
    }

    var clone = numbers.slice(0);
    clone.sort(function(x, y) { return x - y; });

    if (clone.length % 2 === 1) {
      return clone[((clone.length + 1) / 2) - 1];
    } else {
      return Maths.mean(middleTwo(clone));
    }
  },

  /**
   * Computes the mode (most common value) of an array of numbers.
   *
   * @param {Array.<number>} numbers The numbers to average.
   * @return {number} The mode of the numbers.
   *
   * @examples
   * Maths.mode([])              // => undefined
   * Maths.mode([1])             // => 1
   * Maths.mode([1, 1, 2, 3, 5]) // => 1
   */
  mode: function(numbers) {
    if (numbers.length === 0) {
      return undefined;
    }

    var clone = numbers.slice(0);
    clone.sort(function(x, y) { return x - y; });

    var current  = clone[0];
    var count    = 1;
    var mode     = current;
    var maxCount = 1;

    for (var i = 1; i < clone.length; ++i) {
      if (clone[i] === current) {
        ++count;
        if (count > maxCount) {
          mode = current;
          maxCount = count;
        }

      } else {
        current = clone[i];
        count = 1;
      }
    }

    return mode;
  }
};

function middleTwo(array) {
  var middleIndex = Math.floor(array.length / 2) - 1;
  return [array[middleIndex], array[middleIndex + 1]];
}
