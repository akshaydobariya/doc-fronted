import React, { useState, useEffect } from 'react';
import { servicePageService } from '../../services/servicePageService';

// Conditionally import toastify
let toast;
try {
  const toastifyComponents = require('react-toastify');
  toast = toastifyComponents.toast;
} catch (error) {
  toast = {
    success: (msg) => console.log('Success:', msg),
    error: (msg) => console.error('Error:', msg),
    info: (msg) => console.info('Info:', msg)
  };
}

const ComprehensiveContentGenerator = ({ servicePageId, serviceName, onContentGenerated }) => {
  const [loading, setLoading] = useState(false);
  const [existingContent, setExistingContent] = useState(null);
  const [stats, setStats] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [availableServices, setAvailableServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [selectedService, setSelectedService] = useState(null);
  const [generationSettings, setGenerationSettings] = useState({
    forceRegenerate: false,
    provider: 'auto',
    customKeywords: [],
    customCategory: null
  });
  const [keywordInput, setKeywordInput] = useState('');

  // Define the 11 comprehensive sections
  const comprehensiveSections = [
    {
      key: 'introduction',
      title: 'Introduction',
      description: 'Simple patient-friendly introduction (100 words)',
      wordTarget: 100
    },
    {
      key: 'detailedExplanation',
      title: 'What Does It Entail',
      description: 'Detailed explanation in 5 bullet points (500 words)',
      wordTarget: 500
    },
    {
      key: 'treatmentNeed',
      title: 'Why You Need This Treatment',
      description: 'Reasons for treatment in 5 bullet points (500 words)',
      wordTarget: 500
    },
    {
      key: 'symptoms',
      title: 'Signs You May Need This Treatment',
      description: 'Symptoms requiring treatment in 5 bullet points (500 words)',
      wordTarget: 500
    },
    {
      key: 'consequences',
      title: 'What Happens If Treatment Is Delayed',
      description: 'Consequences of delayed treatment in 5 bullet points (500 words)',
      wordTarget: 500
    },
    {
      key: 'procedureDetails',
      title: 'Step-by-Step Procedure',
      description: 'Treatment procedure in 5 steps (500 words)',
      wordTarget: 500
    },
    {
      key: 'postTreatmentCare',
      title: 'Post-Treatment Care Instructions',
      description: 'Aftercare instructions in 5 bullet points (500 words)',
      wordTarget: 500
    },
    {
      key: 'detailedBenefits',
      title: 'Benefits of This Treatment',
      description: 'Treatment benefits in 5 bullet points (500 words)',
      wordTarget: 500
    },
    {
      key: 'sideEffects',
      title: 'Potential Side Effects',
      description: 'Side effects information in 5 bullet points (500 words)',
      wordTarget: 500
    },
    {
      key: 'mythsAndFacts',
      title: 'Common Myths and Facts',
      description: '5 myths and facts (500 words)',
      wordTarget: 500
    },
    {
      key: 'comprehensiveFAQ',
      title: 'Comprehensive FAQ',
      description: '25 questions with 100-word answers (2500 words)',
      wordTarget: 2500
    }
  ];

  const providers = [
    { value: 'auto', label: 'Auto (Best Available)', description: 'Automatically select the best available real AI provider' },
    { value: 'google-ai', label: 'Google AI (Gemini 2.0 Flash)', description: 'Google AI Studio with latest Gemini models - primary provider' },
    { value: 'deepseek', label: 'DeepSeek Chat', description: 'DeepSeek AI for professional content generation - secondary provider' }
  ];

  useEffect(() => {
    if (servicePageId) {
      loadExistingContent();
    }
    loadAvailableServices();
  }, [servicePageId]);

  const loadAvailableServices = async () => {
    try {
      setLoadingServices(true);

      // Load all available services
      const servicesResponse = await servicePageService.getAllServices({
        isActive: true,
        limit: 100 // Get all services
      });

      if (servicesResponse.success) {
        setAvailableServices(servicesResponse.data);

        // Find current service if serviceName is provided
        if (serviceName) {
          const currentService = servicesResponse.data.find(
            service => service.name.toLowerCase() === serviceName.toLowerCase()
          );
          if (currentService) {
            setSelectedService(currentService);
            setGenerationSettings(prev => ({
              ...prev,
              customCategory: currentService.category
            }));
          }
        }
      }

      // Load categories
      const categoriesResponse = await servicePageService.getServiceCategories();
      if (categoriesResponse.success) {
        setCategories(categoriesResponse.data);
      }
    } catch (error) {
      console.error('Error loading services:', error);
      toast.error('Failed to load available services');
    } finally {
      setLoadingServices(false);
    }
  };

  const loadExistingContent = async () => {
    try {
      const response = await servicePageService.getComprehensiveContent(servicePageId);
      if (response.success) {
        setExistingContent(response.data.content);
        setStats(response.data.stats);
      }
    } catch (error) {
      console.warn('No existing comprehensive content found:', error);
    }
  };

  const handleGenerateContent = async () => {
    try {
      setLoading(true);

      // Validate that a service is selected
      if (!selectedService && !serviceName) {
        toast.error('Please select a service to generate content for');
        return;
      }

      // Update generation settings with selected service data
      const finalSettings = {
        ...generationSettings,
        customKeywords: generationSettings.customKeywords.length > 0
          ? generationSettings.customKeywords
          : selectedService?.seo?.keywords || [],
        customCategory: generationSettings.customCategory || selectedService?.category,
        serviceName: selectedService?.name || serviceName
      };

      console.log('Generating content with settings:', finalSettings);

      const response = await servicePageService.generateComprehensiveContent(servicePageId, finalSettings);

      if (response.success) {
        toast.success('Comprehensive content generated successfully!');
        setExistingContent(response.data.content);
        setStats({
          totalSections: response.data.generation.totalSections,
          completedSections: response.data.generation.sectionsGenerated,
          totalWords: Object.values(response.data.content).reduce((sum, section) => {
            return sum + (section.wordCount || section.totalWordCount || 0);
          }, 0),
          totalQuestions: response.data.content.comprehensiveFAQ?.totalQuestions || 0,
          lastGenerated: new Date(),
          generatedBy: response.data.generation.provider
        });

        if (onContentGenerated) {
          onContentGenerated(response.data);
        }

        toast.info(`Generated ${response.data.generation.sectionsGenerated}/${response.data.generation.totalSections} sections using ${response.data.generation.tokensUsed} tokens`);
      }
    } catch (error) {
      console.error('Error generating comprehensive content:', error);
      toast.error('Failed to generate comprehensive content: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddKeyword = () => {
    if (keywordInput.trim() && !generationSettings.customKeywords.includes(keywordInput.trim())) {
      setGenerationSettings(prev => ({
        ...prev,
        customKeywords: [...prev.customKeywords, keywordInput.trim()]
      }));
      setKeywordInput('');
    }
  };

  const handleRemoveKeyword = (keyword) => {
    setGenerationSettings(prev => ({
      ...prev,
      customKeywords: prev.customKeywords.filter(k => k !== keyword)
    }));
  };

  const getSectionStatus = (sectionKey) => {
    if (!existingContent || !existingContent[sectionKey]) {
      return { status: 'missing', color: 'text-red-600', icon: '❌' };
    }

    const section = existingContent[sectionKey];
    const targetWords = comprehensiveSections.find(s => s.key === sectionKey)?.wordTarget || 100;
    const actualWords = section.wordCount || section.totalWordCount || 0;

    if (actualWords >= targetWords * 0.8) {
      return { status: 'complete', color: 'text-green-600', icon: '✅' };
    } else if (actualWords > 0) {
      return { status: 'partial', color: 'text-yellow-600', icon: '⚠️' };
    } else {
      return { status: 'missing', color: 'text-red-600', icon: '❌' };
    }
  };

  const renderContentOverview = () => {
    if (!stats) return null;

    return (
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Content Overview</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.completedSections}</div>
            <div className="text-sm text-gray-600">Sections</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.totalWords.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Words</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.totalQuestions}</div>
            <div className="text-sm text-gray-600">FAQ Questions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {stats.lastGenerated ? new Date(stats.lastGenerated).toLocaleDateString() : 'Never'}
            </div>
            <div className="text-sm text-gray-600">Last Generated</div>
          </div>
        </div>
      </div>
    );
  };

  const renderSectionStatus = () => {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-medium text-gray-900">Content Sections</h4>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            {showDetails ? 'Hide Details' : 'Show Details'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {comprehensiveSections.map(section => {
            const status = getSectionStatus(section.key);

            return (
              <div key={section.key} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                <div className="flex-1">
                  <div className="flex items-center">
                    <span className="mr-2">{status.icon}</span>
                    <span className="font-medium text-gray-900">{section.title}</span>
                  </div>
                  {showDetails && (
                    <div className="mt-1">
                      <div className="text-xs text-gray-600">{section.description}</div>
                      {existingContent && existingContent[section.key] && (
                        <div className="text-xs text-gray-500 mt-1">
                          {(existingContent[section.key].wordCount || existingContent[section.key].totalWordCount || 0)} words
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <span className={`text-sm font-medium ${status.color}`}>
                  {status.status}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Comprehensive Dental Content Generator</h3>
            <p className="text-gray-600 mt-1">
              Generate detailed, SEO-friendly content for {serviceName} with 11 comprehensive sections
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">AI-Powered Content Generation</div>
            <div className="text-lg font-semibold text-blue-600">
              {stats ? `${stats.completedSections}/11 Sections` : 'No Content'}
            </div>
          </div>
        </div>

        {renderContentOverview()}
        {renderSectionStatus()}

        {/* Service Selection */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Service Selection</h4>

          {loadingServices ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading available services...</span>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Dental Service
                </label>
                <select
                  value={selectedService?._id || ''}
                  onChange={(e) => {
                    const service = availableServices.find(s => s._id === e.target.value);
                    setSelectedService(service);
                    if (service) {
                      setGenerationSettings(prev => ({
                        ...prev,
                        customCategory: service.category
                      }));
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a service...</option>
                  {availableServices.map(service => (
                    <option key={service._id} value={service._id}>
                      {service.name} ({service.category.replace('-', ' ')})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Choose from {availableServices.length} available dental services
                </p>
              </div>

              {selectedService && (
                <div className="p-3 bg-white rounded-md border border-blue-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-900">{selectedService.name}</h5>
                      <p className="text-sm text-gray-600 mt-1">{selectedService.shortDescription}</p>
                      <div className="flex items-center mt-2 space-x-4">
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {selectedService.category.replace('-', ' ')}
                        </span>
                        {selectedService.isPopular && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                            Popular
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="text-sm text-blue-700 bg-blue-100 p-3 rounded-md">
                <strong>All Available Services ({availableServices.length}):</strong>
                <div className="mt-1 text-xs grid grid-cols-2 gap-1">
                  {availableServices.map((service, index) => (
                    <span key={service._id} className="block">
                      • {service.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Generation Settings */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Generation Settings</h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Provider Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">AI Provider</label>
              <select
                value={generationSettings.provider}
                onChange={(e) => setGenerationSettings(prev => ({...prev, provider: e.target.value}))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {providers.map(provider => (
                  <option key={provider.value} value={provider.value}>
                    {provider.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {providers.find(p => p.value === generationSettings.provider)?.description}
              </p>
            </div>

            {/* Category Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Dental Category</label>
              <select
                value={generationSettings.customCategory || ''}
                onChange={(e) => setGenerationSettings(prev => ({...prev, customCategory: e.target.value || null}))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Auto-detect from service</option>
                {categories.length > 0 ? (
                  categories.map(category => (
                    <option key={category.id || category} value={category.id || category}>
                      {category.icon ? `${category.icon} ${category.name}` : category.name || category}
                    </option>
                  ))
                ) : (
                  // Fallback to unique categories from available services
                  [...new Set(availableServices.map(s => s.category))].map(category => (
                    <option key={category} value={category}>
                      {category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </option>
                  ))
                )}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {selectedService ? `Current service: ${selectedService.category.replace('-', ' ')}` : 'No service selected'}
              </p>
            </div>
          </div>

          {/* Custom Keywords */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Custom Keywords (Optional)</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddKeyword()}
                placeholder="Add custom keywords for SEO optimization"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleAddKeyword}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Add
              </button>
            </div>
            {generationSettings.customKeywords.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {generationSettings.customKeywords.map(keyword => (
                  <span
                    key={keyword}
                    className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-md"
                  >
                    {keyword}
                    <button
                      onClick={() => handleRemoveKeyword(keyword)}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Force Regenerate Option */}
          <div className="mt-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={generationSettings.forceRegenerate}
                onChange={(e) => setGenerationSettings(prev => ({...prev, forceRegenerate: e.target.checked}))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">
                Force regenerate all content (overwrite existing sections)
              </span>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            {stats && stats.lastGenerated && (
              <span>Last generated: {new Date(stats.lastGenerated).toLocaleString()}</span>
            )}
            {stats && stats.generatedBy && (
              <span className="ml-4">Provider: {stats.generatedBy}</span>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={loadExistingContent}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              Refresh Status
            </button>

            <button
              onClick={handleGenerateContent}
              disabled={loading}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                loading
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating...
                </div>
              ) : (
                `Generate Comprehensive Content`
              )}
            </button>
          </div>
        </div>

        {loading && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center text-blue-800">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
              <div>
                <div className="font-medium">Generating comprehensive content...</div>
                <div className="text-sm">This may take 1-2 minutes to generate all 11 sections</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComprehensiveContentGenerator;