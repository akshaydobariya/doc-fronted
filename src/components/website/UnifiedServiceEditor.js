import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

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
    info: (msg) => console.info('Info:', msg),
    warning: (msg) => console.warn('Warning:', msg)
  };
  ToastContainer = () => null;
}

/**
 * Unified Service Editor
 *
 * This component provides a comprehensive editing interface that seamlessly
 * integrates AI-generated content with visual editing capabilities through
 * the unified content system.
 */
const UnifiedServiceEditor = () => {
  const { servicePageId } = useParams();
  const navigate = useNavigate();

  // Core state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [unifiedContent, setUnifiedContent] = useState(null);
  const [editingMode, setEditingMode] = useState('hybrid');
  const [activeTab, setActiveTab] = useState('visual');

  // AI suggestions state
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [pendingSuggestionsCount, setPendingSuggestionsCount] = useState(0);

  // Conflict resolution state
  const [conflicts, setConflicts] = useState([]);
  const [showConflictResolver, setShowConflictResolver] = useState(false);

  // Version control state
  const [versions, setVersions] = useState([]);
  const [showVersionHistory, setShowVersionHistory] = useState(false);

  // Visual editor state
  const [destackLoaded, setDestackLoaded] = useState(false);
  const [destackInstance, setDestackInstance] = useState(null);

  // Refs
  const autoSaveTimeoutRef = useRef(null);
  const destackContainerRef = useRef(null);

  // Editor tabs configuration
  const editorTabs = [
    { id: 'visual', label: 'Visual Editor', icon: '🎨' },
    { id: 'content', label: 'Content Manager', icon: '📝' },
    { id: 'ai', label: 'AI Assistant', icon: '🤖' },
    { id: 'preview', label: 'Preview', icon: '👁️' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ];

  // Load unified content on component mount
  useEffect(() => {
    if (servicePageId) {
      loadUnifiedContent();
    }
  }, [servicePageId]);

  // Load Destack when visual tab is active
  useEffect(() => {
    if (activeTab === 'visual' && !destackLoaded && unifiedContent) {
      loadDestackEditor();
    }
  }, [activeTab, destackLoaded, unifiedContent]);

  // Auto-check for conflicts and suggestions
  useEffect(() => {
    if (unifiedContent) {
      checkForConflicts();
      loadAISuggestions();
    }
  }, [unifiedContent]);

  /**
   * Load unified content for the service page
   */
  const loadUnifiedContent = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/unified-content/${servicePageId}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to load unified content');
      }

      const result = await response.json();
      if (result.success) {
        setUnifiedContent(result.data);
        setEditingMode(result.data.editingContext?.mode || 'hybrid');
        setPendingSuggestionsCount(result.data.aiInteraction?.pendingSuggestions || 0);
      }
    } catch (error) {
      console.error('Error loading unified content:', error);
      toast.error('Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Load Destack visual editor
   */
  const loadDestackEditor = async () => {
    try {
      if (!window.Destack) {
        // Dynamically load Destack if not already loaded
        await loadDestackScript();
      }

      // Export content to Destack format
      const response = await fetch(`/api/unified-content/${servicePageId}/export/destack`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to export to Destack format');
      }

      const destackData = await response.json();

      // Initialize Destack editor
      const destack = new window.Destack({
        container: destackContainerRef.current,
        data: destackData.data,
        config: {
          serverUrl: '/api/builder',
          themes: ['hyperui', 'ai-sections'], // Include AI sections theme
          onSave: handleDestackSave,
          onContentChange: handleDestackChange
        }
      });

      setDestackInstance(destack);
      setDestackLoaded(true);

      toast.success('Visual editor loaded successfully');
    } catch (error) {
      console.error('Error loading Destack editor:', error);
      toast.error('Failed to load visual editor');
    }
  };

  /**
   * Dynamically load Destack script
   */
  const loadDestackScript = () => {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/@destack/react@latest/dist/destack.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  };

  /**
   * Handle Destack save events
   */
  const handleDestackSave = async (data) => {
    try {
      setSaving(true);

      // Import Destack data to unified content
      const response = await fetch(`/api/unified-content/${servicePageId}/import/destack`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ destackData: data })
      });

      if (!response.ok) {
        throw new Error('Failed to save visual changes');
      }

      const result = await response.json();
      if (result.success) {
        setUnifiedContent(result.data);
        toast.success('Visual changes saved successfully');
      }
    } catch (error) {
      console.error('Error saving Destack content:', error);
      toast.error('Failed to save visual changes');
    } finally {
      setSaving(false);
    }
  };

  /**
   * Handle Destack content changes (for auto-save)
   */
  const handleDestackChange = useCallback((data) => {
    // Clear existing timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    // Set new auto-save timeout
    autoSaveTimeoutRef.current = setTimeout(() => {
      handleDestackSave(data);
    }, 3000); // Auto-save after 3 seconds of inactivity
  }, []);

  /**
   * Update structured content (from content manager or AI)
   */
  const updateStructuredContent = async (content, sections = null) => {
    try {
      setSaving(true);

      const response = await fetch(`/api/unified-content/${servicePageId}/content`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          structuredContent: content,
          sections
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update content');
      }

      const result = await response.json();
      if (result.success) {
        setUnifiedContent(result.data);

        // Reload Destack if it's active
        if (destackInstance && activeTab === 'visual') {
          const destackData = await exportToDestack();
          destackInstance.setData(destackData);
        }

        toast.success('Content updated successfully');
      }
    } catch (error) {
      console.error('Error updating structured content:', error);
      toast.error('Failed to update content');
    } finally {
      setSaving(false);
    }
  };

  /**
   * Sync with AI-generated content
   */
  const syncWithAI = async (generatedContent, options = {}) => {
    try {
      setSaving(true);

      const response = await fetch(`/api/unified-content/${servicePageId}/sync-ai`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          generatedContent,
          options
        })
      });

      if (!response.ok) {
        throw new Error('Failed to sync with AI');
      }

      const result = await response.json();
      if (result.success) {
        setUnifiedContent(result.data);
        setPendingSuggestionsCount(result.suggestions || 0);

        if (result.suggestions > 0) {
          setShowSuggestions(true);
          toast.info(`${result.suggestions} AI suggestions ready for review`);
        } else {
          toast.success('AI content synced successfully');
        }
      }
    } catch (error) {
      console.error('Error syncing with AI:', error);
      toast.error('Failed to sync with AI');
    } finally {
      setSaving(false);
    }
  };

  /**
   * Load AI suggestions
   */
  const loadAISuggestions = async () => {
    try {
      const response = await fetch(`/api/unified-content/${servicePageId}/suggestions`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to load AI suggestions');
      }

      const result = await response.json();
      if (result.success) {
        setAiSuggestions(result.suggestions);
        setPendingSuggestionsCount(result.count);
      }
    } catch (error) {
      console.error('Error loading AI suggestions:', error);
    }
  };

  /**
   * Handle AI suggestion (accept/reject)
   */
  const handleAISuggestion = async (suggestionId, componentId, action) => {
    try {
      const response = await fetch(`/api/unified-content/${servicePageId}/suggestions/handle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          suggestionId,
          componentId,
          action
        })
      });

      if (!response.ok) {
        throw new Error('Failed to handle AI suggestion');
      }

      const result = await response.json();
      if (result.success) {
        setUnifiedContent(result.data);

        // Remove suggestion from list
        setAiSuggestions(prev =>
          prev.filter(s => s.suggestionId !== suggestionId)
        );
        setPendingSuggestionsCount(prev => Math.max(0, prev - 1));

        // Reload visual editor if active
        if (destackInstance && activeTab === 'visual' && action === 'accepted') {
          const destackData = await exportToDestack();
          destackInstance.setData(destackData);
        }

        toast.success(`AI suggestion ${action} successfully`);
      }
    } catch (error) {
      console.error('Error handling AI suggestion:', error);
      toast.error('Failed to handle AI suggestion');
    }
  };

  /**
   * Check for conflicts between content and visual changes
   */
  const checkForConflicts = async () => {
    try {
      const response = await fetch(`/api/unified-content/${servicePageId}/conflicts`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to check for conflicts');
      }

      const result = await response.json();
      if (result.success) {
        setConflicts(result.conflicts);

        if (result.conflicts.length > 0) {
          toast.warning(`${result.conflicts.length} content conflicts detected`);
        }
      }
    } catch (error) {
      console.error('Error checking for conflicts:', error);
    }
  };

  /**
   * Resolve conflicts
   */
  const resolveConflicts = async (resolutions) => {
    try {
      const response = await fetch(`/api/unified-content/${servicePageId}/conflicts/resolve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ resolutions })
      });

      if (!response.ok) {
        throw new Error('Failed to resolve conflicts');
      }

      const result = await response.json();
      if (result.success) {
        setUnifiedContent(result.data);
        setConflicts([]);
        setShowConflictResolver(false);
        toast.success('Conflicts resolved successfully');
      }
    } catch (error) {
      console.error('Error resolving conflicts:', error);
      toast.error('Failed to resolve conflicts');
    }
  };

  /**
   * Export content to Destack format
   */
  const exportToDestack = async () => {
    try {
      const response = await fetch(`/api/unified-content/${servicePageId}/export/destack`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to export to Destack format');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error exporting to Destack:', error);
      return {};
    }
  };

  /**
   * Load version history
   */
  const loadVersionHistory = async () => {
    try {
      const response = await fetch(`/api/unified-content/${servicePageId}/versions`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to load version history');
      }

      const result = await response.json();
      if (result.success) {
        setVersions(result.history);
      }
    } catch (error) {
      console.error('Error loading version history:', error);
      toast.error('Failed to load version history');
    }
  };

  /**
   * Restore version
   */
  const restoreVersion = async (version) => {
    try {
      const response = await fetch(`/api/unified-content/${servicePageId}/versions/restore`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ version })
      });

      if (!response.ok) {
        throw new Error('Failed to restore version');
      }

      const result = await response.json();
      if (result.success) {
        setUnifiedContent(result.data);
        setShowVersionHistory(false);

        // Reload visual editor
        if (destackInstance && activeTab === 'visual') {
          const destackData = await exportToDestack();
          destackInstance.setData(destackData);
        }

        toast.success(`Version ${version} restored successfully`);
      }
    } catch (error) {
      console.error('Error restoring version:', error);
      toast.error('Failed to restore version');
    }
  };

  /**
   * Render the appropriate tab content
   */
  const renderTabContent = () => {
    switch (activeTab) {
      case 'visual':
        return (
          <div className="h-full">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Visual Editor</h3>
              <div className="flex items-center space-x-4">
                {pendingSuggestionsCount > 0 && (
                  <button
                    onClick={() => setShowSuggestions(true)}
                    className="inline-flex items-center px-3 py-2 border border-orange-300 shadow-sm text-sm leading-4 font-medium rounded-md text-orange-700 bg-orange-50 hover:bg-orange-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                  >
                    <span className="mr-2">{pendingSuggestionsCount}</span>
                    AI Suggestions
                  </button>
                )}
                {conflicts.length > 0 && (
                  <button
                    onClick={() => setShowConflictResolver(true)}
                    className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <span className="mr-2">{conflicts.length}</span>
                    Conflicts
                  </button>
                )}
                {saving && (
                  <span className="text-sm text-gray-500">Saving...</span>
                )}
              </div>
            </div>
            <div
              ref={destackContainerRef}
              className="w-full h-96 border border-gray-300 rounded-lg bg-white"
              style={{ minHeight: '600px' }}
            >
              {!destackLoaded && (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading visual editor...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'content':
        return (
          <ContentManager
            unifiedContent={unifiedContent}
            onContentUpdate={updateStructuredContent}
            saving={saving}
          />
        );

      case 'ai':
        return (
          <AIAssistant
            unifiedContent={unifiedContent}
            onSyncWithAI={syncWithAI}
            onGenerateContent={() => {/* Implement AI generation */}}
            saving={saving}
          />
        );

      case 'preview':
        return (
          <PreviewPanel
            unifiedContent={unifiedContent}
          />
        );

      case 'settings':
        return (
          <SettingsPanel
            unifiedContent={unifiedContent}
            onSettingsUpdate={(settings) => {/* Implement settings update */}}
            onLoadVersionHistory={loadVersionHistory}
            onShowVersionHistory={() => setShowVersionHistory(true)}
          />
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
          <p className="mt-4 text-gray-600">Loading unified service editor...</p>
        </div>
      </div>
    );
  }

  if (!unifiedContent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Content Not Found</h2>
          <p className="mt-2 text-gray-600">The service page content could not be loaded.</p>
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
                Unified Service Editor
              </h1>
              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {editingMode}
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                unifiedContent.syncHealth === 'healthy'
                  ? 'bg-green-100 text-green-800'
                  : unifiedContent.syncHealth === 'conflicts'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {unifiedContent.syncHealth}
              </span>

              <button
                onClick={() => setShowVersionHistory(true)}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Versions
              </button>

              <button
                onClick={() => {/* Implement publish */}}
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
            {editorTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
                {tab.id === 'ai' && pendingSuggestionsCount > 0 && (
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                    {pendingSuggestionsCount}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderTabContent()}
      </div>

      {/* AI Suggestions Modal */}
      {showSuggestions && (
        <AISuggestionsModal
          suggestions={aiSuggestions}
          onClose={() => setShowSuggestions(false)}
          onHandleSuggestion={handleAISuggestion}
        />
      )}

      {/* Conflict Resolver Modal */}
      {showConflictResolver && (
        <ConflictResolverModal
          conflicts={conflicts}
          onClose={() => setShowConflictResolver(false)}
          onResolveConflicts={resolveConflicts}
        />
      )}

      {/* Version History Modal */}
      {showVersionHistory && (
        <VersionHistoryModal
          versions={versions}
          currentVersion={unifiedContent.version?.current}
          onClose={() => setShowVersionHistory(false)}
          onRestoreVersion={restoreVersion}
        />
      )}

      {ToastContainer && <ToastContainer position="bottom-right" />}
    </div>
  );
};

// Placeholder components for the different panels
const ContentManager = ({ unifiedContent, onContentUpdate, saving }) => (
  <div className="space-y-6">
    <h3 className="text-lg font-medium text-gray-900">Content Manager</h3>
    <div className="bg-gray-50 p-4 rounded-lg">
      <p className="text-gray-600">Structured content editing interface will be implemented here</p>
      {saving && <p className="text-sm text-blue-600 mt-2">Saving changes...</p>}
    </div>
  </div>
);

const AIAssistant = ({ unifiedContent, onSyncWithAI, onGenerateContent, saving }) => (
  <div className="space-y-6">
    <h3 className="text-lg font-medium text-gray-900">AI Assistant</h3>
    <div className="bg-gray-50 p-4 rounded-lg">
      <p className="text-gray-600">AI content generation and suggestion interface will be implemented here</p>
      {saving && <p className="text-sm text-blue-600 mt-2">Processing AI request...</p>}
    </div>
  </div>
);

const PreviewPanel = ({ unifiedContent }) => (
  <div className="space-y-6">
    <h3 className="text-lg font-medium text-gray-900">Preview</h3>
    <div className="bg-gray-50 p-4 rounded-lg">
      <p className="text-gray-600">Live preview of the service page will be implemented here</p>
    </div>
  </div>
);

const SettingsPanel = ({ unifiedContent, onSettingsUpdate, onLoadVersionHistory, onShowVersionHistory }) => (
  <div className="space-y-6">
    <h3 className="text-lg font-medium text-gray-900">Settings</h3>
    <div className="bg-gray-50 p-4 rounded-lg">
      <p className="text-gray-600">Page settings and configuration options will be implemented here</p>
      <button
        onClick={onShowVersionHistory}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        View Version History
      </button>
    </div>
  </div>
);

// Placeholder modals
const AISuggestionsModal = ({ suggestions, onClose, onHandleSuggestion }) => (
  <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
      <h3 className="text-lg font-medium mb-4">AI Suggestions</h3>
      <div className="space-y-2">
        {suggestions.map((suggestion, index) => (
          <div key={suggestion.suggestionId} className="border p-3 rounded">
            <p className="text-sm text-gray-600">{suggestion.description}</p>
            <div className="mt-2 flex space-x-2">
              <button
                onClick={() => onHandleSuggestion(suggestion.suggestionId, suggestion.componentId, 'accepted')}
                className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
              >
                Accept
              </button>
              <button
                onClick={() => onHandleSuggestion(suggestion.suggestionId, suggestion.componentId, 'rejected')}
                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
      <button onClick={onClose} className="mt-4 px-4 py-2 bg-gray-300 text-gray-700 rounded">
        Close
      </button>
    </div>
  </div>
);

const ConflictResolverModal = ({ conflicts, onClose, onResolveConflicts }) => (
  <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
      <h3 className="text-lg font-medium mb-4">Resolve Conflicts</h3>
      <p className="text-gray-600">Conflict resolution interface will be implemented here</p>
      <button onClick={onClose} className="mt-4 px-4 py-2 bg-gray-300 text-gray-700 rounded">
        Close
      </button>
    </div>
  </div>
);

const VersionHistoryModal = ({ versions, currentVersion, onClose, onRestoreVersion }) => (
  <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
      <h3 className="text-lg font-medium mb-4">Version History</h3>
      <div className="space-y-2">
        {versions.map((version, index) => (
          <div key={version.version} className="border p-3 rounded">
            <div className="flex justify-between items-center">
              <span className="font-medium">Version {version.version}</span>
              {version.version === currentVersion && (
                <span className="text-green-600 text-sm">(Current)</span>
              )}
            </div>
            <p className="text-sm text-gray-600">{version.changes}</p>
            {version.version !== currentVersion && (
              <button
                onClick={() => onRestoreVersion(version.version)}
                className="mt-2 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              >
                Restore
              </button>
            )}
          </div>
        ))}
      </div>
      <button onClick={onClose} className="mt-4 px-4 py-2 bg-gray-300 text-gray-700 rounded">
        Close
      </button>
    </div>
  </div>
);

export default UnifiedServiceEditor;