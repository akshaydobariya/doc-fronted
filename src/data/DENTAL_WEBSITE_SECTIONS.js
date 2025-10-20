// Dental Website Sections - Extracted from Untitled-1.html
// All images and videos are using exact URLs from the source file

const dentalWebsiteSections = [
  // 1. HEADER / NAVIGATION SECTION
  {
    id: 'dental-header-navigation',
    name: 'Dental Website Header',
    category: 'navigation',
    description: 'Complete header with logo, navigation menu and book now button',
    tags: ['dental', 'navigation', 'header', 'menu', 'logo'],
    component: `
      <header class="elementor elementor-130 elementor-location-header" data-elementor-post-type="elementor_library">
        <div class="elementor-element elementor-element-6831e74 e-flex e-con-boxed e-con e-parent e-lazyloaded" data-id="6831e74" data-element_type="container" style="background: #ffffff; position: relative; padding: 10px 0;">
          <div class="e-con-inner" style="max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; padding: 0 20px;">

            <!-- Logo Section -->
            <div class="elementor-element elementor-element-25c8fc94 elementor-widget elementor-widget-image" data-id="25c8fc94">
              <a href="/">
                <img width="189" height="190" src="https://nahidmahmud.com/test-website/test01/wp-content/uploads/2025/09/site-logo-v1.1-1.png"
                     class="attachment-full size-full wp-image-866" alt="Dental Logo"
                     srcset="https://nahidmahmud.com/test-website/test01/wp-content/uploads/2025/09/site-logo-v1.1-1.png 189w,
                             https://nahidmahmud.com/test-website/test01/wp-content/uploads/2025/09/site-logo-v1.1-1-150x150.png 150w"
                     sizes="(max-width: 189px) 100vw, 189px" style="max-width: 120px; height: auto;">
              </a>
            </div>

            <!-- Navigation Menu -->
            <nav class="e-n-menu-wrapper" style="display: flex; align-items: center;">
              <div class="e-n-menu-content">
                <ul style="display: flex; list-style: none; margin: 0; padding: 0; gap: 30px; align-items: center;">
                  <li class="e-n-menu-item">
                    <a href="/" style="text-decoration: none; color: #333; font-weight: 500; font-size: 16px; transition: color 0.3s;">Home</a>
                  </li>
                  <li class="e-n-menu-item dropdown" style="position: relative;">
                    <a href="/services" style="text-decoration: none; color: #333; font-weight: 500; font-size: 16px; transition: color 0.3s; display: flex; align-items: center;">
                      Services
                      <svg style="width: 12px; height: 12px; margin-left: 5px;" viewBox="0 0 320 512" xmlns="http://www.w3.org/2000/svg">
                        <path d="M31.3 192h257.3c17.8 0 26.7 21.5 14.1 34.1L174.1 354.8c-7.8 7.8-20.5 7.8-28.3 0L17.2 226.1C4.6 213.5 13.5 192 31.3 192z"/>
                      </svg>
                    </a>
                    <div class="dropdown-content" style="position: absolute; top: 100%; left: 0; background: white; box-shadow: 0 4px 6px rgba(0,0,0,0.1); border-radius: 8px; padding: 15px; min-width: 200px; z-index: 1000; display: none;">
                      <ul style="list-style: none; margin: 0; padding: 0;">
                        <li style="margin-bottom: 8px;"><a href="/laser-dentistry" style="text-decoration: none; color: #333; font-size: 14px;">Dental Exams & Cleaning</a></li>
                        <li style="margin-bottom: 8px;"><a href="/laser-dentistry" style="text-decoration: none; color: #333; font-size: 14px;">Root Canal Treatment</a></li>
                        <li style="margin-bottom: 8px;"><a href="/laser-dentistry" style="text-decoration: none; color: #333; font-size: 14px;">Cosmetic Dentistry</a></li>
                        <li style="margin-bottom: 8px;"><a href="/laser-dentistry" style="text-decoration: none; color: #333; font-size: 14px;">Dental Implants</a></li>
                        <li style="margin-bottom: 8px;"><a href="/laser-dentistry" style="text-decoration: none; color: #333; font-size: 14px;">Teeth Whitening</a></li>
                        <li style="margin-bottom: 8px;"><a href="/laser-dentistry" style="text-decoration: none; color: #333; font-size: 14px;">Periodontal Scaling</a></li>
                        <li><a href="/laser-dentistry" style="text-decoration: none; color: #333; font-size: 14px;">Fluoride Treatment</a></li>
                      </ul>
                    </div>
                  </li>
                  <li class="e-n-menu-item dropdown" style="position: relative;">
                    <a href="/pediatric-dentistry" style="text-decoration: none; color: #333; font-weight: 500; font-size: 16px; transition: color 0.3s; display: flex; align-items: center;">
                      Pediatric Dentistry
                      <svg style="width: 12px; height: 12px; margin-left: 5px;" viewBox="0 0 320 512" xmlns="http://www.w3.org/2000/svg">
                        <path d="M31.3 192h257.3c17.8 0 26.7 21.5 14.1 34.1L174.1 354.8c-7.8 7.8-20.5 7.8-28.3 0L17.2 226.1C4.6 213.5 13.5 192 31.3 192z"/>
                      </svg>
                    </a>
                    <div class="dropdown-content" style="position: absolute; top: 100%; left: 0; background: white; box-shadow: 0 4px 6px rgba(0,0,0,0.1); border-radius: 8px; padding: 15px; min-width: 220px; z-index: 1000; display: none;">
                      <ul style="list-style: none; margin: 0; padding: 0;">
                        <li style="margin-bottom: 8px;"><a href="/laser-dentistry" style="text-decoration: none; color: #333; font-size: 14px;">Early Childhood Varies/Cavities Care</a></li>
                        <li style="margin-bottom: 8px;"><a href="/laser-dentistry" style="text-decoration: none; color: #333; font-size: 14px;">Nursing Bottle Caries/Cavities Care</a></li>
                        <li style="margin-bottom: 8px;"><a href="/laser-dentistry" style="text-decoration: none; color: #333; font-size: 14px;">Nitrous sedation (coming soon)</a></li>
                        <li><a href="/laser-dentistry" style="text-decoration: none; color: #333; font-size: 14px;">Preventive Orthodontics</a></li>
                      </ul>
                    </div>
                  </li>
                  <li class="e-n-menu-item">
                    <a href="/about-us" style="text-decoration: none; color: #333; font-weight: 500; font-size: 16px; transition: color 0.3s;">About Us</a>
                  </li>
                  <li class="e-n-menu-item">
                    <a href="/blog" style="text-decoration: none; color: #333; font-weight: 500; font-size: 16px; transition: color 0.3s;">Blogs</a>
                  </li>
                  <li class="e-n-menu-item">
                    <a href="/contact-us" style="text-decoration: none; color: #333; font-weight: 500; font-size: 16px; transition: color 0.3s;">Contact Us</a>
                  </li>
                </ul>
              </div>
            </nav>

            <!-- Book Now Button -->
            <div class="elementor-element elementor-element-7335953d elementor-align-right mybuttonid elementor-widget elementor-widget-button">
              <a class="elementor-button elementor-button-link elementor-size-sm" href="#"
                 style="background: #007cba; color: white; padding: 12px 25px; border-radius: 25px; text-decoration: none; font-weight: 600; transition: background 0.3s;">
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
            color: #007cba !important;
          }
          @media (max-width: 768px) {
            .e-con-inner {
              flex-direction: column;
              gap: 20px;
            }
            nav ul {
              flex-direction: column;
              gap: 15px !important;
            }
          }
        </style>
      </header>
    `
  },

  // 2. HERO SECTION WITH VIDEO BACKGROUND
  {
    id: 'dental-hero-video',
    name: 'Hero Section with Video Background',
    category: 'hero',
    description: 'Main hero section with background video, heading, description and CTA buttons',
    tags: ['dental', 'hero', 'video', 'cta', 'appointment'],
    component: `
      <div class="elementor-element elementor-element-107937a e-flex e-con-boxed e-con e-parent e-lazyloaded"
           style="position: relative; min-height: 600px; display: flex; align-items: center; overflow: hidden;">

        <!-- Background Video -->
        <div class="elementor-background-video-container" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 1;">
          <video class="elementor-background-video-hosted" autoplay muted playsinline loop
                 src="https://nahidmahmud.com/test-website/test01/wp-content/uploads/2025/09/Dent-Vid1.mp4"
                 style="width: 100%; height: 100%; object-fit: cover;">
          </video>
          <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.4); z-index: 2;"></div>
        </div>

        <!-- Content -->
        <div class="e-con-inner" style="position: relative; z-index: 3; max-width: 1200px; margin: 0 auto; padding: 80px 20px;">
          <div class="elementor-element elementor-element-4646e54 e-con-full e-flex e-con e-child" style="text-align: center; color: white;">

            <!-- Main Heading -->
            <div class="elementor-element elementor-element-96e99d4 elementor-widget elementor-widget-heading">
              <h1 class="elementor-heading-title elementor-size-default"
                  style="font-size: 48px; font-weight: 700; margin-bottom: 20px; line-height: 1.2; color: white; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">
                Get ready for your best ever Dental Experience!
              </h1>
            </div>

            <!-- Divider -->
            <div class="elementor-element elementor-element-11b082d elementor-widget-divider--view-line elementor-widget elementor-widget-divider"
                 style="margin: 20px 0;">
              <div class="elementor-divider">
                <span class="elementor-divider-separator" style="display: block; width: 80px; height: 3px; background: #007cba; margin: 0 auto;"></span>
              </div>
            </div>

            <!-- Description -->
            <div class="elementor-element elementor-element-4348561 elementor-widget elementor-widget-text-editor"
                 style="margin: 20px 0 40px;">
              <p style="font-size: 18px; line-height: 1.6; color: white; max-width: 600px; margin: 0 auto; text-shadow: 1px 1px 2px rgba(0,0,0,0.5);">
                We use only the best quality materials on the market in order to provide the best products to our patients, So don't worry about anything and book yourself.
              </p>
            </div>

            <!-- CTA Buttons -->
            <div class="elementor-element elementor-element-421a3cf" style="display: flex; justify-content: center; gap: 20px; flex-wrap: wrap; margin-top: 30px;">

              <!-- Book Appointment Button -->
              <div class="elementor-element elementor-element-1fa27b8 mybuttonid elementor-widget elementor-widget-button">
                <a class="elementor-button elementor-button-link elementor-size-sm" href="#"
                   style="background: #007cba; color: white; padding: 15px 30px; border-radius: 30px; text-decoration: none; font-weight: 600; font-size: 16px; transition: all 0.3s; display: inline-block; box-shadow: 0 4px 15px rgba(0,124,186,0.3);">
                  <span class="elementor-button-content-wrapper">
                    <span class="elementor-button-text">Book an appointment</span>
                  </span>
                </a>
              </div>

              <!-- Emergency Contact -->
              <div class="elementor-element elementor-element-ad7d575 elementor-widget elementor-widget-icon-box"
                   style="display: flex; align-items: center; background: rgba(255,255,255,0.1); padding: 15px 25px; border-radius: 30px; backdrop-filter: blur(10px);">
                <div class="elementor-icon-box-wrapper" style="display: flex; align-items: center; gap: 15px;">
                  <div class="elementor-icon-box-icon">
                    <span class="elementor-icon" style="color: #007cba; font-size: 24px;">
                      <svg aria-hidden="true" class="e-font-icon-svg e-fas-phone-alt" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" style="width: 24px; height: 24px; fill: currentColor;">
                        <path d="M497.39 361.8l-112-48a24 24 0 0 0-28 6.9l-49.6 60.6A370.66 370.66 0 0 1 130.6 204.11l60.6-49.6a23.94 23.94 0 0 0 6.9-28l-48-112A24.16 24.16 0 0 0 122.6.61l-104 24A24 24 0 0 0 0 48c0 256.5 207.9 464 464 464a24 24 0 0 0 23.4-18.6l24-104a24.29 24.29 0 0 0-14.01-27.6z"></path>
                      </svg>
                    </span>
                  </div>
                  <div class="elementor-icon-box-content">
                    <p class="elementor-icon-box-title" style="margin: 0; font-size: 14px; font-weight: 600; color: white;">
                      <span>Dental 24H Emergency</span>
                    </p>
                    <p class="elementor-icon-box-description" style="margin: 0; font-size: 16px; font-weight: 700; color: #007cba;">
                      0900-78601
                    </p>
                  </div>
                </div>
              </div>

            </div>

          </div>

          <!-- Doctor Profile Card -->
          <div class="elementor-element elementor-element-a907a3e"
               style="position: absolute; bottom: 20px; right: 20px; background: rgba(255,255,255,0.95); padding: 20px; border-radius: 15px; backdrop-filter: blur(10px); box-shadow: 0 8px 25px rgba(0,0,0,0.1);">

            <!-- LinkedIn Icon -->
            <div class="elementor-element elementor-element-25e61e8" style="position: absolute; top: 10px; right: 10px;">
              <div class="elementor-icon-wrapper">
                <div class="elementor-icon" style="color: #0077b5;">
                  <svg aria-hidden="true" class="e-font-icon-svg e-fab-linkedin" viewBox="0 0 448 512" xmlns="http://www.w3.org/2000/svg" style="width: 20px; height: 20px; fill: currentColor;">
                    <path d="M416 32H31.9C14.3 32 0 46.5 0 64.3v383.4C0 465.5 14.3 480 31.9 480H416c17.6 0 32-14.5 32-32.3V64.3c0-17.8-14.4-32.3-32-32.3zM135.4 416H69V202.2h66.5V416zm-33.2-243c-21.3 0-38.5-17.3-38.5-38.5S80.9 96 102.2 96c21.2 0 38.5 17.3 38.5 38.5 0 21.3-17.2 38.5-38.5 38.5zm282.1 243h-66.4V312c0-24.8-.5-56.7-34.5-56.7-34.6 0-39.9 27-39.9 54.9V416h-66.4V202.2h63.7v29.2h.9c8.9-16.8 30.6-34.5 62.9-34.5 67.2 0 79.7 44.3 79.7 101.9V416z"></path>
                  </svg>
                </div>
              </div>
            </div>

            <!-- Doctor Profile -->
            <div class="elementor-element elementor-element-1b777d1 elementor-widget elementor-widget-image-box">
              <div class="elementor-image-box-wrapper" style="display: flex; align-items: center; gap: 15px;">
                <figure class="elementor-image-box-img">
                  <img decoding="async" width="80" height="80"
                       src="https://nahidmahmud.com/test-website/test01/wp-content/uploads/2025/09/da5ffa4125f625efa2f831a4adbaf7ca5ff1bfe7.png"
                       style="border-radius: 50%; width: 80px; height: 80px; object-fit: cover;" alt="Dr. Thomas Daniel">
                </figure>
                <div class="elementor-image-box-content">
                  <p class="elementor-image-box-title" style="margin: 0 0 5px; font-size: 18px; font-weight: 600; color: #333;">Thomas daniel</p>
                  <p class="elementor-image-box-description" style="margin: 0; font-size: 14px; color: #666;">Sr Dental</p>
                </div>
              </div>
            </div>

            <!-- Review Text -->
            <div class="elementor-element elementor-element-c3ff86f elementor-widget elementor-widget-text-editor" style="margin-top: 15px;">
              <p style="margin: 0; font-size: 14px; color: #555; font-style: italic;">
                "Top Quality dental treatment done by field experts, Highly Recommended for everyone"
              </p>
            </div>

          </div>

        </div>

        <style>
          @media (max-width: 768px) {
            .elementor-heading-title {
              font-size: 32px !important;
            }
            .elementor-element-421a3cf {
              flex-direction: column;
              align-items: center;
            }
            .elementor-element-a907a3e {
              position: relative !important;
              bottom: auto !important;
              right: auto !important;
              margin-top: 40px;
            }
          }

          .elementor-button:hover {
            background: #005a87 !important;
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(0,124,186,0.4) !important;
          }
        </style>

      </div>
    `
  },

  // 3. SERVICES SECTION WITH ICONS
  {
    id: 'dental-services-grid',
    name: 'Dental Services Grid',
    category: 'services',
    description: 'Three column services grid with icons, titles, descriptions and learn more buttons',
    tags: ['dental', 'services', 'icons', 'grid', 'treatments'],
    component: `
      <div class="elementor-element elementor-element-b0a6761 e-flex e-con-boxed e-con e-parent"
           style="background: #f8fafb; padding: 80px 0;">
        <div class="e-con-inner" style="max-width: 1200px; margin: 0 auto; padding: 0 20px;">

          <!-- Services Grid -->
          <div class="elementor-element elementor-element-057ebe0"
               style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px; align-items: start;">

            <!-- Service 1: Root Canal Treatment -->
            <div class="elementor-element elementor-element-a3f4423 e-con-full e-flex e-con e-child"
                 style="background: white; padding: 40px 30px; border-radius: 15px; box-shadow: 0 5px 20px rgba(0,0,0,0.1); text-align: center; transition: transform 0.3s;">

              <div class="elementor-element elementor-element-3c6eac3 elementor-widget elementor-widget-image-box">
                <div class="elementor-image-box-wrapper">
                  <figure class="elementor-image-box-img" style="margin-bottom: 25px;">
                    <img fetchpriority="high" decoding="async" width="235" height="234"
                         src="https://nahidmahmud.com/test-website/test01/wp-content/uploads/2025/09/home-icon-01.png"
                         class="attachment-full size-full wp-image-76" alt="Root Canal Treatment"
                         srcset="https://nahidmahmud.com/test-website/test01/wp-content/uploads/2025/09/home-icon-01.png 235w,
                                 https://nahidmahmud.com/test-website/test01/wp-content/uploads/2025/09/home-icon-01-150x150.png 150w"
                         sizes="(max-width: 235px) 100vw, 235px"
                         style="width: 120px; height: 120px; object-fit: contain; margin: 0 auto;">
                  </figure>
                  <div class="elementor-image-box-content">
                    <h4 class="elementor-image-box-title"
                        style="font-size: 24px; font-weight: 600; color: #333; margin: 0 0 15px; line-height: 1.3;">
                      Root Canal Treatment
                    </h4>
                    <p class="elementor-image-box-description"
                       style="font-size: 16px; color: #666; line-height: 1.6; margin: 0 0 25px;">
                      Root canal treatment (endodontics) is a dental procedure used to treat infection at the centre of a tooth.
                    </p>
                  </div>
                </div>
              </div>

              <div class="elementor-element elementor-element-8299fb8 elementor-widget elementor-widget-button">
                <a class="elementor-button elementor-button-link elementor-size-sm" href="#"
                   style="background: transparent; color: #007cba; border: 2px solid #007cba; padding: 12px 25px; border-radius: 25px; text-decoration: none; font-weight: 600; transition: all 0.3s; display: inline-flex; align-items: center; gap: 8px;">
                  <span class="elementor-button-content-wrapper" style="display: flex; align-items: center; gap: 8px;">
                    <span class="elementor-button-text">Learn More</span>
                    <span class="elementor-button-icon">
                      <svg aria-hidden="true" class="e-font-icon-svg e-fas-angle-right" viewBox="0 0 256 512" xmlns="http://www.w3.org/2000/svg" style="width: 12px; height: 12px; fill: currentColor;">
                        <path d="M224.3 273l-136 136c-9.4 9.4-24.6 9.4-33.9 0l-22.6-22.6c-9.4-9.4-9.4-24.6 0-33.9l96.4-96.4-96.4-96.4c-9.4-9.4-9.4-24.6 0-33.9L54.3 103c9.4-9.4 24.6-9.4 33.9 0l136 136c9.5 9.4 9.5 24.6.1 34z"></path>
                      </svg>
                    </span>
                  </span>
                </a>
              </div>
            </div>

            <!-- Service 2: Cosmetic Dentist -->
            <div class="elementor-element elementor-element-fe72413 e-con-full e-flex e-con e-child"
                 style="background: white; padding: 40px 30px; border-radius: 15px; box-shadow: 0 5px 20px rgba(0,0,0,0.1); text-align: center; transition: transform 0.3s;">

              <div class="elementor-element elementor-element-7dcd930 elementor-widget elementor-widget-image-box">
                <div class="elementor-image-box-wrapper">
                  <figure class="elementor-image-box-img" style="margin-bottom: 25px;">
                    <img loading="lazy" decoding="async" width="235" height="234"
                         src="https://nahidmahmud.com/test-website/test01/wp-content/uploads/2025/09/home-icon-02.png"
                         class="attachment-full size-full wp-image-77" alt="Cosmetic Dentist"
                         srcset="https://nahidmahmud.com/test-website/test01/wp-content/uploads/2025/09/home-icon-02.png 235w,
                                 https://nahidmahmud.com/test-website/test01/wp-content/uploads/2025/09/home-icon-02-150x150.png 150w"
                         sizes="(max-width: 235px) 100vw, 235px"
                         style="width: 120px; height: 120px; object-fit: contain; margin: 0 auto;">
                  </figure>
                  <div class="elementor-image-box-content">
                    <h4 class="elementor-image-box-title"
                        style="font-size: 24px; font-weight: 600; color: #333; margin: 0 0 15px; line-height: 1.3;">
                      Cosmetic Dentist
                    </h4>
                    <p class="elementor-image-box-description"
                       style="font-size: 16px; color: #666; line-height: 1.6; margin: 0 0 25px;">
                      Cosmetic dentistry is the branch of dentistry that focuses on improving the appearance of your smile.
                    </p>
                  </div>
                </div>
              </div>

              <div class="elementor-element elementor-element-2b36135 elementor-widget elementor-widget-button">
                <a class="elementor-button elementor-button-link elementor-size-sm" href="#"
                   style="background: transparent; color: #007cba; border: 2px solid #007cba; padding: 12px 25px; border-radius: 25px; text-decoration: none; font-weight: 600; transition: all 0.3s; display: inline-flex; align-items: center; gap: 8px;">
                  <span class="elementor-button-content-wrapper" style="display: flex; align-items: center; gap: 8px;">
                    <span class="elementor-button-text">Learn More</span>
                    <span class="elementor-button-icon">
                      <svg aria-hidden="true" class="e-font-icon-svg e-fas-angle-right" viewBox="0 0 256 512" xmlns="http://www.w3.org/2000/svg" style="width: 12px; height: 12px; fill: currentColor;">
                        <path d="M224.3 273l-136 136c-9.4 9.4-24.6 9.4-33.9 0l-22.6-22.6c-9.4-9.4-9.4-24.6 0-33.9l96.4-96.4-96.4-96.4c-9.4-9.4-9.4-24.6 0-33.9L54.3 103c9.4-9.4 24.6-9.4 33.9 0l136 136c9.5 9.4 9.5 24.6.1 34z"></path>
                      </svg>
                    </span>
                  </span>
                </a>
              </div>
            </div>

            <!-- Service 3: Dental Implants -->
            <div class="elementor-element elementor-element-7dcd5df e-con-full e-flex e-con e-child"
                 style="background: white; padding: 40px 30px; border-radius: 15px; box-shadow: 0 5px 20px rgba(0,0,0,0.1); text-align: center; transition: transform 0.3s;">

              <div class="elementor-element elementor-element-5b39a3a elementor-widget elementor-widget-image-box">
                <div class="elementor-image-box-wrapper">
                  <figure class="elementor-image-box-img" style="margin-bottom: 25px;">
                    <img loading="lazy" decoding="async" width="234" height="234"
                         src="https://nahidmahmud.com/test-website/test01/wp-content/uploads/2025/09/home-icon-03.png"
                         class="attachment-full size-full wp-image-78" alt="Dental Implants"
                         srcset="https://nahidmahmud.com/test-website/test01/wp-content/uploads/2025/09/home-icon-03.png 234w,
                                 https://nahidmahmud.com/test-website/test01/wp-content/uploads/2025/09/home-icon-03-150x150.png 150w"
                         sizes="(max-width: 234px) 100vw, 234px"
                         style="width: 120px; height: 120px; object-fit: contain; margin: 0 auto;">
                  </figure>
                  <div class="elementor-image-box-content">
                    <h4 class="elementor-image-box-title"
                        style="font-size: 24px; font-weight: 600; color: #333; margin: 0 0 15px; line-height: 1.3;">
                      Dental Implants
                    </h4>
                    <p class="elementor-image-box-description"
                       style="font-size: 16px; color: #666; line-height: 1.6; margin: 0 0 25px;">
                      A dental implant is an artificial tooth root that's placed into your jaw to hold a prosthetic tooth or bridge.
                    </p>
                  </div>
                </div>
              </div>

              <div class="elementor-element elementor-element-4a1a96d elementor-widget elementor-widget-button">
                <a class="elementor-button elementor-button-link elementor-size-sm" href="#"
                   style="background: transparent; color: #007cba; border: 2px solid #007cba; padding: 12px 25px; border-radius: 25px; text-decoration: none; font-weight: 600; transition: all 0.3s; display: inline-flex; align-items: center; gap: 8px;">
                  <span class="elementor-button-content-wrapper" style="display: flex; align-items: center; gap: 8px;">
                    <span class="elementor-button-text">Learn More</span>
                    <span class="elementor-button-icon">
                      <svg aria-hidden="true" class="e-font-icon-svg e-fas-angle-right" viewBox="0 0 256 512" xmlns="http://www.w3.org/2000/svg" style="width: 12px; height: 12px; fill: currentColor;">
                        <path d="M224.3 273l-136 136c-9.4 9.4-24.6 9.4-33.9 0l-22.6-22.6c-9.4-9.4-9.4-24.6 0-33.9l96.4-96.4-96.4-96.4c-9.4-9.4-9.4-24.6 0-33.9L54.3 103c9.4-9.4 24.6-9.4 33.9 0l136 136c9.5 9.4 9.5 24.6.1 34z"></path>
                      </svg>
                    </span>
                  </span>
                </a>
              </div>
            </div>

          </div>

        </div>

        <style>
          .e-con-full:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.15) !important;
          }

          .elementor-button:hover {
            background: #007cba !important;
            color: white !important;
            border-color: #007cba !important;
          }

          @media (max-width: 768px) {
            .elementor-element-057ebe0 {
              grid-template-columns: 1fr !important;
              gap: 20px !important;
            }
            .e-con-full {
              padding: 30px 20px !important;
            }
          }
        </style>

      </div>
    `
  },
  
  // 4. ABOUT US SECTION WITH CONTACT FORM
  {
    id: 'dental-about-contact',
    name: 'About Us with Contact Form',
    category: 'about',
    description: 'About section with description, contact form and feature image',
    tags: ['dental', 'about', 'contact', 'form', 'appointment'],
    component: `
      <div class="elementor-element elementor-element-b20f5a3 e-flex e-con-boxed e-con e-parent"
           style="padding: 80px 0; background: white;">
        <div class="e-con-inner" style="max-width: 1200px; margin: 0 auto; padding: 0 20px;">

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center;">

            <!-- Left Content -->
            <div class="elementor-element elementor-element-75734ee e-con-full e-flex e-con e-child">

              <!-- Heading -->
              <div class="elementor-element elementor-element-248c141 elementor-widget elementor-widget-heading">
                <h2 class="elementor-heading-title elementor-size-default"
                    style="font-size: 36px; font-weight: 700; color: #333; margin: 0 0 20px; line-height: 1.3;">
                  We're welcoming new patients and can't wait to meet you.
                </h2>
              </div>

              <!-- Divider -->
              <div class="elementor-element elementor-element-ac2e6ab elementor-widget-divider--view-line elementor-widget elementor-widget-divider"
                   style="margin: 20px 0;">
                <div class="elementor-divider">
                  <span class="elementor-divider-separator" style="display: block; width: 80px; height: 3px; background: #007cba;"></span>
                </div>
              </div>

              <!-- Description -->
              <div class="elementor-element elementor-element-0a7c6ed elementor-widget elementor-widget-text-editor"
                   style="margin: 20px 0 40px;">
                <p style="font-size: 16px; line-height: 1.6; color: #666; margin: 0;">
                  We use only the best quality materials on the market in order to provide the best products to our patients, So don't worry about anything and book yourself.
                </p>
              </div>

              <!-- Contact Form -->
              <div class="elementor-element elementor-element-3daab51 elementor-widget elementor-widget-form">
                <form class="elementor-form" method="post" name="New Form" aria-label="Contact Form"
                      style="background: #f8fafb; padding: 30px; border-radius: 15px; box-shadow: 0 5px 20px rgba(0,0,0,0.05);">
                  <input type="hidden" name="post_id" value="10">
                  <input type="hidden" name="form_id" value="3daab51">
                  <input type="hidden" name="referer_title" value="">
                  <input type="hidden" name="queried_id" value="10">

                  <div class="elementor-form-fields-wrapper"
                       style="display: flex; gap: 15px; align-items: flex-end;">

                    <!-- Phone Input -->
                    <div class="elementor-field-group" style="flex: 1;">
                      <label for="form-field-phone" class="elementor-field-label"
                             style="display: block; margin-bottom: 8px; font-weight: 600; color: #333; font-size: 14px;">
                        Enter your Phone Number
                      </label>
                      <input size="1" type="tel" name="form_fields[phone]" id="form-field-phone"
                             class="elementor-field elementor-size-md elementor-field-textual"
                             placeholder="Enter your Phone Number"
                             pattern="[0-9()#&+*-=.]+"
                             title="Only numbers and phone characters (#, -, *, etc) are accepted."
                             style="width: 100%; padding: 15px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 16px; transition: border-color 0.3s;">
                    </div>

                    <!-- Submit Button -->
                    <div class="elementor-field-group">
                      <button class="elementor-button elementor-size-sm" type="submit"
                              style="background: #007cba; color: white; border: none; padding: 15px 30px; border-radius: 8px; font-weight: 600; font-size: 16px; cursor: pointer; transition: all 0.3s;">
                        <span class="elementor-button-content-wrapper">
                          <span class="elementor-button-text">Submit</span>
                        </span>
                      </button>
                    </div>

                  </div>
                </form>
              </div>

            </div>

            <!-- Right Image -->
            <div class="elementor-element elementor-element-d54b122 e-con-full e-flex e-con e-child">
              <div class="elementor-element elementor-element-244b182 elementor-widget elementor-widget-image">
                <img loading="lazy" decoding="async" width="443" height="392"
                     src="https://nahidmahmud.com/test-website/test01/wp-content/uploads/2025/09/Group-1000001023.png"
                     class="attachment-full size-full wp-image-91" alt="Dental Practice"
                     srcset="https://nahidmahmud.com/test-website/test01/wp-content/uploads/2025/09/Group-1000001023.png 443w,
                             https://nahidmahmud.com/test-website/test01/wp-content/uploads/2025/09/Group-1000001023-300x265.png 300w"
                     sizes="(max-width: 443px) 100vw, 443px"
                     style="width: 100%; height: auto; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
              </div>
            </div>

          </div>

        </div>

        <style>
          .elementor-field:focus {
            border-color: #007cba !important;
            outline: none;
          }

          .elementor-button:hover {
            background: #005a87 !important;
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0,124,186,0.3);
          }

          @media (max-width: 768px) {
            div[style*="grid-template-columns"] {
              grid-template-columns: 1fr !important;
              gap: 40px !important;
            }
            .elementor-form-fields-wrapper {
              flex-direction: column !important;
              align-items: stretch !important;
            }
          }
        </style>

      </div>
    `
  },

  // 5. WHY CHOOSE US SECTION
  {
    id: 'dental-why-choose-us',
    name: 'Why Choose Us Section',
    category: 'about',
    description: 'Why choose us section with features list and call-to-action',
    tags: ['dental', 'features', 'benefits', 'trust', 'quality'],
    component: `
      <div class="elementor-element elementor-element-578d18b e-flex e-con-boxed e-con e-parent"
           style="background: #f8fafb; padding: 80px 0;">
        <div class="e-con-inner" style="max-width: 1200px; margin: 0 auto; padding: 0 20px;">

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center;">

            <!-- Left Side - Spacer/Background Element -->
            <div class="elementor-element elementor-element-fab45c2" style="position: relative;">
              <div class="elementor-element elementor-element-eb79c2d"
                   style="background: linear-gradient(135deg, #007cba 0%, #005a87 100%); border-radius: 20px; padding: 60px; position: relative; overflow: hidden;">

                <!-- Decorative Elements -->
                <div style="position: absolute; top: -20px; right: -20px; width: 100px; height: 100px; background: rgba(255,255,255,0.1); border-radius: 50%;"></div>
                <div style="position: absolute; bottom: -30px; left: -30px; width: 80px; height: 80px; background: rgba(255,255,255,0.1); border-radius: 50%;"></div>

                <div class="elementor-element elementor-element-8760bae elementor-widget elementor-widget-spacer">
                  <div class="elementor-spacer" style="height: 200px;">
                    <div class="elementor-spacer-inner"></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right Content -->
            <div class="elementor-element elementor-element-98cd553 e-con-full e-flex e-con e-child">

              <!-- Heading -->
              <div class="elementor-element elementor-element-5425698 elementor-widget elementor-widget-heading">
                <h2 class="elementor-heading-title elementor-size-default"
                    style="font-size: 36px; font-weight: 700; color: #333; margin: 0 0 20px; line-height: 1.3;">
                  Why choose Smile for all your dental treatments?
                </h2>
              </div>

              <!-- Divider -->
              <div class="elementor-element elementor-element-b454a7b elementor-widget-divider--view-line elementor-widget elementor-widget-divider"
                   style="margin: 20px 0;">
                <div class="elementor-divider">
                  <span class="elementor-divider-separator" style="display: block; width: 80px; height: 3px; background: #007cba;"></span>
                </div>
              </div>

              <!-- Description -->
              <div class="elementor-element elementor-element-46e24e4 elementor-widget elementor-widget-text-editor"
                   style="margin: 20px 0 30px;">
                <p style="font-size: 16px; line-height: 1.6; color: #666; margin: 0;">
                  We use only the best quality materials on the market in order to provide the best products to our patients.
                </p>
              </div>

              <!-- Features List -->
              <div class="elementor-element elementor-element-3abec23 elementor-widget elementor-widget-icon-list"
                   style="margin: 30px 0 40px;">
                <ul class="elementor-icon-list-items" style="list-style: none; padding: 0; margin: 0;">

                  <li class="elementor-icon-list-item" style="display: flex; align-items: center; margin-bottom: 20px;">
                    <span class="elementor-icon-list-icon" style="margin-right: 15px; color: #007cba;">
                      <svg aria-hidden="true" class="e-font-icon-svg e-fas-shield-alt" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" style="width: 20px; height: 20px; fill: currentColor;">
                        <path d="M466.5 83.7l-192-80a48.15 48.15 0 0 0-36.9 0l-192 80C27.7 91.1 16 108.6 16 128c0 198.5 114.5 335.7 221.5 380.3 11.8 4.9 25.1 4.9 36.9 0C360.1 472.6 496 349.3 496 128c0-19.4-11.7-36.9-29.5-44.3zM256.1 446.3l-.1-381 175.9 73.3c-3.3 151.4-82.1 261.1-175.8 307.7z"></path>
                      </svg>
                    </span>
                    <span class="elementor-icon-list-text" style="font-size: 16px; color: #333; font-weight: 500;">
                      Top quality dental team
                    </span>
                  </li>

                  <li class="elementor-icon-list-item" style="display: flex; align-items: center; margin-bottom: 20px;">
                    <span class="elementor-icon-list-icon" style="margin-right: 15px; color: #007cba;">
                      <svg aria-hidden="true" class="e-font-icon-svg e-fas-shield-alt" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" style="width: 20px; height: 20px; fill: currentColor;">
                        <path d="M466.5 83.7l-192-80a48.15 48.15 0 0 0-36.9 0l-192 80C27.7 91.1 16 108.6 16 128c0 198.5 114.5 335.7 221.5 380.3 11.8 4.9 25.1 4.9 36.9 0C360.1 472.6 496 349.3 496 128c0-19.4-11.7-36.9-29.5-44.3zM256.1 446.3l-.1-381 175.9 73.3c-3.3 151.4-82.1 261.1-175.8 307.7z"></path>
                      </svg>
                    </span>
                    <span class="elementor-icon-list-text" style="font-size: 16px; color: #333; font-weight: 500;">
                      State of the art dental services
                    </span>
                  </li>

                  <li class="elementor-icon-list-item" style="display: flex; align-items: center; margin-bottom: 20px;">
                    <span class="elementor-icon-list-icon" style="margin-right: 15px; color: #007cba;">
                      <svg aria-hidden="true" class="e-font-icon-svg e-fas-shield-alt" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" style="width: 20px; height: 20px; fill: currentColor;">
                        <path d="M466.5 83.7l-192-80a48.15 48.15 0 0 0-36.9 0l-192 80C27.7 91.1 16 108.6 16 128c0 198.5 114.5 335.7 221.5 380.3 11.8 4.9 25.1 4.9 36.9 0C360.1 472.6 496 349.3 496 128c0-19.4-11.7-36.9-29.5-44.3zM256.1 446.3l-.1-381 175.9 73.3c-3.3 151.4-82.1 261.1-175.8 307.7z"></path>
                      </svg>
                    </span>
                    <span class="elementor-icon-list-text" style="font-size: 16px; color: #333; font-weight: 500;">
                      Discount on all dental treatment
                    </span>
                  </li>

                  <li class="elementor-icon-list-item" style="display: flex; align-items: center; margin-bottom: 20px;">
                    <span class="elementor-icon-list-icon" style="margin-right: 15px; color: #007cba;">
                      <svg aria-hidden="true" class="e-font-icon-svg e-fas-shield-alt" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" style="width: 20px; height: 20px; fill: currentColor;">
                        <path d="M466.5 83.7l-192-80a48.15 48.15 0 0 0-36.9 0l-192 80C27.7 91.1 16 108.6 16 128c0 198.5 114.5 335.7 221.5 380.3 11.8 4.9 25.1 4.9 36.9 0C360.1 472.6 496 349.3 496 128c0-19.4-11.7-36.9-29.5-44.3zM256.1 446.3l-.1-381 175.9 73.3c-3.3 151.4-82.1 261.1-175.8 307.7z"></path>
                      </svg>
                    </span>
                    <span class="elementor-icon-list-text" style="font-size: 16px; color: #333; font-weight: 500;">
                      Enrollment is quick and easy
                    </span>
                  </li>

                </ul>
              </div>

              <!-- CTA Button -->
              <div class="elementor-element elementor-element-4bf8c51 elementor-widget elementor-widget-button">
                <a class="elementor-button elementor-button-link elementor-size-sm" href="#"
                   style="background: #007cba; color: white; padding: 15px 30px; border-radius: 30px; text-decoration: none; font-weight: 600; font-size: 16px; display: inline-block; transition: all 0.3s; box-shadow: 0 4px 15px rgba(0,124,186,0.3);">
                  <span class="elementor-button-content-wrapper">
                    <span class="elementor-button-text">Book an appointment</span>
                  </span>
                </a>
              </div>

            </div>

          </div>

        </div>

        <style>
          .elementor-button:hover {
            background: #005a87 !important;
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(0,124,186,0.4) !important;
          }

          @media (max-width: 768px) {
            div[style*="grid-template-columns"] {
              grid-template-columns: 1fr !important;
              gap: 40px !important;
            }
          }
        </style>

      </div>
    `
  },

  // 6. ANOTHER ABOUT SECTION WITH IMAGE
  {
    id: 'dental-about-image',
    name: 'About Section with Side Image',
    category: 'about',
    description: 'About section with call-to-action and side illustration',
    tags: ['dental', 'about', 'cta', 'image', 'professional'],
    component: `
      <div class="elementor-element elementor-element-9c54ca8 e-flex e-con-boxed e-con e-parent"
           style="padding: 80px 0; background: white;">
        <div class="e-con-inner" style="max-width: 1200px; margin: 0 auto; padding: 0 20px;">

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center;">

            <!-- Left Content -->
            <div class="elementor-element elementor-element-5a70f11 e-con-full e-flex e-con e-child">

              <!-- Heading -->
              <div class="elementor-element elementor-element-638da34 elementor-widget elementor-widget-heading">
                <h2 class="elementor-heading-title elementor-size-default"
                    style="font-size: 36px; font-weight: 700; color: #333; margin: 0 0 20px; line-height: 1.3;">
                  Leave your worries at the door and enjoy a healthier, more precise smile
                </h2>
              </div>

              <!-- Divider -->
              <div class="elementor-element elementor-element-c72bc76 elementor-widget-divider--view-line elementor-widget elementor-widget-divider"
                   style="margin: 20px 0;">
                <div class="elementor-divider">
                  <span class="elementor-divider-separator" style="display: block; width: 80px; height: 3px; background: #007cba;"></span>
                </div>
              </div>

              <!-- Description -->
              <div class="elementor-element elementor-element-83280d7 elementor-widget elementor-widget-text-editor"
                   style="margin: 20px 0 40px;">
                <p style="font-size: 16px; line-height: 1.6; color: #666; margin: 0;">
                  We use only the best quality materials on the market in order to provide the best products to our patients, So don't worry about anything and book yourself.
                </p>
              </div>

              <!-- CTA Button -->
              <div class="elementor-element elementor-element-bb4bd57 elementor-widget elementor-widget-button">
                <a class="elementor-button elementor-button-link elementor-size-sm" href="#"
                   style="background: #007cba; color: white; padding: 15px 30px; border-radius: 30px; text-decoration: none; font-weight: 600; font-size: 16px; display: inline-block; transition: all 0.3s; box-shadow: 0 4px 15px rgba(0,124,186,0.3);">
                  <span class="elementor-button-content-wrapper">
                    <span class="elementor-button-text">Book an appointment</span>
                  </span>
                </a>
              </div>

            </div>

            <!-- Right Image -->
            <div class="elementor-element elementor-element-6ae866d e-con-full e-flex e-con e-child">
              <div class="elementor-element elementor-element-06cfc9d elementor-widget elementor-widget-image">
                <img loading="lazy" decoding="async" width="441" height="358"
                     src="https://nahidmahmud.com/test-website/test01/wp-content/uploads/2025/09/Group-1000001024.png"
                     class="attachment-full size-full wp-image-108" alt="Dental Treatment"
                     srcset="https://nahidmahmud.com/test-website/test01/wp-content/uploads/2025/09/Group-1000001024.png 441w,
                             https://nahidmahmud.com/test-website/test01/wp-content/uploads/2025/09/Group-1000001024-300x244.png 300w"
                     sizes="(max-width: 441px) 100vw, 441px"
                     style="width: 100%; height: auto; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
              </div>
            </div>

          </div>

        </div>

        <style>
          .elementor-button:hover {
            background: #005a87 !important;
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(0,124,186,0.4) !important;
          }

          @media (max-width: 768px) {
            div[style*="grid-template-columns"] {
              grid-template-columns: 1fr !important;
              gap: 40px !important;
            }
          }
        </style>

      </div>
    `
  },

  // 7. VIDEO SECTION WITH YOUTUBE EMBED
  {
    id: 'dental-video-section',
    name: 'Video Section with YouTube Embed',
    category: 'video',
    description: 'Video section with YouTube embed and custom overlay image',
    tags: ['dental', 'video', 'youtube', 'testimonial', 'practice'],
    component: `
      <div class="elementor-element elementor-element-607509a e-flex e-con-boxed e-con e-parent"
           style="padding: 80px 0; background: #f8fafb;">
        <div class="e-con-inner" style="max-width: 1200px; margin: 0 auto; padding: 0 20px;">

          <div class="elementor-element elementor-element-3f2ab1e e-con-full e-flex e-con e-child" style="text-align: center;">

            <!-- Heading -->
            <div class="elementor-element elementor-element-2882bb4 elementor-widget elementor-widget-heading" style="margin-bottom: 20px;">
              <h2 class="elementor-heading-title elementor-size-default"
                  style="font-size: 36px; font-weight: 700; color: #333; margin: 0; line-height: 1.3;">
                We're welcoming new patients and can't wait to meet you.
              </h2>
            </div>

            <!-- Description -->
            <div class="elementor-element elementor-element-a518936 elementor-widget elementor-widget-text-editor"
                 style="margin: 20px 0 30px;">
              <p style="font-size: 16px; line-height: 1.6; color: #666; margin: 0; max-width: 600px; margin: 0 auto;">
                We use only the best quality materials on the market in order to provide the best products to our patients.
              </p>
            </div>

            <!-- Divider -->
            <div class="elementor-element elementor-element-2f06926 elementor-widget-divider--view-line elementor-widget elementor-widget-divider"
                 style="margin: 30px 0 50px;">
              <div class="elementor-divider">
                <span class="elementor-divider-separator" style="display: block; width: 80px; height: 3px; background: #007cba; margin: 0 auto;"></span>
              </div>
            </div>

            <!-- Video Section -->
            <div class="elementor-element elementor-element-5db5109 e-con-full e-flex e-con e-child" style="max-width: 800px; margin: 0 auto;">
              <div class="elementor-element elementor-element-086826a elementor-widget elementor-widget-video">

                <!-- Video Container with Overlay -->
                <div class="elementor-wrapper elementor-open-lightbox" style="position: relative; border-radius: 15px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.2);">

                  <!-- Custom Video Overlay -->
                  <div class="elementor-custom-embed-image-overlay"
                       style="position: relative; cursor: pointer; background: linear-gradient(45deg, rgba(0,124,186,0.8), rgba(0,90,135,0.9)); transition: all 0.3s;"
                       onclick="openVideo('https://www.youtube-nocookie.com/embed/26OY4qqrh4A?autoplay=1&feature=oembed')">

                    <img loading="lazy" decoding="async" width="1064" height="452"
                         src="https://nahidmahmud.com/test-website/test01/wp-content/uploads/2025/09/Group-1000001015.png"
                         class="attachment-full size-full wp-image-122" alt="Video Thumbnail"
                         srcset="https://nahidmahmud.com/test-website/test01/wp-content/uploads/2025/09/Group-1000001015.png 1064w,
                                 https://nahidmahmud.com/test-website/test01/wp-content/uploads/2025/09/Group-1000001015-300x127.png 300w,
                                 https://nahidmahmud.com/test-website/test01/wp-content/uploads/2025/09/Group-1000001015-1024x435.png 1024w,
                                 https://nahidmahmud.com/test-website/test01/wp-content/uploads/2025/09/Group-1000001015-768x326.png 768w"
                         sizes="(max-width: 1064px) 100vw, 1064px"
                         style="width: 100%; height: auto; display: block; mix-blend-mode: overlay;">

                    <!-- Play Button Overlay -->
                    <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 10;">
                      <div style="width: 80px; height: 80px; background: rgba(255,255,255,0.9); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 5px 20px rgba(0,0,0,0.3); transition: all 0.3s; cursor: pointer;"
                           onmouseover="this.style.transform='scale(1.1)'; this.style.background='white';"
                           onmouseout="this.style.transform='scale(1)'; this.style.background='rgba(255,255,255,0.9)';">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M8 5V19L19 12L8 5Z" fill="#007cba" stroke="#007cba" stroke-width="2" stroke-linejoin="round"/>
                        </svg>
                      </div>
                    </div>

                    <!-- Video Title Overlay -->
                    <div style="position: absolute; bottom: 20px; left: 20px; right: 20px; color: white; z-index: 10;">
                      <h3 style="margin: 0; font-size: 20px; font-weight: 600; text-shadow: 2px 2px 4px rgba(0,0,0,0.7);">
                        Watch Our Dental Practice Tour
                      </h3>
                      <p style="margin: 5px 0 0; font-size: 14px; opacity: 0.9; text-shadow: 1px 1px 2px rgba(0,0,0,0.7);">
                        See our state-of-the-art facilities and meet our team
                      </p>
                    </div>

                  </div>

                </div>

              </div>

              <!-- Watch Playlist Button -->
              <div class="elementor-element elementor-element-b537a4a elementor-widget elementor-widget-button" style="margin-top: 30px;">
                <a class="elementor-button elementor-button-link elementor-size-sm" href="#"
                   style="background: transparent; color: #007cba; border: 2px solid #007cba; padding: 12px 25px; border-radius: 25px; text-decoration: none; font-weight: 600; transition: all 0.3s; display: inline-block;">
                  <span class="elementor-button-content-wrapper">
                    <span class="elementor-button-text">Watch Playlist</span>
                  </span>
                </a>
              </div>

            </div>

          </div>

        </div>

        <!-- Video Modal -->
        <div id="videoModal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.9); z-index: 10000; align-items: center; justify-content: center;">
          <div style="position: relative; width: 90%; max-width: 800px;">
            <button onclick="closeVideo()" style="position: absolute; top: -40px; right: 0; background: none; border: none; color: white; font-size: 30px; cursor: pointer; z-index: 10001;">&times;</button>
            <iframe id="videoFrame" width="100%" height="450" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
          </div>
        </div>

        <style>
          .elementor-custom-embed-image-overlay:hover {
            transform: scale(1.02);
          }

          .elementor-button:hover {
            background: #007cba !important;
            color: white !important;
            border-color: #007cba !important;
          }

          @media (max-width: 768px) {
            .elementor-heading-title {
              font-size: 28px !important;
            }
            #videoModal iframe {
              height: 250px !important;
            }
          }
        </style>

        <script>
          function openVideo(url) {
            const modal = document.getElementById('videoModal');
            const frame = document.getElementById('videoFrame');
            frame.src = url;
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
          }

          function closeVideo() {
            const modal = document.getElementById('videoModal');
            const frame = document.getElementById('videoFrame');
            frame.src = '';
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
          }

          // Close modal when clicking outside
          document.getElementById('videoModal').addEventListener('click', function(e) {
            if (e.target === this) {
              closeVideo();
            }
          });

          // Close modal on escape key
          document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
              closeVideo();
            }
          });
        </script>

      </div>
    `
  },

  // 8. TEAM SPECIALISTS SECTION
  {
    id: 'dental-team-specialists',
    name: 'Meet Our Specialists',
    category: 'team',
    description: 'Team section showing dental specialists with names and titles',
    tags: ['dental', 'team', 'doctors', 'specialists', 'staff'],
    component: `
      <div class="elementor-element elementor-element-4f657fb e-flex e-con-boxed e-con e-parent"
           style="background: white; padding: 80px 0;">
        <div class="e-con-inner" style="max-width: 1200px; margin: 0 auto; padding: 0 20px;">

          <!-- Section Header -->
          <div class="elementor-element elementor-element-777e43b e-con-full e-flex e-con e-child" style="text-center; margin-bottom: 60px;">

            <!-- Heading -->
            <div class="elementor-element elementor-element-c77acff elementor-widget elementor-widget-heading">
              <h2 class="elementor-heading-title elementor-size-default"
                  style="font-size: 36px; font-weight: 700; color: #333; margin: 0 0 20px; line-height: 1.3;">
                Meet our specialists
              </h2>
            </div>

            <!-- Description -->
            <div class="elementor-element elementor-element-63effda elementor-widget elementor-widget-text-editor"
                 style="margin: 20px 0 30px;">
              <p style="font-size: 16px; line-height: 1.6; color: #666; margin: 0; max-width: 600px; margin: 0 auto;">
                We use only the best quality materials on the market in order to provide the best products to our patients.
              </p>
            </div>

            <!-- Divider -->
            <div class="elementor-element elementor-element-111fc32 elementor-widget-divider--view-line elementor-widget elementor-widget-divider"
                 style="margin: 30px 0;">
              <div class="elementor-divider">
                <span class="elementor-divider-separator" style="display: block; width: 80px; height: 3px; background: #007cba; margin: 0 auto;"></span>
              </div>
            </div>

          </div>

          <!-- Team Grid -->
          <div class="elementor-element elementor-element-0ac75b5"
               style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 30px; margin-bottom: 50px;">

            <!-- Team Member 1: Jim Carry -->
            <div class="elementor-element elementor-element-a7275bf team-member"
                 style="background: linear-gradient(135deg, #007cba 0%, #005a87 100%); border-radius: 20px; padding: 40px 30px; text-align: center; color: white; position: relative; overflow: hidden; transition: transform 0.3s; box-shadow: 0 5px 20px rgba(0,124,186,0.2);">

              <!-- Background Pattern -->
              <div style="position: absolute; top: -20px; right: -20px; width: 100px; height: 100px; background: rgba(255,255,255,0.1); border-radius: 50%;"></div>
              <div style="position: absolute; bottom: -30px; left: -30px; width: 80px; height: 80px; background: rgba(255,255,255,0.1); border-radius: 50%;"></div>

              <div class="elementor-widget elementor-widget-image-box" style="position: relative; z-index: 2;">
                <div class="elementor-image-box-wrapper">
                  <div class="elementor-image-box-content">
                    <p class="elementor-image-box-title" style="margin: 0 0 10px; font-size: 24px; font-weight: 600; color: white;">
                      Jim Carry
                    </p>
                    <p class="elementor-image-box-description" style="margin: 0; font-size: 16px; color: rgba(255,255,255,0.9);">
                      Orthodontist
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Team Member 2: Wade Warren -->
            <div class="elementor-element elementor-element-2cb5c64 team-member"
                 style="background: linear-gradient(135deg, #28a745 0%, #1e7e34 100%); border-radius: 20px; padding: 40px 30px; text-align: center; color: white; position: relative; overflow: hidden; transition: transform 0.3s; box-shadow: 0 5px 20px rgba(40,167,69,0.2);">

              <!-- Background Pattern -->
              <div style="position: absolute; top: -20px; right: -20px; width: 100px; height: 100px; background: rgba(255,255,255,0.1); border-radius: 50%;"></div>
              <div style="position: absolute; bottom: -30px; left: -30px; width: 80px; height: 80px; background: rgba(255,255,255,0.1); border-radius: 50%;"></div>

              <div class="elementor-widget elementor-widget-image-box" style="position: relative; z-index: 2;">
                <div class="elementor-image-box-wrapper">
                  <div class="elementor-image-box-content">
                    <p class="elementor-image-box-title" style="margin: 0 0 10px; font-size: 24px; font-weight: 600; color: white;">
                      Wade Warren
                    </p>
                    <p class="elementor-image-box-description" style="margin: 0; font-size: 16px; color: rgba(255,255,255,0.9);">
                      Endodontist
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Team Member 3: Jenny Wilson -->
            <div class="elementor-element elementor-element-5c9ada6 team-member"
                 style="background: linear-gradient(135deg, #dc3545 0%, #a71e2a 100%); border-radius: 20px; padding: 40px 30px; text-align: center; color: white; position: relative; overflow: hidden; transition: transform 0.3s; box-shadow: 0 5px 20px rgba(220,53,69,0.2);">

              <!-- Background Pattern -->
              <div style="position: absolute; top: -20px; right: -20px; width: 100px; height: 100px; background: rgba(255,255,255,0.1); border-radius: 50%;"></div>
              <div style="position: absolute; bottom: -30px; left: -30px; width: 80px; height: 80px; background: rgba(255,255,255,0.1); border-radius: 50%;"></div>

              <div class="elementor-widget elementor-widget-image-box" style="position: relative; z-index: 2;">
                <div class="elementor-image-box-wrapper">
                  <div class="elementor-image-box-content">
                    <p class="elementor-image-box-title" style="margin: 0 0 10px; font-size: 24px; font-weight: 600; color: white;">
                      Jenny Wilson
                    </p>
                    <p class="elementor-image-box-description" style="margin: 0; font-size: 16px; color: rgba(255,255,255,0.9);">
                      Periodontist
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Team Member 4: Jacob Jones -->
            <div class="elementor-element elementor-element-2f32b90 team-member"
                 style="background: linear-gradient(135deg, #fd7e14 0%, #e8590c 100%); border-radius: 20px; padding: 40px 30px; text-align: center; color: white; position: relative; overflow: hidden; transition: transform 0.3s; box-shadow: 0 5px 20px rgba(253,126,20,0.2);">

              <!-- Background Pattern -->
              <div style="position: absolute; top: -20px; right: -20px; width: 100px; height: 100px; background: rgba(255,255,255,0.1); border-radius: 50%;"></div>
              <div style="position: absolute; bottom: -30px; left: -30px; width: 80px; height: 80px; background: rgba(255,255,255,0.1); border-radius: 50%;"></div>

              <div class="elementor-widget elementor-widget-image-box" style="position: relative; z-index: 2;">
                <div class="elementor-image-box-wrapper">
                  <div class="elementor-image-box-content">
                    <p class="elementor-image-box-title" style="margin: 0 0 10px; font-size: 24px; font-weight: 600; color: white;">
                      Jacob Jones
                    </p>
                    <p class="elementor-image-box-description" style="margin: 0; font-size: 16px; color: rgba(255,255,255,0.9);">
                      Pediatric Dentist
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <!-- Contact Us Button -->
          <div class="elementor-element elementor-element-7ea6673 e-con-full e-flex e-con e-child" style="text-align: center;">
            <div class="elementor-element elementor-element-c9b616f elementor-widget elementor-widget-button">
              <a class="elementor-button elementor-button-link elementor-size-sm" href="#"
                 style="background: #007cba; color: white; padding: 15px 30px; border-radius: 30px; text-decoration: none; font-weight: 600; font-size: 16px; display: inline-block; transition: all 0.3s; box-shadow: 0 4px 15px rgba(0,124,186,0.3);">
                <span class="elementor-button-content-wrapper">
                  <span class="elementor-button-text">Contact Us</span>
                </span>
              </a>
            </div>
          </div>

        </div>

        <style>
          .team-member:hover {
            transform: translateY(-10px);
            box-shadow: 0 15px 40px rgba(0,0,0,0.3) !important;
          }

          .elementor-button:hover {
            background: #005a87 !important;
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(0,124,186,0.4) !important;
          }

          @media (max-width: 768px) {
            .elementor-element-0ac75b5 {
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)) !important;
              gap: 20px !important;
            }
            .team-member {
              padding: 30px 20px !important;
            }
          }
        </style>

      </div>
    `
  },

  // 9. TESTIMONIALS CAROUSEL SECTION
  {
    id: 'dental-testimonials-carousel',
    name: 'Patient Testimonials Carousel',
    category: 'testimonials',
    description: 'Testimonials section with carousel showing patient reviews and photos',
    tags: ['dental', 'testimonials', 'reviews', 'patients', 'carousel'],
    component: `
      <div class="elementor-element elementor-element-467d1c8 e-flex e-con-boxed e-con e-parent"
           style="background: #f8fafb; padding: 80px 0;">
        <div class="e-con-inner" style="max-width: 1200px; margin: 0 auto; padding: 0 20px;">

          <!-- Section Header -->
          <div class="elementor-element elementor-element-a229e20 e-con-full e-flex e-con e-child" style="text-center; margin-bottom: 60px;">

            <!-- Heading -->
            <div class="elementor-element elementor-element-ac0e0e9 elementor-widget elementor-widget-heading">
              <h2 class="elementor-heading-title elementor-size-default"
                  style="font-size: 36px; font-weight: 700; color: #333; margin: 0 0 20px; line-height: 1.3;">
                Our Happy Clients
              </h2>
            </div>

            <!-- Description -->
            <div class="elementor-element elementor-element-0f41700 elementor-widget elementor-widget-text-editor"
                 style="margin: 20px 0 30px;">
              <p style="font-size: 16px; line-height: 1.6; color: #666; margin: 0; max-width: 600px; margin: 0 auto;">
                We use only the best quality materials on the market in order to provide the best products to our patients.
              </p>
            </div>

            <!-- Divider -->
            <div class="elementor-element elementor-element-22f2d50 elementor-widget-divider--view-line elementor-widget elementor-widget-divider"
                 style="margin: 30px 0;">
              <div class="elementor-divider">
                <span class="elementor-divider-separator" style="display: block; width: 80px; height: 3px; background: #007cba; margin: 0 auto;"></span>
              </div>
            </div>

          </div>

          <!-- Testimonials Carousel -->
          <div class="elementor-element elementor-element-45a7fcd e-con-full e-flex e-con e-child">
            <div class="elementor-element elementor-element-85da5e9 elementor-testimonial--align-left elementor-widget elementor-widget-testimonial-carousel">

              <!-- Carousel Container -->
              <div class="elementor-main-swiper" style="position: relative;">

                <!-- Testimonials Wrapper -->
                <div class="swiper-wrapper" style="display: flex; gap: 30px; overflow-x: auto; scroll-snap-type: x mandatory; padding: 20px 0;">

                  <!-- Testimonial 1: Thomas Daniel -->
                  <div class="swiper-slide" style="background: white; border-radius: 20px; padding: 40px; box-shadow: 0 5px 20px rgba(0,0,0,0.1); scroll-snap-align: start; min-width: 350px; flex-shrink: 0;">
                    <div class="elementor-testimonial">

                      <!-- Testimonial Content -->
                      <div class="elementor-testimonial__content" style="margin-bottom: 30px;">
                        <div class="elementor-testimonial__text" style="font-size: 16px; line-height: 1.6; color: #555; font-style: italic; position: relative;">
                          <span style="font-size: 40px; color: #007cba; position: absolute; top: -10px; left: -10px; line-height: 1;">"</span>
                          <span style="margin-left: 20px;">Phosfluorescently synergize covalent outsourcing through functional strategic theme areas. Assertively scale strategic portals without distinctive relationships. Holisticly cultivate tactical e-services before fully researched sources.</span>
                          <span style="font-size: 40px; color: #007cba; position: absolute; bottom: -20px; right: 10px; line-height: 1;">"</span>
                        </div>
                      </div>

                      <!-- Testimonial Footer -->
                      <div class="elementor-testimonial__footer" style="display: flex; align-items: center; gap: 20px;">
                        <div class="elementor-testimonial__image">
                          <img decoding="async"
                               src="https://nahidmahmud.com/test-website/test01/wp-content/uploads/2025/09/b975d5f032ce69088d77649eb3e7f873ba6bd336.jpg"
                               alt="Thomas Daniel"
                               style="width: 60px; height: 60px; border-radius: 50%; object-fit: cover; border: 3px solid #007cba;">
                        </div>
                        <cite class="elementor-testimonial__cite" style="font-style: normal;">
                          <span class="elementor-testimonial__name" style="display: block; font-size: 18px; font-weight: 600; color: #333; margin-bottom: 5px;">Thomas Daniel</span>
                          <span class="elementor-testimonial__title" style="font-size: 14px; color: #666;">CEO</span>
                        </cite>
                      </div>

                    </div>
                  </div>

                  <!-- Testimonial 2: Alena Alex -->
                  <div class="swiper-slide" style="background: white; border-radius: 20px; padding: 40px; box-shadow: 0 5px 20px rgba(0,0,0,0.1); scroll-snap-align: start; min-width: 350px; flex-shrink: 0;">
                    <div class="elementor-testimonial">

                      <!-- Testimonial Content -->
                      <div class="elementor-testimonial__content" style="margin-bottom: 30px;">
                        <div class="elementor-testimonial__text" style="font-size: 16px; line-height: 1.6; color: #555; font-style: italic; position: relative;">
                          <span style="font-size: 40px; color: #007cba; position: absolute; top: -10px; left: -10px; line-height: 1;">"</span>
                          <span style="margin-left: 20px;">Phosfluorescently synergize covalent outsourcing through functional strategic theme areas. Assertively scale strategic portals without distinctive relationships. Holisticly cultivate tactical e-services before fully researched sources.</span>
                          <span style="font-size: 40px; color: #007cba; position: absolute; bottom: -20px; right: 10px; line-height: 1;">"</span>
                        </div>
                      </div>

                      <!-- Testimonial Footer -->
                      <div class="elementor-testimonial__footer" style="display: flex; align-items: center; gap: 20px;">
                        <div class="elementor-testimonial__image">
                          <img decoding="async"
                               src="https://nahidmahmud.com/test-website/test01/wp-content/uploads/2025/09/738e6e77a92971e6075b85d18be0de93205d90cb.jpg"
                               alt="Alena Alex"
                               style="width: 60px; height: 60px; border-radius: 50%; object-fit: cover; border: 3px solid #007cba;">
                        </div>
                        <cite class="elementor-testimonial__cite" style="font-style: normal;">
                          <span class="elementor-testimonial__name" style="display: block; font-size: 18px; font-weight: 600; color: #333; margin-bottom: 5px;">Alena Alex</span>
                          <span class="elementor-testimonial__title" style="font-size: 14px; color: #666;">CEO</span>
                        </cite>
                      </div>

                    </div>
                  </div>

                  <!-- Testimonial 3: Thomas Edison -->
                  <div class="swiper-slide" style="background: white; border-radius: 20px; padding: 40px; box-shadow: 0 5px 20px rgba(0,0,0,0.1); scroll-snap-align: start; min-width: 350px; flex-shrink: 0;">
                    <div class="elementor-testimonial">

                      <!-- Testimonial Content -->
                      <div class="elementor-testimonial__content" style="margin-bottom: 30px;">
                        <div class="elementor-testimonial__text" style="font-size: 16px; line-height: 1.6; color: #555; font-style: italic; position: relative;">
                          <span style="font-size: 40px; color: #007cba; position: absolute; top: -10px; left: -10px; line-height: 1;">"</span>
                          <span style="margin-left: 20px;">Phosfluorescently synergize covalent outsourcing through functional strategic theme areas. Assertively scale strategic portals without distinctive relationships. Holisticly cultivate tactical e-services before fully researched sources.</span>
                          <span style="font-size: 40px; color: #007cba; position: absolute; bottom: -20px; right: 10px; line-height: 1;">"</span>
                        </div>
                      </div>

                      <!-- Testimonial Footer -->
                      <div class="elementor-testimonial__footer" style="display: flex; align-items: center; gap: 20px;">
                        <div class="elementor-testimonial__image">
                          <img decoding="async"
                               src="https://nahidmahmud.com/test-website/test01/wp-content/uploads/2025/09/738e6e77a92971e6075b85d18be0de93205d90cb.jpg"
                               alt="Thomas Edison"
                               style="width: 60px; height: 60px; border-radius: 50%; object-fit: cover; border: 3px solid #007cba;">
                        </div>
                        <cite class="elementor-testimonial__cite" style="font-style: normal;">
                          <span class="elementor-testimonial__name" style="display: block; font-size: 18px; font-weight: 600; color: #333; margin-bottom: 5px;">Thomas Edison</span>
                          <span class="elementor-testimonial__title" style="font-size: 14px; color: #666;">CEO</span>
                        </cite>
                      </div>

                    </div>
                  </div>

                </div>

                <!-- Navigation Arrows -->
                <div class="elementor-swiper-button elementor-swiper-button-prev"
                     style="position: absolute; left: -50px; top: 50%; transform: translateY(-50%); width: 40px; height: 40px; background: white; border-radius: 50%; box-shadow: 0 3px 10px rgba(0,0,0,0.2); display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 10; transition: all 0.3s;"
                     onclick="scrollTestimonials('prev')">
                  <svg aria-hidden="true" class="e-font-icon-svg e-eicon-chevron-left" viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg" style="width: 16px; height: 16px; fill: #007cba;">
                    <path d="M646 125C629 125 613 133 604 142L308 442C296 454 292 471 292 487 292 504 296 521 308 533L604 854C617 867 629 875 646 875 663 875 679 871 692 858 704 846 713 829 713 812 713 796 708 779 692 767L438 487 692 225C700 217 708 204 708 187 708 171 704 154 692 142 675 129 663 125 646 125Z"></path>
                  </svg>
                </div>

                <div class="elementor-swiper-button elementor-swiper-button-next"
                     style="position: absolute; right: -50px; top: 50%; transform: translateY(-50%); width: 40px; height: 40px; background: white; border-radius: 50%; box-shadow: 0 3px 10px rgba(0,0,0,0.2); display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 10; transition: all 0.3s;"
                     onclick="scrollTestimonials('next')">
                  <svg aria-hidden="true" class="e-font-icon-svg e-eicon-chevron-right" viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg" style="width: 16px; height: 16px; fill: #007cba;">
                    <path d="M696 533C708 521 713 504 713 487 713 471 708 454 696 446L400 146C388 133 375 125 354 125 338 125 325 129 313 142 300 154 292 171 292 187 292 204 296 221 308 233L563 492 304 771C292 783 288 800 288 817 288 833 296 850 308 863 321 871 338 875 354 875 371 875 388 867 400 854L696 533Z"></path>
                  </svg>
                </div>

                <!-- Pagination Dots -->
                <div class="swiper-pagination"
                     style="display: flex; justify-content: center; gap: 10px; margin-top: 40px;">
                  <span class="swiper-pagination-bullet" style="width: 12px; height: 12px; background: #007cba; border-radius: 50%; cursor: pointer; opacity: 1;" onclick="goToSlide(0)"></span>
                  <span class="swiper-pagination-bullet" style="width: 12px; height: 12px; background: #ddd; border-radius: 50%; cursor: pointer;" onclick="goToSlide(1)"></span>
                  <span class="swiper-pagination-bullet" style="width: 12px; height: 12px; background: #ddd; border-radius: 50%; cursor: pointer;" onclick="goToSlide(2)"></span>
                </div>

              </div>

            </div>
          </div>

        </div>

        <style>
          .swiper-slide:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.15) !important;
          }

          .elementor-swiper-button:hover {
            background: #007cba !important;
          }

          .elementor-swiper-button:hover svg {
            fill: white !important;
          }

          .swiper-wrapper::-webkit-scrollbar {
            height: 8px;
          }

          .swiper-wrapper::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 10px;
          }

          .swiper-wrapper::-webkit-scrollbar-thumb {
            background: #007cba;
            border-radius: 10px;
          }

          @media (max-width: 768px) {
            .swiper-slide {
              min-width: 280px !important;
              padding: 30px 20px !important;
            }
            .elementor-swiper-button {
              display: none !important;
            }
          }
        </style>

        <script>
          let currentSlide = 0;
          const slides = document.querySelectorAll('.swiper-slide');
          const bullets = document.querySelectorAll('.swiper-pagination-bullet');
          const wrapper = document.querySelector('.swiper-wrapper');

          function scrollTestimonials(direction) {
            const slideWidth = 380; // 350px + 30px gap
            if (direction === 'next' && currentSlide < slides.length - 1) {
              currentSlide++;
            } else if (direction === 'prev' && currentSlide > 0) {
              currentSlide--;
            }

            wrapper.scrollTo({
              left: currentSlide * slideWidth,
              behavior: 'smooth'
            });

            updatePagination();
          }

          function goToSlide(index) {
            currentSlide = index;
            const slideWidth = 380;
            wrapper.scrollTo({
              left: currentSlide * slideWidth,
              behavior: 'smooth'
            });
            updatePagination();
          }

          function updatePagination() {
            bullets.forEach((bullet, index) => {
              if (index === currentSlide) {
                bullet.style.background = '#007cba';
              } else {
                bullet.style.background = '#ddd';
              }
            });
          }

          // Auto scroll functionality
          setInterval(() => {
            if (currentSlide < slides.length - 1) {
              scrollTestimonials('next');
            } else {
              currentSlide = -1;
              scrollTestimonials('next');
            }
          }, 5000);
        </script>

      </div>
    `
  },

  // 10. BLOG/NEWS SECTION
  {
    id: 'dental-news-articles',
    name: 'News & Articles Section',
    category: 'gallery',
    description: 'Blog section with news articles and dental health tips',
    tags: ['dental', 'blog', 'news', 'articles', 'education'],
    component: `
      <div class="elementor-element elementor-element-6474abb e-flex e-con-boxed e-con e-parent"
           style="background: white; padding: 80px 0;">
        <div class="e-con-inner" style="max-width: 1200px; margin: 0 auto; padding: 0 20px;">

          <!-- Section Header -->
          <div class="elementor-element elementor-element-6af0296 e-con-full e-flex e-con e-child">
            <div class="elementor-element elementor-element-181af56 e-con-full e-flex e-con e-child" style="text-align: center; margin-bottom: 60px;">

              <!-- Heading -->
              <div class="elementor-element elementor-element-23338fc elementor-widget elementor-widget-heading">
                <h2 class="elementor-heading-title elementor-size-default"
                    style="font-size: 36px; font-weight: 700; color: #333; margin: 0 0 20px; line-height: 1.3;">
                  News &amp; Articles
                </h2>
              </div>

              <!-- Description -->
              <div class="elementor-element elementor-element-43baaad elementor-widget elementor-widget-text-editor"
                   style="margin: 20px 0 30px;">
                <p style="font-size: 16px; line-height: 1.6; color: #666; margin: 0; max-width: 600px; margin: 0 auto;">
                  We use only the best quality materials on the market in order to provide the best products to our patients.
                </p>
              </div>

              <!-- Divider -->
              <div class="elementor-element elementor-element-650c876 elementor-widget-divider--view-line elementor-widget elementor-widget-divider"
                   style="margin: 30px 0;">
                <div class="elementor-divider">
                  <span class="elementor-divider-separator" style="display: block; width: 80px; height: 3px; background: #007cba; margin: 0 auto;"></span>
                </div>
              </div>

            </div>
          </div>

          <!-- Articles Grid -->
          <div class="elementor-element elementor-element-articles-grid"
               style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px;">

            <!-- Article 1 -->
            <div class="blog-article" style="background: white; border-radius: 15px; overflow: hidden; box-shadow: 0 5px 20px rgba(0,0,0,0.1); transition: transform 0.3s;">
              <div class="article-image" style="position: relative; overflow: hidden; height: 200px;">
                <img src="https://nahidmahmud.com/test-website/test01/wp-content/uploads/2025/09/Group-1000001023.png"
                     alt="Dental Care Tips" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s;">
                <div class="article-category" style="position: absolute; top: 15px; left: 15px; background: #007cba; color: white; padding: 5px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">
                  Dental Care
                </div>
              </div>
              <div class="article-content" style="padding: 25px;">
                <div class="article-meta" style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px; font-size: 14px; color: #999;">
                  <span>October 15, 2025</span>
                  <span>•</span>
                  <span>Dr. Sarah Johnson</span>
                </div>
                <h3 style="font-size: 20px; font-weight: 600; color: #333; margin: 0 0 15px; line-height: 1.4;">
                  5 Essential Tips for Maintaining Oral Hygiene
                </h3>
                <p style="font-size: 14px; line-height: 1.6; color: #666; margin: 0 0 20px;">
                  Discover the most effective ways to keep your teeth and gums healthy with these expert-recommended daily practices.
                </p>
                <a href="#" style="color: #007cba; text-decoration: none; font-weight: 600; font-size: 14px; display: inline-flex; align-items: center; gap: 5px; transition: color 0.3s;">
                  Read More
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </a>
              </div>
            </div>

            <!-- Article 2 -->
            <div class="blog-article" style="background: white; border-radius: 15px; overflow: hidden; box-shadow: 0 5px 20px rgba(0,0,0,0.1); transition: transform 0.3s;">
              <div class="article-image" style="position: relative; overflow: hidden; height: 200px;">
                <img src="https://nahidmahmud.com/test-website/test01/wp-content/uploads/2025/09/Group-1000001024.png"
                     alt="Dental Technology" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s;">
                <div class="article-category" style="position: absolute; top: 15px; left: 15px; background: #28a745; color: white; padding: 5px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">
                  Technology
                </div>
              </div>
              <div class="article-content" style="padding: 25px;">
                <div class="article-meta" style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px; font-size: 14px; color: #999;">
                  <span>October 12, 2025</span>
                  <span>•</span>
                  <span>Dr. Michael Chen</span>
                </div>
                <h3 style="font-size: 20px; font-weight: 600; color: #333; margin: 0 0 15px; line-height: 1.4;">
                  Latest Advances in Dental Implant Technology
                </h3>
                <p style="font-size: 14px; line-height: 1.6; color: #666; margin: 0 0 20px;">
                  Learn about the cutting-edge techniques and materials that are revolutionizing dental implant procedures.
                </p>
                <a href="#" style="color: #007cba; text-decoration: none; font-weight: 600; font-size: 14px; display: inline-flex; align-items: center; gap: 5px; transition: color 0.3s;">
                  Read More
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </a>
              </div>
            </div>

            <!-- Article 3 -->
            <div class="blog-article" style="background: white; border-radius: 15px; overflow: hidden; box-shadow: 0 5px 20px rgba(0,0,0,0.1); transition: transform 0.3s;">
              <div class="article-image" style="position: relative; overflow: hidden; height: 200px;">
                <img src="https://nahidmahmud.com/test-website/test01/wp-content/uploads/2025/09/home-icon-01.png"
                     alt="Children Dentistry" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s;">
                <div class="article-category" style="position: absolute; top: 15px; left: 15px; background: #fd7e14; color: white; padding: 5px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">
                  Pediatric
                </div>
              </div>
              <div class="article-content" style="padding: 25px;">
                <div class="article-meta" style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px; font-size: 14px; color: #999;">
                  <span>October 10, 2025</span>
                  <span>•</span>
                  <span>Dr. Emily Davis</span>
                </div>
                <h3 style="font-size: 20px; font-weight: 600; color: #333; margin: 0 0 15px; line-height: 1.4;">
                  Making Dental Visits Fun for Children
                </h3>
                <p style="font-size: 14px; line-height: 1.6; color: #666; margin: 0 0 20px;">
                  Tips and strategies to help parents prepare their children for stress-free dental appointments.
                </p>
                <a href="#" style="color: #007cba; text-decoration: none; font-weight: 600; font-size: 14px; display: inline-flex; align-items: center; gap: 5px; transition: color 0.3s;">
                  Read More
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </a>
              </div>
            </div>

          </div>

          <!-- View All Articles Button -->
          <div style="text-align: center; margin-top: 50px;">
            <a href="/blog" style="background: #007cba; color: white; padding: 15px 30px; border-radius: 30px; text-decoration: none; font-weight: 600; font-size: 16px; display: inline-block; transition: all 0.3s; box-shadow: 0 4px 15px rgba(0,124,186,0.3);">
              View All Articles
            </a>
          </div>

        </div>

        <style>
          .blog-article:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.15) !important;
          }

          .blog-article:hover .article-image img {
            transform: scale(1.1);
          }

          .blog-article a:hover {
            color: #005a87 !important;
          }

          @media (max-width: 768px) {
            .elementor-element-articles-grid {
              grid-template-columns: 1fr !important;
              gap: 20px !important;
            }
            .article-content {
              padding: 20px !important;
            }
          }
        </style>

      </div>
    `
  },

  // 11. FOOTER SECTION
  {
    id: 'dental-footer',
    name: 'Dental Practice Footer',
    category: 'navigation',
    description: 'Complete footer with practice info, quick links, contact details and social media',
    tags: ['dental', 'footer', 'contact', 'social', 'links'],
    component: `
      <footer class="elementor elementor-112 elementor-location-footer"
              style="background: #1a1a1a; color: white; padding: 60px 0 20px;">

        <!-- Main Footer Content -->
        <div style="max-width: 1200px; margin: 0 auto; padding: 0 20px;">

          <!-- Footer Top -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 40px; margin-bottom: 40px;">

            <!-- Practice Info -->
            <div class="footer-section">
              <div style="margin-bottom: 25px;">
                <img src="https://nahidmahmud.com/test-website/test01/wp-content/uploads/2025/09/cropped-footer-logo-180x180.png"
                     alt="Dental Practice Logo" style="max-width: 120px; height: auto;">
              </div>
              <p style="font-size: 14px; line-height: 1.6; color: #ccc; margin: 0 0 20px;">
                We use only the best quality materials on the market in order to provide the best products to our patients. Your dental health is our top priority.
              </p>
              <div style="display: flex; gap: 15px;">
                <a href="#" style="width: 40px; height: 40px; background: #007cba; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; text-decoration: none; transition: background 0.3s;">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
                <a href="#" style="width: 40px; height: 40px; background: #007cba; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; text-decoration: none; transition: background 0.3s;">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="#" style="width: 40px; height: 40px; background: #007cba; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; text-decoration: none; transition: background 0.3s;">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                <a href="#" style="width: 40px; height: 40px; background: #007cba; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; text-decoration: none; transition: background 0.3s;">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.083.346-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.755-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24c6.624 0 11.99-5.367 11.99-11.987C24.007 5.367 18.641.001 12.017.001z"/>
                  </svg>
                </a>
              </div>
            </div>

            <!-- Quick Links -->
            <div class="footer-section">
              <h3 style="font-size: 18px; font-weight: 600; color: white; margin: 0 0 20px;">Quick Links</h3>
              <ul style="list-style: none; padding: 0; margin: 0;">
                <li style="margin-bottom: 12px;">
                  <a href="/" style="color: #ccc; text-decoration: none; font-size: 14px; transition: color 0.3s; display: flex; align-items: center; gap: 8px;">
                    <span style="color: #007cba;">›</span> Home
                  </a>
                </li>
                <li style="margin-bottom: 12px;">
                  <a href="/about" style="color: #ccc; text-decoration: none; font-size: 14px; transition: color 0.3s; display: flex; align-items: center; gap: 8px;">
                    <span style="color: #007cba;">›</span> About Us
                  </a>
                </li>
                <li style="margin-bottom: 12px;">
                  <a href="/services" style="color: #ccc; text-decoration: none; font-size: 14px; transition: color 0.3s; display: flex; align-items: center; gap: 8px;">
                    <span style="color: #007cba;">›</span> Services
                  </a>
                </li>
                <li style="margin-bottom: 12px;">
                  <a href="/team" style="color: #ccc; text-decoration: none; font-size: 14px; transition: color 0.3s; display: flex; align-items: center; gap: 8px;">
                    <span style="color: #007cba;">›</span> Our Team
                  </a>
                </li>
                <li style="margin-bottom: 12px;">
                  <a href="/blog" style="color: #ccc; text-decoration: none; font-size: 14px; transition: color 0.3s; display: flex; align-items: center; gap: 8px;">
                    <span style="color: #007cba;">›</span> Blog
                  </a>
                </li>
                <li style="margin-bottom: 12px;">
                  <a href="/contact" style="color: #ccc; text-decoration: none; font-size: 14px; transition: color 0.3s; display: flex; align-items: center; gap: 8px;">
                    <span style="color: #007cba;">›</span> Contact Us
                  </a>
                </li>
              </ul>
            </div>

            <!-- Services -->
            <div class="footer-section">
              <h3 style="font-size: 18px; font-weight: 600; color: white; margin: 0 0 20px;">Our Services</h3>
              <ul style="list-style: none; padding: 0; margin: 0;">
                <li style="margin-bottom: 12px;">
                  <a href="/services/general-dentistry" style="color: #ccc; text-decoration: none; font-size: 14px; transition: color 0.3s; display: flex; align-items: center; gap: 8px;">
                    <span style="color: #007cba;">›</span> General Dentistry
                  </a>
                </li>
                <li style="margin-bottom: 12px;">
                  <a href="/services/cosmetic-dentistry" style="color: #ccc; text-decoration: none; font-size: 14px; transition: color 0.3s; display: flex; align-items: center; gap: 8px;">
                    <span style="color: #007cba;">›</span> Cosmetic Dentistry
                  </a>
                </li>
                <li style="margin-bottom: 12px;">
                  <a href="/services/dental-implants" style="color: #ccc; text-decoration: none; font-size: 14px; transition: color 0.3s; display: flex; align-items: center; gap: 8px;">
                    <span style="color: #007cba;">›</span> Dental Implants
                  </a>
                </li>
                <li style="margin-bottom: 12px;">
                  <a href="/services/pediatric-dentistry" style="color: #ccc; text-decoration: none; font-size: 14px; transition: color 0.3s; display: flex; align-items: center; gap: 8px;">
                    <span style="color: #007cba;">›</span> Pediatric Dentistry
                  </a>
                </li>
                <li style="margin-bottom: 12px;">
                  <a href="/services/orthodontics" style="color: #ccc; text-decoration: none; font-size: 14px; transition: color 0.3s; display: flex; align-items: center; gap: 8px;">
                    <span style="color: #007cba;">›</span> Orthodontics
                  </a>
                </li>
                <li style="margin-bottom: 12px;">
                  <a href="/services/emergency-dentistry" style="color: #ccc; text-decoration: none; font-size: 14px; transition: color 0.3s; display: flex; align-items: center; gap: 8px;">
                    <span style="color: #007cba;">›</span> Emergency Care
                  </a>
                </li>
              </ul>
            </div>

            <!-- Contact Information -->
            <div class="footer-section">
              <h3 style="font-size: 18px; font-weight: 600; color: white; margin: 0 0 20px;">Contact Info</h3>

              <div style="display: flex; align-items: flex-start; gap: 12px; margin-bottom: 20px;">
                <div style="width: 20px; height: 20px; background: #007cba; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 2px;">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                </div>
                <div>
                  <p style="margin: 0; color: #ccc; font-size: 14px; line-height: 1.5;">
                    123 Dental Street, Suite 100<br>
                    Medical City, MC 12345
                  </p>
                </div>
              </div>

              <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px;">
                <div style="width: 20px; height: 20px; background: #007cba; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                  </svg>
                </div>
                <div>
                  <p style="margin: 0; color: #ccc; font-size: 14px;">
                    <a href="tel:+1234567890" style="color: #ccc; text-decoration: none;">(123) 456-7890</a>
                  </p>
                </div>
              </div>

              <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px;">
                <div style="width: 20px; height: 20px; background: #007cba; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                  </svg>
                </div>
                <div>
                  <p style="margin: 0; color: #ccc; font-size: 14px;">
                    <a href="mailto:info@dentalclinic.com" style="color: #ccc; text-decoration: none;">info@dentalclinic.com</a>
                  </p>
                </div>
              </div>

              <div style="display: flex; align-items: center; gap: 12px;">
                <div style="width: 20px; height: 20px; background: #007cba; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
                    <path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                  </svg>
                </div>
                <div>
                  <p style="margin: 0; color: #ccc; font-size: 14px; line-height: 1.5;">
                    Mon-Fri: 8:00 AM - 6:00 PM<br>
                    Sat: 9:00 AM - 3:00 PM
                  </p>
                </div>
              </div>

            </div>

          </div>

          <!-- Footer Bottom -->
          <div style="border-top: 1px solid #333; padding-top: 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 20px;">
            <p style="margin: 0; color: #888; font-size: 14px;">
              © 2025 Dental Practice. All rights reserved.
            </p>
            <div style="display: flex; gap: 25px;">
              <a href="/privacy-policy" style="color: #888; text-decoration: none; font-size: 14px; transition: color 0.3s;">Privacy Policy</a>
              <a href="/terms-of-service" style="color: #888; text-decoration: none; font-size: 14px; transition: color 0.3s;">Terms of Service</a>
              <a href="/sitemap" style="color: #888; text-decoration: none; font-size: 14px; transition: color 0.3s;">Sitemap</a>
            </div>
          </div>

        </div>

        <style>
          .footer-section a:hover {
            color: #007cba !important;
          }

          .footer-section a[href*="tel:"]:hover,
          .footer-section a[href*="mailto:"]:hover {
            color: #007cba !important;
          }

          @media (max-width: 768px) {
            footer {
              padding: 40px 0 20px !important;
            }

            footer > div > div:first-child {
              grid-template-columns: 1fr !important;
              gap: 30px !important;
            }

            footer > div > div:last-child {
              flex-direction: column !important;
              text-align: center;
            }

            footer > div > div:last-child > div {
              order: -1;
            }
          }
        </style>

      </footer>
    `
  }
];

export default dentalWebsiteSections;