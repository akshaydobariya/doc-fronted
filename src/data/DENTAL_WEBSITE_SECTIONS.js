// Dental Website Sections - Clean version with only dynamic React headers
// No hardcoded services - all services loaded dynamically from API

import modernApiHeader from './NEW_MODERN_HEADER.js';

// Dynamic Service Generator for Headers
const generateDynamicServicesDropdown = (services = [], websiteId = null, groupByCategory = true) => {
  if (services.length === 0) {
    return `
      <li style="margin-bottom: 8px;">
        <span style="color: #666; font-size: 14px;">No services available</span>
      </li>
    `;
  }

  if (groupByCategory) {
    // Group services by category
    const servicesByCategory = services.reduce((acc, service) => {
      const categoryId = service.category || 'general';
      if (!acc[categoryId]) {
        acc[categoryId] = [];
      }
      acc[categoryId].push(service);
      return acc;
    }, {});

    return Object.entries(servicesByCategory).map(([categoryId, categoryServices], index) => {
      const categoryName = categoryId.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
      return `
        ${index > 0 ? '<li style="border-top: 1px solid #eee; margin: 8px 0; padding-top: 8px;"></li>' : ''}
        <li style="margin-bottom: 6px;">
          <div style="font-weight: 600; color: #007cba; font-size: 12px; text-transform: uppercase; margin-bottom: 4px;">
            ${categoryName}
          </div>
        </li>
        ${categoryServices.map(service => `
          <li style="margin-bottom: 6px; margin-left: 12px;">
            <a href="${websiteId ? `/website/${websiteId}/services/${service.slug}` : `/services/${service.slug}`}"
               style="text-decoration: none; color: #333; font-size: 14px; display: block; padding: 2px 8px; border-radius: 4px; transition: all 0.3s;"
               onmouseover="this.style.color='#007cba'; this.style.backgroundColor='#f8f9fa'"
               onmouseout="this.style.color='#333'; this.style.backgroundColor='transparent'">
              ${service.name}
            </a>
          </li>
        `).join('')}
      `;
    }).join('');
  } else {
    // Flat list
    return services.map(service => `
      <li style="margin-bottom: 8px;">
        <a href="${websiteId ? `/website/${websiteId}/services/${service.slug}` : `/services/${service.slug}`}"
           style="text-decoration: none; color: #333; font-size: 14px; display: block; padding: 4px 8px; border-radius: 4px; transition: all 0.3s;"
           onmouseover="this.style.color='#007cba'; this.style.backgroundColor='#f8f9fa'"
           onmouseout="this.style.color='#333'; this.style.backgroundColor='transparent'">
          ${service.name}
        </a>
      </li>
    `).join('');
  }
};

