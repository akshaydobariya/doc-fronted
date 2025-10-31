/**
 * Enhanced Dental Website Sections
 * Updated navigation components with dynamic service integration
 */

// Enhanced navigation with dynamic services dropdown
export const enhancedDentalNavigation = {
  id: 'dental-header-navigation-enhanced',
  name: 'Dynamic Services Navigation',
  category: 'navigation',
  description: 'Header with dynamic services dropdown populated from database',
  tags: ['dental', 'navigation', 'header', 'dynamic', 'services'],
  component: `
    <header class="elementor elementor-130 elementor-location-header" data-elementor-post-type="elementor_library">
      <div class="elementor-element elementor-element-6831e74 e-flex e-con-boxed e-con e-parent e-lazyloaded"
           data-id="6831e74" data-element_type="container"
           style="background: #ffffff; position: relative; padding: 10px 0;">
        <div class="e-con-inner" style="max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; padding: 0 20px;">

          <!-- Logo Section -->
          <div class="elementor-element elementor-element-25c8fc94 elementor-widget elementor-widget-image" data-id="25c8fc94">
            <a href="/">
              <img width="189" height="190"
                   src="https://nahidmahmud.com/test-website/test01/wp-content/uploads/2025/09/site-logo-v1.1-1.png"
                   class="attachment-full size-full wp-image-866" alt="Dental Practice Logo"
                   style="max-width: 120px; height: auto;">
            </a>
          </div>

          <!-- Navigation Menu -->
          <nav class="e-n-menu-wrapper" style="display: flex; align-items: center;">
            <div class="e-n-menu-content">
              <ul style="display: flex; list-style: none; margin: 0; padding: 0; gap: 30px; align-items: center;">

                <li class="e-n-menu-item">
                  <a href="/" style="text-decoration: none; color: #333; font-weight: 500; font-size: 16px; transition: color 0.3s;">
                    Home
                  </a>
                </li>

                <!-- Dynamic Services Dropdown -->
                <li class="e-n-menu-item dropdown services-dropdown" style="position: relative;" data-dynamic-services="true">
                  <a href="/services"
                     style="text-decoration: none; color: #333; font-weight: 500; font-size: 16px; transition: color 0.3s; display: flex; align-items: center;">
                    Services
                    <svg style="width: 12px; height: 12px; margin-left: 5px;" viewBox="0 0 320 512" xmlns="http://www.w3.org/2000/svg">
                      <path d="M31.3 192h257.3c17.8 0 26.7 21.5 14.1 34.1L174.1 354.8c-7.8 7.8-20.5 7.8-28.3 0L17.2 226.1C4.6 213.5 13.5 192 31.3 192z"/>
                    </svg>
                  </a>

                  <!-- Services Dropdown Content (will be populated dynamically) -->
                  <div class="dropdown-content services-dropdown-content"
                       style="position: absolute; top: 100%; left: 0; background: white;
                              box-shadow: 0 8px 20px rgba(0,0,0,0.15); border-radius: 12px;
                              padding: 20px; min-width: 280px; z-index: 1000; display: none;
                              border: 1px solid #e5e7eb;">

                    <!-- Loading state -->
                    <div class="services-loading" style="text-align: center; padding: 20px; color: #6b7280;">
                      <div style="margin-bottom: 10px;">Loading services...</div>
                    </div>

                    <!-- Services will be populated here by JavaScript -->
                    <div class="services-list" style="display: none;">
                      <!-- Categories will be populated here -->
                    </div>

                    <!-- View All Services Link -->
                    <div style="border-top: 1px solid #e5e7eb; margin-top: 15px; padding-top: 15px; text-align: center;">
                      <a href="/services"
                         style="text-decoration: none; color: #2563eb; font-weight: 600; font-size: 14px;">
                        View All Services →
                      </a>
                    </div>
                  </div>
                </li>

                <li class="e-n-menu-item">
                  <a href="/about" style="text-decoration: none; color: #333; font-weight: 500; font-size: 16px; transition: color 0.3s;">
                    About
                  </a>
                </li>

                <li class="e-n-menu-item">
                  <a href="/team" style="text-decoration: none; color: #333; font-weight: 500; font-size: 16px; transition: color 0.3s;">
                    Our Team
                  </a>
                </li>

                <li class="e-n-menu-item">
                  <a href="/contact" style="text-decoration: none; color: #333; font-weight: 500; font-size: 16px; transition: color 0.3s;">
                    Contact
                  </a>
                </li>

              </ul>
            </div>
          </nav>

          <!-- Book Appointment Button -->
          <div class="elementor-element elementor-element-ba87ce4 elementor-widget elementor-widget-button" data-id="ba87ce4">
            <a href="/book-appointment"
               style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
                      color: white; padding: 12px 24px; border-radius: 25px;
                      text-decoration: none; font-weight: 600; font-size: 14px;
                      transition: all 0.3s ease; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);"
               onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(37, 99, 235, 0.4)';"
               onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(37, 99, 235, 0.3)';">
              Book Appointment
            </a>
          </div>

        </div>
      </div>

      <!-- Dynamic Services Loading Script -->
      <script>
        (function() {
          // Initialize services dropdown
          function initServicesDropdown() {
            const servicesDropdown = document.querySelector('.services-dropdown');
            const dropdownContent = document.querySelector('.services-dropdown-content');
            const servicesLoading = document.querySelector('.services-loading');
            const servicesList = document.querySelector('.services-list');

            if (!servicesDropdown || !dropdownContent) return;

            // Show/hide dropdown on hover
            servicesDropdown.addEventListener('mouseenter', function() {
              dropdownContent.style.display = 'block';
              loadServices();
            });

            servicesDropdown.addEventListener('mouseleave', function() {
              dropdownContent.style.display = 'none';
            });

            // Keep dropdown open when hovering over it
            dropdownContent.addEventListener('mouseenter', function() {
              dropdownContent.style.display = 'block';
            });

            dropdownContent.addEventListener('mouseleave', function() {
              dropdownContent.style.display = 'none';
            });

            let servicesLoaded = false;

            function loadServices() {
              if (servicesLoaded) return;

              // Get current subdomain
              const hostname = window.location.hostname;
              const subdomain = hostname.split('.')[0];

              // Make API call to get services
              fetch('/api/services?isActive=true&limit=10')
                .then(response => response.json())
                .then(data => {
                  if (data.success && data.data) {
                    renderServices(data.data);
                    servicesLoaded = true;
                  } else {
                    showError();
                  }
                })
                .catch(error => {
                  console.error('Error loading services:', error);
                  showError();
                });
            }

            function renderServices(services) {
              // Group services by category
              const categories = {};
              services.forEach(service => {
                const category = service.categoryDisplayName || service.category;
                if (!categories[category]) {
                  categories[category] = [];
                }
                categories[category].push(service);
              });

              let html = '';

              // Render popular services first
              const popularServices = services.filter(s => s.isPopular).slice(0, 6);
              if (popularServices.length > 0) {
                html += '<div style="margin-bottom: 15px;">';
                html += '<div style="font-weight: 600; color: #374151; margin-bottom: 8px; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Popular Services</div>';
                popularServices.forEach(service => {
                  html += '<div style="margin-bottom: 6px;">';
                  html += '<a href="/services/' + service.slug + '" style="text-decoration: none; color: #4b5563; font-size: 14px; display: flex; align-items: center; padding: 4px 0; transition: color 0.2s;"';
                  html += ' onmouseover="this.style.color=\'#2563eb\'" onmouseout="this.style.color=\'#4b5563\'">';
                  html += '<span style="color: #f59e0b; margin-right: 8px;">★</span>';
                  html += service.name;
                  html += '</a>';
                  html += '</div>';
                });
                html += '</div>';
              }

              // Render categories
              const categoryKeys = Object.keys(categories).slice(0, 3); // Limit to 3 categories
              categoryKeys.forEach((category, index) => {
                if (index > 0) {
                  html += '<div style="border-top: 1px solid #f3f4f6; margin: 12px 0;"></div>';
                }

                html += '<div style="margin-bottom: 12px;">';
                html += '<div style="font-weight: 600; color: #374151; margin-bottom: 8px; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">' + category + '</div>';

                categories[category].slice(0, 4).forEach(service => {
                  html += '<div style="margin-bottom: 4px;">';
                  html += '<a href="/services/' + service.slug + '" style="text-decoration: none; color: #4b5563; font-size: 14px; transition: color 0.2s;"';
                  html += ' onmouseover="this.style.color=\'#2563eb\'" onmouseout="this.style.color=\'#4b5563\'">';
                  html += service.name;
                  html += '</a>';
                  html += '</div>';
                });
                html += '</div>';
              });

              servicesList.innerHTML = html;
              servicesLoading.style.display = 'none';
              servicesList.style.display = 'block';
            }

            function showError() {
              servicesLoading.innerHTML = '<div style="color: #ef4444;">Unable to load services</div>';
            }
          }

          // Initialize when DOM is ready
          if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initServicesDropdown);
          } else {
            initServicesDropdown();
          }
        })();
      </script>

      <!-- Mobile Menu Styles (responsive) -->
      <style>
        @media (max-width: 768px) {
          .e-n-menu-wrapper {
            display: none;
          }

          .e-con-inner {
            flex-direction: column;
            gap: 15px;
          }

          .services-dropdown-content {
            position: fixed !important;
            top: 60px !important;
            left: 0 !important;
            right: 0 !important;
            max-width: 100vw !important;
            border-radius: 0 !important;
          }
        }

        /* Hover effects */
        .e-n-menu-item a:hover {
          color: #2563eb !important;
        }

        .dropdown-content a:hover {
          background-color: #f8fafc;
          border-radius: 6px;
          padding: 6px 8px;
          margin: -2px -4px;
        }
      </style>
    </header>
  `
};

// Export the enhanced section
export default enhancedDentalNavigation;