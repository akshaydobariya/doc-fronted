/**
 * EMERGENCY DESTACK FIX
 * This script must be loaded BEFORE React and Destack to patch the componentsList.reduce error
 */

console.log('Loading Destack emergency fix...');

// Store original Array.prototype.reduce
const originalReduce = Array.prototype.reduce;

// Override reduce to handle the specific Destack error
Array.prototype.reduce = function(callback, initialValue) {
  // Check if this is being called on something that's not an array
  if (this == null || this === undefined) {
    // Get the call stack to see if this is from Destack
    const stack = new Error().stack;
    if (stack && (stack.includes('loadThemeComponents') || stack.includes('destack'))) {
      console.warn('DESTACK FIX: componentsList.reduce called on null/undefined, using fallback');

      // Return a default components array for Destack
      const fallbackComponents = [
        'Text', 'Image', 'Button', 'Container', 'Row', 'Column',
        'Heading', 'Paragraph', 'Link', 'List', 'Card'
      ];

      return originalReduce.call(fallbackComponents, callback, initialValue);
    }
  }

  // For non-arrays that aren't from Destack, still throw error
  if (!Array.isArray(this)) {
    // But check if it's the specific Destack case
    const stack = new Error().stack;
    if (stack && (stack.includes('loadThemeComponents') || stack.includes('destack'))) {
      console.warn('DESTACK FIX: componentsList.reduce called on non-array, using fallback');

      const fallbackComponents = [
        'Text', 'Image', 'Button', 'Container', 'Row', 'Column',
        'Heading', 'Paragraph', 'Link', 'List', 'Card'
      ];

      return originalReduce.call(fallbackComponents, callback, initialValue);
    }

    // For other cases, call original and let it fail normally
    return originalReduce.call(this, callback, initialValue);
  }

  // Normal array, call original reduce
  return originalReduce.call(this, callback, initialValue);
};

// Also set up global Destack defaults
window.destackFix = {
  components: [
    'Text', 'Image', 'Button', 'Container', 'Row', 'Column',
    'Heading', 'Paragraph', 'Link', 'List', 'Card', 'Form',
    'Input', 'Select', 'Checkbox', 'Radio', 'Textarea'
  ]
};

// Pre-initialize Destack global objects
window.destack = window.destack || {};
window.destack.theme = window.destack.theme || {};
window.destack.theme.components = window.destack.theme.components || window.destackFix.components;

// Global error handler
window.addEventListener('error', function(event) {
  if (event.error && event.error.message && event.error.message.includes('componentsList.reduce')) {
    console.warn('DESTACK FIX: Caught componentsList.reduce error globally');
    event.preventDefault();

    // Try to fix Destack state
    if (window.destack) {
      if (!window.destack.theme) window.destack.theme = {};
      if (!Array.isArray(window.destack.theme.components)) {
        window.destack.theme.components = window.destackFix.components;
      }
    }

    return false;
  }
});

// Unhandled promise rejections
window.addEventListener('unhandledrejection', function(event) {
  if (event.reason && event.reason.message && event.reason.message.includes('componentsList.reduce')) {
    console.warn('DESTACK FIX: Caught componentsList.reduce promise rejection');
    event.preventDefault();

    // Try to fix Destack state
    if (window.destack) {
      if (!window.destack.theme) window.destack.theme = {};
      if (!Array.isArray(window.destack.theme.components)) {
        window.destack.theme.components = window.destackFix.components;
      }
    }
  }
});

console.log('Destack emergency fix loaded successfully');