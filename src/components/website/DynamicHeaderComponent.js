import React, { useState, useEffect } from 'react';
import serviceService from '../../services/serviceService';

/**
 * Dynamic Header Component
 * Generates navigation with services loaded from API
 * Used in the drag-and-drop website builder
 */
const DynamicHeaderComponent = ({
  websiteId,
  logoUrl,
  siteName = "Dental Practice",
  selectedServices = [],
  customNavigation = [],
  primaryColor = "#007cba",
  textColor = "#333"
}) => {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadServicesAndCategories();
  }, []);

  const loadServicesAndCategories = async () => {
    try {
      setLoading(true);

      // Load services and categories from API
      const [servicesResponse, categoriesResponse] = await Promise.all([
        serviceService.getAllServices({ isActive: true }),
        serviceService.getCategories()
      ]);

      setServices(servicesResponse.data || []);
      setCategories(categoriesResponse.data || []);
    } catch (error) {
      console.error('Error loading services:', error);
      // Use empty arrays if API fails
      setServices([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter services by selected services or show all if none selected
  const filteredServices = selectedServices.length > 0
    ? services.filter(service => selectedServices.includes(service._id))
    : services;

  // Group services by category
  const servicesByCategory = filteredServices.reduce((acc, service) => {
    if (!acc[service.category]) {
      acc[service.category] = [];
    }
    acc[service.category].push(service);
    return acc;
  }, {});

  // Get category display name
  const getCategoryDisplayName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : categoryId.replace('-', ' ');
  };

  // Generate service dropdown HTML
  const generateServiceDropdown = () => {
    if (loading) {
      return `
        <li style="margin-bottom: 8px;">
          <span style="color: #666; font-size: 14px;">Loading services...</span>
        </li>
      `;
    }

    if (filteredServices.length === 0) {
      return `
        <li style="margin-bottom: 8px;">
          <span style="color: #666; font-size: 14px;">No services available</span>
        </li>
      `;
    }

    // If we have multiple categories, group them
    if (Object.keys(servicesByCategory).length > 1) {
      return Object.entries(servicesByCategory).map(([categoryId, categoryServices]) => `
        <li style="margin-bottom: 12px;">
          <div style="font-weight: 600; color: ${primaryColor}; font-size: 13px; text-transform: uppercase; margin-bottom: 6px;">
            ${getCategoryDisplayName(categoryId)}
          </div>
          ${categoryServices.map(service => `
            <div style="margin-bottom: 6px; margin-left: 10px;">
              <a href="${websiteId ? `/website/${websiteId}/services/${service.slug}` : `/services/${service.slug}`}"
                 style="text-decoration: none; color: #333; font-size: 14px; display: block; padding: 2px 0; transition: color 0.3s;"
                 onmouseover="this.style.color='${primaryColor}'"
                 onmouseout="this.style.color='#333'">
                ${service.name}
              </a>
            </div>
          `).join('')}
        </li>
      `).join('');
    } else {
      // Single category or ungrouped services
      return filteredServices.map(service => `
        <li style="margin-bottom: 8px;">
          <a href="${websiteId ? `/website/${websiteId}/services/${service.slug}` : `/services/${service.slug}`}"
             style="text-decoration: none; color: #333; font-size: 14px; transition: color 0.3s;"
             onmouseover="this.style.color='${primaryColor}'"
             onmouseout="this.style.color='#333'">
            ${service.name}
          </a>
        </li>
      `).join('');
    }
  };

  // Generate the complete header HTML
  const generateHeaderHTML = () => {
    return `
      <header class="elementor elementor-130 elementor-location-header" data-elementor-post-type="elementor_library">
        <div class="elementor-element elementor-element-6831e74 e-flex e-con-boxed e-con e-parent e-lazyloaded"
             data-id="6831e74" data-element_type="container"
             style="background: #ffffff; position: relative; padding: 10px 0;">
          <div class="e-con-inner" style="max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; padding: 0 20px;">

            <!-- Logo Section -->
            <div class="elementor-element elementor-element-25c8fc94 elementor-widget elementor-widget-image" data-id="25c8fc94">
              <a href="/">
                ${logoUrl ? `
                  <img width="189" height="190" src="${logoUrl}"
                       class="attachment-full size-full wp-image-866" alt="${siteName} Logo"
                       style="max-width: 120px; height: auto;">
                ` : `
                  <div style="font-size: 24px; font-weight: bold; color: ${primaryColor};">
                    ${siteName}
                  </div>
                `}
              </a>
            </div>

            <!-- Navigation Menu -->
            <nav class="e-n-menu-wrapper" style="display: flex; align-items: center;">
              <div class="e-n-menu-content">
                <ul style="display: flex; list-style: none; margin: 0; padding: 0; gap: 30px; align-items: center;">
                  <li class="e-n-menu-item">
                    <a href="/" style="text-decoration: none; color: ${textColor}; font-weight: 500; font-size: 16px; transition: color 0.3s;">Home</a>
                  </li>

                  ${filteredServices.length > 0 ? `
                  <li class="e-n-menu-item dropdown" style="position: relative;">
                    <a href="/services" style="text-decoration: none; color: ${textColor}; font-weight: 500; font-size: 16px; transition: color 0.3s; display: flex; align-items: center;">
                      Services
                      <svg style="width: 12px; height: 12px; margin-left: 5px;" viewBox="0 0 320 512" xmlns="http://www.w3.org/2000/svg">
                        <path d="M31.3 192h257.3c17.8 0 26.7 21.5 14.1 34.1L174.1 354.8c-7.8 7.8-20.5 7.8-28.3 0L17.2 226.1C4.6 213.5 13.5 192 31.3 192z"/>
                      </svg>
                    </a>
                    <div class="dropdown-content" style="position: absolute; top: 100%; left: 0; background: white; box-shadow: 0 4px 6px rgba(0,0,0,0.1); border-radius: 8px; padding: 15px; min-width: 250px; z-index: 1000; display: none; max-height: 400px; overflow-y: auto;">
                      <ul style="list-style: none; margin: 0; padding: 0;">
                        ${generateServiceDropdown()}
                      </ul>
                    </div>
                  </li>
                  ` : ''}

                  ${customNavigation.map(item => `
                    <li class="e-n-menu-item">
                      <a href="${item.url}" style="text-decoration: none; color: ${textColor}; font-weight: 500; font-size: 16px; transition: color 0.3s;">${item.name}</a>
                    </li>
                  `).join('')}

                  <li class="e-n-menu-item">
                    <a href="/about-us" style="text-decoration: none; color: ${textColor}; font-weight: 500; font-size: 16px; transition: color 0.3s;">About Us</a>
                  </li>
                  <li class="e-n-menu-item">
                    <a href="/contact-us" style="text-decoration: none; color: ${textColor}; font-weight: 500; font-size: 16px; transition: color 0.3s;">Contact Us</a>
                  </li>
                </ul>
              </div>
            </nav>

            <!-- Book Now Button -->
            <div class="elementor-element elementor-element-7335953d elementor-align-right mybuttonid elementor-widget elementor-widget-button">
              <a class="elementor-button elementor-button-link elementor-size-sm" href="#book-appointment"
                 style="background: ${primaryColor}; color: white; padding: 12px 25px; border-radius: 25px; text-decoration: none; font-weight: 600; transition: all 0.3s;"
                 onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 8px rgba(0,0,0,0.2)'"
                 onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
                <span class="elementor-button-content-wrapper">
                  <span class="elementor-button-text">Book Now</span>
                </span>
              </a>
            </div>

          </div>
        </div>

        <style>
          .dropdown:hover .dropdown-content {
            display: block !important;
          }
          .e-n-menu-item a:hover {
            color: ${primaryColor} !important;
          }
          .dropdown-content a:hover {
            background-color: #f8f9fa;
            padding: 4px 8px;
            border-radius: 4px;
          }
          @media (max-width: 768px) {
            .e-con-inner {
              flex-direction: column;
              gap: 20px;
            }
            .e-n-menu-content ul {
              flex-direction: column;
              gap: 15px;
            }
            .dropdown-content {
              position: static !important;
              box-shadow: none !important;
              padding: 10px 0 !important;
            }
          }
        </style>
      </header>
    `;
  };

  return generateHeaderHTML();
};

export default DynamicHeaderComponent;