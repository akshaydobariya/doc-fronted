import { API_BASE_URL } from '../config/api';
import api from './api';
/**
 * Unified Content Service
 *
 * Provides API methods for interacting with the unified content system
 * that bridges AI-generated content and visual editing capabilities.
 */

class UnifiedContentService {
  /**
   * Get unified content for a service page
   */
  static async getUnifiedContent(servicePageId) {
    try {
      const response = await fetch(`${API_BASE_URL}/unified-content/${servicePageId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error getting unified content:', error);
      throw error;
    }
  }

  /**
   * Get unified content by service page ID (alias for compatibility)
   */
  static async getByServicePage(servicePageId) {
    return this.getUnifiedContent(servicePageId);
  }

  /**
   * Create unified content for a service page
   */
  static async create(servicePageId, websiteId) {
    try {
      const response = await fetch(`${API_BASE_URL}/unified-content`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          servicePageId,
          websiteId
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error creating unified content:', error);
      throw error;
    }
  }

  /**
   * Update visual components from Destack editor
   */
  static async updateComponents(servicePageId, components, editingContext = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}/unified-content/${servicePageId}/components`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          components,
          editingContext
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error updating components:', error);
      throw error;
    }
  }

  /**
   * Update structured content from AI or content editor
   */
  static async updateStructuredContent(servicePageId, structuredContent, sections = null) {
    try {
      const response = await fetch(`${API_BASE_URL}/unified-content/${servicePageId}/content`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          structuredContent,
          sections
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error updating structured content:', error);
      throw error;
    }
  }

  /**
   * Sync with AI-generated content
   */
  static async syncWithAI(servicePageId, generatedContent, options = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}/unified-content/${servicePageId}/sync-ai`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          generatedContent,
          options
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error syncing with AI:', error);
      throw error;
    }
  }

  /**
   * Get pending AI suggestions
   */
  static async getAISuggestions(servicePageId) {
    try {
      const response = await fetch(`${API_BASE_URL}/unified-content/${servicePageId}/suggestions`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error getting AI suggestions:', error);
      throw error;
    }
  }

  /**
   * Handle AI suggestion (accept/reject)
   */
  static async handleAISuggestion(servicePageId, suggestionId, componentId, action) {
    try {
      const response = await fetch(`${API_BASE_URL}/unified-content/${servicePageId}/suggestions/handle`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          suggestionId,
          componentId,
          action
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error handling AI suggestion:', error);
      throw error;
    }
  }

  /**
   * Apply AI suggestion (alias for handleAISuggestion with action='accept')
   */
  static async applySuggestion(servicePageId, suggestionId, componentId) {
    return this.handleAISuggestion(servicePageId, suggestionId, componentId, 'accept');
  }

  /**
   * Reject AI suggestion (alias for handleAISuggestion with action='reject')
   */
  static async rejectSuggestion(servicePageId, suggestionId, componentId) {
    return this.handleAISuggestion(servicePageId, suggestionId, componentId, 'reject');
  }

  /**
   * Export content to Destack format
   */
  static async exportToDestack(servicePageId) {
    try {
      const response = await fetch(`${API_BASE_URL}/unified-content/${servicePageId}/export/destack`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error exporting to Destack:', error);
      throw error;
    }
  }

  /**
   * Import content from Destack format
   */
  static async importFromDestack(servicePageId, destackData) {
    try {
      const response = await fetch(`${API_BASE_URL}/unified-content/${servicePageId}/import/destack`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          destackData
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error importing from Destack:', error);
      throw error;
    }
  }

  /**
   * Detect conflicts between content and visual changes
   */
  static async detectConflicts(servicePageId) {
    try {
      const response = await fetch(`${API_BASE_URL}/unified-content/${servicePageId}/conflicts`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error detecting conflicts:', error);
      throw error;
    }
  }

  /**
   * Resolve conflicts with specified resolution strategy
   */
  static async resolveConflicts(servicePageId, resolutions) {
    try {
      const response = await fetch(`${API_BASE_URL}/unified-content/${servicePageId}/conflicts/resolve`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          resolutions
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error resolving conflicts:', error);
      throw error;
    }
  }

  /**
   * Resolve single conflict (alias for resolveConflicts with single resolution)
   */
  static async resolveConflict(servicePageId, conflictId, resolution) {
    return this.resolveConflicts(servicePageId, [{ conflictId, resolution }]);
  }

  /**
   * Get version history
   */
  static async getVersionHistory(servicePageId, limit = 10, offset = 0) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/unified-content/${servicePageId}/versions?limit=${limit}&offset=${offset}`,
        {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error getting version history:', error);
      throw error;
    }
  }

  /**
   * Restore to a specific version
   */
  static async restoreVersion(servicePageId, version) {
    try {
      const response = await fetch(`${API_BASE_URL}/unified-content/${servicePageId}/versions/restore`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          version
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error restoring version:', error);
      throw error;
    }
  }

  /**
   * Generate AI content for specific sections
   */
  static async generateAIContent(servicePageId, sections, options = {}) {
    let servicePage = null;

    try {
      // Get service page details to extract service information
      servicePage = await this.getServicePage(servicePageId);
      if (!servicePage) {
        throw new Error('Service page not found');
      }

      // Prepare LLM generation request
      const llmRequest = {
        serviceName: servicePage.title || servicePage.serviceName,
        category: servicePage.category || 'general-dentistry',
        description: servicePage.description || '',
        websiteId: servicePage.websiteId,
        generateSEO: sections.includes('seo') || sections.length === 0,
        generateFAQ: sections.includes('faq') || sections.length === 0,
        generateProcedure: sections.includes('procedure') || sections.length === 0,
        generateBenefits: sections.includes('benefits') || sections.length === 0,
        generateAftercare: sections.includes('aftercare') || sections.length === 0,
        provider: options.provider || 'auto',
        temperature: options.temperature || 0.7,
        keywords: options.keywords || []
      };

      // Call the real LLM backend endpoint
      const response = await api.post('/services/generate-content', llmRequest);

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to generate content');
      }

      const { llmContent, tokensUsed } = response.data.data;

      // Transform LLM response to frontend format
      const generatedContent = {};

      // Hero section
      if (sections.includes('hero') || sections.length === 0) {
        generatedContent.hero = {
          title: `Professional ${servicePage.title || servicePage.serviceName}`,
          subtitle: "Expert Dental Care You Can Trust",
          description: llmContent.serviceOverview?.content?.substring(0, 150) + '...' || "Experience exceptional dental services with our advanced technology and compassionate care.",
          ctaText: "Schedule Consultation"
        };
      }

      // Overview section
      if (sections.includes('overview') || sections.length === 0) {
        generatedContent.overview = {
          title: "About This Service",
          content: llmContent.serviceOverview?.content || "Professional dental service tailored to your needs.",
          highlights: [
            "Advanced dental technology",
            "Experienced professionals",
            "Personalized treatment plans",
            "Comfortable environment"
          ]
        };
      }

      // Benefits section
      if ((sections.includes('benefits') || sections.length === 0) && llmContent.serviceBenefits) {
        const benefitsList = this.parseBenefitsFromLLM(llmContent.serviceBenefits.content);
        generatedContent.benefits = {
          title: "Why Choose Our Service",
          introduction: "Discover the advantages of our professional dental care",
          list: benefitsList.map(benefit => ({
            title: benefit.title,
            description: benefit.description,
            icon: this.getIconForBenefit(benefit.title)
          }))
        };
      }

      // Procedure section
      if ((sections.includes('procedure') || sections.length === 0) && llmContent.procedureSteps) {
        const steps = this.parseStepsFromLLM(llmContent.procedureSteps.content);
        generatedContent.procedure = {
          title: "The Procedure",
          introduction: "What to expect during your visit",
          steps: steps
        };
      }

      // FAQ section
      if ((sections.includes('faq') || sections.length === 0) && llmContent.faqGeneration) {
        const faqs = this.parseFAQFromLLM(llmContent.faqGeneration.content);
        generatedContent.faq = {
          title: "Frequently Asked Questions",
          introduction: "Common questions about this service",
          questions: faqs
        };
      }

      // Aftercare section
      if ((sections.includes('aftercare') || sections.length === 0) && llmContent.aftercareInstructions) {
        const instructions = this.parseAfterCareFromLLM(llmContent.aftercareInstructions.content);
        generatedContent.aftercare = {
          title: "Recovery & Aftercare",
          introduction: "Important aftercare instructions",
          instructions: instructions
        };
      }

      return {
        success: true,
        generatedContent,
        tokensUsed: tokensUsed || 0,
        provider: llmContent.serviceOverview?.provider || 'backend-llm',
        sections: sections || Object.keys(generatedContent)
      };

    } catch (error) {
      console.error('Error generating AI content:', error);

      // Fallback to basic content if LLM fails
      const fallbackContent = {
        hero: {
          title: `Professional ${servicePage?.title || 'Dental Service'}`,
          subtitle: "Expert Dental Care You Can Trust",
          description: "Experience exceptional dental services with our advanced technology and compassionate care.",
          ctaText: "Schedule Consultation"
        }
      };

      return {
        success: false,
        error: error.message,
        generatedContent: fallbackContent,
        sections: ['hero']
      };
    }
  }

  /**
   * Parse benefits from LLM content
   */
  static parseBenefitsFromLLM(content) {
    try {
      const lines = content.split('\n').filter(line => line.trim());
      const benefits = [];

      for (const line of lines) {
        if (line.includes('•') || line.includes('-') || line.includes('*')) {
          const benefit = line.replace(/[•\-*]\s*/, '').trim();
          if (benefit) {
            const parts = benefit.split(':');
            let title = parts[0]?.trim() || benefit;
            title = title.replace(/\*\*/g, '').replace(/\*/g, '').trim();
            if (title.length > 95) {
              title = title.substring(0, 95) + '...';
            }
            benefits.push({
              title: title,
              description: parts[1]?.trim() || ''
            });
          }
        }
      }

      return benefits.length > 0 ? benefits : [{
        title: 'Professional Treatment',
        description: 'High-quality dental care'
      }];
    } catch (error) {
      return [{
        title: 'Professional Treatment',
        description: 'High-quality dental care'
      }];
    }
  }

  /**
   * Parse procedure steps from LLM content
   */
  static parseStepsFromLLM(content) {
    try {
      const lines = content.split('\n').filter(line => line.trim());
      const steps = [];
      let stepNumber = 1;

      for (const line of lines) {
        if (line.match(/^\d+\./) || line.includes('Step') || line.includes('•') || line.includes('-')) {
          const step = line.replace(/^\d+\.\s*/, '').replace(/Step\s*\d+\s*[:=-]?\s*/i, '').replace(/[•-]\s*/, '').trim();
          if (step) {
            const parts = step.split(':');
            let title = parts[0]?.trim() || `Step ${stepNumber}`;
            title = title.replace(/\*\*/g, '').replace(/\*/g, '').trim();
            if (title.length > 95) {
              title = title.substring(0, 95) + '...';
            }
            steps.push({
              stepNumber: stepNumber++,
              title: title,
              description: parts[1]?.trim() || step
            });
          }
        }
      }

      return steps.length > 0 ? steps : [{
        stepNumber: 1,
        title: 'Consultation',
        description: 'Initial consultation and examination'
      }];
    } catch (error) {
      return [{
        stepNumber: 1,
        title: 'Consultation',
        description: 'Initial consultation and examination'
      }];
    }
  }

  /**
   * Parse FAQ from LLM content
   */
  static parseFAQFromLLM(content) {
    try {
      const lines = content.split('\n').filter(line => line.trim());
      const faqs = [];
      let currentQuestion = '';
      let currentAnswer = '';

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        if (line.includes('?') || line.toLowerCase().includes('q:') || line.toLowerCase().includes('question')) {
          if (currentQuestion && currentAnswer) {
            faqs.push({
              question: currentQuestion,
              answer: currentAnswer
            });
          }
          currentQuestion = line.replace(/^q:\s*/i, '').replace(/^\d+\.\s*/, '').trim();
          currentAnswer = '';
        } else if (line && currentQuestion) {
          currentAnswer += (currentAnswer ? ' ' : '') + line.replace(/^a:\s*/i, '').trim();
        }
      }

      if (currentQuestion && currentAnswer) {
        faqs.push({
          question: currentQuestion,
          answer: currentAnswer
        });
      }

      return faqs.length > 0 ? faqs : [{
        question: 'How long does the procedure take?',
        answer: 'The duration varies depending on your specific needs. We will discuss timing during your consultation.'
      }];
    } catch (error) {
      return [{
        question: 'How long does the procedure take?',
        answer: 'The duration varies depending on your specific needs. We will discuss timing during your consultation.'
      }];
    }
  }

