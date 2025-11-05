import api from './api';

/**
 * Service Page API Service
 * Handles all API calls related to service page editing functionality
 */

export const servicePageService = {
  /**
   * Get all service pages for a website
   */
  async getServicePages(websiteId, options = {}) {
    const params = new URLSearchParams();

    if (options.status) params.append('status', options.status);
    if (options.includeAnalytics) params.append('includeAnalytics', 'true');

    const queryString = params.toString();
    const url = `/service-pages/website/${websiteId}${queryString ? `?${queryString}` : ''}`;

    const response = await api.get(url);
    return response.data;
  },

  /**
   * Get a specific service page by ID
   */
  async getServicePage(servicePageId, includeVersions = false) {
    const params = includeVersions ? '?includeVersions=true' : '';
    const response = await api.get(`/service-pages/${servicePageId}${params}`);
    return response.data;
  },

  /**
   * Get service page data formatted for editing
   */
  async getServicePageForEditing(servicePageId) {
    const response = await api.get(`/service-pages/${servicePageId}/edit`);
    return response.data;
  },

  /**
   * Update service page content (creates new version)
   */
  async updateServicePageContent(servicePageId, updateData) {
    const response = await api.put(`/service-pages/${servicePageId}/content`, updateData);
    return response.data;
  },

  /**
   * Get version history for a service page
   */
  async getVersionHistory(servicePageId) {
    const response = await api.get(`/service-pages/${servicePageId}/versions`);
    return response.data;
  },

  /**
   * Create a new version of a service page
   */
  async createVersion(servicePageId, changeLog) {
    const response = await api.post(`/service-pages/${servicePageId}/versions`, {
      changeLog
    });
    return response.data;
  },

  /**
   * Restore a specific version of a service page
   */
  async restoreVersion(servicePageId, versionNumber) {
    const response = await api.put(`/service-pages/${servicePageId}/restore/${versionNumber}`);
    return response.data;
  },

  /**
   * Publish a service page version
   */
  async publishVersion(servicePageId, data = {}) {
    const response = await api.post(`/service-pages/${servicePageId}/publish`, data);
    return response.data;
  },

  /**
   * Get editing capabilities for a service page
   */
  async getEditingCapabilities(servicePageId) {
    const response = await api.get(`/service-pages/${servicePageId}/capabilities`);
    return response.data;
  },

  /**
   * Update editing mode for a service page
   */
  async updateEditingMode(servicePageId, data) {
    const response = await api.put(`/service-pages/${servicePageId}/editing-mode`, data);
    return response.data;
  },

  /**
   * Preview service page content without saving
   */
  async previewServicePage(servicePageId, previewData) {
    const response = await api.post(`/service-pages/${servicePageId}/preview`, previewData);
    return response.data;
  },

  /**
   * Batch operations for multiple service pages
   */
  async batchUpdateStatus(servicePageIds, status) {
    const response = await api.post('/service-pages/batch/status', {
      servicePageIds,
      status
    });
    return response.data;
  },

  /**
   * Get service page analytics and performance data
   */
  async getServicePageAnalytics(servicePageId, dateRange = '30d') {
    const response = await api.get(`/service-pages/${servicePageId}/analytics?range=${dateRange}`);
    return response.data;
  },

  /**
   * Search service pages
   */
  async searchServicePages(websiteId, query, filters = {}) {
    const params = new URLSearchParams({
      q: query,
      ...filters
    });

    const response = await api.get(`/service-pages/website/${websiteId}/search?${params.toString()}`);
    return response.data;
  },

  /**
   * Get service page SEO analysis
   */
  async getServicePageSEO(servicePageId) {
    const response = await api.get(`/service-pages/${servicePageId}/seo-analysis`);
    return response.data;
  },

  /**
   * Generate service page content using AI
   */
  async generateContentWithAI(servicePageId, promptData) {
    const response = await api.post(`/service-pages/${servicePageId}/ai-generate`, promptData);
    return response.data;
  },

  /**
   * Export service page data
   */
  async exportServicePage(servicePageId, format = 'json') {
    const response = await api.get(`/service-pages/${servicePageId}/export?format=${format}`);
    return response.data;
  },

  /**
   * Import service page data
   */
  async importServicePage(websiteId, importData) {
    const response = await api.post(`/service-pages/website/${websiteId}/import`, importData);
    return response.data;
  },

  /**
   * Clone a service page
   */
  async cloneServicePage(servicePageId, targetWebsiteId, options = {}) {
    const response = await api.post(`/service-pages/${servicePageId}/clone`, {
      targetWebsiteId,
      ...options
    });
    return response.data;
  },

  /**
   * Get service page templates
   */
  async getServicePageTemplates(category = null) {
    const params = category ? `?category=${category}` : '';
    const response = await api.get(`/service-pages/templates${params}`);
    return response.data;
  },

  /**
   * Apply template to service page
   */
  async applyTemplate(servicePageId, templateId, options = {}) {
    const response = await api.post(`/service-pages/${servicePageId}/apply-template`, {
      templateId,
      ...options
    });
    return response.data;
  },

  /**
   * Get service page performance metrics
   */
  async getPerformanceMetrics(servicePageId, timeframe = '7d') {
    const response = await api.get(`/service-pages/${servicePageId}/performance?timeframe=${timeframe}`);
    return response.data;
  },

  /**
   * Update service page settings
   */
  async updateSettings(servicePageId, settings) {
    const response = await api.put(`/service-pages/${servicePageId}/settings`, settings);
    return response.data;
  },

  /**
   * Get service page comments/feedback
   */
  async getComments(servicePageId) {
    const response = await api.get(`/service-pages/${servicePageId}/comments`);
    return response.data;
  },

  /**
   * Add comment to service page
   */
  async addComment(servicePageId, comment) {
    const response = await api.post(`/service-pages/${servicePageId}/comments`, comment);
    return response.data;
  },

  /**
   * Schedule service page publication
   */
  async schedulePublication(servicePageId, publishDate) {
    const response = await api.post(`/service-pages/${servicePageId}/schedule`, {
      publishDate
    });
    return response.data;
  },

  /**
   * Get service page revision diff
   */
  async getRevisionDiff(servicePageId, version1, version2) {
    const response = await api.get(`/service-pages/${servicePageId}/diff/${version1}/${version2}`);
    return response.data;
  },

  /**
   * Update service page components (for drag-drop editor)
   */
  async updateServicePageComponents(servicePageId, updateData) {
    const response = await api.put(`/service-pages/${servicePageId}/components`, updateData);
    return response.data;
  },

  /**
   * Publish a service page
   */
  async publishServicePage(servicePageId) {
    const response = await api.post(`/service-pages/${servicePageId}/publish`);
    return response.data;
  },

  /**
   * Get unified editing data (service page + unified content + template info) atomically
   */
  async getUnifiedEditingData(servicePageId, options = {}) {
    const params = new URLSearchParams();

    if (options.includeTemplateInfo) params.append('includeTemplateInfo', 'true');

    const queryString = params.toString();
    const url = `/service-pages/${servicePageId}/unified-data${queryString ? `?${queryString}` : ''}`;

    const response = await api.get(url);
    return response.data;
  },

  /**
   * Save unified editing data atomically (service page + unified content)
   */
  async saveUnifiedEditingData(servicePageId, unifiedData) {
    const response = await api.put(`/service-pages/${servicePageId}/unified-data`, unifiedData);
    return response.data;
  },

  /**
   * Generate comprehensive dental content (11 sections) for a service page
   */
  async generateComprehensiveContent(servicePageId, settings = {}) {
    const response = await api.post(`/service-pages/${servicePageId}/comprehensive-content/generate`, settings);
    return response.data;
  },

  /**
   * Get comprehensive content for a service page
   */
  async getComprehensiveContent(servicePageId) {
    const response = await api.get(`/service-pages/${servicePageId}/comprehensive-content`);
    return response.data;
  },

  /**
   * Update specific section of comprehensive content
   */
  async updateComprehensiveContentSection(servicePageId, sectionName, updateData) {
    const response = await api.put(`/service-pages/${servicePageId}/comprehensive-content/${sectionName}`, updateData);
    return response.data;
  },

  /**
   * Get all available dental services
   */
  async getAllServices(options = {}) {
    const params = new URLSearchParams();

    if (options.category) params.append('category', options.category);
    if (options.search) params.append('search', options.search);
    if (options.isActive !== undefined) params.append('isActive', options.isActive);
    if (options.isPopular) params.append('isPopular', options.isPopular);
    if (options.page) params.append('page', options.page);
    if (options.limit) params.append('limit', options.limit);

    const queryString = params.toString();
    const url = `/services${queryString ? `?${queryString}` : ''}`;

    const response = await api.get(url);
    return response.data;
  },

  /**
   * Get service categories
   */
  async getServiceCategories() {
    const response = await api.get('/services/categories');
    return response.data;
  }
};