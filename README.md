Here's the idea behind this little project: consolidate docs, specs, and performance benchmarks into one SPECTACULAR package.

What?

Like this:

```javascript
/**
 * Adds up all of the numbers in an array.
 *
 * @param {Array.<number>} numbers The numbers to sum up.
 * @return {number} The sum of the numbers.
 *
 * @examples
 * sum([])        // => 0
 * sum([1])       // => 1
 * sum([1, 2, 3]) // => 6
 */
function sum(numbers) {
  var sum = 0;
  for (var i = 0; i < numbers.length; ++i) {
    sum += numbers[i];
  }
  return sum;
}
```

The goal of Spectacular (*note to self: name is pretty weak; think about changing*) is to establish a conventional system whereby we can use JSDoc to parse the `@examples` annotation and automatically generate:

- documentation (duh)
- specs, which will be *a part of* the documentation (e.g., you view it in a browser, you can see the specs passing/failing right there)
- *eventually*, performance benchmarks (this one will take a bit more work)

Just FYI, I've barely even started at this.