  /**
   * Parse aftercare instructions from LLM content
   */
  static parseAfterCareFromLLM(content) {
    try {
      const lines = content.split('\n').filter(line => line.trim());
      const instructions = [];

      for (const line of lines) {
        if (line.includes('•') || line.includes('-') || line.includes('*') || line.match(/^\d+\./)) {
          const instruction = line.replace(/[•\-*]\s*/, '').replace(/^\d+\.\s*/, '').trim();
          if (instruction) {
            let title = instruction.split('.')[0] || instruction;
            title = title.replace(/\*\*/g, '').replace(/\*/g, '').trim();
            if (title.length > 95) {
              title = title.substring(0, 95) + '...';
            }
            instructions.push({
              title: title,
              description: instruction,
              timeframe: this.extractTimeframe(instruction)
            });
          }
        }
      }

      return instructions.length > 0 ? instructions : [{
        title: 'Follow post-treatment instructions',
        description: 'Follow all post-treatment care instructions provided.',
        timeframe: 'First 24 hours'
      }];
    } catch (error) {
      return [{
        title: 'Follow post-treatment instructions',
        description: 'Follow all post-treatment care instructions provided.',
        timeframe: 'First 24 hours'
      }];
    }
  }

  /**
   * Extract timeframe from text
   */
  static extractTimeframe(text) {
    const timeframes = ['24 hours', '48 hours', '1 week', '2 weeks', 'first day', 'first week'];
    for (const timeframe of timeframes) {
      if (text.toLowerCase().includes(timeframe)) {
        return timeframe;
      }
    }
    return null;
  }