const dentalWebsiteSections = [
  // API-integrated header component (non-React)
  modernApiHeader,

  // React-based headers only - no hardcoded services
  {
    id: 'modern-minimalist',
    name: 'Modern Minimalist Header',
    category: 'navigation',
    description: 'Clean, minimal design with perfect typography and service mapping',
    tags: ['modern', 'minimalist', 'navigation', 'header', 'react', 'clean'],
    isReactComponent: true,
    componentName: 'ModernMinimalistHeader',
    isDynamic: true,
    defaultConfig: {
      primaryColor: '#2563eb',
      textColor: '#1f2937',
      showAllServices: false,
      groupByCategory: true,
      maxServicesInDropdown: 12
    }
  },
  {
    id: 'glassmorphism-header',
    name: 'Glassmorphism Header',
    category: 'navigation',
    description: 'Modern glass effect with backdrop blur and transparent elements',
    tags: ['modern', 'glassmorphism', 'navigation', 'header', 'react', 'glass'],
    isReactComponent: true,
    componentName: 'GlassmorphismHeader',
    isDynamic: true,
    defaultConfig: {
      primaryColor: '#6366f1',
      textColor: '#1e293b',
      showAllServices: false,
      groupByCategory: true,
      maxServicesInDropdown: 12
    }
  },
  {
    id: 'gradient-modern',
    name: 'Gradient Modern Header',
    category: 'navigation',
    description: 'Bold gradient design with vibrant colors and animations',
    tags: ['modern', 'gradient', 'navigation', 'header', 'react', 'colorful'],
    isReactComponent: true,
    componentName: 'GradientModernHeader',
    isDynamic: true,
    defaultConfig: {
      primaryColor: '#8b5cf6',
      secondaryColor: '#06b6d4',
      textColor: '#ffffff',
      showAllServices: false,
      groupByCategory: true,
      maxServicesInDropdown: 12
    }
  },
  {
    id: 'corporate-professional',
    name: 'Corporate Professional Header',
    category: 'navigation',
    description: 'Business-focused design with professional styling and contact info',
    tags: ['modern', 'corporate', 'navigation', 'header', 'react', 'professional'],
    isReactComponent: true,
    componentName: 'CorporateProfessionalHeader',
    isDynamic: true,
    defaultConfig: {
      primaryColor: '#1565c0',
      secondaryColor: '#0d47a1',
      textColor: '#263238',
      showAllServices: false,
      groupByCategory: true,
      maxServicesInDropdown: 12,
      showContactInfo: true,
      contactPhone: '(123) 456-7890',
      contactEmail: 'info@practice.com'
    }
  },
  {
    id: 'futuristic-tech',
    name: 'Futuristic Tech Header',
    category: 'navigation',
    description: 'High-tech design with neon accents, animations, and sci-fi styling',
    tags: ['modern', 'futuristic', 'navigation', 'header', 'react', 'tech'],
    isReactComponent: true,
    componentName: 'FuturisticTechHeader',
    isDynamic: true,
    defaultConfig: {
      primaryColor: '#00ff88',
      secondaryColor: '#0099ff',
      accentColor: '#ff0066',
      textColor: '#ffffff',
      showAllServices: false,
      groupByCategory: true,
      maxServicesInDropdown: 12
    }
  },
  {
    id: 'dynamic-navigation',
    name: 'Live Dynamic Navigation (React)',
    category: 'navigation',
    description: 'React-based navigation header that loads services from database in real-time with hover dropdowns',
    tags: ['dental', 'navigation', 'header', 'react', 'database', 'live', 'dynamic'],
    isDynamic: true,
    isReactComponent: true,
    componentName: 'DynamicNavigationHeader',
    defaultConfig: {
      primaryColor: '#007cba',
      textColor: '#333',
      showAllServices: false,
      groupByCategory: true,
      maxServicesInDropdown: 12,
      useAdvancedStyling: true,
      enableHoverEffects: true,
      showBrandLogo: true,
      responsiveBreakpoint: 768
    }
  },
  // Footer component
  {
    id: 'modern-footer',
    name: 'Modern Footer',
    category: 'footer',
    description: 'Professional footer with contact info, links, and social media',
    tags: ['footer', 'contact', 'professional', 'modern'],
    component: `
      <footer style="background: #1f2937; color: white; padding: 60px 0 30px 0;">
        <div style="max-width: 1200px; margin: 0 auto; padding: 0 20px;">
          <!-- Footer Content -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 40px; margin-bottom: 40px;">

            <!-- Practice Info -->
            <div>
              <h3 style="font-size: 1.5rem; font-weight: 700; margin: 0 0 20px 0; color: #007cba;">
                🦷 Dental Practice
              </h3>
              <p style="color: #9ca3af; line-height: 1.6; margin: 0 0 20px 0;">
                Providing exceptional dental care with modern technology and personalized attention for every patient.
              </p>
              <div style="display: flex; gap: 15px;">
                <a href="#" style="color: #9ca3af; font-size: 20px; transition: color 0.3s;"
                   onmouseover="this.style.color='#007cba'" onmouseout="this.style.color='#9ca3af'">📘</a>
                <a href="#" style="color: #9ca3af; font-size: 20px; transition: color 0.3s;"
                   onmouseover="this.style.color='#007cba'" onmouseout="this.style.color='#9ca3af'">📷</a>
                <a href="#" style="color: #9ca3af; font-size: 20px; transition: color 0.3s;"
                   onmouseover="this.style.color='#007cba'" onmouseout="this.style.color='#9ca3af'">🐦</a>
              </div>
            </div>

            <!-- Quick Links -->
            <div>
              <h4 style="font-size: 1.2rem; font-weight: 600; margin: 0 0 20px 0;">Quick Links</h4>
              <div style="display: flex; flex-direction: column; gap: 12px;">
                <a href="/" style="color: #9ca3af; text-decoration: none; transition: color 0.3s;"
                   onmouseover="this.style.color='#007cba'" onmouseout="this.style.color='#9ca3af'">Home</a>
                <a href="/about" style="color: #9ca3af; text-decoration: none; transition: color 0.3s;"
                   onmouseover="this.style.color='#007cba'" onmouseout="this.style.color='#9ca3af'">About Us</a>
                <a href="/services" style="color: #9ca3af; text-decoration: none; transition: color 0.3s;"
                   onmouseover="this.style.color='#007cba'" onmouseout="this.style.color='#9ca3af'">Services</a>
                <a href="/contact" style="color: #9ca3af; text-decoration: none; transition: color 0.3s;"
                   onmouseover="this.style.color='#007cba'" onmouseout="this.style.color='#9ca3af'">Contact</a>
                <a href="/appointments" style="color: #9ca3af; text-decoration: none; transition: color 0.3s;"
                   onmouseover="this.style.color='#007cba'" onmouseout="this.style.color='#9ca3af'">Book Appointment</a>
              </div>
            </div>

            <!-- Contact Info -->
            <div>
              <h4 style="font-size: 1.2rem; font-weight: 600; margin: 0 0 20px 0;">Contact Info</h4>
              <div style="display: flex; flex-direction: column; gap: 12px;">
                <div style="display: flex; align-items: center; gap: 10px; color: #9ca3af;">
                  📍 <span>123 Main Street, City, State 12345</span>
                </div>
                <div style="display: flex; align-items: center; gap: 10px; color: #9ca3af;">
                  📞 <a href="tel:+1234567890" style="color: #9ca3af; text-decoration: none;">(123) 456-7890</a>
                </div>
                <div style="display: flex; align-items: center; gap: 10px; color: #9ca3af;">
                  ✉️ <a href="mailto:info@dentalpractice.com" style="color: #9ca3af; text-decoration: none;">info@dentalpractice.com</a>
                </div>
              </div>
            </div>

            <!-- Office Hours -->
            <div>
              <h4 style="font-size: 1.2rem; font-weight: 600; margin: 0 0 20px 0;">Office Hours</h4>
              <div style="display: flex; flex-direction: column; gap: 8px; color: #9ca3af; font-size: 0.9rem;">
                <div style="display: flex; justify-content: space-between;">
                  <span>Monday - Friday:</span>
                  <span>8:00 AM - 6:00 PM</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span>Saturday:</span>
                  <span>9:00 AM - 4:00 PM</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span>Sunday:</span>
                  <span>Emergency Only</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer Bottom -->
          <div style="border-top: 1px solid #374151; padding-top: 30px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 20px;">
            <div style="color: #9ca3af; font-size: 0.9rem;">
              © 2024 Dental Practice. All rights reserved.
            </div>
            <div style="display: flex; gap: 20px;">
              <a href="/privacy" style="color: #9ca3af; text-decoration: none; font-size: 0.9rem; transition: color 0.3s;"
                 onmouseover="this.style.color='#007cba'" onmouseout="this.style.color='#9ca3af'">Privacy Policy</a>
              <a href="/terms" style="color: #9ca3af; text-decoration: none; font-size: 0.9rem; transition: color 0.3s;"
                 onmouseover="this.style.color='#007cba'" onmouseout="this.style.color='#9ca3af'">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    `
  }
];

export default dentalWebsiteSections;