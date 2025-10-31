// NEW MODERN API-INTEGRATED HEADER COMPONENT
const modernApiHeader = {
  id: 'modern-api-header',
  name: 'Modern API Header',
  category: 'navigation',
  description: 'Modern header with live API integration for services from /api/services/pages endpoint',
  tags: ['modern', 'api', 'navigation', 'header', 'dynamic', 'services'],
  isDefault: true,
  apiIntegrated: true,
  component: `
    <header class="modern-api-header" data-component-type="modern-api-header" data-website-id="">
      <!-- Modern Header Container -->
      <div class="header-container" style="
        background: linear-gradient(135deg, #ffffff 0%, #f8fafb 100%);
        border-bottom: 1px solid rgba(30, 64, 175, 0.1);
        position: sticky;
        top: 0;
        z-index: 1000;
        padding: 0;
        box-shadow: 0 1px 15px rgba(0, 0, 0, 0.08);
        backdrop-filter: blur(10px);
      ">
        <div class="header-inner" style="
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 24px;
        ">

          <!-- Modern Logo Section -->
          <div class="logo-section" style="display: flex; align-items: center; gap: 16px;">
            <div class="logo-icon" style="
              width: 52px;
              height: 52px;
              background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
              border-radius: 16px;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 8px 25px rgba(30, 64, 175, 0.3);
              transition: transform 0.3s ease;
            ">
              <span style="color: white; font-size: 28px; font-weight: bold;">🦷</span>
            </div>
            <div class="logo-text">
              <a href="/" style="text-decoration: none;">
                <div class="site-title" style="
                  font-size: 28px;
                  font-weight: 800;
                  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
                  -webkit-background-clip: text;
                  -webkit-text-fill-color: transparent;
                  background-clip: text;
                  line-height: 1.2;
                  margin-bottom: 2px;
                ">
                  <span data-dynamic-content="siteName">Dental Practice</span>
                </div>
                <div class="tagline" style="
                  font-size: 12px;
                  color: #64748b;
                  font-weight: 500;
                  letter-spacing: 0.5px;
                ">
                  Professional Care
                </div>
              </a>
            </div>
          </div>

          <!-- Modern Navigation -->
          <nav class="main-navigation" style="display: flex; align-items: center;">
            <ul style="display: flex; list-style: none; margin: 0; padding: 0; gap: 40px; align-items: center;">
              <li>
                <a href="/" style="
                  text-decoration: none;
                  color: #334155;
                  font-weight: 600;
                  font-size: 16px;
                  padding: 8px 16px;
                  border-radius: 10px;
                  transition: all 0.3s ease;
                  position: relative;
                ">
                  Home
                </a>
              </li>

              <!-- Modern Services Dropdown -->
              <li class="services-dropdown" style="position: relative;">
                <a href="/services" style="
                  text-decoration: none;
                  color: #334155;
                  font-weight: 600;
                  font-size: 16px;
                  padding: 8px 16px;
                  border-radius: 10px;
                  transition: all 0.3s ease;
                  display: flex;
                  align-items: center;
                  gap: 8px;
                  position: relative;
                ">
                  <span style="display: flex; align-items: center; gap: 6px;">
                    <span style="font-size: 18px;">🦷</span>
                    Services
                  </span>
                  <svg style="width: 16px; height: 16px; transition: transform 0.3s ease;" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                  </svg>
                </a>

                <!-- Modern API Services Dropdown -->
                <div class="api-services-dropdown" style="
                  position: absolute;
                  top: calc(100% + 8px);
                  left: 0;
                  background: white;
                  border-radius: 16px;
                  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.12), 0 8px 30px rgba(0, 0, 0, 0.08);
                  border: 1px solid rgba(30, 64, 175, 0.1);
                  padding: 24px;
                  min-width: 320px;
                  max-width: 400px;
                  z-index: 1000;
                  display: none;
                  backdrop-filter: blur(15px);
                ">
                  <!-- Loading State -->
                  <div class="services-loading" style="display: block;">
                    <div style="
                      display: flex;
                      flex-direction: column;
                      align-items: center;
                      gap: 16px;
                      text-align: center;
                      padding: 20px;
                    ">
                      <div style="
                        width: 40px;
                        height: 40px;
                        border: 3px solid #e2e8f0;
                        border-top: 3px solid #3b82f6;
                        border-radius: 50%;
                        animation: spin 1s linear infinite;
                      "></div>
                      <div style="color: #64748b; font-size: 15px; font-weight: 500;">
                        Loading services...
                      </div>
                    </div>
                  </div>

                  <!-- Error State -->
                  <div class="services-error" style="display: none;">
                    <div style="
                      text-align: center;
                      padding: 24px;
                      color: #ef4444;
                      font-size: 14px;
                    ">
                      <div style="font-size: 32px; margin-bottom: 12px;">⚠️</div>
                      <div style="font-weight: 600; margin-bottom: 8px;">Unable to load services</div>
                      <button onclick="window.reloadApiServices && window.reloadApiServices()"
                              style="
                                background: #3b82f6;
                                color: white;
                                border: none;
                                padding: 8px 16px;
                                border-radius: 8px;
                                cursor: pointer;
                                font-size: 12px;
                                font-weight: 500;
                                transition: background 0.3s ease;
                              "
                              onmouseover="this.style.background='#2563eb'"
                              onmouseout="this.style.background='#3b82f6'">
                        Retry
                      </button>
                    </div>
                  </div>

                  <!-- Services Content -->
                  <div class="services-content" style="display: none;">
                    <div class="services-header" style="
                      margin-bottom: 20px;
                      padding-bottom: 16px;
                      border-bottom: 1px solid #e2e8f0;
                    ">
                      <h3 style="
                        margin: 0;
                        font-size: 18px;
                        font-weight: 700;
                        color: #1e293b;
                        display: flex;
                        align-items: center;
                        gap: 8px;
                      ">
                        <span style="font-size: 20px;">🦷</span>
                        Our Services
                      </h3>
                      <p style="margin: 4px 0 0 0; font-size: 13px; color: #64748b;">
                        Professional dental care services
                      </p>
                    </div>

                    <ul class="api-services-list" style="
                      list-style: none;
                      margin: 0;
                      padding: 0;
                      max-height: 300px;
                      overflow-y: auto;
                    ">
                      <!-- Services will be dynamically loaded here -->
                    </ul>
                  </div>
                </div>
              </li>

              <li>
                <a href="/about" style="
                  text-decoration: none;
                  color: #334155;
                  font-weight: 600;
                  font-size: 16px;
                  padding: 8px 16px;
                  border-radius: 10px;
                  transition: all 0.3s ease;
                ">
                  About
                </a>
              </li>

              <li>
                <a href="/contact" style="
                  text-decoration: none;
                  color: #334155;
                  font-weight: 600;
                  font-size: 16px;
                  padding: 8px 16px;
                  border-radius: 10px;
                  transition: all 0.3s ease;
                ">
                  Contact
                </a>
              </li>
            </ul>
          </nav>

          <!-- Modern CTA Button -->
          <div class="header-cta">
            <a href="/contact" style="
              background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
              color: white;
              text-decoration: none;
              padding: 12px 24px;
              border-radius: 12px;
              font-weight: 600;
              font-size: 14px;
              transition: all 0.3s ease;
              box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);
              border: none;
              cursor: pointer;
              display: flex;
              align-items: center;
              gap: 8px;
            ">
              <span>📞</span>
              Contact Us
            </a>
          </div>

        </div>
      </div>

      <!-- Modern CSS Styles -->
      <style>
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Hover Effects */
        .services-dropdown:hover .api-services-dropdown {
          display: block !important;
          animation: slideDown 0.3s ease;
        }

        .services-dropdown:hover svg {
          transform: rotate(180deg);
        }

        .main-navigation a:hover {
          color: #3b82f6 !important;
          background: rgba(59, 130, 246, 0.1) !important;
          transform: translateY(-2px);
        }

        .logo-icon:hover {
          transform: scale(1.1) rotate(5deg);
        }

        .header-cta a:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(59, 130, 246, 0.5) !important;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .header-inner {
            flex-direction: column;
            gap: 16px;
            padding: 16px;
          }

          .main-navigation ul {
            flex-direction: column;
            gap: 8px;
          }

          .api-services-dropdown {
            position: static !important;
            box-shadow: none !important;
            border: 1px solid #e2e8f0 !important;
            margin-top: 8px;
          }

          .logo-section {
            gap: 12px;
          }

          .logo-icon {
            width: 44px !important;
            height: 44px !important;
          }

          .site-title {
            font-size: 24px !important;
          }
        }
      </style>

      <!-- Enhanced JavaScript for API Integration -->
      <script>
        (function() {
          let servicesCache = null;
          let cacheTimestamp = 0;
          const CACHE_DURATION = 300000; // 5 minutes
          let isLoading = false;

          console.log('🚀 Modern API Header initialized');

          // Global reload function
          window.reloadApiServices = function() {
            console.log('🔄 Manually reloading API services...');
            servicesCache = null;
            cacheTimestamp = 0;
            loadServices(true);
          };

          // Main service loading function
          function loadServices(forceReload = false) {
            console.log('📡 Starting service load...');

            const dropdown = document.querySelector('.api-services-dropdown');
            const loadingDiv = dropdown?.querySelector('.services-loading');
            const errorDiv = dropdown?.querySelector('.services-error');
            const servicesContent = dropdown?.querySelector('.services-content');
            const servicesList = dropdown?.querySelector('.api-services-list');

            if (!dropdown || !loadingDiv || !errorDiv || !servicesContent || !servicesList) {
              console.warn('⚠️ Required dropdown elements not found');
              return;
            }

            // Prevent multiple simultaneous loads
            if (isLoading && !forceReload) {
              console.log('⏳ Service loading already in progress...');
              return;
            }

            // Check cache
            const now = Date.now();
            if (!forceReload && servicesCache && (now - cacheTimestamp) < CACHE_DURATION) {
              console.log('🚀 Using cached services');
              displayServices(servicesCache);
              return;
            }

            // Show loading state
            loadingDiv.style.display = 'block';
            errorDiv.style.display = 'none';
            servicesContent.style.display = 'none';
            isLoading = true;

            // Get website ID
            const websiteId = window.currentWebsiteId ||
                             document.querySelector('[data-website-id]')?.getAttribute('data-website-id') ||
                             document.querySelector('.modern-api-header')?.getAttribute('data-website-id') ||
                             new URLSearchParams(window.location.search).get('websiteId') ||
                             window.location.pathname.match(/\\/website\\/([^\\/]+)/)?.[1];

            console.log('🔍 Detected website ID:', websiteId);

            // Construct API URL
            const baseUrl = window.location.origin;
            const apiUrl = websiteId
              ? \`\${baseUrl}/api/services/pages?websiteId=\${websiteId}&isIntegrated=true\`
              : \`\${baseUrl}/api/services?isActive=true&limit=50\`;

            console.log('📡 API URL:', apiUrl);

            // Make API call
            fetch(apiUrl, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
              },
              credentials: 'same-origin'
            })
            .then(response => {
              console.log('📥 API Response status:', response.status);
              if (!response.ok) {
                throw new Error(\`API request failed: \${response.status} \${response.statusText}\`);
              }
              return response.json();
            })
            .then(data => {
              console.log('📊 API Response data:', data);

              // Handle different response formats
              let services = [];
              if (data.servicePages && Array.isArray(data.servicePages)) {
                services = data.servicePages;
              } else if (data.services && Array.isArray(data.services)) {
                services = data.services;
              } else if (Array.isArray(data)) {
                services = data;
              }

              console.log(\`✅ Loaded \${services.length} services\`);

              // Cache and display
              servicesCache = services;
              cacheTimestamp = now;
              displayServices(services);
            })
            .catch(error => {
              console.error('❌ API Error:', error);
              showError();
            })
            .finally(() => {
              isLoading = false;
            });
          }

          // Display services in dropdown
          function displayServices(services) {
            const dropdown = document.querySelector('.api-services-dropdown');
            const loadingDiv = dropdown?.querySelector('.services-loading');
            const errorDiv = dropdown?.querySelector('.services-error');
            const servicesContent = dropdown?.querySelector('.services-content');
            const servicesList = dropdown?.querySelector('.api-services-list');

            if (!dropdown || !servicesList || !servicesContent) return;

            // Hide loading and error states
            loadingDiv.style.display = 'none';
            errorDiv.style.display = 'none';
            servicesContent.style.display = 'block';

            if (services.length === 0) {
              servicesList.innerHTML = \`
                <li style="
                  padding: 24px;
                  text-align: center;
                  color: #64748b;
                  font-size: 15px;
                  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
                  border-radius: 12px;
                  margin: 8px 0;
                ">
                  <div style="font-size: 32px; margin-bottom: 12px;">🦷</div>
                  <div style="font-weight: 600; color: #334155; margin-bottom: 4px;">No Services Available</div>
                  <div style="font-size: 13px;">Please add services to your practice</div>
                </li>
              \`;
              return;
            }

            // Group services by category
            const servicesByCategory = services.reduce((acc, service) => {
              const categoryId = service.category || 'general';
              if (!acc[categoryId]) {
                acc[categoryId] = [];
              }
              acc[categoryId].push(service);
              return acc;
            }, {});

            const websiteId = window.currentWebsiteId ||
                             document.querySelector('[data-website-id]')?.getAttribute('data-website-id');

            let html = '';
            Object.entries(servicesByCategory).forEach(([categoryId, categoryServices], index) => {
              const categoryName = categoryId.replace(/-/g, ' ').replace(/\\b\\w/g, l => l.toUpperCase());

              if (index > 0) {
                html += '<li style="border-top: 1px solid #e2e8f0; margin: 16px 0; padding-top: 16px;"></li>';
              }

              html += \`
                <li style="margin-bottom: 12px;">
                  <div style="
                    font-weight: 700;
                    color: #3b82f6;
                    font-size: 12px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    margin-bottom: 8px;
                  ">
                    \${categoryName}
                  </div>
                </li>
              \`;

              categoryServices.forEach(service => {
                // Create service URL
                let serviceUrl;
                if (websiteId && service.slug) {
                  serviceUrl = \`/website/\${websiteId}/services/\${service.slug}\`;
                } else if (service.slug) {
                  serviceUrl = \`/services/\${service.slug}\`;
                } else if (service._id) {
                  serviceUrl = websiteId ? \`/website/\${websiteId}/service/\${service._id}\` : \`/service/\${service._id}\`;
                } else {
                  serviceUrl = '#';
                }

                html += \`
                  <li style="margin-bottom: 4px; margin-left: 16px;">
                    <a href="\${serviceUrl}"
                       style="
                         text-decoration: none;
                         color: #475569;
                         font-size: 15px;
                         font-weight: 500;
                         display: block;
                         padding: 10px 16px;
                         border-radius: 10px;
                         transition: all 0.3s ease;
                         line-height: 1.5;
                         border-left: 3px solid transparent;
                       "
                       onmouseover="
                         this.style.color='#3b82f6';
                         this.style.backgroundColor='#eff6ff';
                         this.style.transform='translateX(6px)';
                         this.style.borderLeftColor='#3b82f6';
                       "
                       onmouseout="
                         this.style.color='#475569';
                         this.style.backgroundColor='transparent';
                         this.style.transform='translateX(0)';
                         this.style.borderLeftColor='transparent';
                       "
                       onclick="console.log('🔗 Navigating to service:', '\${service.name}', '\${serviceUrl}')">
                      <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="font-size: 16px;">🦷</span>
                        <span>\${service.name}</span>
                      </div>
                    </a>
                  </li>
                \`;
              });
            });

            servicesList.innerHTML = html;
            console.log(\`🎯 Rendered \${services.length} services in dropdown\`);
          }

          // Show error state
          function showError() {
            const dropdown = document.querySelector('.api-services-dropdown');
            const loadingDiv = dropdown?.querySelector('.services-loading');
            const errorDiv = dropdown?.querySelector('.services-error');
            const servicesContent = dropdown?.querySelector('.services-content');

            if (!dropdown) return;

            loadingDiv.style.display = 'none';
            errorDiv.style.display = 'block';
            servicesContent.style.display = 'none';
          }

          // Initialize with multiple triggers
          function initialize() {
            console.log('🎯 Initializing modern header services...');
            loadServices();

            // Setup hover trigger
            const servicesDropdown = document.querySelector('.services-dropdown');
            if (servicesDropdown) {
              servicesDropdown.addEventListener('mouseenter', () => {
                console.log('🎯 Services hovered - loading...');
                loadServices();
              });
            }
          }

          // Multiple initialization attempts
          if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initialize);
          } else {
            initialize();
          }

          // Backup initializations
          setTimeout(initialize, 500);
          setTimeout(initialize, 1000);
          setTimeout(initialize, 2000);

          // Global service creation event listeners
          window.addEventListener('serviceCreated', function(event) {
            console.log('🆕 Service created - updating header:', event.detail);
            servicesCache = null;
            cacheTimestamp = 0;
            loadServices(true);
          });

          // Make functions globally available
          window.triggerHeaderServiceLoad = function() {
            console.log('🔄 Manual service load trigger');
            loadServices(true);
          };

        })();
      </script>
    </header>
  `
};

export default modernApiHeader;