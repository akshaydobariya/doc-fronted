import api from './api';

/**
 * Website Service
 * Handles all website-related API calls
 */

class WebsiteService {
  // Get all websites for the authenticated doctor
  async getWebsites() {
    try {
      const response = await api.get('/websites');
      return response.data;
    } catch (error) {
      console.error('Get websites error:', error);
      throw this.handleError(error);
    }
  }

  // Get specific website by ID
  async getWebsiteById(id) {
    try {
      const response = await api.get(`/websites/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get website error:', error);
      throw this.handleError(error);
    }
  }

  // Create new website
  async createWebsite(websiteData) {
    try {
      const response = await api.post('/websites', websiteData);
      return response.data;
    } catch (error) {
      console.error('Create website error:', error);
      throw this.handleError(error);
    }
  }

  // Update website metadata
  async updateWebsite(id, updateData) {
    try {
      const response = await api.put(`/websites/${id}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Update website error:', error);
      throw this.handleError(error);
    }
  }

  // Save website content (create new version)
  async saveWebsiteContent(id, contentData) {
    try {
      const response = await api.post(`/websites/${id}/content`, contentData);
      return response.data;
    } catch (error) {
      console.error('Save website content error:', error);
      throw this.handleError(error);
    }
  }

  // Get website version history
  async getWebsiteVersions(id) {
    try {
      const response = await api.get(`/websites/${id}/versions`);
      return response.data;
    } catch (error) {
      console.error('Get website versions error:', error);
      throw this.handleError(error);
    }
  }

  // Restore website to specific version
  async restoreWebsiteVersion(id, versionNumber) {
    try {
      const response = await api.post(`/websites/${id}/restore`, { versionNumber });
      return response.data;
    } catch (error) {
      console.error('Restore website version error:', error);
      throw this.handleError(error);
    }
  }

  // Check subdomain availability
  async checkSubdomainAvailability(subdomain, excludeId = null) {
    try {
      const params = excludeId ? { excludeId } : {};
      const response = await api.get(`/websites/subdomain/${subdomain}/available`, { params });
      return response.data;
    } catch (error) {
      console.error('Check subdomain availability error:', error);
      throw this.handleError(error);
    }
  }

  // Update website status
  async updateWebsiteStatus(id, status) {
    try {
      const response = await api.patch(`/websites/${id}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Update website status error:', error);
      throw this.handleError(error);
    }
  }

  // Delete website (soft delete - archive)
  async deleteWebsite(id) {
    try {
      const response = await api.delete(`/websites/${id}`);
      return response.data;
    } catch (error) {
      console.error('Delete website error:', error);
      throw this.handleError(error);
    }
  }

  // Permanently delete website
  async permanentDeleteWebsite(id) {
    try {
      const response = await api.delete(`/websites/${id}/permanent`);
      return response.data;
    } catch (error) {
      console.error('Permanent delete website error:', error);
      throw this.handleError(error);
    }
  }

  // Publish website
  async publishWebsite(id) {
    return this.updateWebsiteStatus(id, 'published');
  }

  // Unpublish website
  async unpublishWebsite(id) {
    return this.updateWebsiteStatus(id, 'draft');
  }

  // Set website to preview mode
  async setWebsitePreview(id) {
    return this.updateWebsiteStatus(id, 'preview');
  }

  // Generate static site
  async generateStaticSite(id) {
    try {
      const response = await api.post(`/websites/${id}/generate`);
      return response.data;
    } catch (error) {
      console.error('Generate static site error:', error);
      throw this.handleError(error);
    }
  }

  // Deploy website
  async deployWebsite(id, provider = 'vercel') {
    try {
      const response = await api.post(`/websites/${id}/deploy`, { provider });
      return response.data;
    } catch (error) {
      console.error('Deploy website error:', error);
      throw this.handleError(error);
    }
  }

  // Get deployment status
  async getDeploymentStatus(id) {
    try {
      const response = await api.get(`/websites/${id}/deployment`);
      return response.data;
    } catch (error) {
      console.error('Get deployment status error:', error);
      throw this.handleError(error);
    }
  }

  // Helper method to handle API errors
  handleError(error) {
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.message || 'An error occurred';
      return new Error(message);
    } else if (error.request) {
      // Request was made but no response received
      return new Error('No response from server');
    } else {
      // Something else happened
      return new Error(error.message || 'Unknown error');
    }
  }

  // Generate website URLs
  getWebsiteUrl(website) {
    // If custom domain is configured
    if (website.customDomain) {
      return `https://${website.customDomain}`;
    }

    // If website is deployed globally (has deployment URL from Vercel)
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

  getPreviewUrl(website) {
    // If website is deployed globally, use the deployment URL
    if (website.deployment?.url) {
      return website.deployment.url;
    }

    // For development/local testing
    if (process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost') {
      return `http://localhost:5000/api/websites/public/${website.subdomain}`;
    }

    // Fallback to expected preview URL
    return website.deployment?.previewUrl || `https://preview-${website.subdomain}.docwebsite.app`;
  }

  // Website templates
  getAvailableTemplates() {
    return [
      {
        id: 'dental-modern',
        name: 'Modern Dental',
        description: 'Clean, modern design perfect for dental practices',
        preview: '/templates/dental-modern-preview.jpg',
        category: 'Medical'
      },
      {
        id: 'medical-classic',
        name: 'Classic Medical',
        description: 'Professional, trustworthy design for medical professionals',
        preview: '/templates/medical-classic-preview.jpg',
        category: 'Medical'
      },
      {
        id: 'healthcare-minimal',
        name: 'Minimal Healthcare',
        description: 'Minimalist design focusing on content and accessibility',
        preview: '/templates/healthcare-minimal-preview.jpg',
        category: 'Medical'
      },
      {
        id: 'custom',
        name: 'Custom Design',
        description: 'Start from scratch with a blank canvas',
        preview: '/templates/custom-preview.jpg',
        category: 'Custom'
      }
    ];
  }

  // Website status colors and labels
  getStatusConfig() {
    return {
      draft: {
        label: 'Draft',
        color: '#64748b',
        bgColor: '#f1f5f9',
        icon: '📝'
      },
      preview: {
        label: 'Preview',
        color: '#f59e0b',
        bgColor: '#fef3c7',
        icon: '👁️'
      },
      published: {
        label: 'Published',
        color: '#10b981',
        bgColor: '#d1fae5',
        icon: '🌍'
      },
      archived: {
        label: 'Archived',
        color: '#ef4444',
        bgColor: '#fecaca',
        icon: '📦'
      }
    };
  }
}

// Export singleton instance
const websiteService = new WebsiteService();
export default websiteService;