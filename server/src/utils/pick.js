/**
 * Creates a new object composed of the picked properties from source object
 * @param {Object} object - Source object to pick properties from
 * @param {string[]} keys - Array of property keys to pick
 * @returns {Object} New object with only the specified properties
 * @example
 * const user = { name: 'John', age: 30, email: 'john@example.com' };
 * pick(user, ['name', 'email']); // { name: 'John', email: 'john@example.com' }
 */
const pick = (object, keys) => {
    return keys.reduce((obj, key) => {
        if (object && Object.prototype.hasOwnProperty.call(object, key)) {
            obj[key] = object[key];
        }
        return obj;
    }, {});
};

module.exports = pick;