import React from 'react';
import DynamicNavigationHeader from './DynamicNavigationHeader';
import ServicesSection from './ServicesSection';
// Import new modern headers
import ModernMinimalistHeader from './ModernMinimalistHeader';
import GlassmorphismHeader from './GlassmorphismHeader';
import GradientModernHeader from './GradientModernHeader';
import CorporateProfessionalHeader from './CorporateProfessionalHeader';
import FuturisticTechHeader from './FuturisticTechHeader';

/**
 * Component Renderer
 * Handles rendering of both HTML and React components in the drag-and-drop builder
 */

// Registry of available React components
const REACT_COMPONENTS = {
  // Legacy components
  DynamicNavigationHeader: DynamicNavigationHeader,
  ServicesSection: ServicesSection,
  // Modern header components
  ModernMinimalistHeader: ModernMinimalistHeader,
  GlassmorphismHeader: GlassmorphismHeader,
  GradientModernHeader: GradientModernHeader,
  CorporateProfessionalHeader: CorporateProfessionalHeader,
  FuturisticTechHeader: FuturisticTechHeader
};

const ComponentRenderer = ({ component, config = {}, websiteId = null, isPreview = false }) => {
  // Check if this is a React component
  if (component.isReactComponent && component.componentName) {
    const ReactComponent = REACT_COMPONENTS[component.componentName];

    if (ReactComponent) {
      // Merge default config with passed config
      const finalConfig = {
        ...component.defaultConfig,
        ...config,
        websiteId
      };

      return (
        <div data-component-id={component.id} data-component-type="react-component">
          <ReactComponent {...finalConfig} />
        </div>
      );
    } else {
      // Component not found - show placeholder
      return (
        <div
          style={{
            padding: '20px',
            border: '2px dashed #ff9800',
            backgroundColor: '#fff3e0',
            textAlign: 'center',
            color: '#f57c00'
          }}
        >
          <h4 style={{ margin: '0 0 8px 0' }}>⚠️ React Component Not Found</h4>
          <p style={{ margin: '0', fontSize: '14px' }}>
            Component: {component.componentName}
          </p>
        </div>
      );
    }
  }

  // Regular HTML component - render with dangerouslySetInnerHTML
  return (
    <div
      data-component-id={component.id}
      data-component-type="html-component"
      dangerouslySetInnerHTML={{ __html: component.component }}
    />
  );
};

export default ComponentRenderer;