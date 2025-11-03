import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ServicePageCanvas from './ServicePageCanvas';
import ServiceComponentLibrary from './ServiceComponentLibrary';
import ContentManager from './ContentManager';
import AIAssistant from './AIAssistant';
import PreviewPanel from './PreviewPanel';
import ConflictResolution from './ConflictResolution';
import { servicePageService } from '../../services/servicePageService';
import UnifiedContentService from '../../services/unifiedContentService';

// Conditionally import toastify
let ToastContainer, toast;
try {
  const toastifyComponents = require('react-toastify');
  ToastContainer = toastifyComponents.ToastContainer;
  toast = toastifyComponents.toast;
  require('react-toastify/dist/ReactToastify.css');
} catch (error) {
  console.warn('react-toastify not installed, notifications will use console');
  toast = {
    success: (msg) => console.log('Success:', msg),
    error: (msg) => console.error('Error:', msg),
    info: (msg) => console.info('Info:', msg)
  };
  ToastContainer = () => null;
}

const ServicePageEditor = () => {
  const { servicePageId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [servicePage, setServicePage] = useState(null);
  const [currentVersionData, setCurrentVersionData] = useState(null);
  const [editingCapabilities, setEditingCapabilities] = useState(null);
  const [websiteSettings, setWebsiteSettings] = useState({});
  const [serviceInfo, setServiceInfo] = useState({});
  const [components, setComponents] = useState([]);
  const [editingMode, setEditingMode] = useState('template');
  const [activeTab, setActiveTab] = useState('design');
  const [versions, setVersions] = useState([]);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [unifiedContent, setUnifiedContent] = useState(null);
  const [conflicts, setConflicts] = useState([]);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [syncStatus, setSyncStatus] = useState(null);
  const saveTimeoutRef = useRef(null);

  // Tabs for the editor interface
  const editorTabs = [
    { id: 'design', label: 'Design', icon: '🎨' },
    { id: 'content', label: 'Content', icon: '📝' },
    { id: 'unified', label: 'Unified Content', icon: '🔄' },
    { id: 'ai-assistant', label: 'AI Assistant', icon: '🤖' },
    { id: 'conflicts', label: 'Conflicts', icon: '⚠️' },
    { id: 'seo', label: 'SEO', icon: '🔍' },
    { id: 'versions', label: 'Versions', icon: '📋' },
    { id: 'preview', label: 'Preview', icon: '👁️' }
  ];

  useEffect(() => {
    if (servicePageId) {
      loadServicePageData();
    }
  }, [servicePageId]);

  const loadServicePageData = async () => {
    try {
      setLoading(true);

      // Use the new unified data endpoint for atomic loading
      const response = await servicePageService.getUnifiedEditingData(servicePageId, { includeTemplateInfo: true });

      if (response.success) {
        const {
          servicePage,
          unifiedContent,
          syncStatus,
          templateInfo,
          conflictResolution
        } = response.data;

        // Set service page data
        setServicePage(servicePage);
        setCurrentVersionData(servicePage.currentVersionData);
        setEditingCapabilities(servicePage.editingCapabilities);
        setEditingMode(servicePage.editingMode || 'template');

        // Set unified content data
        setUnifiedContent(unifiedContent);
        setSyncStatus(syncStatus);

        // Handle conflicts if any
        if (conflictResolution.hasConflicts) {
          setConflicts([{
            type: conflictResolution.conflictSource,
            message: 'Template and content are out of sync',
            severity: 'warning'
          }]);
        } else {
          setConflicts([]);
        }

        // Initialize components based on editing mode
        if (servicePage.editingMode === 'visual' && servicePage.currentVersionData?.components) {
          setComponents(servicePage.currentVersionData.components);
        } else {
          // Generate components from template content
          setComponents(generateComponentsFromContent(servicePage.content));
        }

        // Show sync status notification
        if (syncStatus === 'out_of_sync') {
          toast.info('Template and content are out of sync. Please review conflicts.');
        } else if (syncStatus === 'in_sync') {
          toast.success('All content is synchronized.');
        }
      }
    } catch (error) {
      console.error('Error loading unified service page data:', error);
      toast.error('Failed to load service page data');

      // Fallback to individual loading if unified endpoint fails
      try {
        const fallbackResponse = await servicePageService.getServicePageForEditing(servicePageId);
        if (fallbackResponse.success) {
          const { servicePage, currentVersionData, editingCapabilities } = fallbackResponse.data;
          setServicePage(servicePage);
          setCurrentVersionData(currentVersionData);
          setEditingCapabilities(editingCapabilities);
          setEditingMode(servicePage.editingMode || 'template');

          if (servicePage.editingMode === 'visual' && currentVersionData?.components) {
            setComponents(currentVersionData.components);
          } else {
            setComponents(generateComponentsFromContent(servicePage.content));
          }

          toast.warning('Using fallback data loading. Some features may be limited.');
        }
      } catch (fallbackError) {
        console.error('Fallback loading also failed:', fallbackError);
        toast.error('Failed to load service page data completely');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadUnifiedContentData = async (servicePageId) => {
    try {
      // Get unified content for this service page
      const unifiedContentResponse = await UnifiedContentService.getByServicePage(servicePageId);
      if (unifiedContentResponse) {
        setUnifiedContent(unifiedContentResponse);
        setConflicts(unifiedContentResponse.conflicts || []);
        setSyncStatus(unifiedContentResponse.syncStatus);

        // Load AI suggestions
        const suggestionsResponse = await UnifiedContentService.getAISuggestions(unifiedContentResponse._id);
        setAiSuggestions(suggestionsResponse.suggestions || []);
      }
    } catch (error) {
      console.warn('Unified content not found, will be created when needed:', error);
      // This is expected for existing service pages that don't have unified content yet
    }
  };

  const loadVersionHistory = async () => {
    try {
      const response = await servicePageService.getVersionHistory(servicePageId);
      if (response.success) {
        setVersions(response.data.versions);
      }
    } catch (error) {
      console.error('Error loading version history:', error);
      toast.error('Failed to load version history');
    }
  };

  const generateComponentsFromContent = (content) => {
    const components = [];
    let order = 0;

    // Hero section
    if (content.hero) {
      components.push({
        id: `hero-${Date.now()}`,
        type: 'ServiceHero',
        props: {
          title: content.hero.title,
          subtitle: content.hero.subtitle,
          description: content.hero.description,
          ctaText: content.hero.ctaText,
          backgroundImage: content.hero.backgroundImage
        },
        order: order++
      });
    }

    // Overview section
    if (content.overview) {
      components.push({
        id: `overview-${Date.now()}`,
        type: 'ServiceOverview',
        props: {
          title: content.overview.title,
          content: content.overview.content,
          highlights: content.overview.highlights
        },
        order: order++
      });
    }

    // Benefits section
    if (content.benefits && content.benefits.list && content.benefits.list.length > 0) {
      components.push({
        id: `benefits-${Date.now()}`,
        type: 'ServiceBenefits',
        props: {
          title: content.benefits.title,
          introduction: content.benefits.introduction,
          benefits: content.benefits.list
        },
        order: order++
      });
    }

    // Procedure section
    if (content.procedure && content.procedure.steps && content.procedure.steps.length > 0) {
      components.push({
        id: `procedure-${Date.now()}`,
        type: 'ServiceProcedure',
        props: {
          title: content.procedure.title,
          introduction: content.procedure.introduction,
          steps: content.procedure.steps,
          additionalInfo: content.procedure.additionalInfo
        },
        order: order++
      });
    }

    // FAQ section
    if (content.faq && content.faq.questions && content.faq.questions.length > 0) {
      components.push({
        id: `faq-${Date.now()}`,
        type: 'ServiceFAQ',
        props: {
          title: content.faq.title,
          introduction: content.faq.introduction,
          questions: content.faq.questions
        },
        order: order++
      });
    }

    // CTA section
    if (content.cta) {
      components.push({
        id: `cta-${Date.now()}`,
        type: 'ServiceCTA',
        props: {
          title: content.cta.title,
          subtitle: content.cta.subtitle,
          buttonText: content.cta.buttonText,
          phoneNumber: content.cta.phoneNumber,
          email: content.cta.email,
          backgroundColor: content.cta.backgroundColor
        },
        order: order++
      });
    }

    return components.sort((a, b) => a.order - b.order);
  };

  const handleComponentsChange = (newComponents) => {
    setComponents(newComponents);
    autoSave();
  };

  const handleContentChange = (section, field, value) => {
    setServicePage(prev => ({
      ...prev,
      content: {
        ...prev.content,
        [section]: {
          ...prev.content[section],
          [field]: value
        }
      }
    }));
    autoSave();
  };

  const handleSEOChange = (field, value) => {
    setServicePage(prev => ({
      ...prev,
      seo: {
        ...prev.seo,
        [field]: value
      }
    }));
    autoSave();
  };

  const autoSave = () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      saveServicePage();
    }, 2000); // Auto-save after 2 seconds of inactivity
  };

  const saveServicePage = async () => {
    try {
      setSaving(true);

      // Prepare unified data for atomic save
      const unifiedData = {
        servicePageContent: servicePage.content,
        editingMode: editingMode,
        components: editingMode === 'visual' ? components : [],
        seo: servicePage.seo,
        design: servicePage.design,
        changeLog: 'Auto-saved from editor'
      };

      // Include unified content data if available
      if (unifiedContent) {
        unifiedData.unifiedContentData = {
          content: unifiedContent.content,
          aiSuggestions: aiSuggestions,
          conflicts: conflicts
        };
      }

      // Try unified save first, fall back to individual save if needed
      try {
        const response = await servicePageService.saveUnifiedEditingData(servicePageId, unifiedData);

        if (response.success) {
          setSyncStatus('in_sync');
          toast.success('Changes saved successfully');
        }
      } catch (unifiedError) {
        console.warn('Unified save failed, trying individual save:', unifiedError);

        // Fallback to individual save
        const individualData = {
          content: servicePage.content,
          components: editingMode === 'visual' ? components : [],
          seo: servicePage.seo,
          design: servicePage.design,
          editingMode: editingMode,
          changeLog: 'Auto-saved from editor (fallback)'
        };

        const fallbackResponse = await servicePageService.updateServicePageContent(servicePageId, individualData);

        if (fallbackResponse.success) {
          setSyncStatus('fallback_save');
          toast.warning('Changes saved (limited functionality mode)');
        }
      }
    } catch (error) {
      console.error('Error saving service page:', error);
      toast.error('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleManualSave = async () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    await saveServicePage();
  };

  const handlePublish = async () => {
    try {
      const response = await servicePageService.publishVersion(servicePageId, {
        versionNumber: servicePage.currentVersion
      });

      if (response.success) {
        toast.success('Service page published successfully');
        setServicePage(prev => ({ ...prev, status: 'published' }));
      }
    } catch (error) {
      console.error('Error publishing service page:', error);
      toast.error('Failed to publish service page');
    }
  };

  const handleRestoreVersion = async (versionNumber) => {
    try {
      const response = await servicePageService.restoreVersion(servicePageId, versionNumber);

      if (response.success) {
        toast.success(`Version ${versionNumber} restored successfully`);
        await loadServicePageData();
      }
    } catch (error) {
      console.error('Error restoring version:', error);
      toast.error('Failed to restore version');
    }
  };

  const handleEditingModeChange = async (newMode) => {
    try {
      const response = await servicePageService.updateEditingMode(servicePageId, { editingMode: newMode });

      if (response.success) {
        setEditingMode(newMode);
        setEditingCapabilities(response.data.capabilities);
        toast.success(`Switched to ${newMode} editing mode`);

        // Regenerate components if switching to visual mode
        if (newMode === 'visual' && editingMode !== 'visual') {
          setComponents(generateComponentsFromContent(servicePage.content));
        }
      }
    } catch (error) {
      console.error('Error updating editing mode:', error);
      toast.error('Failed to update editing mode');
    }
  };

  const renderEditingModeSelector = () => (
    <div className="mb-6 bg-gray-50 p-4 rounded-lg">
      <h3 className="text-sm font-medium text-gray-700 mb-3">Editing Mode</h3>
      <div className="flex space-x-4">
        {['template', 'visual', 'hybrid'].map(mode => (
          <button
            key={mode}
            onClick={() => handleEditingModeChange(mode)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              editingMode === mode
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {mode.charAt(0).toUpperCase() + mode.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'design':
        return (
          <div className="space-y-6">
            {renderEditingModeSelector()}

            {editingMode === 'visual' && (
              <ServiceComponentLibrary
                onComponentAdd={(component) => {
                  setComponents(prev => [...prev, { ...component, id: `${component.type}-${Date.now()}` }]);
                }}
                editingCapabilities={editingCapabilities}
              />
            )}

            <ServicePageCanvas
              components={components}
              onComponentsChange={handleComponentsChange}
              editingMode={editingMode}
              editingCapabilities={editingCapabilities}
              websiteSettings={websiteSettings}
            />
          </div>
        );

      case 'content':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Content Management</h3>
            {/* Content editing interface would go here */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-600">Content editing interface - Individual section editors would be implemented here</p>
            </div>
          </div>
        );

      case 'unified':
        return (
          <div className="space-y-6">
            <ContentManager
              websiteId={servicePage?.websiteId}
              onContentChange={(content) => {
                setUnifiedContent(content);
                loadUnifiedContentData(servicePageId);
              }}
            />
          </div>
        );

      case 'ai-assistant':
        return (
          <div className="space-y-6">
            <AIAssistant
              contentId={unifiedContent?._id}
              onSuggestionApplied={(suggestion) => {
                // Reload AI suggestions after applying one
                if (unifiedContent?._id) {
                  UnifiedContentService.getAISuggestions(unifiedContent._id)
                    .then(response => setAiSuggestions(response.suggestions || []))
                    .catch(console.error);
                }
              }}
            />
          </div>
        );

      case 'conflicts':
        return (
          <div className="space-y-6">
            {conflicts && conflicts.length > 0 ? (
              <ConflictResolution
                contentId={unifiedContent?._id}
                conflicts={conflicts}
                onResolutionComplete={() => {
                  // Reload unified content after resolving conflicts
                  loadUnifiedContentData(servicePageId);
                }}
              />
            ) : (
              <div className="bg-green-50 p-6 rounded-lg text-center">
                <div className="text-green-600 text-2xl mb-2">✅</div>
                <h3 className="text-lg font-medium text-green-900 mb-2">No Conflicts Found</h3>
                <p className="text-green-700">AI content and visual edits are perfectly synchronized.</p>
              </div>
            )}
          </div>
        );

      case 'seo':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">SEO Settings</h3>
            {/* SEO interface would go here */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-600">SEO interface - Meta title, description, keywords editor would be implemented here</p>
            </div>
          </div>
        );

      case 'versions':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Version History</h3>
            <button
              onClick={loadVersionHistory}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Load Version History
            </button>

            {versions.length > 0 && (
              <div className="space-y-2">
                {versions.map(version => (
                  <div key={version.versionNumber} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <span className="font-medium">Version {version.versionNumber}</span>
                      <span className="text-gray-600 ml-2">{version.changeLog}</span>
                      {version.isCurrent && <span className="text-green-600 ml-2">(Current)</span>}
                    </div>
                    {!version.isCurrent && (
                      <button
                        onClick={() => handleRestoreVersion(version.versionNumber)}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                      >
                        Restore
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'preview':
        return (
          <div className="space-y-6">
            <PreviewPanel
              contentId={unifiedContent?._id}
              websiteId={servicePage?.websiteId}
            />
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading service page editor...</p>
        </div>
      </div>
    );
  }

  if (!servicePage) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Service Page Not Found</h2>
          <p className="mt-2 text-gray-600">The service page you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-gray-400 hover:text-gray-600"
              >
                ← Back
              </button>
              <h1 className="ml-4 text-xl font-semibold text-gray-900">
                Editing: {servicePage.title}
              </h1>
              {saving && (
                <span className="ml-2 text-sm text-gray-500">Saving...</span>
              )}
            </div>

            <div className="flex items-center space-x-4">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                servicePage.status === 'published'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {servicePage.status}
              </span>

              <button
                onClick={handleManualSave}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Save
              </button>

              <button
                onClick={handlePublish}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Publish
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="-mb-px flex space-x-8">
            {editorTabs.map(tab => {
              const getTabBadge = () => {
                if (tab.id === 'conflicts' && conflicts.length > 0) {
                  return (
                    <span className="ml-2 bg-red-100 text-red-800 text-xs font-medium px-2 py-0.5 rounded-full">
                      {conflicts.length}
                    </span>
                  );
                }
                if (tab.id === 'ai-assistant' && aiSuggestions.length > 0) {
                  return (
                    <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full">
                      {aiSuggestions.length}
                    </span>
                  );
                }
                return null;
              };

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                  {getTabBadge()}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderTabContent()}
      </div>

      {ToastContainer && <ToastContainer position="bottom-right" />}
    </div>
  );
};

export default ServicePageEditor;