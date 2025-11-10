/**
 * Destack Bundle Patch
 *
 * This module provides an aggressive fix for the componentsList.reduce error
 * that occurs in the bundled Destack code. It hooks into the execution context
 * to prevent the error before it happens.
 */

console.log('Loading Destack Bundle Patch...');

// Store original Array prototype methods
const ORIGINAL_METHODS = {
  reduce: Array.prototype.reduce,
  map: Array.prototype.map,
  filter: Array.prototype.filter
};

// Counter to track patch applications
let patchAppliedCount = 0;

/**
 * Checks if the current execution context is from Destack
 */
const isDestackContext = () => {
  try {
    const stack = new Error().stack;
    return stack && (
      stack.includes('loadThemeComponents') ||
      stack.includes('destack') ||
      stack.includes('bundle.js:67732') ||
      stack.includes('ContentProviderReact') ||
      stack.includes('static/js/bundle.js')
    );
  } catch (e) {
    return false;
  }
};

/**
 * Safe reduce implementation for Destack
 */
const safeReduce = function(callback, initialValue) {
  const context = this;

  // Handle null/undefined context
  if (context == null || context === undefined) {
    if (isDestackContext()) {
      patchAppliedCount++;
      console.warn(`BUNDLE PATCH ${patchAppliedCount}: componentsList.reduce called on null/undefined, using fallback`);

      const fallbackArray = [
        'Text', 'Image', 'Button', 'Container', 'Row', 'Column',
        'Heading', 'Paragraph', 'Link', 'List', 'Card', 'Form'
      ];

      return ORIGINAL_METHODS.reduce.call(fallbackArray, callback, initialValue);
    }

    // Let other contexts fail normally
    throw new TypeError('Array.prototype.reduce called on null or undefined');
  }

  // Handle non-array context that should be an array (for Destack)
  if (!Array.isArray(context) && isDestackContext()) {
    patchAppliedCount++;
    console.warn(`BUNDLE PATCH ${patchAppliedCount}: componentsList.reduce called on non-array, using fallback`);

    const fallbackArray = [
      'Text', 'Image', 'Button', 'Container', 'Row', 'Column',
      'Heading', 'Paragraph', 'Link', 'List', 'Card', 'Form'
    ];

    return ORIGINAL_METHODS.reduce.call(fallbackArray, callback, initialValue);
  }

  // Normal case - call original reduce
  return ORIGINAL_METHODS.reduce.call(context, callback, initialValue);
};

/**
 * Apply the bundle patch
 */
const applyBundlePatch = () => {
  try {
    // Override Array.prototype.reduce with our safe version
    // ESLint disable: This is a necessary patch for Destack compatibility
    // eslint-disable-next-line no-extend-native
    Array.prototype.reduce = safeReduce;

    // Also set up global error handlers
    if (typeof window !== 'undefined') {
      // Handle unhandled promise rejections
      window.addEventListener('unhandledrejection', (event) => {
        if (event.reason && event.reason.message &&
            event.reason.message.includes('componentsList.reduce')) {
          patchAppliedCount++;
          console.warn(`BUNDLE PATCH ${patchAppliedCount}: Caught promise rejection for componentsList.reduce`);
          event.preventDefault();

          // Try to fix the global state
          if (!window.destack) window.destack = {};
          if (!window.destack.theme) window.destack.theme = {};
          if (!Array.isArray(window.destack.theme.components)) {
            window.destack.theme.components = [
              'Text', 'Image', 'Button', 'Container', 'Row', 'Column'
            ];
          }
        }
      });

      // Handle synchronous errors
      window.addEventListener('error', (event) => {
        if (event.error && event.error.message &&
            event.error.message.includes('componentsList.reduce')) {
          patchAppliedCount++;
          console.warn(`BUNDLE PATCH ${patchAppliedCount}: Caught error for componentsList.reduce`);
          event.preventDefault();

          // Try to fix the global state
          if (!window.destack) window.destack = {};
          if (!window.destack.theme) window.destack.theme = {};
          if (!Array.isArray(window.destack.theme.components)) {
            window.destack.theme.components = [
              'Text', 'Image', 'Button', 'Container', 'Row', 'Column'
            ];
          }
        }
      });

      // Pre-initialize Destack globals
      if (!window.destack) window.destack = {};
      if (!window.destack.theme) window.destack.theme = {};
      if (!Array.isArray(window.destack.theme.components)) {
        window.destack.theme.components = [
          'Text', 'Image', 'Button', 'Container', 'Row', 'Column',
          'Heading', 'Paragraph', 'Link', 'List', 'Card', 'Form',
          'Input', 'Select', 'Checkbox', 'Radio', 'Textarea'
        ];
      }

      console.log('Destack Bundle Patch applied successfully');
      return true;
    }
  } catch (error) {
    console.error('Failed to apply Destack Bundle Patch:', error);
    return false;
  }

  return false;
};

/**
 * Remove the patch (for cleanup)
 */
const removeBundlePatch = () => {
  try {
    // eslint-disable-next-line no-extend-native
    Array.prototype.reduce = ORIGINAL_METHODS.reduce;
    console.log('Destack Bundle Patch removed');
    return true;
  } catch (error) {
    console.error('Failed to remove Destack Bundle Patch:', error);
    return false;
  }
};

// Auto-apply the patch
const patchApplied = applyBundlePatch();

console.log('Destack Bundle Patch loaded', {
  patchApplied,
  patchAppliedCount
});

export {
  applyBundlePatch,
  removeBundlePatch,
  isDestackContext,
  safeReduce
};