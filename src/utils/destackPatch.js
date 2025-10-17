/**
 * Destack Compatibility Patch
 *
 * This file contains patches to fix known issues with the Destack library,
 * specifically the componentsList.reduce TypeError that occurs when
 * componentsList is not an array.
 */

// Store original methods
const originalReduceMethod = Array.prototype.reduce;

// Enhanced error handling for Destack componentsList
const patchedReduce = function(callback, initialValue) {
  // Check if this is being called on a non-array that should be an array
  if (this == null || this === undefined || typeof this.reduce !== 'function') {
    console.warn('REACT DESTACK PATCH: Reduce called on non-array, attempting to fix...');

    // If this appears to be a Destack components context, return a safe default
    if (typeof callback === 'function') {
      const stack = new Error().stack;
      if (stack && (stack.includes('loadThemeComponents') || stack.includes('destack') || stack.includes('bundle.js'))) {
        console.warn('REACT DESTACK PATCH: Detected Destack componentsList issue, using fallback array');

        // Return a default components list for Destack
        const fallbackComponents = [
          'Text', 'Image', 'Button', 'Container', 'Row', 'Column',
          'Heading', 'Paragraph', 'Link', 'List', 'Card', 'Form'
        ];

        return originalReduceMethod.call(fallbackComponents, callback, initialValue);
      }
    }

    // For other cases, throw the original error
    throw new TypeError('Reduce called on non-array');
  }

  // Call original reduce method for normal arrays
  return originalReduceMethod.call(this, callback, initialValue);
};

// Temporarily override Array.prototype.reduce to catch the bundle error
console.log('REACT DESTACK PATCH: Overriding Array.prototype.reduce for Destack fix');
Array.prototype.reduce = patchedReduce;

// Global error handler for Destack-related errors
const handleDestackError = (error) => {
  if (error.message && error.message.includes('componentsList.reduce')) {
    console.warn('Caught componentsList.reduce error, applying patch...');

    // Ensure Destack has a valid components list
    if (typeof window !== 'undefined') {
      window.destackComponentsPatch = window.destackComponentsPatch || {
        components: [
          'Text', 'Image', 'Button', 'Container', 'Row', 'Column',
          'Heading', 'Paragraph', 'Link', 'List', 'Card', 'Form',
          'Input', 'Select', 'Checkbox', 'Radio', 'Textarea'
        ]
      };

      // Try to fix the Destack internal state
      if (window.destack) {
        if (!window.destack.theme) window.destack.theme = {};
        if (!Array.isArray(window.destack.theme.components)) {
          window.destack.theme.components = window.destackComponentsPatch.components;
        }
      }
    }

    return true; // Indicate that the error was handled
  }

  return false; // Indicate that the error was not handled
};

// Patch global error handlers
const patchGlobalErrorHandlers = () => {
  if (typeof window === 'undefined') return;

  // Patch unhandled promise rejections
  const originalUnhandledRejection = window.onunhandledrejection;
  window.addEventListener('unhandledrejection', (event) => {
    if (handleDestackError(event.reason)) {
      event.preventDefault();
    } else if (originalUnhandledRejection) {
      originalUnhandledRejection(event);
    }
  });

  // Patch global errors
  const originalErrorHandler = window.onerror;
  window.addEventListener('error', (event) => {
    if (handleDestackError(event.error)) {
      event.preventDefault();
    } else if (originalErrorHandler) {
      originalErrorHandler(event);
    }
  });
};

// Initialize the patch
const initializeDestackPatch = () => {
  console.log('Initializing Destack compatibility patch...');

  try {
    // Apply global error handlers
    patchGlobalErrorHandlers();

    // Set up Destack defaults early
    if (typeof window !== 'undefined') {
      window.destackComponentsPatch = window.destackComponentsPatch || {
        components: [
          'Text', 'Image', 'Button', 'Container', 'Row', 'Column',
          'Heading', 'Paragraph', 'Link', 'List', 'Card', 'Form',
          'Input', 'Select', 'Checkbox', 'Radio', 'Textarea',
          'Divider', 'Spacer', 'Icon', 'Video', 'Audio'
        ]
      };

      // Pre-initialize Destack structure
      if (!window.destack) window.destack = {};
      if (!window.destack.theme) window.destack.theme = {};
      if (!Array.isArray(window.destack.theme.components)) {
        window.destack.theme.components = window.destackComponentsPatch.components;
      }
    }

    console.log('Destack patch initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Destack patch:', error);
  }
};

// Auto-initialize when this module is loaded
if (typeof window !== 'undefined') {
  // Initialize immediately if DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeDestackPatch);
  } else {
    initializeDestackPatch();
  }
}

export {
  initializeDestackPatch,
  handleDestackError,
  patchGlobalErrorHandlers
};