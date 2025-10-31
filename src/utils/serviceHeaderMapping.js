/**
 * Service Header Mapping Utility
 * Handles mapping between services and header navigation components
 * Used by the drag-and-drop website builder
 */

import serviceService from '../services/serviceService';

export class ServiceHeaderMapper {
  constructor() {
    this.servicesCache = null;
    this.categoriesCache = null;
    this.cacheTimestamp = null;
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Load and cache services and categories
   */
  async loadServicesData() {
    const now = Date.now();

    // Return cached data if it's still fresh
    if (this.servicesCache && this.cacheTimestamp && (now - this.cacheTimestamp) < this.cacheTimeout) {
      return {
        services: this.servicesCache,
        categories: this.categoriesCache
      };
    }

    try {
      const [servicesResponse, categoriesResponse] = await Promise.all([
        serviceService.getAllServices({ isActive: true }),
        serviceService.getCategories()
      ]);

      this.servicesCache = servicesResponse.data || [];
      this.categoriesCache = categoriesResponse.data || [];
      this.cacheTimestamp = now;

      return {
        services: this.servicesCache,
        categories: this.categoriesCache
      };
    } catch (error) {
      console.error('Error loading services data:', error);
      return {
        services: [],
        categories: []
      };
    }
  }

  /**
   * Generate navigation menu data for services
   */
  async generateServiceNavigation(selectedServiceIds = [], groupByCategory = true, websiteId = null) {
    const { services, categories } = await this.loadServicesData();

    // Filter services by selected IDs if provided
    const filteredServices = selectedServiceIds.length > 0
      ? services.filter(service => selectedServiceIds.includes(service._id))
      : services;

    if (!groupByCategory) {
      return filteredServices.map(service => ({
        id: service._id,
        name: service.name,
        slug: service.slug,
        url: websiteId ? `/website/${websiteId}/services/${service.slug}` : `/services/${service.slug}`,
        category: service.category
      }));
    }

    // Group by category
    const servicesByCategory = filteredServices.reduce((acc, service) => {
      if (!acc[service.category]) {
        acc[service.category] = [];
      }
      acc[service.category].push({
        id: service._id,
        name: service.name,
        slug: service.slug,
        url: websiteId ? `/website/${websiteId}/services/${service.slug}` : `/services/${service.slug}`,
        category: service.category
      });
      return acc;
    }, {});

    // Add category metadata
    return Object.entries(servicesByCategory).map(([categoryId, categoryServices]) => {
      const category = categories.find(cat => cat.id === categoryId);
      return {
        categoryId,
        categoryName: category ? category.name : categoryId.replace('-', ' '),
        categoryIcon: category ? category.icon : '🦷',
        services: categoryServices
      };
    });
  }

  /**
   * Generate dynamic header component with services
   */
  async generateDynamicHeaderComponent(options = {}) {
    const {
      selectedServiceIds = [],
      websiteId = null,
      logoUrl = null,
      siteName = "Dental Practice",
      primaryColor = "#007cba",
      textColor = "#333",
      customNavigation = [],
      showServicesDropdown = true,
      groupServicesByCategory = true
    } = options;

    const { services } = await this.loadServicesData();
    const serviceNavigation = await this.generateServiceNavigation(selectedServiceIds, groupServicesByCategory, websiteId);

    return {
      id: 'dynamic-dental-header-with-services',
      name: 'Dynamic Dental Header with API Services',
      category: 'navigation',
      description: 'Professional dental header with services loaded from API',
      tags: ['dental', 'navigation', 'header', 'dynamic', 'services'],
      serviceData: {
        selectedServiceIds,
        serviceNavigation,
        totalServices: services.length
      },
      component: this.generateHeaderHTML({
        selectedServiceIds,
        logoUrl,
        siteName,
        primaryColor,
        textColor,
        customNavigation,
        showServicesDropdown,
        serviceNavigation
      })
    };
  }

  /**
   * Generate the actual HTML for the header
   */
  generateHeaderHTML({
    selectedServiceIds = [],
    logoUrl = null,
    siteName = "Dental Practice",
    primaryColor = "#007cba",
    textColor = "#333",
    customNavigation = [],
    showServicesDropdown = true,
    serviceNavigation = []
  }) {
    // Generate service dropdown content
    const generateServiceDropdown = () => {
      if (serviceNavigation.length === 0) {
        return `
          <li style="margin-bottom: 8px;">
            <span style="color: #666; font-size: 14px;">No services available</span>
          </li>
        `;
      }

      // Check if services are grouped by category
      if (serviceNavigation[0]?.services) {
        // Grouped by category
        return serviceNavigation.map(categoryGroup => `
          <li style="margin-bottom: 12px;">
            <div style="font-weight: 600; color: ${primaryColor}; font-size: 13px; text-transform: uppercase; margin-bottom: 6px; display: flex; align-items: center; gap: 5px;">
              <span>${categoryGroup.categoryIcon || '🦷'}</span>
              ${categoryGroup.categoryName}
            </div>
            ${categoryGroup.services.map(service => `
              <div style="margin-bottom: 6px; margin-left: 20px;">
                <a href="${service.url}"
                   style="text-decoration: none; color: #333; font-size: 14px; display: block; padding: 4px 8px; border-radius: 4px; transition: all 0.3s;"
                   onmouseover="this.style.color='${primaryColor}'; this.style.backgroundColor='#f8f9fa'"
                   onmouseout="this.style.color='#333'; this.style.backgroundColor='transparent'">
                  ${service.name}
                </a>
              </div>
            `).join('')}
          </li>
        `).join('');
      } else {
        // Flat list
        return serviceNavigation.map(service => `
          <li style="margin-bottom: 8px;">
            <a href="${service.url}"
               style="text-decoration: none; color: #333; font-size: 14px; display: block; padding: 4px 8px; border-radius: 4px; transition: all 0.3s;"
               onmouseover="this.style.color='${primaryColor}'; this.style.backgroundColor='#f8f9fa'"
               onmouseout="this.style.color='#333'; this.style.backgroundColor='transparent'">
              ${service.name}
            </a>
          </li>
        `).join('');
      }
    };

    return `
      <header class="dynamic-dental-header" data-website-id="${selectedServiceIds.join(',')}" data-component-type="dynamic-header">
        <div class="header-container" style="background: #ffffff; position: relative; padding: 15px 0; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div class="header-inner" style="max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; padding: 0 20px;">

            <!-- Logo Section -->
            <div class="logo-section">
              <a href="/" style="text-decoration: none;">
                ${logoUrl ? `
                  <img src="${logoUrl}" alt="${siteName} Logo" style="max-width: 120px; height: auto;">
                ` : `
                  <div style="font-size: 24px; font-weight: bold; color: ${primaryColor};">
                    ${siteName}
                  </div>
                `}
              </a>
            </div>

            <!-- Navigation Menu -->
            <nav class="main-navigation" style="display: flex; align-items: center;">
              <ul style="display: flex; list-style: none; margin: 0; padding: 0; gap: 30px; align-items: center;">
                <li>
                  <a href="/" style="text-decoration: none; color: ${textColor}; font-weight: 500; font-size: 16px; transition: color 0.3s;">
                    Home
                  </a>
                </li>

                ${showServicesDropdown && serviceNavigation.length > 0 ? `
                <li class="services-dropdown" style="position: relative;">
                  <a href="/services" style="text-decoration: none; color: ${textColor}; font-weight: 500; font-size: 16px; transition: color 0.3s; display: flex; align-items: center; gap: 5px;">
                    Services
                    <svg style="width: 12px; height: 12px;" viewBox="0 0 320 512" xmlns="http://www.w3.org/2000/svg">
                      <path fill="${textColor}" d="M31.3 192h257.3c17.8 0 26.7 21.5 14.1 34.1L174.1 354.8c-7.8 7.8-20.5 7.8-28.3 0L17.2 226.1C4.6 213.5 13.5 192 31.3 192z"/>
                    </svg>
                  </a>
                  <div class="services-dropdown-content" style="position: absolute; top: 100%; left: 0; background: white; box-shadow: 0 8px 25px rgba(0,0,0,0.15); border-radius: 8px; padding: 20px; min-width: 280px; z-index: 1000; display: none; max-height: 400px; overflow-y: auto; border: 1px solid #e5e7eb;">
                    <ul style="list-style: none; margin: 0; padding: 0;">
                      ${generateServiceDropdown()}
                    </ul>
                  </div>
                </li>
                ` : ''}

                ${customNavigation.map(item => `
                  <li>
                    <a href="${item.url}" style="text-decoration: none; color: ${textColor}; font-weight: 500; font-size: 16px; transition: color 0.3s;">
                      ${item.name}
                    </a>
                  </li>
                `).join('')}

                <li>
                  <a href="/about" style="text-decoration: none; color: ${textColor}; font-weight: 500; font-size: 16px; transition: color 0.3s;">
                    About
                  </a>
                </li>
                <li>
                  <a href="/contact" style="text-decoration: none; color: ${textColor}; font-weight: 500; font-size: 16px; transition: color 0.3s;">
                    Contact
                  </a>
                </li>
              </ul>
            </nav>

            <!-- CTA Button -->
            <div class="cta-section">
              <a href="#book-appointment" class="book-now-btn" style="background: ${primaryColor}; color: white; padding: 12px 25px; border-radius: 25px; text-decoration: none; font-weight: 600; transition: all 0.3s; display: inline-block;">
                Book Appointment
              </a>
            </div>

          </div>
        </div>

        <style>
          .services-dropdown:hover .services-dropdown-content {
            display: block !important;
          }
          .main-navigation a:hover {
            color: ${primaryColor} !important;
          }
          .book-now-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(0, 124, 186, 0.3);
          }
          @media (max-width: 768px) {
            .header-inner {
              flex-direction: column;
              gap: 20px;
            }
            .main-navigation ul {
              flex-direction: column;
              gap: 15px;
              text-align: center;
            }
            .services-dropdown-content {
              position: static !important;
              box-shadow: none !important;
              border: none !important;
              padding: 15px 0 !important;
            }
          }
        </style>
      </header>
    `;
  }

  /**
   * Update services in existing header component
   */
  async updateHeaderServices(headerComponentHTML, newServiceIds, websiteId = null) {
    const serviceNavigation = await this.generateServiceNavigation(newServiceIds, true, websiteId);
    // Re-generate the header with new services
    // This would be used when services are added/removed from the header
    return this.generateHeaderHTML({
      selectedServiceIds: newServiceIds,
      serviceNavigation
    });
  }

  /**
   * Clear cache (useful when services are updated)
   */
  clearCache() {
    this.servicesCache = null;
    this.categoriesCache = null;
    this.cacheTimestamp = null;
  }
}

// Export a singleton instance
export const serviceHeaderMapper = new ServiceHeaderMapper();

// Export utility functions
export const generateServiceHeaderComponent = (options) => {
  return serviceHeaderMapper.generateDynamicHeaderComponent(options);
};

export const updateHeaderWithServices = (headerHTML, serviceIds, websiteId = null) => {
  return serviceHeaderMapper.updateHeaderServices(headerHTML, serviceIds, websiteId);
};

export const clearServiceCache = () => {
  serviceHeaderMapper.clearCache();
};