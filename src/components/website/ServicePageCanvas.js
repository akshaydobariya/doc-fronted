import React, { useState, useRef } from 'react';

// Conditionally import drag and drop components
let DragDropContext, Droppable, Draggable;
try {
  const dndComponents = require('react-beautiful-dnd');
  DragDropContext = dndComponents.DragDropContext;
  Droppable = dndComponents.Droppable;
  Draggable = dndComponents.Draggable;
} catch (error) {
  console.warn('react-beautiful-dnd not installed, drag and drop will be disabled');
}

const ServicePageCanvas = ({
  components,
  onComponentsChange,
  editingMode,
  editingCapabilities,
  websiteSettings
}) => {
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [showPropertyPanel, setShowPropertyPanel] = useState(false);

  const handleDragEnd = (result) => {
    if (!result.destination || !editingCapabilities?.canEditComponents) {
      return;
    }

    const items = Array.from(components);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    onComponentsChange(items);
  };

  const handleComponentSelect = (component) => {
    setSelectedComponent(component);
    setShowPropertyPanel(true);
  };

  const handleComponentUpdate = (componentId, updates) => {
    const updatedComponents = components.map(comp =>
      comp.id === componentId
        ? { ...comp, ...updates }
        : comp
    );
    onComponentsChange(updatedComponents);
  };

  const handleComponentDelete = (componentId) => {
    const updatedComponents = components.filter(comp => comp.id !== componentId);
    onComponentsChange(updatedComponents);
    if (selectedComponent?.id === componentId) {
      setSelectedComponent(null);
      setShowPropertyPanel(false);
    }
  };

  const handleComponentDuplicate = (component) => {
    const duplicatedComponent = {
      ...component,
      id: `${component.type}-${Date.now()}`
    };
    const updatedComponents = [...components, duplicatedComponent];
    onComponentsChange(updatedComponents);
  };

  const renderComponentPreview = (component) => {
    const baseStyles = {
      backgroundColor: websiteSettings.colors?.background || '#ffffff',
      fontFamily: websiteSettings.fonts?.body || 'Arial, sans-serif'
    };

    switch (component.type) {
      case 'ServiceHero':
        return (
          <div
            className="relative p-8 text-center text-white rounded-lg"
            style={{
              backgroundColor: component.props.backgroundColor || '#2563eb',
              backgroundImage: component.props.backgroundImage ? `url(${component.props.backgroundImage})` : '',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <h1 className="text-3xl font-bold mb-4">{component.props.title || 'Service Title'}</h1>
            <p className="text-xl mb-2">{component.props.subtitle || 'Service Subtitle'}</p>
            <p className="mb-6">{component.props.description || 'Service description'}</p>
            <button className="bg-white text-blue-600 px-6 py-2 rounded-md font-medium">
              {component.props.ctaText || 'Book Appointment'}
            </button>
          </div>
        );

      case 'ServiceOverview':
        return (
          <div className="p-6 bg-white rounded-lg" style={baseStyles}>
            <h2 className="text-2xl font-bold mb-4">{component.props.title || 'Overview'}</h2>
            <p className="text-gray-600 mb-4">{component.props.content || 'Service overview content'}</p>
            {component.props.highlights && component.props.highlights.length > 0 && (
              <ul className="list-disc list-inside space-y-1">
                {component.props.highlights.map((highlight, index) => (
                  <li key={index} className="text-gray-700">{highlight}</li>
                ))}
              </ul>
            )}
          </div>
        );

      case 'ServiceBenefits':
        return (
          <div className="p-6 bg-white rounded-lg" style={baseStyles}>
            <h2 className="text-2xl font-bold mb-4">{component.props.title || 'Benefits'}</h2>
            {component.props.introduction && (
              <p className="text-gray-600 mb-6">{component.props.introduction}</p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {component.props.benefits?.map((benefit, index) => (
                <div key={index} className="text-center">
                  <div className="text-4xl mb-3">{benefit.icon || '✅'}</div>
                  <h3 className="font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-gray-600 text-sm">{benefit.description}</p>
                </div>
              )) || (
                <div className="text-center">
                  <div className="text-4xl mb-3">✅</div>
                  <h3 className="font-semibold mb-2">Sample Benefit</h3>
                  <p className="text-gray-600 text-sm">Benefit description</p>
                </div>
              )}
            </div>
          </div>
        );

      case 'ServiceProcedure':
        return (
          <div className="p-6 bg-white rounded-lg" style={baseStyles}>
            <h2 className="text-2xl font-bold mb-4">{component.props.title || 'Procedure'}</h2>
            {component.props.introduction && (
              <p className="text-gray-600 mb-6">{component.props.introduction}</p>
            )}
            <div className="space-y-4">
              {component.props.steps?.map((step, index) => (
                <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    {step.stepNumber}
                  </div>
                  <div>
                    <h3 className="font-semibold">{step.title}</h3>
                    <p className="text-gray-600 text-sm">{step.description}</p>
                    {step.duration && (
                      <span className="text-xs text-blue-600 font-medium">Duration: {step.duration}</span>
                    )}
                  </div>
                </div>
              )) || (
                <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold">Sample Step</h3>
                    <p className="text-gray-600 text-sm">Step description</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'ServiceFAQ':
        return (
          <div className="p-6 bg-white rounded-lg" style={baseStyles}>
            <h2 className="text-2xl font-bold mb-4">{component.props.title || 'FAQ'}</h2>
            {component.props.introduction && (
              <p className="text-gray-600 mb-6">{component.props.introduction}</p>
            )}
            <div className="space-y-4">
              {component.props.questions?.map((faq, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">{faq.question}</h3>
                  <p className="text-gray-600 text-sm">{faq.answer}</p>
                </div>
              )) || (
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Sample Question?</h3>
                  <p className="text-gray-600 text-sm">Sample answer</p>
                </div>
              )}
            </div>
          </div>
        );

      case 'ServiceCTA':
        return (
          <div
            className="p-8 text-center text-white rounded-lg"
            style={{ backgroundColor: component.props.backgroundColor || '#2563eb' }}
          >
            <h2 className="text-2xl font-bold mb-4">{component.props.title || 'Ready to Get Started?'}</h2>
            {component.props.subtitle && (
              <p className="text-lg mb-6">{component.props.subtitle}</p>
            )}
            <div className="space-y-4">
              <button className="bg-white text-blue-600 px-6 py-3 rounded-md font-medium mr-4">
                {component.props.buttonText || 'Book Now'}
              </button>
              {component.props.phoneNumber && (
                <p className="text-sm">Call us: {component.props.phoneNumber}</p>
              )}
            </div>
          </div>
        );

      default:
        return (
          <div className="p-6 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
            <div className="text-center">
              <h3 className="font-medium text-gray-900">Unknown Component</h3>
              <p className="text-sm text-gray-600">{component.type}</p>
            </div>
          </div>
        );
    }
  };

  const renderComponentControls = (component, index) => (
    <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
      <button
        onClick={() => handleComponentSelect(component)}
        className="p-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
        title="Edit"
      >
        ✏️
      </button>
      <button
        onClick={() => handleComponentDuplicate(component)}
        className="p-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
        title="Duplicate"
      >
        📋
      </button>
      <button
        onClick={() => handleComponentDelete(component.id)}
        className="p-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
        title="Delete"
      >
        🗑️
      </button>
    </div>
  );

  const renderPropertyPanel = () => {
    if (!selectedComponent || !showPropertyPanel) return null;

    return (
      <div className="fixed right-0 top-0 h-full w-80 bg-white border-l border-gray-200 shadow-lg z-50 overflow-y-auto">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Edit Component</h3>
            <button
              onClick={() => setShowPropertyPanel(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          <p className="text-sm text-gray-600">{selectedComponent.type}</p>
        </div>

        <div className="p-4 space-y-4">
          {/* Property editing interface would go here */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">
              Property editing interface for {selectedComponent.type} would be implemented here.
              This would include form fields for editing component props like title, content, colors, etc.
            </p>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => setShowPropertyPanel(false)}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Save Changes
            </button>
            <button
              onClick={() => setShowPropertyPanel(false)}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative">
      {/* Canvas Area */}
      <div className="bg-gray-50 min-h-screen p-4">
        {editingMode === 'visual' && editingCapabilities?.canEditComponents && DragDropContext ? (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="service-page-canvas">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-4"
                >
                  {components.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-lg border-2 border-dashed border-gray-300">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Start Building Your Service Page
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Add components from the library to create your service page
                      </p>
                      <div className="text-4xl mb-4">🚀</div>
                    </div>
                  ) : (
                    components.map((component, index) => (
                      <Draggable
                        key={component.id}
                        draggableId={component.id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`relative group ${
                              snapshot.isDragging ? 'z-10' : ''
                            }`}
                          >
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                              {renderComponentPreview(component)}
                              {renderComponentControls(component, index)}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))
                  )}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        ) : (
          // Template mode - no drag and drop, just display
          <div className="space-y-4">
            {components.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Template Mode
                </h3>
                <p className="text-gray-600 mb-4">
                  Components are generated automatically from your service content
                </p>
                <div className="text-4xl mb-4">📋</div>
              </div>
            ) : (
              components.map((component, index) => (
                <div key={component.id} className="relative group">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    {renderComponentPreview(component)}
                    {editingCapabilities?.canEditContent && renderComponentControls(component, index)}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Property Panel */}
      {renderPropertyPanel()}

      {/* Editing Mode Indicator */}
      <div className="fixed bottom-4 left-4 bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm">
        <span className="text-sm font-medium text-gray-700">
          Mode: {editingMode.charAt(0).toUpperCase() + editingMode.slice(1)}
        </span>
      </div>
    </div>
  );
};

// Default props
ServicePageCanvas.defaultProps = {
  components: [],
  editingMode: 'template',
  editingCapabilities: {
    canEditContent: true,
    canEditComponents: false,
    canEditLayout: false
  },
  websiteSettings: {},
  onComponentsChange: () => {}
};

export default ServicePageCanvas;