  /**
   * Get icon for benefit based on title
   */
  static getIconForBenefit(title) {
    const iconMap = {
      'expert': '👨‍⚕️',
      'technology': '🔬',
      'personalized': '📋',
      'comfort': '😊',
      'safety': '🛡️',
      'quality': '⭐',
      'care': '❤️',
      'professional': '🎓',
      'advanced': '🚀',
      'gentle': '🤗'
    };

    const titleLower = title.toLowerCase();
    for (const [key, icon] of Object.entries(iconMap)) {
      if (titleLower.includes(key)) {
        return icon;
      }
    }
    return '✨'; // Default icon
  }

  /**
   * Get available stock images for a search query
   */
  static async getStockImages(searchQuery, page = 1, perPage = 20) {
    try {
      // Try to get stock images from backend (which may integrate with Unsplash)
      const response = await api.get('/unified-content/stock-images', {
        params: {
          query: searchQuery,
          page,
          per_page: perPage
        }
      });

      if (response.data.success) {
        return response.data;
      }

      // Fallback to direct Unsplash integration if backend fails
      const unsplashApiKey = process.env.REACT_APP_UNSPLASH_ACCESS_KEY;
      if (unsplashApiKey) {
        const unsplashResponse = await fetch(
          `https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchQuery)}&page=${page}&per_page=${perPage}&orientation=landscape&content_filter=high`,
          {
            headers: {
              Authorization: `Client-ID ${unsplashApiKey}`
            }
          }
        );

        if (unsplashResponse.ok) {
          const data = await unsplashResponse.json();
          const images = data.results.map(photo => ({
            id: photo.id,
            url: photo.urls.regular,
            thumbnail: photo.urls.small,
            alt: photo.alt_description || `${searchQuery} stock image`,
            source: 'unsplash',
            photographer: photo.user.name,
            photographerUrl: photo.user.links.html,
            tags: photo.tags?.map(tag => tag.title) || [searchQuery]
          }));

          return {
            success: true,
            images,
            pagination: {
              page,
              perPage,
              total: data.total,
              totalPages: data.total_pages
            }
          };
        }
      }

      // Final fallback to curated dental images
      const fallbackImages = [
        {
          id: 'dental-1',
          url: 'https://images.unsplash.com/photo-1609840114035-3c981b782dfe?w=800&h=600&fit=crop',
          thumbnail: 'https://images.unsplash.com/photo-1609840114035-3c981b782dfe?w=300&h=200&fit=crop',
          alt: 'Professional dental care',
          source: 'unsplash',
          photographer: 'Unsplash',
          tags: ['dental', 'healthcare', 'professional']
        },
        {
          id: 'dental-2',
          url: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=800&h=600&fit=crop',
          thumbnail: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=300&h=200&fit=crop',
          alt: 'Modern dental office',
          source: 'unsplash',
          photographer: 'Unsplash',
          tags: ['dental', 'office', 'modern']
        },
        {
          id: 'dental-3',
          url: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800&h=600&fit=crop',
          thumbnail: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=300&h=200&fit=crop',
          alt: 'Dental examination tools',
          source: 'unsplash',
          photographer: 'Unsplash',
          tags: ['dental', 'tools', 'examination']
        }
      ];

      return {
        success: true,
        images: fallbackImages.filter(img =>
          img.tags.some(tag =>
            tag.toLowerCase().includes(searchQuery.toLowerCase()) ||
            searchQuery.toLowerCase().includes(tag.toLowerCase())
          )
        ),
        pagination: {
          page: 1,
          perPage: fallbackImages.length,
          total: fallbackImages.length,
          totalPages: 1
        }
      };

    } catch (error) {
      console.error('Error getting stock images:', error);

      // Return empty result on error
      return {
        success: false,
        error: error.message,
        images: [],
        pagination: {
          page: 1,
          perPage: 0,
          total: 0,
          totalPages: 0
        }
      };
    }
  }

