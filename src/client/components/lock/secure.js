// secure/secure.js

// Global sanitization function
function sanitize(input) {
    if (typeof input !== 'string') {
      return input; // Only sanitize strings
    }
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      "/": '&#x2F;',
    };
    const reg = /[&<>"'/]/ig;
    return input.replace(reg, match => map[match]);
  }
  
  // Function to create a sanitizing proxy around an object
  function createSanitizingProxy(target) {
    return new Proxy(target, {
      set(target, property, value) {
        target[property] = sanitize(value);
        return true; // Indicate success
      },
      get(target, property) {
        return target[property]; // Direct pass-through for retrieval
      }
    });
  }
  
  // Exporting the functions for use in other files
  export { sanitize, createSanitizingProxy };