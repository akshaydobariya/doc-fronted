import api from './api';

/**
 * Service API Client
 * Handles all dental service and service page related API calls
 */
class ServiceService {

  // ========== Dental Services ==========

  /**
   * Get all dental services
   * @param {Object} params - Query parameters
   * @returns {Promise} API response
   */
  async getServices(params = {}) {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await api.get(`/services?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Get services error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Alias for getServices - Get all dental services
   * @param {Object} params - Query parameters
   * @returns {Promise} API response
   */
  async getAllServices(params = {}) {
    return this.getServices(params);
  }

  /**
   * Search services
   * @param {string} searchTerm - Search query
   * @param {Array} categories - Categories to filter by
   * @param {number} limit - Result limit
   * @returns {Promise} API response
   */
  async searchServices(searchTerm, categories = null, limit = 20) {
    try {
      const params = new URLSearchParams({
        q: searchTerm,
        limit: limit.toString()
      });

      if (categories && categories.length > 0) {
        params.append('categories', categories.join(','));
      }

      const response = await api.get(`/services/search?${params}`);
      return response.data;
    } catch (error) {
      console.error('Search services error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get services by category
   * @param {string} category - Service category
   * @param {boolean} activeOnly - Only active services
   * @returns {Promise} API response
   */
  async getServicesByCategory(category, activeOnly = true) {
    try {
      const params = new URLSearchParams({ activeOnly: activeOnly.toString() });
      const response = await api.get(`/services/category/${category}?${params}`);
      return response.data;
    } catch (error) {
      console.error('Get services by category error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get all service categories
   * @returns {Promise} API response
   */
  async getCategories() {
    try {
      const response = await api.get('/services/categories');
      return response.data;
    } catch (error) {
      console.error('Get categories error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get popular services
   * @param {number} limit - Number of services to return
   * @returns {Promise} API response
   */
  async getPopularServices(limit = 6) {
    try {
      const response = await api.get(`/services/popular?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Get popular services error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get single service by ID or slug
   * @param {string} identifier - Service ID or slug
   * @returns {Promise} API response
   */
  async getService(identifier) {
    try {
      const response = await api.get(`/services/${identifier}`);
      return response.data;
    } catch (error) {
      console.error('Get service error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Create new service (doctor only)
   * @param {Object} serviceData - Service data
   * @returns {Promise} API response
   */
  async createService(serviceData) {
    try {
      const response = await api.post('/services', serviceData);

      // Trigger header update when service is created
      if (response.data && response.data.service) {
        console.log('🆕 Service created successfully, triggering header update...');

        // Dispatch custom event for header components
        window.dispatchEvent(new CustomEvent('serviceCreated', {
          detail: response.data.service
        }));

        // Also call global function if available
        if (window.onServiceCreated) {
          window.onServiceCreated(response.data.service);
        }
      }

      return response.data;
    } catch (error) {
      console.error('Create service error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Update service (doctor only)
   * @param {string} serviceId - Service ID
   * @param {Object} updateData - Update data
   * @returns {Promise} API response
   */
  async updateService(serviceId, updateData) {
    try {
      const response = await api.put(`/services/${serviceId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Update service error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Delete service (doctor only)
   * @param {string} serviceId - Service ID
   * @param {boolean} permanent - Permanent deletion
   * @returns {Promise} API response
   */
  async deleteService(serviceId, permanent = false) {
    try {
      const params = permanent ? '?permanent=true' : '';
      const response = await api.delete(`/services/${serviceId}${params}`);
      return response.data;
    } catch (error) {
      console.error('Delete service error:', error);
      throw this.handleError(error);
    }
  }

  // ========== Service Categories ==========

  /**
   * Get all service categories
   * @returns {Promise} API response
   */
  async getServiceCategories() {
    try {
      const response = await api.get('/services/categories');
      return response.data;
    } catch (error) {
      console.error('Get service categories error:', error);
      throw this.handleError(error);
    }
  }

  // ========== Content Generation ==========

  /**
   * Generate content for a service
   * @param {string} serviceId - Service ID
   * @param {Object} options - Generation options
   * @returns {Promise} API response
   */
  async generateServiceContent(serviceId, options = {}) {
    try {
      const {
        contentType = 'full-page',
        provider = 'auto',
        temperature = 0.7,
        keywords = [],
        customPrompt = null
      } = options;

      const response = await api.post(`/services/${serviceId}/generate-content`, {
        contentType,
        provider,
        temperature,
        keywords,
        customPrompt
      });
      return response.data;
    } catch (error) {
      console.error('Generate service content error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Generate content for a service using service data (for default services)
   * @param {Object} serviceData - Service information
   * @returns {Promise} API response
   */
  async generateContentFromServiceData(serviceData) {
    try {
      const response = await api.post('/services/generate-content-from-data', serviceData);

      // Trigger header update when service content is generated (usually creates service page)
      if (response.data && (response.data.servicePage || response.data.success)) {
        console.log('🆕 Service content generated successfully, triggering header update...');

        // Dispatch custom event for header components
        window.dispatchEvent(new CustomEvent('serviceCreated', {
          detail: response.data.servicePage || response.data
        }));

        // Also call global function if available
        if (window.onServiceCreated) {
          window.onServiceCreated(response.data.servicePage || response.data);
        }
      }

      return response.data;
    } catch (error) {
      console.error('Generate content from service data error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get LLM provider status
   * @returns {Promise} API response
   */
  async getLLMStatus() {
    try {
      const response = await api.get('/services/llm/status');
      return response.data;
    } catch (error) {
      console.error('Get LLM status error:', error);
      throw this.handleError(error);
    }
  }

  // ========== Service Pages ==========

  /**
   * Get service pages for a website
   * @param {string} websiteId - Website ID
   * @param {Object} params - Query parameters
   * @returns {Promise} API response
   */
  async getServicePages(websiteId, params = {}) {
    try {
      const queryParams = new URLSearchParams({
        websiteId,
        ...params
      });
      const response = await api.get(`/services/pages?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Get service pages error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get specific service page
   * @param {string|Object} pageIdOrParams - Service page ID or query parameters object
   * @returns {Promise} API response
   */
  async getServicePage(pageIdOrParams) {
    try {
      if (typeof pageIdOrParams === 'string') {
        // Get by ID
        const response = await api.get(`/services/pages/${pageIdOrParams}`);
        return response.data;
      } else {
        // Get by query parameters
        const queryParams = new URLSearchParams(pageIdOrParams);
        const response = await api.get(`/services/pages?${queryParams}`);

        // Return the first matching page
        if (response.data.success && response.data.data.length > 0) {
          return {
            success: true,
            data: response.data.data[0]
          };
        }

        throw new Error('Service page not found');
      }
    } catch (error) {
      console.error('Get service page error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Create or update service page
   * @param {Object} pageData - Service page data
   * @returns {Promise} API response
   */
  async createServicePage(pageData) {
    try {
      const response = await api.post('/services/pages', pageData);

      // Trigger header update when service page is created
      if (response.data && response.data.servicePage) {
        console.log('🆕 Service page created successfully, triggering header update...');

        // Dispatch custom event for header components
        window.dispatchEvent(new CustomEvent('serviceCreated', {
          detail: response.data.servicePage
        }));

        // Also call global function if available
        if (window.onServiceCreated) {
          window.onServiceCreated(response.data.servicePage);
        }
      }

      return response.data;
    } catch (error) {
      console.error('Create service page error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Update service page
   * @param {string} pageId - Service page ID
   * @param {Object} updateData - Update data
   * @param {string} method - HTTP method ('PUT' for full update, 'PATCH' for partial update)
   * @returns {Promise} API response
   */
  async updateServicePage(pageId, updateData, method = 'PUT') {
    try {
      const response = method === 'PATCH'
        ? await api.patch(`/services/pages/${pageId}`, updateData)
        : await api.put(`/services/pages/${pageId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Update service page error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Delete service page
   * @param {string} pageId - Service page ID
   * @returns {Promise} API response
   */
  async deleteServicePage(pageId) {
    try {
      const response = await api.delete(`/services/pages/${pageId}`);
      return response.data;
    } catch (error) {
      console.error('Delete service page error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Publish service page
   * @param {string} pageId - Service page ID
   * @returns {Promise} API response
   */
  async publishServicePage(pageId) {
    try {
      const response = await api.patch(`/services/pages/${pageId}/status`, {
        status: 'published'
      });
      return response.data;
    } catch (error) {
      console.error('Publish service page error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Unpublish service page
   * @param {string} pageId - Service page ID
   * @returns {Promise} API response
   */
  async unpublishServicePage(pageId) {
    try {
      const response = await api.patch(`/services/pages/${pageId}/status`, {
        status: 'draft'
      });
      return response.data;
    } catch (error) {
      console.error('Unpublish service page error:', error);
      throw this.handleError(error);
    }
  }

  // ========== Content Templates ==========

  /**
   * Get content templates
   * @param {Object} params - Query parameters
   * @returns {Promise} API response
   */
  async getContentTemplates(params = {}) {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await api.get(`/services/templates?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Get content templates error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Create content template
   * @param {Object} templateData - Template data
   * @returns {Promise} API response
   */
  async createContentTemplate(templateData) {
    try {
      const response = await api.post('/services/templates', templateData);
      return response.data;
    } catch (error) {
      console.error('Create content template error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Update content template
   * @param {string} templateId - Template ID
   * @param {Object} updateData - Update data
   * @returns {Promise} API response
   */
  async updateContentTemplate(templateId, updateData) {
    try {
      const response = await api.put(`/services/templates/${templateId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Update content template error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Delete content template
   * @param {string} templateId - Template ID
   * @returns {Promise} API response
   */
  async deleteContentTemplate(templateId) {
    try {
      const response = await api.delete(`/services/templates/${templateId}`);
      return response.data;
    } catch (error) {
      console.error('Delete content template error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Use content template
   * @param {string} templateId - Template ID
   * @param {Object} variables - Template variables
   * @returns {Promise} API response
   */
  async useContentTemplate(templateId, variables = {}) {
    try {
      const response = await api.post(`/services/templates/${templateId}/use`, {
        variables
      });
      return response.data;
    } catch (error) {
      console.error('Use content template error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Rate content template
   * @param {string} templateId - Template ID
   * @param {number} rating - Rating (1-5)
   * @returns {Promise} API response
   */
  async rateContentTemplate(templateId, rating) {
    try {
      const response = await api.post(`/services/templates/${templateId}/rate`, {
        rating
      });
      return response.data;
    } catch (error) {
      console.error('Rate content template error:', error);
      throw this.handleError(error);
    }
  }

  // ========== Utility Methods ==========

  /**
   * Handle API errors
   * @param {Error} error - Error object
   * @returns {Error} Formatted error
   */
  handleError(error) {
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.message || 'An error occurred';
      const statusCode = error.response.status;
      const details = error.response.data?.details || null;

      const formattedError = new Error(message);
      formattedError.statusCode = statusCode;
      formattedError.details = details;

      return formattedError;
    } else if (error.request) {
      // Request was made but no response received
      return new Error('No response from server. Please check your connection.');
    } else {
      // Something else happened
      return new Error(error.message || 'Unknown error occurred');
    }
  }

  /**
   * Generate service page URL
   * @param {Object} website - Website object
   * @param {string} serviceSlug - Service slug
   * @returns {string} Service page URL
   */
  generateServicePageUrl(website, serviceSlug) {
    const baseUrl = this.getWebsiteBaseUrl(website);
    return `${baseUrl}/services/${serviceSlug}`;
  }

  /**
   * Get website base URL
   * @param {Object} website - Website object
   * @returns {string} Base URL
   */
  getWebsiteBaseUrl(website) {
    if (website.customDomain) {
      return `https://${website.customDomain}`;
    }

    if (website.deployment?.url) {
      return website.deployment.url;
    }

    // For development/local testing
    if (process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost') {
      return `http://localhost:5000/api/websites/public/${website.subdomain}`;
    }

    // Fallback to expected production URL
    return `https://${website.subdomain}.docwebsite.app`;
  }

  /**
   * Validate service data
   * @param {Object} serviceData - Service data to validate
   * @returns {Object} Validation result
   */
  validateServiceData(serviceData) {
    const errors = [];

    if (!serviceData.name || serviceData.name.trim().length === 0) {
      errors.push('Service name is required');
    }

    if (!serviceData.category) {
      errors.push('Service category is required');
    }

    if (!serviceData.shortDescription || serviceData.shortDescription.trim().length === 0) {
      errors.push('Service description is required');
    }

    if (serviceData.shortDescription && serviceData.shortDescription.length > 200) {
      errors.push('Service description must be 200 characters or less');
    }

    if (serviceData.pricing?.basePrice && serviceData.pricing.basePrice < 0) {
      errors.push('Price cannot be negative');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate service page data
   * @param {Object} pageData - Service page data to validate
   * @returns {Object} Validation result
   */
  validateServicePageData(pageData) {
    const errors = [];

    if (!pageData.websiteId) {
      errors.push('Website ID is required');
    }

    if (!pageData.serviceId) {
      errors.push('Service ID is required');
    }

    if (!pageData.title || pageData.title.trim().length === 0) {
      errors.push('Page title is required');
    }

    if (pageData.seo?.metaTitle && pageData.seo.metaTitle.length > 60) {
      errors.push('Meta title should be 60 characters or less');
    }

    if (pageData.seo?.metaDescription && pageData.seo.metaDescription.length > 160) {
      errors.push('Meta description should be 160 characters or less');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Format service for display
   * @param {Object} service - Service object
   * @returns {Object} Formatted service
   */
  formatServiceForDisplay(service) {
    return {
      ...service,
      categoryDisplayName: service.categoryDisplayName || this.getCategoryDisplayName(service.category),
      priceDisplay: service.priceDisplay || this.formatPriceDisplay(service.pricing),
      urlPath: service.urlPath || `/services/${service.slug}`
    };
  }

  /**
   * Get category display name
   * @param {string} categoryKey - Category key
   * @returns {string} Display name
   */
  getCategoryDisplayName(categoryKey) {
    const categoryMap = {
      'general-dentistry': 'General Dentistry',
      'cosmetic-dentistry': 'Cosmetic Dentistry',
      'orthodontics': 'Orthodontics',
      'oral-surgery': 'Oral Surgery',
      'pediatric-dentistry': 'Pediatric Dentistry',
      'emergency-dentistry': 'Emergency Dentistry',
      'periodontics': 'Periodontics',
      'endodontics': 'Endodontics',
      'prosthodontics': 'Prosthodontics',
      'oral-pathology': 'Oral Pathology'
    };
    return categoryMap[categoryKey] || categoryKey;
  }

  /**
   * Format price for display
   * @param {Object} pricing - Pricing object
   * @returns {string} Formatted price
   */
  formatPriceDisplay(pricing) {
    if (!pricing) return 'Contact for pricing';

    if (pricing.hasFixedPrice && pricing.basePrice) {
      return `$${pricing.basePrice}`;
    }

    if (pricing.priceRange) {
      if (pricing.priceRange.min && pricing.priceRange.max) {
        return `$${pricing.priceRange.min} - $${pricing.priceRange.max}`;
      }
      if (pricing.priceRange.min) {
        return `Starting at $${pricing.priceRange.min}`;
      }
    }

    return 'Contact for pricing';
  }

  // ========== Enhanced Service Methods ==========

  /**
   * Get service by slug
   * @param {string} slug - Service slug
   * @returns {Promise} API response
   */
  async getServiceBySlug(slug) {
    try {
      const response = await api.get(`/services/slug/${slug}`);
      return response.data;
    } catch (error) {
      console.error('Get service by slug error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Track service page view
   * @param {string} serviceId - Service ID
   * @returns {Promise} API response
   */
  async trackServiceView(serviceId) {
    try {
      const response = await api.post(`/services/${serviceId}/view`);
      return response.data;
    } catch (error) {
      console.error('Track service view error:', error);
      // Don't throw error for tracking failures
      return null;
    }
  }


  /**
   * Update service page status
   * @param {string} pageId - Service page ID
   * @param {string} status - New status ('draft' | 'published')
   * @returns {Promise} API response
   */
  async updateServicePageStatus(pageId, status) {
    try {
      const response = await api.patch(`/services/pages/${pageId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Update service page status error:', error);
      throw this.handleError(error);
    }
  }


  /**
   * Batch generate content for multiple services
   * @param {Array} serviceDataArray - Array of service data objects
   * @param {Object} options - Generation options
   * @returns {Promise} Array of results
   */
  async batchGenerateContent(serviceDataArray, options = {}) {
    try {
      const {
        websiteId,
        generateSEO = true,
        generateFAQ = true,
        generateProcedure = true,
        generateBenefits = true,
        provider = 'auto',
        temperature = 0.7
      } = options;

      // Generate content for all services in parallel
      const generationPromises = serviceDataArray.map(async (serviceData) => {
        try {
          const result = await this.generateContentFromServiceData({
            ...serviceData,
            websiteId,
            generateSEO,
            generateFAQ,
            generateProcedure,
            generateBenefits,
            provider,
            temperature
          });

          return {
            serviceData,
            success: true,
            result
          };
        } catch (error) {
          return {
            serviceData,
            success: false,
            error: error.message || 'Generation failed'
          };
        }
      });

      const results = await Promise.allSettled(generationPromises);

      return results.map((result, index) => {
        if (result.status === 'fulfilled') {
          return result.value;
        } else {
          return {
            serviceData: serviceDataArray[index],
            success: false,
            error: result.reason?.message || 'Generation failed'
          };
        }
      });

    } catch (error) {
      console.error('Batch generate content error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Batch publish service pages
   * @param {Array} pageIds - Array of service page IDs
   * @returns {Promise} Array of results
   */
  async batchPublishPages(pageIds) {
    try {
      const publishPromises = pageIds.map(async (pageId) => {
        try {
          const result = await this.updateServicePageStatus(pageId, 'published');
          return {
            pageId,
            success: true,
            result
          };
        } catch (error) {
          return {
            pageId,
            success: false,
            error: error.message || 'Publish failed'
          };
        }
      });

      const results = await Promise.allSettled(publishPromises);

      return results.map((result, index) => {
        if (result.status === 'fulfilled') {
          return result.value;
        } else {
          return {
            pageId: pageIds[index],
            success: false,
            error: result.reason?.message || 'Publish failed'
          };
        }
      });

    } catch (error) {
      console.error('Batch publish pages error:', error);
      throw this.handleError(error);
    }
  }
}

// Export singleton instance
const serviceService = new ServiceService();
export default serviceService;