  /**
   * Save selected stock image to assets
   */
  static async saveStockImage(servicePageId, imageData) {
    try {
      const response = await fetch(`${API_BASE_URL}/unified-content/${servicePageId}/assets/save-stock-image`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          imageData
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error saving stock image:', error);
      throw error;
    }
  }

  /**
   * Get sync status and health information
   */
  static async getSyncStatus(servicePageId) {
    try {
      const response = await fetch(`${API_BASE_URL}/unified-content/${servicePageId}/sync-status`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error getting sync status:', error);
      throw error;
    }
  }

  /**
   * Force full synchronization between content and visual components
   */
  static async forceSyncronization(servicePageId) {
    try {
      const response = await fetch(`${API_BASE_URL}/unified-content/${servicePageId}/force-sync`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error forcing synchronization:', error);
      throw error;
    }
  }

  /**
   * Get analytics data for the unified content
   */
  static async getAnalytics(servicePageId) {
    try {
      const response = await fetch(`${API_BASE_URL}/unified-content/${servicePageId}/analytics`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error getting analytics:', error);
      throw error;
    }
  }

  /**
   * Preview the unified content as it would appear on the live site
   */
  static async previewContent(servicePageId, viewMode = 'desktop') {
    try {
      const response = await fetch(
        `${API_BASE_URL}/unified-content/${servicePageId}/preview?viewMode=${viewMode}`,
        {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error previewing content:', error);
      throw error;
    }
  }

  /**
   * Publish the unified content to the live site
   */
  static async publishContent(servicePageId) {
    try {
      const response = await fetch(`${API_BASE_URL}/unified-content/${servicePageId}/publish`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error publishing content:', error);
      throw error;
    }
  }
}

export default UnifiedContentService;