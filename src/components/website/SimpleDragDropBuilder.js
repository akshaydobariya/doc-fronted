import {
  Add as AddIcon,
  ArrowBack as BackIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIcon,
  Edit as EditIcon,
  FilterList as FilterIcon,
  Image as ImageIcon,
  AutoAwesome as MagicIcon,
  Preview as PreviewIcon,
  Publish as PublishIcon,
  Save as SaveIcon,
  Search as SearchIcon,
  MedicalServices as ServicesIcon,
  Settings as SettingsIcon,
  Palette as TemplateIcon,
  TextFields as TextIcon,
  CloudUpload as UploadIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import {
  Alert,
  AppBar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Stack,
  TextField,
  Toolbar,
  Typography
} from '@mui/material';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import dentalWebsiteSections from '../../data/DENTAL_WEBSITE_SECTIONS';
// Removed enhancedDentalNavigation - using only clean dynamic headers
import serviceService from '../../services/serviceService';
import websiteService from '../../services/websiteService';
import { servicePageService } from '../../services/servicePageService';
import { clearServiceCache, serviceHeaderMapper } from '../../utils/serviceHeaderMapping';
import UnifiedContentService from '../../services/unifiedContentService';
import ComponentRenderer from './ComponentRenderer';
import CorporateProfessionalHeader from './CorporateProfessionalHeader';
import DynamicHeaderComponent from './DynamicHeaderComponent';
import DynamicHeaderHandler from './DynamicHeaderHandler';
import EnhancedServiceSelector from './EnhancedServiceSelector';
import PageBuilderErrorBoundary from './PageBuilderErrorBoundary';
import ServiceManager from './ServiceManager';
import dentalWebsiteSectionsComponent from '../../data/DENTAL_WEBSITE_SECTIONS_BACKUP2';
import DestackUnifiedContentSidebar from './DestackUnifiedContentSidebar';

/**
 * Simple Drag Drop Builder - Clean implementation without Destack complications
 */
const SimpleDragDropBuilder = () => {
  const [searchParams] = useSearchParams();
  const routeParams = useParams();
  const navigate = useNavigate();

  // Detect if we're in display mode (URL: /website/:websiteId/services/:serviceSlug)
  const isDisplayMode = routeParams.websiteId && routeParams.serviceSlug;
  const displayWebsiteId = routeParams.websiteId;
  const displayServiceSlug = routeParams.serviceSlug;

  // Get parameters from query string (edit mode) or route params (display mode)
  const websiteId = isDisplayMode ? displayWebsiteId : searchParams.get('websiteId');
  const servicePageId = searchParams.get('servicePageId'); // Only available in service page edit mode
  const queryMode = searchParams.get('mode'); // 'service' for service page editing

  // Determine the actual mode
  let actualMode;
  if (isDisplayMode) {
    actualMode = 'display'; // Service page display mode
  } else if (servicePageId && queryMode === 'service') {
    actualMode = 'service'; // Service page edit mode
  } else {
    actualMode = 'website'; // Website edit mode (original functionality)
  }

  // Website state
  const [website, setWebsite] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Mode state variables
  const [isServicePageMode, setIsServicePageMode] = useState(actualMode === 'service' || actualMode === 'display');
  const [isWebsiteMode, setIsWebsiteMode] = useState(actualMode === 'website');
  const [isEditMode, setIsEditMode] = useState(actualMode === 'service');
  const [isViewMode, setIsViewMode] = useState(actualMode === 'display');

  // Service page state (when in service page mode)
  const [servicePage, setServicePage] = useState(null);
  const [serviceInfo, setServiceInfo] = useState(null);
  const [blogCards, setBlogCards] = useState([]);

  // Unified content state (for service page mode)
  const [unifiedContentSidebarVisible, setUnifiedContentSidebarVisible] = useState(false);
  const [unifiedContentEnabled, setUnifiedContentEnabled] = useState(actualMode === 'service');


  // Refs to track auto-mapping state and caching
  const autoMappingCompleted = useRef(false);
  const initialLoadCompleted = useRef(false);
  const servicesCache = useRef(null);
  const servicesCacheTimestamp = useRef(null);
  const CACHE_DURATION = 30000; // 30 seconds cache

  // UI state
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Component filter state
  const [components, setComponents] = useState([]);
  const [filteredComponents, setFilteredComponents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTags, setSelectedTags] = useState([]);

  // Canvas state
  const [canvasComponents, setCanvasComponents] = useState([]);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [nextId, setNextId] = useState(1);

  // Text editing state
  const [textEditDialogOpen, setTextEditDialogOpen] = useState(false);
  const [editingComponent, setEditingComponent] = useState(null);
  const [extractedTexts, setExtractedTexts] = useState([]);

  // Component preview state
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [previewComponent, setPreviewComponent] = useState(null);

  // Image upload state
  const [imageUploadDialogOpen, setImageUploadDialogOpen] = useState(false);
  const [editingImageComponent, setEditingImageComponent] = useState(null);

  // Template state
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [loadingTemplate, setLoadingTemplate] = useState(false);

  // Iframe interaction state
  const [interactionDialogOpen, setInteractionDialogOpen] = useState(false);
  const [editingInteractionComponent, setEditingInteractionComponent] = useState(null);
  const [iframeUrl, setIframeUrl] = useState('');
  const [iframeModalOpen, setIframeModalOpen] = useState(false);
  const [currentIframeUrl, setCurrentIframeUrl] = useState('');

  // Service selection state
  const [enhancedServiceSelectorOpen, setEnhancedServiceSelectorOpen] = useState(false);


  // Available categories and tags for dental practice
  const categories = [
    { value: 'all', label: 'All Components' },
    { value: 'navigation', label: 'Header & Navigation' },
    { value: 'hero', label: 'Hero Sections' },
    { value: 'services', label: 'Dental Services' },
    { value: 'about', label: 'About Practice' },
    { value: 'team', label: 'Doctor & Team' },
    { value: 'video', label: 'Video Sections' },
    { value: 'testimonials', label: 'Patient Reviews' },
    { value: 'gallery', label: 'Practice Gallery' },
    { value: 'appointments', label: 'Booking Forms' },
    { value: 'contact', label: 'Contact Info' },
    { value: 'education', label: 'Patient Education' }
  ];

  const availableTags = [
    'dental', 'professional', 'modern', 'trustworthy', 'clean',
    'patient-friendly', 'responsive', 'elegant', 'medical', 'appointment',
    'gallery', 'testimonial', 'emergency', 'insurance', 'technology'
  ];

  // Global settings
  const [globalSettings, setGlobalSettings] = useState({
    siteName: '',
    siteDescription: '',
    primaryColor: '#2563eb',
    secondaryColor: '#64748b',
    fontFamily: 'Inter, sans-serif'
  });

  useEffect(() => {
    // Filter components based on search term, category, and tags
    let filtered = Array.isArray(components) ? components : [];

    if (searchTerm) {
      filtered = filtered.filter(comp =>
        comp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comp.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comp.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(comp => comp.category === selectedCategory);
    }

    if (selectedTags.length > 0) {
      filtered = filtered.filter(comp =>
        selectedTags.some(tag => comp.tags?.includes(tag))
      );
    }


    setFilteredComponents(filtered);
  }, [components, searchTerm, selectedCategory, selectedTags]);

  // Generate Destack components from service page content - Enhanced API Content Mapping
  const generateServicePageComponents = (content, serviceData, blogCards = []) => {
    console.log('🚀 generateServicePageComponents called with blogCards:', blogCards);
    if (!content) {
      console.warn('⚠️ No content provided for service page components generation');
      return [];
    }

    const components = [];
    let componentId = 1;


    // Extract dynamic service information
    const serviceName = serviceData?.name || content.hero?.title || 'Dental Service';
    const serviceCategory = serviceData?.category || 'general-dentistry';
    const serviceDescription = serviceData?.shortDescription || content.hero?.subtitle || '';


    // Generate appropriate banner image based on service category and existing content
    const getBannerImage = (serviceName, category, heroContent) => {
      // First, check if there's an existing image in the content
      if (heroContent?.imageUrl) {
        return heroContent.imageUrl;
      }

      const defaultImages = {
        'cosmetic-dentistry': 'https://images.unsplash.com/photo-1606811971618-4486d14f3f99?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=400',
        'general-dentistry': 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=400',
        'oral-surgery': 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=400',
        'orthodontics': 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=400'
      };

      // Special case for laser dentistry to maintain exact reference
      if (serviceName.toLowerCase().includes('laser')) {
        return 'https://nahidmahmud.com/test-website/test01/wp-content/uploads/2025/09/Laser-dentistry-banner.png';
      }

      const selectedImage = defaultImages[category] || defaultImages['general-dentistry'];
      return selectedImage;
    };

    // 1. Hero Banner Section - Dynamic based on service data
    if (!content.hero || Object.keys(content.hero).length === 0 || !content.hero.title) {
      const heroId = `service-hero-${componentId++}`;
      components.push({
      id: heroId,
      type: 'ServiceHero',
      name: `${serviceName} Hero Banner`,
      category: 'hero',
      description: `Hero banner for ${serviceName} service`,
      tags: ['hero', 'service', 'banner'],
      instanceId: `${heroId}-${Date.now()}`,
      component: `
        <section class="service-hero" style="background: linear-gradient(135deg, #fafafa 0%, #ffffff 100%); padding: 0; margin: 0; position: relative; overflow: hidden;">
          <!-- Subtle geometric background elements -->
          <div style="position: absolute; top: -200px; right: -200px; width: 400px; height: 400px; background: radial-gradient(circle, rgba(99, 102, 241, 0.03) 0%, transparent 70%); border-radius: 50%;"></div>
          <div style="position: absolute; bottom: -150px; left: -150px; width: 300px; height: 300px; background: radial-gradient(circle, rgba(16, 185, 129, 0.03) 0%, transparent 70%); border-radius: 50%;"></div>

          <div style="position: relative; width: 100%; min-height: 70vh; display: flex; align-items: center;">
            <!-- Premium image with subtle overlay -->
            <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 1;">
              <img src="${getBannerImage(serviceName, serviceCategory, content.hero)}"
                   alt="${serviceName} Banner"
                   style="width: 100%; height: 100%; object-fit: cover; opacity: 0.12; filter: blur(0.5px);">
            </div>

            <!-- Content container with premium typography -->
            <div style="position: relative; z-index: 3; max-width: 1200px; margin: 0 auto; padding: 120px 40px; text-align: center;">
              <!-- Premium badge -->
              <div style="display: inline-block; padding: 8px 24px; background: rgba(99, 102, 241, 0.08); border: 1px solid rgba(99, 102, 241, 0.12); border-radius: 50px; margin-bottom: 40px;">
                <span style="color: #6366f1; font-weight: 600; font-size: 13px; text-transform: uppercase; letter-spacing: 1.5px;">Premium Dental Care</span>
              </div>

              <!-- Main heading with elegant typography -->
              <h1 data-text="true" style="font-size: clamp(42px, 5vw, 72px); font-weight: 300; margin: 0 0 24px 0; color: #1a1a1a; line-height: 1.1; letter-spacing: -0.02em; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;">
                ${content.hero?.title || serviceName}
              </h1>

              <!-- Subtle separator line -->
              <div style="width: 60px; height: 1px; background: linear-gradient(90deg, transparent, #6366f1, transparent); margin: 32px auto;"></div>

              ${(content.hero?.subtitle || serviceDescription) ? `
                <p data-text="true" style="font-size: 20px; font-weight: 400; margin: 0 0 48px 0; color: #6b7280; max-width: 600px; margin-left: auto; margin-right: auto; line-height: 1.6;">
                  ${content.hero?.subtitle || serviceDescription}
                </p>
              ` : ''}

              <!-- Premium CTA button -->
              <div style="margin-top: 48px;">
                <button data-text="true" style="
                  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
                  color: white;
                  padding: 16px 48px;
                  border: none;
                  border-radius: 12px;
                  font-size: 16px;
                  font-weight: 600;
                  cursor: pointer;
                  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                  box-shadow: 0 4px 16px rgba(99, 102, 241, 0.2);
                  letter-spacing: 0.5px;
                " onmouseover="
                  this.style.transform = 'translateY(-2px)';
                  this.style.boxShadow = '0 8px 32px rgba(99, 102, 241, 0.3)';
                " onmouseout="
                  this.style.transform = 'translateY(0)';
                  this.style.boxShadow = '0 4px 16px rgba(99, 102, 241, 0.2)';
                ">
                  Book Consultation
                </button>
              </div>
            </div>
          </div>
        </section>
      `,
      props: {
        ...content.hero,
        title: serviceName,
        subtitle: serviceDescription,
        serviceName,
        serviceCategory
      },
      config: {
        ...content.hero,
        title: serviceName,
        subtitle: serviceDescription
      }
    });
    }

    // 2. Overview/Mission Section - From API content.overview
    if (content.overview && content.overview.content) {
      const overviewId = `service-overview-${componentId++}`;

      // Process markdown-style content
      const processContent = (rawContent) => {
        return rawContent
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/## (.*?)\n/g, '<h2 style="font-size: 24px; font-weight: bold; margin: 30px 0 15px 0; color: #1976d2;">$1</h2>')
          .replace(/\n\n/g, '</p><p style="margin: 15px 0; line-height: 1.6;">')
          .replace(/\n/g, '<br>');
      };

      components.push({
        id: overviewId,
        type: 'ServiceOverview',
        name: `${serviceName} Overview`,
        category: 'content',
        description: `Detailed overview of ${serviceName} service`,
        tags: ['overview', 'mission', 'content'],
        instanceId: `${overviewId}-${Date.now()}`,
        component: `
          <section class="service-overview" style="background: #ffffff; padding: 120px 40px; position: relative; overflow: hidden;">
            <!-- Subtle background pattern -->
            <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0.02; background-image: radial-gradient(circle at 20% 20%, #6366f1 1px, transparent 1px); background-size: 40px 40px;"></div>

            <div style="max-width: 1100px; margin: 0 auto; position: relative; z-index: 2;">
              <!-- Section badge -->
              <div style="text-align: center; margin-bottom: 60px;">
                <div style="display: inline-block; padding: 6px 20px; background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.12); border-radius: 30px; margin-bottom: 32px;">
                  <span style="color: #10b981; font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 1.2px;">Treatment Overview</span>
                </div>

                <h2 data-text="true" style="font-size: clamp(36px, 4vw, 48px); font-weight: 400; margin: 0; color: #1a1a1a; line-height: 1.2; letter-spacing: -0.01em; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;">
                  ${content.overview.title || 'Treatment Overview'}
                </h2>

                <!-- Elegant separator -->
                <div style="width: 80px; height: 1px; background: linear-gradient(90deg, transparent, #10b981, transparent); margin: 40px auto;"></div>
              </div>

              <!-- Premium content card -->
              <div style="background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(20px); padding: 60px 50px; border-radius: 24px; border: 1px solid rgba(255, 255, 255, 0.2); box-shadow: 0 20px 60px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(255, 255, 255, 0.1);">
                <div data-text="true" style="font-size: 18px; line-height: 1.8; color: #374151; font-weight: 400; text-align: center; max-width: 800px; margin: 0 auto;">
                  <div style="margin: 0;">${processContent(content.overview.content)}</div>
                </div>
              </div>

              <!-- Subtle accent dots -->
              <div style="display: flex; justify-content: center; margin-top: 40px; gap: 8px;">
                <div style="width: 6px; height: 6px; background: #10b981; border-radius: 50%; opacity: 0.6;"></div>
                <div style="width: 6px; height: 6px; background: #10b981; border-radius: 50%; opacity: 0.4;"></div>
                <div style="width: 6px; height: 6px; background: #10b981; border-radius: 50%; opacity: 0.2;"></div>
              </div>
            </div>
          </section>
        `,
        props: {
          title: content.overview.title,
          content: content.overview.content,
          highlights: content.overview.highlights || []
        },
        config: {
          title: content.overview.title,
          content: content.overview.content
        }
      });
    }

    // 3. Contact Form Section - From reference site
    const contactId = `service-contact-${componentId++}`;
    components.push({
      id: contactId,
      type: 'ServiceContact',
      name: 'Contact Form',
      category: 'contact',
      description: 'Contact form with city dropdown - exact reference design',
      tags: ['contact', 'form'],
      instanceId: `${contactId}-${Date.now()}`,
      component: `
        <section class="service-contact" style="background: white; padding: 40px 20px;">
          <div style="max-width: 600px; margin: 0 auto;">
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-bottom: 20px;">
              <input type="text" placeholder="Enter Your Name" data-text="true"
                     style="padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 15px;">
              <input type="tel" placeholder="Enter Your Number" data-text="true"
                     style="padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 15px;">
              <select data-text="true" style="padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 15px; background: white;">
                <option>Select City</option>
                <option>Delhi</option>
                <option>Noida</option>
                <option>Ghaziabad</option>
                <option>Faridabad</option>
                <option>Gurgaon</option>
                <option>Panchkula</option>
              </select>
            </div>
            <button data-text="true" style="background: #F66123; color: white; padding: 16px 32px; border: none; border-radius: 6px; font-size: 15px; font-weight: bold; width: 200px; cursor: pointer;">
              Submit
            </button>
          </div>
        </section>
      `,
      props: {},
      config: {}
    });

    // 3. Benefits Section - From API content.benefits
    if (content.benefits && content.benefits.list && content.benefits.list.length > 0) {
      const benefitsId = `service-benefits-${componentId++}`;

      const getIconForBenefit = (title) => {
        const titleLower = title.toLowerCase();
        if (titleLower.includes('smile') || titleLower.includes('confidence')) return '😊';
        if (titleLower.includes('breath') || titleLower.includes('fresh')) return '🌬️';
        if (titleLower.includes('health') || titleLower.includes('protect')) return '🛡️';
        if (titleLower.includes('prevent') || titleLower.includes('pain')) return '⚠️';
        if (titleLower.includes('comfort') || titleLower.includes('gentle')) return '🤗';
        if (titleLower.includes('money') || titleLower.includes('save')) return '💰';
        if (titleLower.includes('personal') || titleLower.includes('care')) return '📋';
        return '✨';
      };

      components.push({
        id: benefitsId,
        type: 'ServiceBenefits',
        name: `${serviceName} Benefits`,
        category: 'benefits',
        description: `Benefits of ${serviceName} service`,
        tags: ['benefits', 'features', 'advantages'],
        instanceId: `${benefitsId}-${Date.now()}`,
        component: `
          <section class="service-benefits" style="background: linear-gradient(135deg, #fafafa 0%, #ffffff 100%); padding: 120px 40px; position: relative; overflow: hidden;">
            <!-- Elegant background elements -->
            <div style="position: absolute; top: -100px; right: -100px; width: 300px; height: 300px; background: radial-gradient(circle, rgba(234, 179, 8, 0.03) 0%, transparent 70%); border-radius: 50%;"></div>
            <div style="position: absolute; bottom: -150px; left: -150px; width: 400px; height: 400px; background: radial-gradient(circle, rgba(234, 179, 8, 0.02) 0%, transparent 70%); border-radius: 50%;"></div>

            <div style="max-width: 1300px; margin: 0 auto; position: relative; z-index: 2;">
              <!-- Premium section header -->
              <div style="text-align: center; margin-bottom: 80px;">
                <div style="display: inline-block; padding: 6px 20px; background: rgba(234, 179, 8, 0.08); border: 1px solid rgba(234, 179, 8, 0.12); border-radius: 30px; margin-bottom: 32px;">
                  <span style="color: #eab308; font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 1.2px;">Treatment Benefits</span>
                </div>

                <h2 data-text="true" style="font-size: clamp(36px, 4vw, 48px); font-weight: 400; margin: 0; color: #1a1a1a; line-height: 1.2; letter-spacing: -0.01em; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;">
                  ${content.benefits.title || 'Key Benefits'}
                </h2>

                ${content.benefits.introduction ? `
                  <div style="width: 80px; height: 1px; background: linear-gradient(90deg, transparent, #eab308, transparent); margin: 40px auto 30px;"></div>
                  <p data-text="true" style="font-size: 18px; font-weight: 400; margin: 0; color: #6b7280; max-width: 700px; margin-left: auto; margin-right: auto; line-height: 1.6;">
                    ${content.benefits.introduction}
                  </p>
                ` : ''}
              </div>

              <!-- Premium benefits grid -->
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(380px, 1fr)); gap: 32px;">
                ${content.benefits.list.map((benefit, index) => `
                  <div style="
                    background: rgba(255, 255, 255, 0.8);
                    backdrop-filter: blur(20px);
                    padding: 40px 36px;
                    border-radius: 20px;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(255, 255, 255, 0.1);
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;
                    overflow: hidden;
                  " onmouseover="
                    this.style.transform = 'translateY(-8px)';
                    this.style.boxShadow = '0 20px 60px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(255, 255, 255, 0.15)';
                  " onmouseout="
                    this.style.transform = 'translateY(0)';
                    this.style.boxShadow = '0 10px 40px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(255, 255, 255, 0.1)';
                  ">
                    <!-- Subtle top accent -->
                    <div style="position: absolute; top: 0; left: 0; width: 100%; height: 2px; background: linear-gradient(90deg, rgba(234, 179, 8, 0.6), rgba(234, 179, 8, 0.2));"></div>

                    <div style="display: flex; align-items: flex-start; gap: 24px;">
                      <!-- Minimalist icon container -->
                      <div style="
                        flex-shrink: 0;
                        width: 56px;
                        height: 56px;
                        background: linear-gradient(135deg, rgba(234, 179, 8, 0.1), rgba(234, 179, 8, 0.05));
                        border: 1px solid rgba(234, 179, 8, 0.1);
                        border-radius: 16px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 24px;
                        margin-top: 4px;
                      ">
                        ${getIconForBenefit(benefit.title)}
                      </div>

                      <div style="flex: 1;">
                        <h3 data-text="true" style="font-size: 20px; font-weight: 600; margin: 0 0 16px 0; color: #1a1a1a; line-height: 1.3; letter-spacing: -0.005em;">
                          ${benefit.title}
                        </h3>
                        <p data-text="true" style="font-size: 16px; line-height: 1.7; color: #4b5563; margin: 0; font-weight: 400;">
                          ${(benefit.description || benefit.content || '').replace(/\*\*/g, '')}
                        </p>
                      </div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          </section>
        `,
        props: {
          title: content.benefits.title,
          introduction: content.benefits.introduction,
          benefits: content.benefits.list
        },
        config: {
          title: content.benefits.title,
          benefits: content.benefits.list
        }
      });
    }

    // 4. Procedure Steps Section - From API content.procedure
    if (content.procedure && content.procedure.steps && content.procedure.steps.length > 0) {
      const procedureId = `service-procedure-${componentId++}`;

      components.push({
        id: procedureId,
        type: 'ServiceProcedure',
        name: `${serviceName} Procedure`,
        category: 'procedure',
        description: `Step-by-step procedure for ${serviceName}`,
        tags: ['procedure', 'steps', 'process'],
        instanceId: `${procedureId}-${Date.now()}`,
        component: `
          <section class="service-procedure" style="background: #ffffff; padding: 120px 40px; position: relative; overflow: hidden;">
            <!-- Elegant background elements -->
            <div style="position: absolute; top: -120px; left: -120px; width: 350px; height: 350px; background: radial-gradient(circle, rgba(79, 70, 229, 0.03) 0%, transparent 70%); border-radius: 50%;"></div>
            <div style="position: absolute; bottom: -100px; right: -100px; width: 280px; height: 280px; background: radial-gradient(circle, rgba(79, 70, 229, 0.02) 0%, transparent 70%); border-radius: 50%;"></div>

            <div style="max-width: 1200px; margin: 0 auto; position: relative; z-index: 2;">
              <!-- Premium section header -->
              <div style="text-align: center; margin-bottom: 80px;">
                <div style="display: inline-block; padding: 6px 20px; background: rgba(79, 70, 229, 0.08); border: 1px solid rgba(79, 70, 229, 0.12); border-radius: 30px; margin-bottom: 32px;">
                  <span style="color: #4f46e5; font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 1.2px;">Treatment Process</span>
                </div>

                <h2 data-text="true" style="font-size: clamp(36px, 4vw, 48px); font-weight: 400; margin: 0; color: #1a1a1a; line-height: 1.2; letter-spacing: -0.01em; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;">
                  ${content.procedure.title || 'Treatment Process'}
                </h2>

                ${content.procedure.introduction ? `
                  <div style="width: 80px; height: 1px; background: linear-gradient(90deg, transparent, #4f46e5, transparent); margin: 40px auto 30px;"></div>
                  <p data-text="true" style="font-size: 18px; font-weight: 400; margin: 0; color: #6b7280; max-width: 700px; margin-left: auto; margin-right: auto; line-height: 1.6;">
                    ${content.procedure.introduction}
                  </p>
                ` : ''}
              </div>

              <!-- Premium procedure timeline -->
              <div style="position: relative; max-width: 900px; margin: 0 auto;">
                <!-- Central timeline line -->
                <div style="position: absolute; left: 50%; top: 80px; bottom: 80px; width: 1px; background: linear-gradient(180deg, rgba(79, 70, 229, 0.2), rgba(79, 70, 229, 0.6), rgba(79, 70, 229, 0.2)); transform: translateX(-50%); z-index: 1;"></div>

                ${content.procedure.steps.map((step, index) => `
                  <div style="
                    display: flex;
                    align-items: center;
                    margin-bottom: ${index === content.procedure.steps.length - 1 ? '0' : '60px'};
                    position: relative;
                    ${index % 2 === 0 ? 'flex-direction: row;' : 'flex-direction: row-reverse;'}
                  ">
                    <!-- Step content card -->
                    <div style="
                      flex: 1;
                      background: rgba(255, 255, 255, 0.8);
                      backdrop-filter: blur(20px);
                      padding: 40px 36px;
                      border-radius: 20px;
                      border: 1px solid rgba(255, 255, 255, 0.2);
                      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(255, 255, 255, 0.1);
                      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                      ${index % 2 === 0 ? 'margin-right: 60px;' : 'margin-left: 60px;'}
                      max-width: 400px;
                    " onmouseover="
                      this.style.transform = 'translateY(-8px)';
                      this.style.boxShadow = '0 20px 60px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(255, 255, 255, 0.15)';
                    " onmouseout="
                      this.style.transform = 'translateY(0)';
                      this.style.boxShadow = '0 10px 40px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(255, 255, 255, 0.1)';
                    ">
                      <!-- Step number badge -->
                      <div style="
                        display: inline-block;
                        padding: 4px 12px;
                        background: rgba(79, 70, 229, 0.1);
                        border: 1px solid rgba(79, 70, 229, 0.15);
                        border-radius: 20px;
                        margin-bottom: 20px;
                      ">
                        <span style="color: #4f46e5; font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">Step ${step.stepNumber || index + 1}</span>
                      </div>

                      <h3 data-text="true" style="font-size: 22px; font-weight: 600; margin: 0 0 16px 0; color: #1a1a1a; line-height: 1.3; letter-spacing: -0.005em;">
                        ${step.title}
                      </h3>
                      <p data-text="true" style="font-size: 16px; line-height: 1.7; color: #4b5563; margin: 0; font-weight: 400;">
                        ${(step.description || step.content || '').replace(/\*\*/g, '')}
                      </p>
                    </div>

                    <!-- Central step number circle -->
                    <div style="
                      flex-shrink: 0;
                      width: 64px;
                      height: 64px;
                      background: linear-gradient(135deg, #4f46e5, #3730a3);
                      border: 4px solid #ffffff;
                      border-radius: 50%;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      font-size: 22px;
                      font-weight: 700;
                      color: white;
                      position: relative;
                      z-index: 3;
                      box-shadow: 0 8px 25px rgba(79, 70, 229, 0.25);
                    ">
                      ${step.stepNumber || index + 1}
                    </div>

                    <!-- Spacer for opposite side -->
                    <div style="flex: 1; max-width: 400px; ${index % 2 === 0 ? 'margin-left: 60px;' : 'margin-right: 60px;'}"></div>
                  </div>
                `).join('')}
              </div>
            </div>
          </section>
        `,
        props: {
          title: content.procedure.title,
          introduction: content.procedure.introduction,
          steps: content.procedure.steps
        },
        config: {
          title: content.procedure.title,
          steps: content.procedure.steps
        }
      });
    }

    // 5. FAQ Section - From API content.faq
    if (content.faq && content.faq.questions && content.faq.questions.length > 0) {
      const faqId = `service-faq-${componentId++}`;

    // Enhanced FAQ Section from API content
    if (content.faq && content.faq.questions && content.faq.questions.length > 0) {
      const enhancedFaqId = `service-faq-enhanced-${componentId++}`;

      components.push({
        id: enhancedFaqId,
        type: 'ServiceFAQEnhanced',
        name: `${serviceName} FAQ Enhanced`,
        category: 'faq',
        description: `Enhanced FAQ section for ${serviceName}`,
        tags: ['faq', 'questions', 'answers'],
        instanceId: `${enhancedFaqId}-${Date.now()}`,
        component: `
          <section class="service-faq-enhanced" style="background: linear-gradient(135deg, #f8f9ff 0%, #ffffff 100%); padding: 120px 20px; position: relative; overflow: hidden;">
            <!-- Premium background elements -->
            <div style="position: absolute; top: -100px; right: -100px; width: 300px; height: 300px; background: radial-gradient(circle, rgba(156, 39, 176, 0.04) 0%, transparent 70%); border-radius: 50%;"></div>
            <div style="position: absolute; bottom: -80px; left: -80px; width: 250px; height: 250px; background: radial-gradient(circle, rgba(156, 39, 176, 0.02) 0%, transparent 70%); border-radius: 50%;"></div>
            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 600px; height: 600px; background: linear-gradient(45deg, rgba(156, 39, 176, 0.01) 0%, transparent 50%); border-radius: 50%; z-index: 0;"></div>

            <div style="max-width: 1000px; margin: 0 auto; position: relative; z-index: 2;">
              <!-- Premium section header -->
              <div style="text-align: center; margin-bottom: 80px;">
                <div style="display: inline-block; padding: 14px 32px; background: rgba(156, 39, 176, 0.08); backdrop-filter: blur(20px); border-radius: 50px; margin-bottom: 30px; border: 1px solid rgba(156, 39, 176, 0.1);">
                  <span style="color: #7b1fa2; font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 1.5px;">❓ Questions & Answers</span>
                </div>
                <h2 data-text="true" style="font-size: 48px; font-weight: 800; margin-bottom: 25px; background: linear-gradient(135deg, #7b1fa2, #9c27b0); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; text-shadow: 0 4px 8px rgba(123, 31, 162, 0.1);">
                  ${content.faq.title || 'Frequently Asked Questions'}
                </h2>
                ${content.faq.introduction ? `
                  <p data-text="true" style="font-size: 20px; color: #6a1b7b; max-width: 700px; margin: 0 auto; line-height: 1.8; font-weight: 400;">
                    ${content.faq.introduction}
                  </p>
                ` : ''}
              </div>

              <!-- Premium FAQ items -->
              <div style="max-width: 900px; margin: 0 auto;">
                ${content.faq.questions.map((faq, index) => `
                  <div style="background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(20px); border: 1px solid rgba(156, 39, 176, 0.08); border-radius: 20px; margin-bottom: 24px; overflow: hidden; box-shadow: 0 8px 32px rgba(156, 39, 176, 0.08); transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); position: relative;" onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 16px 48px rgba(156, 39, 176, 0.12)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 8px 32px rgba(156, 39, 176, 0.08)'">
                    <!-- Question number indicator -->
                    <div style="position: absolute; top: -8px; left: 24px; width: 32px; height: 32px; background: linear-gradient(135deg, #9c27b0, #7b1fa2); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700; box-shadow: 0 4px 16px rgba(156, 39, 176, 0.3);">
                      ${index + 1}
                    </div>

                    <!-- Question button -->
                    <button
                      onclick="
                        const content = this.nextElementSibling;
                        const icon = this.querySelector('.faq-icon');
                        const isVisible = content.style.display === 'block';
                        const wasVisible = isVisible;
                        content.style.display = isVisible ? 'none' : 'block';
                        icon.textContent = isVisible ? '+' : '−';

                        if (!wasVisible) {
                          this.style.background = 'linear-gradient(135deg, rgba(156, 39, 176, 0.95), rgba(123, 31, 162, 0.95))';
                          this.style.color = 'white';
                          this.style.backdropFilter = 'blur(20px)';
                          content.style.animation = 'faqSlideDown 0.4s ease-out';
                        } else {
                          this.style.background = 'rgba(255, 255, 255, 0.9)';
                          this.style.color = '#4a148c';
                          this.style.backdropFilter = 'blur(20px)';
                        }
                      "
                      style="width: 100%; padding: 32px 24px 32px 70px; background: rgba(255, 255, 255, 0.9); border: none; text-align: left; cursor: pointer; font-size: 18px; font-weight: 600; display: flex; justify-content: space-between; align-items: center; transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); color: #4a148c; backdrop-filter: blur(20px);">
                      <span data-text="true" style="flex: 1; margin-right: 20px; line-height: 1.4;">
                        ${(faq.question || '').replace(/\*\*/g, '')}
                      </span>
                      <span class="faq-icon" style="font-size: 24px; font-weight: 800; line-height: 1; transition: transform 0.3s ease;">+</span>
                    </button>

                    <!-- Answer content -->
                    <div style="padding: 0; display: none; background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(20px);">
                      <div style="padding: 32px 24px 32px 70px; border-top: 1px solid rgba(156, 39, 176, 0.1);">
                        <div data-text="true" style="font-size: 16px; line-height: 1.8; color: #4a148c; font-weight: 400;">
                          ${(faq.answer || '').replace(/\*\*/g, '').replace(/\n/g, '<br>')}
                        </div>
                      </div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Premium gradient overlay -->
            <div style="position: absolute; bottom: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, rgba(156, 39, 176, 0.1), transparent);"></div>
          </section>
        `,
        props: {
          title: content.faq.title,
          introduction: content.faq.introduction,
          questions: content.faq.questions
        },
        config: {
          title: content.faq.title,
          questions: content.faq.questions
        }
      });
    }    }

    // Enhanced Aftercare Section from API content
    if (content.aftercare && content.aftercare.showSection && content.aftercare.instructions && content.aftercare.instructions.length > 0) {
      const enhancedAftercareId = `service-aftercare-enhanced-${componentId++}`;

      components.push({
        id: enhancedAftercareId,
        type: 'ServiceAftercareEnhanced',
        name: `${serviceName} Aftercare Enhanced`,
        category: 'aftercare',
        description: `Enhanced aftercare instructions for ${serviceName}`,
        tags: ['aftercare', 'recovery', 'instructions'],
        instanceId: `${enhancedAftercareId}-${Date.now()}`,
        component: `
          <section class="service-aftercare-enhanced" style="background: linear-gradient(135deg, #f0fdff 0%, #ffffff 100%); padding: 120px 20px; position: relative; overflow: hidden;">
            <!-- Premium background elements -->
            <div style="position: absolute; top: -120px; left: -120px; width: 350px; height: 350px; background: radial-gradient(circle, rgba(0, 150, 136, 0.04) 0%, transparent 70%); border-radius: 50%;"></div>
            <div style="position: absolute; bottom: -100px; right: -100px; width: 300px; height: 300px; background: radial-gradient(circle, rgba(0, 150, 136, 0.03) 0%, transparent 70%); border-radius: 50%;"></div>
            <div style="position: absolute; top: 30%; left: 20%; width: 200px; height: 200px; background: linear-gradient(45deg, rgba(0, 150, 136, 0.02) 0%, transparent 50%); border-radius: 50%; transform: rotate(45deg);"></div>

            <div style="max-width: 1200px; margin: 0 auto; position: relative; z-index: 2;">
              <!-- Premium section header -->
              <div style="text-align: center; margin-bottom: 80px;">
                <div style="display: inline-block; padding: 14px 32px; background: rgba(0, 150, 136, 0.08); backdrop-filter: blur(20px); border-radius: 50px; margin-bottom: 30px; border: 1px solid rgba(0, 150, 136, 0.1);">
                  <span style="color: #00695c; font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 1.5px;">🌿 Recovery Guide</span>
                </div>
                <h2 data-text="true" style="font-size: 48px; font-weight: 800; margin-bottom: 25px; background: linear-gradient(135deg, #00695c, #009688); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; text-shadow: 0 4px 8px rgba(0, 105, 92, 0.1);">
                  ${content.aftercare.title || 'Recovery & Aftercare'}
                </h2>
                ${content.aftercare.introduction ? `
                  <p data-text="true" style="font-size: 20px; color: #00796b; max-width: 800px; margin: 0 auto; line-height: 1.8; font-weight: 400;">
                    ${content.aftercare.introduction}
                  </p>
                ` : ''}
              </div>

              <!-- Premium aftercare timeline -->
              <div style="max-width: 1000px; margin: 0 auto;">
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(450px, 1fr)); gap: 40px;">
                  ${content.aftercare.instructions.map((instruction, index) => `
                    <div style="background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(20px); padding: 40px; border-radius: 24px; box-shadow: 0 8px 32px rgba(0, 150, 136, 0.08); border: 1px solid rgba(0, 150, 136, 0.08); transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); position: relative; overflow: hidden;" onmouseover="this.style.transform='translateY(-8px)'; this.style.boxShadow='0 16px 48px rgba(0, 150, 136, 0.12)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 8px 32px rgba(0, 150, 136, 0.08)'">
                      <!-- Recovery phase indicator -->
                      <div style="position: absolute; top: 0; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, #009688, #00695c);"></div>

                      <!-- Timeline step icon -->
                      <div style="display: flex; align-items: flex-start; gap: 24px;">
                        <div style="flex-shrink: 0; position: relative;">
                          <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #009688, #00695c); color: white; border-radius: 20px; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 800; box-shadow: 0 8px 24px rgba(0, 150, 136, 0.3);">
                            ${index + 1}
                          </div>
                          <!-- Recovery icon overlay -->
                          <div style="position: absolute; -top: 4px; -right: 4px; width: 24px; height: 24px; background: rgba(0, 150, 136, 0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px;">
                            🌿
                          </div>
                        </div>

                        <div style="flex: 1; min-width: 0;">
                          <h3 data-text="true" style="font-size: 22px; font-weight: 700; margin: 0 0 16px 0; color: #00695c; line-height: 1.3;">
                            ${instruction.title}
                          </h3>
                          <p data-text="true" style="font-size: 16px; line-height: 1.8; color: #37474f; margin: 0 0 16px 0; font-weight: 400;">
                            ${(instruction.description || instruction.content || '').replace(/\*\*/g, '')}
                          </p>

                          <!-- Time frame indicator -->
                          ${instruction.timeframe ? `
                            <div style="margin-top: 16px; padding: 12px 20px; background: linear-gradient(135deg, rgba(0, 150, 136, 0.08), rgba(0, 150, 136, 0.04)); backdrop-filter: blur(10px); border-radius: 16px; display: inline-flex; align-items: center; gap: 8px; border: 1px solid rgba(0, 150, 136, 0.1);">
                              <span style="font-size: 14px;">⏱️</span>
                              <span style="font-size: 14px; color: #00695c; font-weight: 600; letter-spacing: 0.5px;">
                                ${instruction.timeframe}
                              </span>
                            </div>
                          ` : ''}
                        </div>
                      </div>

                      <!-- Recovery progress indicator -->
                      <div style="position: absolute; bottom: -2px; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, transparent, rgba(0, 150, 136, 0.2), transparent);"></div>
                    </div>
                  `).join('')}
                </div>
              </div>

              <!-- Recovery timeline completion -->
              <div style="text-align: center; margin-top: 60px;">
                <div style="display: inline-flex; align-items: center; gap: 16px; padding: 20px 32px; background: rgba(0, 150, 136, 0.08); backdrop-filter: blur(20px); border-radius: 50px; border: 1px solid rgba(0, 150, 136, 0.1);">
                  <span style="font-size: 24px;">✨</span>
                  <span style="color: #00695c; font-weight: 600; font-size: 16px; letter-spacing: 0.5px;">Follow these steps for optimal recovery</span>
                  <span style="font-size: 24px;">🌿</span>
                </div>
              </div>
            </div>

            <!-- Premium gradient overlay -->
            <div style="position: absolute; bottom: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, rgba(0, 150, 136, 0.1), transparent);"></div>
          </section>
        `,
        props: {
          title: content.aftercare.title,
          introduction: content.aftercare.introduction,
          instructions: content.aftercare.instructions
        },
        config: {
          title: content.aftercare.title,
          instructions: content.aftercare.instructions
        }
      });
    }

    // Enhanced CTA Section from API content
    if (content.cta) {
      const enhancedCtaId = `service-cta-enhanced-${componentId++}`;

      components.push({
        id: enhancedCtaId,
        type: 'ServiceCTAEnhanced',
        name: `${serviceName} CTA Enhanced`,
        category: 'cta',
        description: `Enhanced call to action for ${serviceName}`,
        tags: ['cta', 'booking', 'consultation'],
        instanceId: `${enhancedCtaId}-${Date.now()}`,
        component: `
          <section class="service-cta-enhanced" style="background: ${content.cta.backgroundColor || '#1976d2'}; padding: 80px 20px; text-align: center;">
            <div style="max-width: 800px; margin: 0 auto;">
              <h2 data-text="true" style="font-size: 36px; font-weight: bold; margin-bottom: 15px; color: white;">
                ${content.cta.title || `Ready for ${serviceName}?`}
              </h2>
              <p data-text="true" style="font-size: 20px; margin-bottom: 40px; color: rgba(255,255,255,0.9);">
                ${content.cta.subtitle || `Schedule your ${serviceName} consultation today.`}
              </p>
              <div style="display: flex; flex-wrap: wrap; gap: 20px; justify-content: center; align-items: center;">
                <button data-text="true" style="background: white; color: ${content.cta.backgroundColor || '#1976d2'}; padding: 18px 40px; border: none; border-radius: 8px; font-size: 18px; font-weight: bold; cursor: pointer; transition: transform 0.3s ease;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                  ${content.cta.buttonText || 'Book Consultation'}
                </button>
                ${content.cta.phoneNumber ? `
                  <div style="display: flex; align-items: center; gap: 10px; color: white;">
                    <span style="font-size: 20px;">📞</span>
                    <span data-text="true" style="font-size: 18px; font-weight: 600;">
                      ${content.cta.phoneNumber}
                    </span>
                  </div>
                ` : ''}
              </div>
            </div>
          </section>
        `,
        props: {
          title: content.cta.title,
          subtitle: content.cta.subtitle,
          buttonText: content.cta.buttonText,
          phoneNumber: content.cta.phoneNumber,
          backgroundColor: content.cta.backgroundColor
        },
        config: {
          title: content.cta.title,
          backgroundColor: content.cta.backgroundColor
        }
      });
    }

    // 🆕 COMPREHENSIVE CONTENT SECTIONS (6 additional sections)
    // These sections are from content.comprehensiveContent and provide detailed information

    // 6. Symptoms Section - From API content.comprehensiveContent.symptoms
    if (content.comprehensiveContent && content.comprehensiveContent.symptoms && content.comprehensiveContent.symptoms.bulletPoints && content.comprehensiveContent.symptoms.bulletPoints.length > 0) {
      const symptomsId = `service-symptoms-${componentId++}`;

      components.push({
        id: symptomsId,
        type: 'ServiceSymptoms',
        name: `${serviceName} Symptoms`,
        category: 'comprehensive',
        description: `Symptoms section for ${serviceName}`,
        tags: ['symptoms', 'signs', 'comprehensive'],
        instanceId: `${symptomsId}-${Date.now()}`,
        component: `
          <section class="service-symptoms" style="background: linear-gradient(135deg, #fef7f7 0%, #ffffff 100%); padding: 120px 20px; position: relative; overflow: hidden;">
            <!-- Enhanced minimalist background elements -->
            <div style="position: absolute; top: -100px; right: -100px; width: 300px; height: 300px; background: radial-gradient(circle, rgba(233, 30, 99, 0.03) 0%, transparent 70%); border-radius: 50%;"></div>
            <div style="position: absolute; bottom: -80px; left: -80px; width: 250px; height: 250px; background: radial-gradient(circle, rgba(233, 30, 99, 0.02) 0%, transparent 70%); border-radius: 50%;"></div>
            <div style="position: absolute; top: 40%; right: 15%; width: 150px; height: 150px; background: linear-gradient(45deg, rgba(233, 30, 99, 0.01) 0%, transparent 50%); border-radius: 50%; transform: rotate(45deg);"></div>

            <div style="max-width: 1200px; margin: 0 auto; position: relative; z-index: 2;">
              <!-- Enhanced minimalist header -->
              <div style="text-align: center; margin-bottom: 80px;">
                <div style="display: inline-block; padding: 14px 32px; background: rgba(233, 30, 99, 0.06); backdrop-filter: blur(20px); border-radius: 50px; margin-bottom: 30px; border: 1px solid rgba(233, 30, 99, 0.08);">
                  <span style="color: #ad1457; font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 1.5px;">🩺 Warning Signs</span>
                </div>
                <h2 data-text="true" style="font-size: 48px; font-weight: 800; margin-bottom: 25px; background: linear-gradient(135deg, #ad1457, #e91e63); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; text-shadow: 0 4px 8px rgba(173, 20, 87, 0.1);">
                  ${content.comprehensiveContent.symptoms.title || 'Signs & Symptoms'}
                </h2>
                <p data-text="true" style="font-size: 20px; color: #8e1538; max-width: 700px; margin: 0 auto; line-height: 1.8; font-weight: 400;">
                  Recognize these symptoms early for better treatment outcomes
                </p>
              </div>

              <!-- Enhanced minimalist symptom cards -->
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(420px, 1fr)); gap: 32px;">
                ${content.comprehensiveContent.symptoms.bulletPoints.map((symptom, index) => `
                  <div style="background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(20px); padding: 40px; border-radius: 24px; box-shadow: 0 8px 32px rgba(233, 30, 99, 0.08); border: 1px solid rgba(233, 30, 99, 0.06); transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); position: relative; overflow: hidden;" onmouseover="this.style.transform='translateY(-8px)'; this.style.boxShadow='0 16px 48px rgba(233, 30, 99, 0.12)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 8px 32px rgba(233, 30, 99, 0.08)'">
                    <!-- Minimalist accent line -->
                    <div style="position: absolute; top: 0; left: 0; width: 100%; height: 3px; background: linear-gradient(90deg, #e91e63, #ad1457);"></div>

                    <!-- Symptom content -->
                    <div style="display: flex; align-items: flex-start; gap: 24px;">
                      <!-- Enhanced minimalist icon -->
                      <div style="flex-shrink: 0; position: relative;">
                        <div style="width: 60px; height: 60px; background: linear-gradient(135deg, rgba(233, 30, 99, 0.1), rgba(173, 20, 87, 0.05)); backdrop-filter: blur(10px); color: #ad1457; border-radius: 20px; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 800; box-shadow: 0 4px 16px rgba(233, 30, 99, 0.1); border: 1px solid rgba(233, 30, 99, 0.1);">
                          ${index + 1}
                        </div>
                        <!-- Medical indicator -->
                        <div style="position: absolute; -top: 8px; -right: 8px; width: 20px; height: 20px; background: rgba(233, 30, 99, 0.08); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px;">
                          🚨
                        </div>
                      </div>

                      <div style="flex: 1; min-width: 0;">
                        <h3 data-text="true" style="font-size: 22px; font-weight: 700; margin: 0 0 16px 0; color: #ad1457; line-height: 1.3;">
                          ${symptom.title}
                        </h3>
                        <p data-text="true" style="font-size: 16px; line-height: 1.8; color: #37474f; margin: 0; font-weight: 400;">
                          ${(symptom.content || '').replace(/\*\*/g, '')}
                        </p>
                      </div>
                    </div>

                    <!-- Subtle bottom accent -->
                    <div style="position: absolute; bottom: -1px; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, transparent, rgba(233, 30, 99, 0.1), transparent);"></div>
                  </div>
                `).join('')}
              </div>

              <!-- Minimalist summary indicator -->
              <div style="text-align: center; margin-top: 60px;">
                <div style="display: inline-flex; align-items: center; gap: 16px; padding: 20px 32px; background: rgba(233, 30, 99, 0.04); backdrop-filter: blur(20px); border-radius: 50px; border: 1px solid rgba(233, 30, 99, 0.06);">
                  <span style="font-size: 20px;">🩺</span>
                  <span style="color: #ad1457; font-weight: 600; font-size: 16px; letter-spacing: 0.5px;">Early detection leads to better outcomes</span>
                  <span style="font-size: 20px;">✨</span>
                </div>
              </div>
            </div>

            <!-- Minimalist gradient overlay -->
            <div style="position: absolute; bottom: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, rgba(233, 30, 99, 0.08), transparent);"></div>
          </section>
        `,
        props: {
          title: content.comprehensiveContent.symptoms.title,
          bulletPoints: content.comprehensiveContent.symptoms.bulletPoints
        },
        config: {
          title: content.comprehensiveContent.symptoms.title,
          bulletPoints: content.comprehensiveContent.symptoms.bulletPoints
        }
      });
    }

    // 7. Consequences Section - From API content.comprehensiveContent.consequences
    if (content.comprehensiveContent && content.comprehensiveContent.consequences && content.comprehensiveContent.consequences.bulletPoints && content.comprehensiveContent.consequences.bulletPoints.length > 0) {
      const consequencesId = `service-consequences-${componentId++}`;

      components.push({
        id: consequencesId,
        type: 'ServiceConsequences',
        name: `${serviceName} Consequences`,
        category: 'comprehensive',
        description: `Consequences section for ${serviceName}`,
        tags: ['consequences', 'risks', 'comprehensive'],
        instanceId: `${consequencesId}-${Date.now()}`,
        component: `
          <section class="service-consequences" style="background: linear-gradient(135deg, #fff8f5 0%, #ffffff 100%); padding: 120px 20px; position: relative; overflow: hidden;">
            <!-- Enhanced minimalist background elements -->
            <div style="position: absolute; top: -100px; right: -100px; width: 300px; height: 300px; background: radial-gradient(circle, rgba(255, 152, 0, 0.03) 0%, transparent 70%); border-radius: 50%;"></div>
            <div style="position: absolute; bottom: -80px; left: -80px; width: 250px; height: 250px; background: radial-gradient(circle, rgba(255, 152, 0, 0.02) 0%, transparent 70%); border-radius: 50%;"></div>
            <div style="position: absolute; top: 40%; left: 15%; width: 150px; height: 150px; background: linear-gradient(45deg, rgba(255, 152, 0, 0.01) 0%, transparent 50%); border-radius: 50%; transform: rotate(45deg);"></div>

            <div style="max-width: 1200px; margin: 0 auto; position: relative; z-index: 2;">
              <!-- Enhanced minimalist header -->
              <div style="text-align: center; margin-bottom: 80px;">
                <div style="display: inline-block; padding: 14px 32px; background: rgba(255, 152, 0, 0.06); backdrop-filter: blur(20px); border-radius: 50px; margin-bottom: 30px; border: 1px solid rgba(255, 152, 0, 0.08);">
                  <span style="color: #e65100; font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 1.5px;">⚠️ Important Risks</span>
                </div>
                <h2 data-text="true" style="font-size: 48px; font-weight: 800; margin-bottom: 25px; background: linear-gradient(135deg, #e65100, #ff9800); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; text-shadow: 0 4px 8px rgba(230, 81, 0, 0.1);">
                  ${content.comprehensiveContent.consequences.title || 'If Left Untreated'}
                </h2>
                <p data-text="true" style="font-size: 20px; color: #d84315; max-width: 700px; margin: 0 auto; line-height: 1.8; font-weight: 400;">
                  Understanding the risks of delayed treatment
                </p>
              </div>

              <!-- Enhanced minimalist consequence cards -->
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(420px, 1fr)); gap: 32px;">
                ${content.comprehensiveContent.consequences.bulletPoints.map((consequence, index) => `
                  <div style="background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(20px); padding: 40px; border-radius: 24px; box-shadow: 0 8px 32px rgba(255, 152, 0, 0.08); border: 1px solid rgba(255, 152, 0, 0.06); transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); position: relative; overflow: hidden;" onmouseover="this.style.transform='translateY(-8px)'; this.style.boxShadow='0 16px 48px rgba(255, 152, 0, 0.12)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 8px 32px rgba(255, 152, 0, 0.08)'">
                    <!-- Minimalist accent line -->
                    <div style="position: absolute; top: 0; left: 0; width: 100%; height: 3px; background: linear-gradient(90deg, #ff9800, #e65100);"></div>

                    <!-- Consequence content -->
                    <div style="display: flex; align-items: flex-start; gap: 24px;">
                      <!-- Enhanced minimalist warning icon -->
                      <div style="flex-shrink: 0; position: relative;">
                        <div style="width: 60px; height: 60px; background: linear-gradient(135deg, rgba(255, 152, 0, 0.1), rgba(230, 81, 0, 0.05)); backdrop-filter: blur(10px); color: #e65100; border-radius: 20px; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 800; box-shadow: 0 4px 16px rgba(255, 152, 0, 0.1); border: 1px solid rgba(255, 152, 0, 0.1);">
                          ⚠️
                        </div>
                        <!-- Risk indicator -->
                        <div style="position: absolute; -top: 8px; -right: 8px; width: 20px; height: 20px; background: rgba(255, 152, 0, 0.08); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px;">
                          🚨
                        </div>
                      </div>

                      <div style="flex: 1; min-width: 0;">
                        <h3 data-text="true" style="font-size: 22px; font-weight: 700; margin: 0 0 16px 0; color: #e65100; line-height: 1.3;">
                          ${consequence.title}
                        </h3>
                        <p data-text="true" style="font-size: 16px; line-height: 1.8; color: #37474f; margin: 0; font-weight: 400;">
                          ${(consequence.content || '').replace(/\*\*/g, '')}
                        </p>
                      </div>
                    </div>

                    <!-- Subtle bottom accent -->
                    <div style="position: absolute; bottom: -1px; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, transparent, rgba(255, 152, 0, 0.1), transparent);"></div>
                  </div>
                `).join('')}
              </div>

              <!-- Minimalist prevention call-to-action -->
              <div style="text-align: center; margin-top: 60px;">
                <div style="display: inline-flex; align-items: center; gap: 16px; padding: 20px 32px; background: rgba(255, 152, 0, 0.04); backdrop-filter: blur(20px); border-radius: 50px; border: 1px solid rgba(255, 152, 0, 0.06);">
                  <span style="font-size: 20px;">🛡️</span>
                  <span style="color: #e65100; font-weight: 600; font-size: 16px; letter-spacing: 0.5px;">Prevention is better than cure</span>
                  <span style="font-size: 20px;">⚕️</span>
                </div>
              </div>
            </div>

            <!-- Minimalist gradient overlay -->
            <div style="position: absolute; bottom: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, rgba(255, 152, 0, 0.08), transparent);"></div>
          </section>
        `,
        props: {
          title: content.comprehensiveContent.consequences.title,
          bulletPoints: content.comprehensiveContent.consequences.bulletPoints
        },
        config: {
          title: content.comprehensiveContent.consequences.title,
          bulletPoints: content.comprehensiveContent.consequences.bulletPoints
        }
      });
    }

    // 8. Procedure Details Section - From API content.comprehensiveContent.procedureDetails
    if (content.comprehensiveContent && content.comprehensiveContent.procedureDetails && content.comprehensiveContent.procedureDetails.steps && content.comprehensiveContent.procedureDetails.steps.length > 0) {
      const procedureDetailsId = `service-procedure-details-${componentId++}`;

      components.push({
        id: procedureDetailsId,
        type: 'ServiceProcedureDetails',
        name: `${serviceName} Detailed Procedure`,
        category: 'comprehensive',
        description: `Detailed procedure steps for ${serviceName}`,
        tags: ['procedure', 'detailed', 'comprehensive'],
        instanceId: `${procedureDetailsId}-${Date.now()}`,
        component: `
          <section class="service-procedure-details" style="background: linear-gradient(135deg, #f3f9ff 0%, #ffffff 100%); padding: 120px 20px; position: relative; overflow: hidden;">
            <!-- Enhanced minimalist background elements -->
            <div style="position: absolute; top: -120px; right: -120px; width: 350px; height: 350px; background: radial-gradient(circle, rgba(33, 150, 243, 0.03) 0%, transparent 70%); border-radius: 50%;"></div>
            <div style="position: absolute; bottom: -100px; left: -100px; width: 300px; height: 300px; background: radial-gradient(circle, rgba(33, 150, 243, 0.02) 0%, transparent 70%); border-radius: 50%;"></div>
            <div style="position: absolute; top: 30%; right: 20%; width: 200px; height: 200px; background: linear-gradient(45deg, rgba(33, 150, 243, 0.01) 0%, transparent 50%); border-radius: 50%; transform: rotate(45deg);"></div>

            <div style="max-width: 1200px; margin: 0 auto; position: relative; z-index: 2;">
              <!-- Enhanced minimalist header -->
              <div style="text-align: center; margin-bottom: 80px;">
                <div style="display: inline-block; padding: 14px 32px; background: rgba(33, 150, 243, 0.06); backdrop-filter: blur(20px); border-radius: 50px; margin-bottom: 30px; border: 1px solid rgba(33, 150, 243, 0.08);">
                  <span style="color: #0d47a1; font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 1.5px;">🔬 Detailed Process</span>
                </div>
                <h2 data-text="true" style="font-size: 48px; font-weight: 800; margin-bottom: 25px; background: linear-gradient(135deg, #0d47a1, #2196f3); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; text-shadow: 0 4px 8px rgba(13, 71, 161, 0.1);">
                  ${content.comprehensiveContent.procedureDetails.title || 'Detailed Procedure'}
                </h2>
                <p data-text="true" style="font-size: 20px; color: #1565c0; max-width: 700px; margin: 0 auto; line-height: 1.8; font-weight: 400;">
                  Step-by-step breakdown of the complete treatment process
                </p>
              </div>

              <!-- Enhanced minimalist procedure timeline -->
              <div style="max-width: 1000px; margin: 0 auto; position: relative;">
                ${content.comprehensiveContent.procedureDetails.steps.map((step, index) => `
                  <div style="display: flex; align-items: flex-start; margin-bottom: 48px; position: relative;">
                    <!-- Enhanced minimalist step indicator -->
                    <div style="flex-shrink: 0; position: relative; margin-right: 40px;">
                      <div style="width: 80px; height: 80px; background: linear-gradient(135deg, rgba(33, 150, 243, 0.1), rgba(13, 71, 161, 0.05)); backdrop-filter: blur(10px); color: #0d47a1; border-radius: 24px; display: flex; align-items: center; justify-content: center; font-size: 28px; font-weight: 800; box-shadow: 0 8px 24px rgba(33, 150, 243, 0.1); border: 2px solid rgba(33, 150, 243, 0.1); z-index: 2;">
                        ${step.stepNumber || index + 1}
                      </div>
                      <!-- Process indicator -->
                      <div style="position: absolute; -top: 4px; -right: 4px; width: 24px; height: 24px; background: rgba(33, 150, 243, 0.08); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px;">
                        🔬
                      </div>
                    </div>

                    <!-- Timeline connector -->
                    ${index < content.comprehensiveContent.procedureDetails.steps.length - 1 ? `
                      <div style="position: absolute; left: 39px; top: 80px; width: 2px; height: 48px; background: linear-gradient(180deg, rgba(33, 150, 243, 0.2), rgba(33, 150, 243, 0.1)); z-index: 1;"></div>
                    ` : ''}

                    <!-- Enhanced step content card -->
                    <div style="flex: 1; background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(20px); padding: 40px; border-radius: 24px; box-shadow: 0 8px 32px rgba(33, 150, 243, 0.08); border: 1px solid rgba(33, 150, 243, 0.06); transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); position: relative; overflow: hidden;" onmouseover="this.style.transform='translateY(-6px)'; this.style.boxShadow='0 16px 48px rgba(33, 150, 243, 0.12)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 8px 32px rgba(33, 150, 243, 0.08)'">
                      <!-- Minimalist accent line -->
                      <div style="position: absolute; top: 0; left: 0; width: 100%; height: 3px; background: linear-gradient(90deg, #2196f3, #0d47a1);"></div>

                      <h3 data-text="true" style="font-size: 24px; font-weight: 700; margin: 0 0 20px 0; color: #0d47a1; line-height: 1.3;">
                        ${step.title}
                      </h3>
                      <p data-text="true" style="font-size: 17px; line-height: 1.8; color: #37474f; margin: 0; font-weight: 400;">
                        ${(step.description || step.content || '').replace(/\*\*/g, '')}
                      </p>

                      <!-- Subtle step completion indicator -->
                      <div style="position: absolute; bottom: -1px; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, transparent, rgba(33, 150, 243, 0.1), transparent);"></div>
                    </div>
                  </div>
                `).join('')}

                <!-- Process completion indicator -->
                <div style="text-align: center; margin-top: 60px;">
                  <div style="display: inline-flex; align-items: center; gap: 16px; padding: 20px 32px; background: rgba(33, 150, 243, 0.04); backdrop-filter: blur(20px); border-radius: 50px; border: 1px solid rgba(33, 150, 243, 0.06);">
                    <span style="font-size: 20px;">⚕️</span>
                    <span style="color: #0d47a1; font-weight: 600; font-size: 16px; letter-spacing: 0.5px;">Professional treatment process</span>
                    <span style="font-size: 20px;">✨</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Minimalist gradient overlay -->
            <div style="position: absolute; bottom: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, rgba(33, 150, 243, 0.08), transparent);"></div>
          </section>
        `,
        props: {
          title: content.comprehensiveContent.procedureDetails.title,
          steps: content.comprehensiveContent.procedureDetails.steps
        },
        config: {
          title: content.comprehensiveContent.procedureDetails.title,
          steps: content.comprehensiveContent.procedureDetails.steps
        }
      });
    }

    // 9. Detailed Benefits Section - From API content.comprehensiveContent.detailedBenefits
    if (content.comprehensiveContent && content.comprehensiveContent.detailedBenefits && content.comprehensiveContent.detailedBenefits.bulletPoints && content.comprehensiveContent.detailedBenefits.bulletPoints.length > 0) {
      const detailedBenefitsId = `service-detailed-benefits-${componentId++}`;

      components.push({
        id: detailedBenefitsId,
        type: 'ServiceDetailedBenefits',
        name: `${serviceName} Detailed Benefits`,
        category: 'comprehensive',
        description: `Detailed benefits section for ${serviceName}`,
        tags: ['benefits', 'detailed', 'comprehensive'],
        instanceId: `${detailedBenefitsId}-${Date.now()}`,
        component: `
          <section class="service-detailed-benefits" style="background: linear-gradient(135deg, #f1f8f1 0%, #ffffff 100%); padding: 120px 20px; position: relative; overflow: hidden;">
            <!-- Enhanced minimalist background elements -->
            <div style="position: absolute; top: -100px; left: -100px; width: 300px; height: 300px; background: radial-gradient(circle, rgba(76, 175, 80, 0.03) 0%, transparent 70%); border-radius: 50%;"></div>
            <div style="position: absolute; bottom: -80px; right: -80px; width: 250px; height: 250px; background: radial-gradient(circle, rgba(76, 175, 80, 0.02) 0%, transparent 70%); border-radius: 50%;"></div>
            <div style="position: absolute; top: 40%; right: 15%; width: 150px; height: 150px; background: linear-gradient(45deg, rgba(76, 175, 80, 0.01) 0%, transparent 50%); border-radius: 50%; transform: rotate(45deg);"></div>

            <div style="max-width: 1200px; margin: 0 auto; position: relative; z-index: 2;">
              <!-- Enhanced minimalist header -->
              <div style="text-align: center; margin-bottom: 80px;">
                <div style="display: inline-block; padding: 14px 32px; background: rgba(76, 175, 80, 0.06); backdrop-filter: blur(20px); border-radius: 50px; margin-bottom: 30px; border: 1px solid rgba(76, 175, 80, 0.08);">
                  <span style="color: #1b5e20; font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 1.5px;">✨ Treatment Benefits</span>
                </div>
                <h2 data-text="true" style="font-size: 48px; font-weight: 800; margin-bottom: 25px; background: linear-gradient(135deg, #1b5e20, #4caf50); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; text-shadow: 0 4px 8px rgba(27, 94, 32, 0.1);">
                  ${content.comprehensiveContent.detailedBenefits.title || 'Treatment Benefits'}
                </h2>
                <p data-text="true" style="font-size: 20px; color: #2e7d32; max-width: 700px; margin: 0 auto; line-height: 1.8; font-weight: 400;">
                  Comprehensive advantages and positive outcomes you can expect
                </p>
              </div>

              <!-- Enhanced minimalist benefit cards -->
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(420px, 1fr)); gap: 32px;">
                ${content.comprehensiveContent.detailedBenefits.bulletPoints.map((benefit, index) => `
                  <div style="background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(20px); padding: 40px; border-radius: 24px; box-shadow: 0 8px 32px rgba(76, 175, 80, 0.08); border: 1px solid rgba(76, 175, 80, 0.06); transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); position: relative; overflow: hidden;" onmouseover="this.style.transform='translateY(-8px)'; this.style.boxShadow='0 16px 48px rgba(76, 175, 80, 0.12)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 8px 32px rgba(76, 175, 80, 0.08)'">
                    <!-- Minimalist accent line -->
                    <div style="position: absolute; top: 0; left: 0; width: 100%; height: 3px; background: linear-gradient(90deg, #4caf50, #1b5e20);"></div>

                    <!-- Benefit content -->
                    <div style="display: flex; align-items: flex-start; gap: 24px;">
                      <!-- Enhanced minimalist check icon -->
                      <div style="flex-shrink: 0; position: relative;">
                        <div style="width: 60px; height: 60px; background: linear-gradient(135deg, rgba(76, 175, 80, 0.1), rgba(27, 94, 32, 0.05)); backdrop-filter: blur(10px); color: #1b5e20; border-radius: 20px; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 800; box-shadow: 0 4px 16px rgba(76, 175, 80, 0.1); border: 1px solid rgba(76, 175, 80, 0.1);">
                          ✓
                        </div>
                        <!-- Benefit indicator -->
                        <div style="position: absolute; -top: 8px; -right: 8px; width: 20px; height: 20px; background: rgba(76, 175, 80, 0.08); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px;">
                          ✨
                        </div>
                      </div>

                      <div style="flex: 1; min-width: 0;">
                        <h3 data-text="true" style="font-size: 22px; font-weight: 700; margin: 0 0 16px 0; color: #1b5e20; line-height: 1.3;">
                          ${benefit.title}
                        </h3>
                        <p data-text="true" style="font-size: 16px; line-height: 1.8; color: #37474f; margin: 0; font-weight: 400;">
                          ${(benefit.content || '').replace(/\*\*/g, '')}
                        </p>
                      </div>
                    </div>

                    <!-- Subtle bottom accent -->
                    <div style="position: absolute; bottom: -1px; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, transparent, rgba(76, 175, 80, 0.1), transparent);"></div>
                  </div>
                `).join('')}
              </div>

              <!-- Minimalist success indicator -->
              <div style="text-align: center; margin-top: 60px;">
                <div style="display: inline-flex; align-items: center; gap: 16px; padding: 20px 32px; background: rgba(76, 175, 80, 0.04); backdrop-filter: blur(20px); border-radius: 50px; border: 1px solid rgba(76, 175, 80, 0.06);">
                  <span style="font-size: 20px;">🌟</span>
                  <span style="color: #1b5e20; font-weight: 600; font-size: 16px; letter-spacing: 0.5px;">Experience these amazing benefits</span>
                  <span style="font-size: 20px;">💚</span>
                </div>
              </div>
            </div>

            <!-- Minimalist gradient overlay -->
            <div style="position: absolute; bottom: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, rgba(76, 175, 80, 0.08), transparent);"></div>
          </section>
        `,
        props: {
          title: content.comprehensiveContent.detailedBenefits.title,
          bulletPoints: content.comprehensiveContent.detailedBenefits.bulletPoints
        },
        config: {
          title: content.comprehensiveContent.detailedBenefits.title,
          bulletPoints: content.comprehensiveContent.detailedBenefits.bulletPoints
        }
      });
    }

    // 10. Side Effects Section - From API content.comprehensiveContent.sideEffects
    if (content.comprehensiveContent && content.comprehensiveContent.sideEffects && content.comprehensiveContent.sideEffects.bulletPoints && content.comprehensiveContent.sideEffects.bulletPoints.length > 0) {
      const sideEffectsId = `service-side-effects-${componentId++}`;

      components.push({
        id: sideEffectsId,
        type: 'ServiceSideEffects',
        name: `${serviceName} Side Effects`,
        category: 'comprehensive',
        description: `Side effects section for ${serviceName}`,
        tags: ['side-effects', 'risks', 'comprehensive'],
        instanceId: `${sideEffectsId}-${Date.now()}`,
        component: `
          <section class="service-side-effects" style="background: linear-gradient(135deg, #f3e5f5 0%, #ce93d8 50%, #9c27b0 100%); padding: 100px 20px; position: relative; overflow: hidden;">
            <div style="position: absolute; top: -40px; right: -40px; width: 180px; height: 180px; background: rgba(255,255,255,0.1); border-radius: 50%; transform: rotate(45deg);"></div>
            <div style="position: absolute; bottom: -20px; left: -20px; width: 120px; height: 120px; background: rgba(255,255,255,0.05); border-radius: 50%;"></div>
            <div style="max-width: 1200px; margin: 0 auto; position: relative; z-index: 2;">
              <div style="text-align: center; margin-bottom: 80px;">
                <div style="display: inline-block; padding: 12px 30px; background: rgba(156, 39, 176, 0.15); border-radius: 50px; margin-bottom: 30px;">
                  <span style="color: #4a148c; font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">💊 Considerations</span>
                </div>
                <h2 data-text="true" style="font-size: 48px; font-weight: 800; margin-bottom: 25px; color: #4a148c; text-shadow: 2px 2px 4px rgba(0,0,0,0.1);">
                  ${content.comprehensiveContent.sideEffects.title || 'Possible Side Effects'}
                </h2>
                <p data-text="true" style="font-size: 20px; color: #6a1b9a; max-width: 700px; margin: 0 auto; line-height: 1.6;">
                  Important information about potential temporary effects
                </p>
              </div>
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 35px;">
                ${content.comprehensiveContent.sideEffects.bulletPoints.map((sideEffect, index) => `
                  <div style="background: rgba(255,255,255,0.95); padding: 40px; border-radius: 20px; box-shadow: 0 20px 40px rgba(156, 39, 176, 0.15); border: 1px solid rgba(156, 39, 176, 0.1); transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); position: relative; overflow: hidden;" onmouseover="this.style.transform='translateY(-10px) scale(1.02)'; this.style.boxShadow='0 30px 60px rgba(156, 39, 176, 0.25)'" onmouseout="this.style.transform='translateY(0) scale(1)'; this.style.boxShadow='0 20px 40px rgba(156, 39, 176, 0.15)'">
                    <div style="position: absolute; top: 0; left: 0; width: 100%; height: 6px; background: linear-gradient(90deg, #9c27b0, #4a148c);"></div>
                    <div style="display: flex; align-items: flex-start; gap: 20px;">
                      <div style="flex-shrink: 0; width: 60px; height: 60px; background: linear-gradient(135deg, #9c27b0, #4a148c); color: white; border-radius: 15px; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: bold; box-shadow: 0 8px 20px rgba(156, 39, 176, 0.3);">
                        ℹ️
                      </div>
                      <div style="flex: 1;">
                        <h3 data-text="true" style="font-size: 22px; font-weight: 700; margin: 0 0 15px 0; color: #4a148c; line-height: 1.3;">
                          ${sideEffect.title}
                        </h3>
                        <p data-text="true" style="font-size: 16px; line-height: 1.7; color: #4a4a4a; margin: 0;">
                          ${(sideEffect.content || '').replace(/\*\*/g, '')}
                        </p>
                      </div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          </section>
        `,
        props: {
          title: content.comprehensiveContent.sideEffects.title,
          bulletPoints: content.comprehensiveContent.sideEffects.bulletPoints
        },
        config: {
          title: content.comprehensiveContent.sideEffects.title,
          bulletPoints: content.comprehensiveContent.sideEffects.bulletPoints
        }
      });
    }

    // 11. Myths & Facts Section - From API content.comprehensiveContent.mythsAndFacts
    if (content.comprehensiveContent && content.comprehensiveContent.mythsAndFacts && content.comprehensiveContent.mythsAndFacts.items && content.comprehensiveContent.mythsAndFacts.items.length > 0) {
      const mythsAndFactsId = `service-myths-facts-${componentId++}`;

      components.push({
        id: mythsAndFactsId,
        type: 'ServiceMythsFacts',
        name: `${serviceName} Myths & Facts`,
        category: 'comprehensive',
        description: `Myths and facts section for ${serviceName}`,
        tags: ['myths', 'facts', 'comprehensive'],
        instanceId: `${mythsAndFactsId}-${Date.now()}`,
        component: `
          <section class="service-myths-facts" style="background: linear-gradient(135deg, #fbe9e7 0%, #ffab91 50%, #ff5722 100%); padding: 100px 20px; position: relative; overflow: hidden;">
            <div style="position: absolute; top: -60px; left: -60px; width: 220px; height: 220px; background: rgba(255,255,255,0.1); border-radius: 50%; transform: rotate(45deg);"></div>
            <div style="position: absolute; bottom: -40px; right: -40px; width: 160px; height: 160px; background: rgba(255,255,255,0.05); border-radius: 50%;"></div>
            <div style="max-width: 1200px; margin: 0 auto; position: relative; z-index: 2;">
              <div style="text-align: center; margin-bottom: 80px;">
                <div style="display: inline-block; padding: 12px 30px; background: rgba(255, 87, 34, 0.15); border-radius: 50px; margin-bottom: 30px;">
                  <span style="color: #bf360c; font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">🔍 Truth Check</span>
                </div>
                <h2 data-text="true" style="font-size: 48px; font-weight: 800; margin-bottom: 25px; color: #bf360c; text-shadow: 2px 2px 4px rgba(0,0,0,0.1);">
                  ${content.comprehensiveContent.mythsAndFacts.title || 'Myths vs Facts'}
                </h2>
                <p data-text="true" style="font-size: 20px; color: #d84315; max-width: 700px; margin: 0 auto; line-height: 1.6;">
                  Separating misconceptions from evidence-based truths
                </p>
              </div>
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(500px, 1fr)); gap: 40px;">
                ${content.comprehensiveContent.mythsAndFacts.items.map((item, index) => `
                  <div style="background: rgba(255,255,255,0.95); border-radius: 25px; overflow: hidden; box-shadow: 0 25px 50px rgba(255, 87, 34, 0.15); border: 1px solid rgba(255, 87, 34, 0.1); transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);" onmouseover="this.style.transform='translateY(-12px)'; this.style.boxShadow='0 35px 70px rgba(255, 87, 34, 0.25)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 25px 50px rgba(255, 87, 34, 0.15)'">
                    <!-- Myth Section -->
                    <div style="background: linear-gradient(135deg, #ffcdd2, #ef5350); padding: 30px; position: relative;">
                      <div style="position: absolute; top: -10px; right: -10px; width: 80px; height: 80px; background: rgba(255,255,255,0.1); border-radius: 50%; transform: rotate(45deg);"></div>
                      <div style="display: flex; align-items: flex-start; gap: 15px; position: relative; z-index: 2;">
                        <div style="flex-shrink: 0; width: 50px; height: 50px; background: rgba(244, 67, 54, 0.9); color: white; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: bold;">
                          ❌
                        </div>
                        <div style="flex: 1;">
                          <h4 style="font-size: 16px; font-weight: 700; margin: 0 0 10px 0; color: #c62828; text-transform: uppercase; letter-spacing: 1px;">MYTH</h4>
                          <p data-text="true" style="font-size: 17px; line-height: 1.6; color: #1a1a1a; margin: 0; font-weight: 500;">
                            ${(item.myth || '').replace(/\*\*/g, '')}
                          </p>
                        </div>
                      </div>
                    </div>
                    <!-- Fact Section -->
                    <div style="background: linear-gradient(135deg, #c8e6c9, #66bb6a); padding: 30px; position: relative;">
                      <div style="position: absolute; top: -10px; left: -10px; width: 80px; height: 80px; background: rgba(255,255,255,0.1); border-radius: 50%; transform: rotate(45deg);"></div>
                      <div style="display: flex; align-items: flex-start; gap: 15px; position: relative; z-index: 2;">
                        <div style="flex-shrink: 0; width: 50px; height: 50px; background: rgba(76, 175, 80, 0.9); color: white; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: bold;">
                          ✅
                        </div>
                        <div style="flex: 1;">
                          <h4 style="font-size: 16px; font-weight: 700; margin: 0 0 10px 0; color: #1b5e20; text-transform: uppercase; letter-spacing: 1px;">FACT</h4>
                          <p data-text="true" style="font-size: 17px; line-height: 1.6; color: #1a1a1a; margin: 0; font-weight: 500;">
                            ${(item.fact || '').replace(/\*\*/g, '')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          </section>
        `,
        props: {
          title: content.comprehensiveContent.mythsAndFacts.title,
          items: content.comprehensiveContent.mythsAndFacts.items
        },
        config: {
          title: content.comprehensiveContent.mythsAndFacts.title,
          items: content.comprehensiveContent.mythsAndFacts.items
        }
      });
    }

    // 12. Blog Section - Related Articles (positioned after Myths & Facts)
    console.log('🔍 Blog section check - blogCards:', blogCards, 'length:', blogCards?.length);
    if (blogCards && blogCards.length > 0) {
      console.log('✅ Creating blog section with', blogCards.length, 'blog cards');
      const blogSectionId = `service-blog-${componentId++}`;
      components.push({
        id: blogSectionId,
        type: 'ServiceBlogSection',
        name: 'Related Blog Articles',
        category: 'comprehensive',
        description: 'Blog articles related to this service',
        tags: ['blog', 'articles', 'content', 'comprehensive'],
        instanceId: `${blogSectionId}-${Date.now()}`,
        component: `
          <section class="service-blog" style="background: linear-gradient(135deg, #f3e8ff 0%, #ddd6fe 50%, #c4b5fd 100%); padding: 100px 20px; position: relative; overflow: hidden;">
            <div style="position: absolute; top: -60px; right: -60px; width: 220px; height: 220px; background: rgba(255,255,255,0.1); border-radius: 50%; transform: rotate(45deg);"></div>
            <div style="position: absolute; bottom: -40px; left: -40px; width: 160px; height: 160px; background: rgba(255,255,255,0.05); border-radius: 50%;"></div>
            <div style="max-width: 1200px; margin: 0 auto; position: relative; z-index: 2;">
              <div style="text-align: center; margin-bottom: 80px;">
                <div style="display: inline-block; padding: 12px 30px; background: rgba(139, 69, 255, 0.15); border-radius: 50px; margin-bottom: 30px;">
                  <span style="color: #6b46c1; font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">📚 Related Articles</span>
                </div>
                <h2 data-text="true" style="font-size: 48px; font-weight: 800; margin-bottom: 25px; color: #6b46c1; text-shadow: 2px 2px 4px rgba(0,0,0,0.1);">
                  Learn More About This Treatment
                </h2>
                <p data-text="true" style="font-size: 20px; color: #7c3aed; max-width: 700px; margin: 0 auto; line-height: 1.6;">
                  Explore our comprehensive guides and expert insights
                </p>
              </div>
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 24px;">
                ${blogCards.map((blog, index) => `
                  <article style="
                    background: white;
                    border: 1px solid rgba(0, 0, 0, 0.08);
                    border-radius: 12px;
                    padding: 24px;
                    transition: all 0.3s ease;
                    position: relative;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
                  " onmouseover="
                    this.style.borderColor = 'rgba(139, 69, 255, 0.2)';
                    this.style.boxShadow = '0 4px 16px rgba(139, 69, 255, 0.1)';
                  " onmouseout="
                    this.style.borderColor = 'rgba(0, 0, 0, 0.08)';
                    this.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)';
                  ">

                    <!-- Featured badge (minimal) -->
                    ${blog.featured ? `
                      <div style="
                        position: absolute;
                        top: 16px;
                        right: 16px;
                        width: 8px;
                        height: 8px;
                        background: #f59e0b;
                        border-radius: 50%;
                        box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.2);
                      "></div>
                    ` : ''}

                    <!-- Content -->
                    <div style="margin-bottom: 20px;">
                      <h3 data-text="true" style="
                        font-size: 20px;
                        font-weight: 600;
                        margin: 0 0 12px 0;
                        color: #1a1a1a;
                        line-height: 1.4;
                        display: -webkit-box;
                        -webkit-line-clamp: 2;
                        -webkit-box-orient: vertical;
                        overflow: hidden;
                      ">
                        ${blog.title}
                      </h3>

                      <p data-text="true" style="
                        font-size: 14px;
                        line-height: 1.5;
                        color: #6b7280;
                        margin: 0 0 16px 0;
                        display: -webkit-box;
                        -webkit-line-clamp: 2;
                        -webkit-box-orient: vertical;
                        overflow: hidden;
                      ">
                        ${blog.summary}
                      </p>

                      <!-- Metadata -->
                      <div style="
                        display: flex;
                        align-items: center;
                        gap: 12px;
                        margin-bottom: 16px;
                        font-size: 12px;
                        color: #9ca3af;
                      ">
                        <span>${blog.readingTime} min read</span>
                        <span>•</span>
                        <span>${blog.wordCount} words</span>
                      </div>
                    </div>

                    <!-- Read Button -->
                    <button onclick="
                      event.stopPropagation();
                      window.location.href = '${blog.url}';
                    " style="
                      width: 100%;
                      padding: 10px 16px;
                      background: #6b46c1;
                      color: white;
                      border: none;
                      border-radius: 8px;
                      font-size: 14px;
                      font-weight: 500;
                      cursor: pointer;
                      transition: all 0.3s ease;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      gap: 6px;
                    " onmouseover="
                      this.style.background = '#553c9a';
                      this.style.transform = 'translateY(-1px)';
                    " onmouseout="
                      this.style.background = '#6b46c1';
                      this.style.transform = 'translateY(0)';
                    ">
                      Read Article
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </button>
                  </article>
                `).join('')}
              </div>
              ${blogCards.length > 3 ? `
                <div style="text-align: center; margin-top: 60px;">
                  <a href="/blog" style="display: inline-flex; align-items: center; gap: 8px; padding: 16px 32px; background: linear-gradient(135deg, #6b46c1, #553c9a); color: white; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px; transition: all 0.3s ease; box-shadow: 0 8px 25px rgba(107, 70, 193, 0.25);" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 12px 30px rgba(107, 70, 193, 0.35)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 8px 25px rgba(107, 70, 193, 0.25)'">
                    View All Articles
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </a>
                </div>
              ` : ''}
            </div>
          </section>
        `,
        props: {
          title: 'Learn More About This Treatment',
          blogs: blogCards
        },
        config: {
          title: 'Learn More About This Treatment',
          blogs: blogCards
        }
      });
    }

    // 13. Footer Section - Professional footer at the very end
    const footerId = `service-footer-${componentId++}`;
    components.push({
      id: footerId,
      type: 'ServiceFooter',
      name: 'Professional Footer',
      category: 'footer',
      description: 'Professional dental practice footer with contact information',
      tags: ['footer', 'contact', 'professional'],
      instanceId: `${footerId}-${Date.now()}`,
      component: `
        <footer class="service-footer" style="background: linear-gradient(135deg, #1a1a1a 0%, #2d2d30 50%, #3e3e42 100%); color: white; padding: 100px 20px 50px; position: relative; overflow: hidden;">
          <!-- Enhanced minimalist background elements -->
          <div style="position: absolute; top: -120px; right: -120px; width: 350px; height: 350px; background: radial-gradient(circle, rgba(255, 255, 255, 0.02) 0%, transparent 70%); border-radius: 50%;"></div>
          <div style="position: absolute; bottom: -100px; left: -100px; width: 300px; height: 300px; background: radial-gradient(circle, rgba(255, 255, 255, 0.01) 0%, transparent 70%); border-radius: 50%;"></div>
          <div style="position: absolute; top: 30%; left: 20%; width: 200px; height: 200px; background: linear-gradient(45deg, rgba(255, 255, 255, 0.01) 0%, transparent 50%); border-radius: 50%; transform: rotate(45deg);"></div>

          <div style="max-width: 1300px; margin: 0 auto; position: relative; z-index: 2;">
            <!-- Premium footer sections -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 60px; margin-bottom: 60px;">

              <!-- Enhanced Practice Info -->
              <div style="max-width: 350px;">
                <div style="margin-bottom: 32px;">
                  <h3 data-text="true" style="font-size: 28px; font-weight: 800; margin-bottom: 16px; background: linear-gradient(135deg, #ffffff, #e0e0e0); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
                    ${website?.name || 'Dental Practice'}
                  </h3>
                  <div style="width: 40px; height: 3px; background: linear-gradient(90deg, #64b5f6, #42a5f5); border-radius: 2px; margin-bottom: 24px;"></div>
                </div>
                <p data-text="true" style="font-size: 16px; line-height: 1.8; color: #c5c6c7; margin-bottom: 32px; font-weight: 400;">
                  Professional dental care with modern technology and personalized treatment plans for optimal oral health and beautiful smiles.
                </p>

                <!-- Enhanced social media -->
                <div style="display: flex; gap: 16px;">
                  <div style="width: 48px; height: 48px; background: rgba(100, 181, 246, 0.1); backdrop-filter: blur(10px); border-radius: 16px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.3s ease; border: 1px solid rgba(100, 181, 246, 0.1);" onmouseover="this.style.background='rgba(100, 181, 246, 0.2)'; this.style.transform='translateY(-2px)'" onmouseout="this.style.background='rgba(100, 181, 246, 0.1)'; this.style.transform='translateY(0)'">
                    <span style="color: #64b5f6; font-size: 20px;">📘</span>
                  </div>
                  <div style="width: 48px; height: 48px; background: rgba(100, 181, 246, 0.1); backdrop-filter: blur(10px); border-radius: 16px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.3s ease; border: 1px solid rgba(100, 181, 246, 0.1);" onmouseover="this.style.background='rgba(100, 181, 246, 0.2)'; this.style.transform='translateY(-2px)'" onmouseout="this.style.background='rgba(100, 181, 246, 0.1)'; this.style.transform='translateY(0)'">
                    <span style="color: #64b5f6; font-size: 20px;">📷</span>
                  </div>
                  <div style="width: 48px; height: 48px; background: rgba(100, 181, 246, 0.1); backdrop-filter: blur(10px); border-radius: 16px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.3s ease; border: 1px solid rgba(100, 181, 246, 0.1);" onmouseover="this.style.background='rgba(100, 181, 246, 0.2)'; this.style.transform='translateY(-2px)'" onmouseout="this.style.background='rgba(100, 181, 246, 0.1)'; this.style.transform='translateY(0)'">
                    <span style="color: #64b5f6; font-size: 20px;">🐦</span>
                  </div>
                </div>
              </div>

              <!-- Enhanced Contact Info -->
              <div>
                <h4 data-text="true" style="font-size: 22px; font-weight: 700; margin-bottom: 32px; color: #e0e0e0;">Contact Information</h4>
                <div style="display: flex; flex-direction: column; gap: 24px;">
                  <div style="display: flex; align-items: flex-start; gap: 16px;">
                    <div style="width: 40px; height: 40px; background: rgba(100, 181, 246, 0.1); backdrop-filter: blur(10px); border-radius: 12px; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(100, 181, 246, 0.1);">
                      <span style="color: #64b5f6; font-size: 18px;">📍</span>
                    </div>
                    <div>
                      <p data-text="true" style="font-size: 16px; color: #c5c6c7; margin: 0; line-height: 1.6; font-weight: 400;">
                        123 Main Street<br>
                        Suite 100<br>
                        Your City, State 12345
                      </p>
                    </div>
                  </div>
                  <div style="display: flex; align-items: center; gap: 16px;">
                    <div style="width: 40px; height: 40px; background: rgba(100, 181, 246, 0.1); backdrop-filter: blur(10px); border-radius: 12px; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(100, 181, 246, 0.1);">
                      <span style="color: #64b5f6; font-size: 18px;">📞</span>
                    </div>
                    <p data-text="true" style="font-size: 16px; color: #c5c6c7; margin: 0; font-weight: 500;">(555) 123-4567</p>
                  </div>
                  <div style="display: flex; align-items: center; gap: 16px;">
                    <div style="width: 40px; height: 40px; background: rgba(100, 181, 246, 0.1); backdrop-filter: blur(10px); border-radius: 12px; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(100, 181, 246, 0.1);">
                      <span style="color: #64b5f6; font-size: 18px;">✉️</span>
                    </div>
                    <p data-text="true" style="font-size: 16px; color: #c5c6c7; margin: 0; font-weight: 400;">info@dentalcare.com</p>
                  </div>
                </div>
              </div>

              <!-- Enhanced Office Hours -->
              <div>
                <h4 data-text="true" style="font-size: 22px; font-weight: 700; margin-bottom: 32px; color: #e0e0e0;">Office Hours</h4>
                <div style="background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(10px); padding: 24px; border-radius: 16px; border: 1px solid rgba(255, 255, 255, 0.05);">
                  <div style="display: flex; justify-content: space-between; margin-bottom: 16px; padding: 8px 0;">
                    <span data-text="true" style="color: #c5c6c7; font-size: 15px; font-weight: 500;">Monday - Friday</span>
                    <span data-text="true" style="color: #e0e0e0; font-size: 15px; font-weight: 600;">8:00 AM - 6:00 PM</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; margin-bottom: 16px; padding: 8px 0;">
                    <span data-text="true" style="color: #c5c6c7; font-size: 15px; font-weight: 500;">Saturday</span>
                    <span data-text="true" style="color: #e0e0e0; font-size: 15px; font-weight: 600;">9:00 AM - 3:00 PM</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; margin-bottom: 20px; padding: 8px 0;">
                    <span data-text="true" style="color: #c5c6c7; font-size: 15px; font-weight: 500;">Sunday</span>
                    <span data-text="true" style="color: #e0e0e0; font-size: 15px; font-weight: 600;">Closed</span>
                  </div>
                  <div style="border-top: 1px solid rgba(255, 255, 255, 0.1); padding-top: 16px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: rgba(255, 112, 67, 0.1); border-radius: 12px; border: 1px solid rgba(255, 112, 67, 0.2);">
                      <span data-text="true" style="color: #ff7043; font-size: 15px; font-weight: 700;">🚨 Emergency</span>
                      <span data-text="true" style="color: #ff7043; font-size: 15px; font-weight: 600;">24/7 Available</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Enhanced Quick Links -->
              <div>
                <h4 data-text="true" style="font-size: 22px; font-weight: 700; margin-bottom: 32px; color: #e0e0e0;">Quick Actions</h4>
                <div style="display: flex; flex-direction: column; gap: 16px;">
                  <a data-text="true" href="/about" style="color: #c5c6c7; text-decoration: none; font-size: 16px; padding: 12px 20px; border-radius: 12px; transition: all 0.3s ease; border: 1px solid rgba(255, 255, 255, 0.05); font-weight: 500;" onmouseover="this.style.background='rgba(100, 181, 246, 0.1)'; this.style.color='#64b5f6'; this.style.transform='translateX(8px)'" onmouseout="this.style.background='transparent'; this.style.color='#c5c6c7'; this.style.transform='translateX(0)'">→ About Our Practice</a>
                  <a data-text="true" href="/services" style="color: #c5c6c7; text-decoration: none; font-size: 16px; padding: 12px 20px; border-radius: 12px; transition: all 0.3s ease; border: 1px solid rgba(255, 255, 255, 0.05); font-weight: 500;" onmouseover="this.style.background='rgba(100, 181, 246, 0.1)'; this.style.color='#64b5f6'; this.style.transform='translateX(8px)'" onmouseout="this.style.background='transparent'; this.style.color='#c5c6c7'; this.style.transform='translateX(0)'">→ Our Services</a>
                  <a data-text="true" href="/appointments" style="color: #c5c6c7; text-decoration: none; font-size: 16px; padding: 12px 20px; border-radius: 12px; transition: all 0.3s ease; border: 1px solid rgba(255, 255, 255, 0.05); font-weight: 500;" onmouseover="this.style.background='rgba(100, 181, 246, 0.1)'; this.style.color='#64b5f6'; this.style.transform='translateX(8px)'" onmouseout="this.style.background='transparent'; this.style.color='#c5c6c7'; this.style.transform='translateX(0)'">→ Book Appointment</a>
                  <a data-text="true" href="/contact" style="color: #c5c6c7; text-decoration: none; font-size: 16px; padding: 12px 20px; border-radius: 12px; transition: all 0.3s ease; border: 1px solid rgba(255, 255, 255, 0.05); font-weight: 500;" onmouseover="this.style.background='rgba(100, 181, 246, 0.1)'; this.style.color='#64b5f6'; this.style.transform='translateX(8px)'" onmouseout="this.style.background='transparent'; this.style.color='#c5c6c7'; this.style.transform='translateX(0)'">→ Contact Us</a>

                  <!-- Emergency action button -->
                  <div style="margin-top: 8px; padding: 16px 20px; background: rgba(255, 112, 67, 0.1); border-radius: 16px; border: 1px solid rgba(255, 112, 67, 0.2); cursor: pointer; transition: all 0.3s ease;" onmouseover="this.style.background='rgba(255, 112, 67, 0.15)'; this.style.transform='translateY(-2px)'" onmouseout="this.style.background='rgba(255, 112, 67, 0.1)'; this.style.transform='translateY(0)'">
                    <span data-text="true" style="color: #ff7043; font-size: 16px; font-weight: 700; display: flex; align-items: center; gap: 8px;">
                      🚨 Emergency Care
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Enhanced Bottom Bar -->
            <div style="border-top: 1px solid rgba(255, 255, 255, 0.08); padding-top: 40px;">
              <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 24px;">
                <p data-text="true" style="font-size: 14px; color: #9e9e9e; margin: 0; font-weight: 400;">
                  © 2024 ${website?.name || 'Dental Practice'}. All rights reserved. |
                  <span style="color: #64b5f6; cursor: pointer;" onmouseover="this.style.color='#42a5f5'" onmouseout="this.style.color='#64b5f6'">Privacy Policy</span> |
                  <span style="color: #64b5f6; cursor: pointer;" onmouseover="this.style.color='#42a5f5'" onmouseout="this.style.color='#64b5f6'">Terms of Service</span>
                </p>
                <div style="display: flex; align-items: center; gap: 16px;">
                  <span style="font-size: 14px; color: #9e9e9e; font-weight: 500;">Powered by</span>
                  <div style="padding: 8px 16px; background: linear-gradient(135deg, #64b5f6, #42a5f5); border-radius: 12px; box-shadow: 0 4px 12px rgba(100, 181, 246, 0.2);">
                    <span style="font-size: 12px; color: white; font-weight: 700; letter-spacing: 0.5px;">SMART DENTAL</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Minimalist bottom accent line -->
          <div style="position: absolute; bottom: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, rgba(100, 181, 246, 0.3), transparent);"></div>
        </footer>
      `,
      props: {
        practiceName: website?.name || 'Dental Practice'
      },
      config: {
        practiceName: website?.name || 'Dental Practice'
      }
    });


    return components;
  };

  // Transform canvas components back to structured content format
  const transformCanvasToContent = (canvasComponents, serviceData) => {
    const content = {
      hero: {},
      overview: {},
      benefits: {},
      procedure: {},
      faq: {},
      aftercare: {},
      cta: {}
    };

    if (!canvasComponents || !Array.isArray(canvasComponents)) {
      return content;
    }

    const serviceName = serviceData?.name || 'Dental Service';

    canvasComponents.forEach(component => {
      const componentHtml = component.component || '';
      const componentType = component.type || '';
      const props = component.props || {};

      // Extract text content from HTML
      const extractTextFromHtml = (html) => {
        if (!html) return '';
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        return tempDiv.textContent || tempDiv.innerText || '';
      };

      // Hero Section
      if (componentType === 'ServiceHero' || component.name?.includes('Hero') || componentHtml.includes('hero-section')) {
        content.hero.title = props.title || extractTextFromHtml(componentHtml.match(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/)?.[1]) || `${serviceName} - Professional Dental Care`;
        content.hero.subtitle = props.subtitle || extractTextFromHtml(componentHtml.match(/<p[^>]*class="[^"]*subtitle[^"]*"[^>]*>(.*?)<\/p>/)?.[1]) || `Expert ${serviceName} services for optimal oral health`;
        content.hero.description = props.description || extractTextFromHtml(componentHtml.match(/<p[^>]*class="[^"]*description[^"]*"[^>]*>(.*?)<\/p>/)?.[1]) || `Experience professional ${serviceName} treatment with our skilled dental team`;
        content.hero.ctaText = props.ctaText || 'Schedule Consultation';
      }

      // Overview Section
      if (componentType === 'ServiceOverview' || component.name?.includes('Overview') || componentHtml.includes('overview-section')) {
        content.overview.title = props.title || extractTextFromHtml(componentHtml.match(/<h[2-6][^>]*>(.*?)<\/h[2-6]>/)?.[1]) || `About ${serviceName}`;
        content.overview.content = props.content || extractTextFromHtml(componentHtml.match(/<p[^>]*>(.*?)<\/p>/)?.[1]) || `${serviceName} is a professional dental treatment designed to improve your oral health`;

        // Extract highlights from lists
        const listMatches = componentHtml.match(/<li[^>]*>(.*?)<\/li>/g);
        if (listMatches) {
          content.overview.highlights = listMatches.map(li => extractTextFromHtml(li));
        } else {
          content.overview.highlights = ['Professional dental care', 'Modern techniques', 'Personalized treatment'];
        }
      }

      // Benefits Section (USP)
      if (componentType === 'ServiceUSP' || component.name?.includes('Benefits') || component.name?.includes('USP') || componentHtml.includes('benefits-section')) {
        content.benefits.title = props.title || extractTextFromHtml(componentHtml.match(/<h[2-6][^>]*>(.*?)<\/h[2-6]>/)?.[1]) || `Benefits of ${serviceName}`;
        content.benefits.introduction = props.introduction || `Choosing ${serviceName} provides numerous advantages for your oral health and overall well-being.`;

        // Extract benefit items from component
        const benefitMatches = componentHtml.match(/<div[^>]*class="[^"]*benefit[^"]*"[^>]*>.*?<\/div>/g);
        if (benefitMatches && benefitMatches.length > 0) {
          content.benefits.list = benefitMatches.map((benefit, index) => {
            const title = extractTextFromHtml(benefit.match(/<h[3-6][^>]*>(.*?)<\/h[3-6]>/)?.[1]) || `Benefit ${index + 1}`;
            const description = extractTextFromHtml(benefit.match(/<p[^>]*>(.*?)<\/p>/)?.[1]) || 'Professional dental care benefit';
            return { title, description };
          });
        } else {
          // Fallback benefits
          content.benefits.list = [
            { title: 'Professional Expertise', description: 'Expert dental care from qualified professionals' },
            { title: 'Modern Techniques', description: 'Advanced dental technology and proven methods' },
            { title: 'Personalized Care', description: 'Treatment plans tailored to your specific needs' }
          ];
        }
      }

      // Procedure Section
      if (componentType === 'ServiceProcedure' || component.name?.includes('Procedure') || componentHtml.includes('procedure-section')) {
        content.procedure.title = props.title || extractTextFromHtml(componentHtml.match(/<h[2-6][^>]*>(.*?)<\/h[2-6]>/)?.[1]) || `The ${serviceName} Process`;

        // Extract procedure steps
        const stepMatches = componentHtml.match(/<div[^>]*class="[^"]*step[^"]*"[^>]*>.*?<\/div>/g);
        if (stepMatches && stepMatches.length > 0) {
          content.procedure.steps = stepMatches.map((step, index) => {
            const title = extractTextFromHtml(step.match(/<h[3-6][^>]*>(.*?)<\/h[3-6]>/)?.[1]) || `Step ${index + 1}`;
            const description = extractTextFromHtml(step.match(/<p[^>]*>(.*?)<\/p>/)?.[1]) || 'Procedure step description';
            return { title, description };
          });
        } else {
          // Fallback steps
          content.procedure.steps = [
            { title: 'Initial Consultation', description: 'Comprehensive examination and treatment planning' },
            { title: 'Treatment Preparation', description: 'Preparation and setup for the procedure' },
            { title: 'Procedure Execution', description: `Professional ${serviceName} treatment` },
            { title: 'Follow-up Care', description: 'Post-treatment monitoring and care instructions' }
          ];
        }
      }

      // FAQ Section
      if (componentType === 'ServiceFAQ' || component.name?.includes('FAQ') || componentHtml.includes('faq-section')) {
        content.faq.title = props.title || extractTextFromHtml(componentHtml.match(/<h[2-6][^>]*>(.*?)<\/h[2-6]>/)?.[1]) || `Frequently Asked Questions`;

        // Extract FAQ items
        const faqMatches = componentHtml.match(/<div[^>]*class="[^"]*faq[^"]*"[^>]*>.*?<\/div>/g);
        if (faqMatches && faqMatches.length > 0) {
          content.faq.questions = faqMatches.map(faq => {
            const question = extractTextFromHtml(faq.match(/<[^>]*class="[^"]*question[^"]*"[^>]*>(.*?)<\/[^>]*>/)?.[1]) || 'Common question';
            const answer = extractTextFromHtml(faq.match(/<[^>]*class="[^"]*answer[^"]*"[^>]*>(.*?)<\/[^>]*>/)?.[1]) || 'Professional answer';
            return { question, answer };
          });
        } else {
          // Fallback FAQ
          content.faq.questions = [
            { question: `How long does ${serviceName} take?`, answer: 'Treatment duration varies based on individual needs and complexity.' },
            { question: 'Is the procedure comfortable?', answer: 'We use modern techniques to ensure your comfort throughout the treatment.' }
          ];
        }
      }

      // Aftercare Section
      if (componentType === 'ServiceAftercare' || component.name?.includes('Aftercare') || componentHtml.includes('aftercare-section')) {
        content.aftercare.title = props.title || extractTextFromHtml(componentHtml.match(/<h[2-6][^>]*>(.*?)<\/h[2-6]>/)?.[1]) || 'Post-Treatment Care';

        const instructionMatches = componentHtml.match(/<li[^>]*>(.*?)<\/li>/g);
        if (instructionMatches) {
          content.aftercare.instructions = instructionMatches.map(li => extractTextFromHtml(li));
        } else {
          content.aftercare.instructions = [
            'Follow post-treatment care instructions',
            'Schedule follow-up appointments as needed',
            'Contact us if you have any concerns'
          ];
        }
      }

      // Call-to-Action Section
      if (componentType === 'ServiceCTA' || component.name?.includes('CTA') || componentHtml.includes('cta-section')) {
        content.cta.title = props.title || extractTextFromHtml(componentHtml.match(/<h[2-6][^>]*>(.*?)<\/h[2-6]>/)?.[1]) || `Ready for ${serviceName}?`;
        content.cta.subtitle = props.subtitle || `Schedule your ${serviceName} consultation today`;
        content.cta.buttonText = props.buttonText || 'Book Appointment';
      }
    });

    return content;
  };

  const loadWebsite = useCallback(async () => {
    try {
      setIsLoading(true);

      // Load service page if in service mode (edit) or display mode
      if (isServicePageMode) {
        let servicePageResponse;

        if (isEditMode && servicePageId) {
          // Edit mode: Load by servicePageId
          servicePageResponse = await servicePageService.getServicePageForEditing(servicePageId);
        } else if (isViewMode && displayServiceSlug) {
          try {
            // Use the same API as ServicePage component
            const response = await fetch(`http://localhost:5000/api/services/public/page/${websiteId}/${displayServiceSlug}?_t=${Date.now()}`, {
              credentials: 'include',
              cache: 'no-cache'
            });

            if (!response.ok) {
              throw new Error('Service page not found');
            }

            const result = await response.json();

            // Transform the response to match the expected format
            servicePageResponse = {
              success: true,
              data: {
                servicePage: result.data,
                serviceInfo: result.data.serviceId, // The service info is in serviceId field
                websiteSettings: {}
              }
            };
          } catch (error) {
            console.error('Error loading service page for display:', error);
            setIsLoading(false);
            return;
          }
        } else {
          console.error('Missing required parameters for service page mode');
          setIsLoading(false);
          return;
        }
        if (servicePageResponse.success && servicePageResponse.data && servicePageResponse.data.servicePage) {
          setServicePage(servicePageResponse.data.servicePage);
          setServiceInfo(servicePageResponse.data.serviceInfo);
          setWebsite(servicePageResponse.data.servicePage.websiteId);

          // Extract blog cards from API response
          if (servicePageResponse.data.servicePage.blogs) {
            setBlogCards(servicePageResponse.data.servicePage.blogs);
            console.log(`✅ Loaded ${servicePageResponse.data.servicePage.blogs.length} blog cards for service page editor`);
          } else {
            setBlogCards([]);
            console.log('ℹ️ No blog cards found for this service page');
          }
console.log(servicePageResponse.data.servicePage.blogs);
          // Load service page components
          const currentVersionData = servicePageResponse.data.currentVersionData;

          if (currentVersionData && currentVersionData.components && currentVersionData.components.length > 0) {
            setCanvasComponents(currentVersionData.components);
            setNextId(prev => Math.max(prev, currentVersionData.components.length + 1));
            showSnackbar(`Loaded ${currentVersionData.components.length} saved components`, 'success');
          } else {
            console.log('🔍 Generating service page components with blog cards:', servicePageResponse.data.blogs);
              const serviceComponents = generateServicePageComponents(
              servicePageResponse.data.servicePage.content,
              servicePageResponse.data.serviceInfo,
              servicePageResponse.data.servicePage.blogs 
            );
              setCanvasComponents(serviceComponents);
            // Update the next ID counter to avoid conflicts
            setNextId(prev => prev + serviceComponents.length);

            if (serviceComponents.length > 0) {
              showSnackbar(`Generated ${serviceComponents.length} service page sections`, 'success');
            } else {
              console.warn('⚠️ No service page components generated');
              showSnackbar('No service page content found', 'warning');
            }
          }

          setGlobalSettings(servicePageResponse.data.websiteSettings || {});
        }
      } else {
        // Regular website loading
        const response = await websiteService.getWebsiteById(websiteId);
        const websiteData = response.website;
        setWebsite(websiteData);

        // Get current version data
        const currentVersion = websiteData.versions.find(v => v.versionNumber === websiteData.currentVersion) || websiteData.versions[0];
        if (currentVersion) {
          setGlobalSettings(currentVersion.globalSettings || {});
          // Load existing canvas components if any
          if (currentVersion.pages?.[0]?.components) {
            setCanvasComponents(currentVersion.pages[0].components);
          }
        }
      }

      showSnackbar('Website loaded successfully');
    } catch (error) {
      console.error('Load website error:', error);
      showSnackbar('Error loading website: ' + error.message, 'error');
      navigate('/websites');
    } finally {
      setIsLoading(false);
    }
  }, [websiteId, isServicePageMode, servicePageId]);

  const loadComponents = useCallback(async () => {
    try {
      // Skip loading full component library in service page mode
      if (isServicePageMode) {
        setComponents([]);
        setFilteredComponents([]);
        return;
      }

      // Comprehensive dental-specific components with only clean dynamic sections
      const dentalComponents = [
        // Only clean dynamic sections and React headers
        ...dentalWebsiteSections,
      ...dentalWebsiteSectionsComponent
      ];

      setComponents(dentalComponents);
      setFilteredComponents(dentalComponents);
    } catch (error) {
      console.error('Error loading components:', error);
      showSnackbar('Error loading components, using fallback', 'warning');
    }
  }, [isServicePageMode]);

  // Load website and components on mount
  useEffect(() => {
    if (websiteId) {
      loadWebsite();
      loadComponents();
    } else {
      navigate('/websites');
    }
  }, [websiteId, servicePageId, actualMode, navigate, loadWebsite, loadComponents]);

  // Auto-map services to headers when website builder loads (run only once)
  useEffect(() => {
    const autoMapServicesOnLoad = async () => {
      // Only run auto-mapping once after initial load is complete, and not in service page mode
      if (websiteId &&
          !isLoading &&
          !autoMappingCompleted.current &&
          initialLoadCompleted.current &&
          !isServicePageMode) {

        autoMappingCompleted.current = true; // Set flag to prevent multiple runs

        try {
          // Check if we have services in database
          const serviceCount = await getWebsiteServiceCount();
          const headerComponents = canvasComponents.filter(isHeaderComponent);
          if (serviceCount > 0) {
            if (headerComponents.length === 0) {
              // No headers exist, create a modern default header with services
              await createModernDefaultHeaderWithServices();
            } else {
              // Headers exist, update them with current services
              await syncHeadersWithDatabase();
            }
          } 
        } catch (error) {
          console.error('Error during auto-mapping:', error);
          autoMappingCompleted.current = false; // Reset on error to allow retry
        }
      }
    };

    // Run auto-mapping after a short delay to ensure everything is loaded
    const timer = setTimeout(autoMapServicesOnLoad, 1500);
    return () => clearTimeout(timer);
  }, [websiteId, isLoading, initialLoadCompleted.current]);

  // Track when initial loading is complete
  useEffect(() => {
    if (!isLoading && websiteId && !initialLoadCompleted.current) {
      initialLoadCompleted.current = true;
    }
  }, [isLoading, websiteId]);

  const showSnackbar = useCallback((message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  }, []);

  // Setup service creation event listener (simplified)
  useEffect(() => {
    // Simple event handler that doesn't depend on complex functions
    const handleServiceCreated = (event) => {
      // Simple refresh approach - trigger existing functions
      setTimeout(() => {
        // Clear cache
        if (servicesCache.current) {
          servicesCache.current = null;
          servicesCacheTimestamp.current = null;
        }

        // Trigger header refresh functions if available
        if (window.reloadApiServices) {
          window.reloadApiServices();
        }
        if (window.triggerHeaderServiceLoad) {
          window.triggerHeaderServiceLoad();
        }

        showSnackbar('🆕 Headers updated with new service!', 'success');
      }, 1000);
    };

    window.addEventListener('serviceCreated', handleServiceCreated);

    // Cleanup function
    return () => {
      window.removeEventListener('serviceCreated', handleServiceCreated);
    };
  }, [showSnackbar]);

  // Fetch website-specific services from database with caching
  const fetchWebsiteServices = async (forceRefresh = false) => {
    // Check cache first
    const now = Date.now();
    if (!forceRefresh &&
        servicesCache.current &&
        servicesCacheTimestamp.current &&
        (now - servicesCacheTimestamp.current) < CACHE_DURATION) {
      return servicesCache.current;
    }

    try {
      // First try to get service pages for this website (integrated services)
      const servicePages = await serviceService.getServicePages(websiteId, {
        isIntegrated: true,
        status: 'all' // Get both draft and published
      });

      let websiteServices = [];

      if (servicePages.data && servicePages.data.length > 0) {
        // Extract service data from the pages
        websiteServices = servicePages.data.map(page => {
          // Handle both populated and non-populated serviceId
          const serviceData = page.serviceId;
          if (typeof serviceData === 'string') {
            // If serviceId is just an ID, we need to get the full service data
            return {
              _id: serviceData,
              name: page.title || 'Unknown Service',
              slug: page.slug
            };
          } else {
            // If serviceId is populated with full service data
            return {
              _id: serviceData._id,
              name: serviceData.name,
              slug: serviceData.slug,
              category: serviceData.category,
              shortDescription: serviceData.shortDescription
            };
          }
        });
      } else {
        try {
          // Get services that belong to this specific website
          const websiteData = await websiteService.getWebsiteById(websiteId);
          if (websiteData?.website?.services && websiteData.website.services.length > 0) {
            // If website has associated services, use those
            websiteServices = websiteData.website.services.map(service => ({
              _id: service._id || service.id,
              name: service.name,
              slug: service.slug,
              category: service.category,
              shortDescription: service.shortDescription
            }));
          } else {
            // Only use empty array if truly no services exist for this website
            websiteServices = [];
          }
        } catch (fallbackError) {
          console.error('Error fetching website-specific services:', fallbackError);
          websiteServices = [];
        }
      }

      // Cache the results
      servicesCache.current = websiteServices;
      servicesCacheTimestamp.current = now;
      return websiteServices;

    } catch (error) {
      console.error('Error fetching website services:', error);
      // Return empty array instead of all services to prevent wrong service count
      servicesCache.current = [];
      servicesCacheTimestamp.current = now;
      return [];
    }
  };

  // Get service count for the website
  const getWebsiteServiceCount = async () => {
    try {
      const services = await fetchWebsiteServices();
      return services.length;
    } catch (error) {
      console.error('Error getting service count:', error);
      return 0;
    }
  };

  // Clear services cache when data is updated
  const clearServicesCache = () => {
    servicesCache.current = null;
    servicesCacheTimestamp.current = null;
  };

  // Sync header components with current database services
  const syncHeadersWithDatabase = async () => {
    try {
      // Clear cache to ensure fresh data
      clearServicesCache();

      const serviceCount = await getWebsiteServiceCount();

      if (serviceCount === 0) {
        showSnackbar('No services found in database for this website', 'warning');
        return;
      }

      const currentWebsiteServices = await fetchWebsiteServices(true); // Force refresh
      const headerComponents = canvasComponents.filter(isHeaderComponent);

      if (headerComponents.length === 0) {
        showSnackbar('No header components found on canvas', 'info');
        return;
      }

      // Update all headers with current database services
      await handleServiceHeaderUpdate([]);

    } catch (error) {
      console.error('Error syncing headers with database:', error);
      showSnackbar('Failed to sync headers with database', 'error');
    }
  };

  // Create a modern default header with services
  const createModernDefaultHeaderWithServices = async () => {
    try {
      const currentWebsiteServices = await fetchWebsiteServices();
      const serviceCount = currentWebsiteServices.length;

      if (serviceCount === 0) {
        return;
      }

      const allServiceIds = currentWebsiteServices.map(s => s._id);

      // Get modern API header component from dental sections
      const modernApiHeaderTemplate = dentalWebsiteSections.find(section => section.id === 'modern-api-header');

      // Create a modern API-driven header component
      const modernHeader = {
        id: 'modern-api-header',
        name: `Smart API Header (${serviceCount} services)`,
        category: 'navigation',
        description: 'Auto-created header with dynamic API service loading',
        tags: ['dental', 'navigation', 'header', 'api', 'smart', 'auto-load'],
        isDynamic: true,
        autoLoadServices: true,
        component: modernApiHeaderTemplate?.component || '',
        config: {
          websiteId,
          selectedServiceIds: allServiceIds,
          logoUrl: null,
          siteName: website?.name || "Dental Practice",
          primaryColor: "#1e40af", // Modern blue
          textColor: "#1f2937", // Dark gray
          groupByCategory: true,
          maxServicesInDropdown: 15,
          showAllServices: false,
          customNavigation: [
            { name: "About", url: "/about" },
            { name: "Contact", url: "/contact" }
          ]
        },
        component: null, // Will be loaded from DENTAL_WEBSITE_SECTIONS
        instanceId: `modern-header-${Date.now()}`,
        serviceData: {
          websiteServiceCount: serviceCount,
          mappedServices: allServiceIds,
          lastMapped: new Date().toISOString(),
          autoCreated: true
        }
      };

      // Add to the top of the canvas
      setCanvasComponents(prev => [modernHeader, ...prev]);
      setNextId(prev => prev + 1);

      showSnackbar(`✨ Modern header auto-created with ${serviceCount} services from database!`, 'success');

    } catch (error) {
      console.error('Error creating modern default header:', error);
      showSnackbar('Failed to create modern header', 'error');
    }
  };

  // Create 5 Modern Headers with service mapping
  const createModernHeadersWithServiceMapping = async (headerType = 'minimalist') => {
    try {
      const currentWebsiteServices = await fetchWebsiteServices();
      const serviceCount = currentWebsiteServices.length;

      if (serviceCount === 0) {
        showSnackbar('No services found in database. Please add services first.', 'warning');
        return;
      }

      const allServiceIds = currentWebsiteServices.map(s => s._id);

      // Define our 5 modern header configurations
      const modernHeaders = {
        minimalist: {
          id: 'modern-minimalist-header',
          name: 'Modern Minimalist Header',
          description: 'Clean, minimal design with perfect typography',
          componentName: 'ModernMinimalistHeader',
          primaryColor: '#2563eb',
          textColor: '#1f2937'
        },
        glassmorphism: {
          id: 'glassmorphism-header',
          name: 'Glassmorphism Header',
          description: 'Modern glass effect with backdrop blur',
          componentName: 'GlassmorphismHeader',
          primaryColor: '#6366f1',
          textColor: '#1e293b'
        },
        gradient: {
          id: 'gradient-modern-header',
          name: 'Gradient Modern Header',
          description: 'Bold gradient design with vibrant colors',
          componentName: 'GradientModernHeader',
          primaryColor: '#8b5cf6',
          secondaryColor: '#06b6d4',
          textColor: '#ffffff'
        },
        corporate: {
          id: 'corporate-professional-header',
          name: 'Corporate Professional Header',
          description: 'Business-focused design with professional styling',
          componentName: 'CorporateProfessionalHeader',
          primaryColor: '#1565c0',
          secondaryColor: '#0d47a1',
          textColor: '#263238'
        },
        futuristic: {
          id: 'futuristic-tech-header',
          name: 'Futuristic Tech Header',
          description: 'High-tech design with neon accents and animations',
          componentName: 'FuturisticTechHeader',
          primaryColor: '#00ff88',
          secondaryColor: '#0099ff',
          accentColor: '#ff0066',
          textColor: '#ffffff'
        }
      };

      const selectedHeader = modernHeaders[headerType];
      if (!selectedHeader) {
        throw new Error(`Unknown header type: ${headerType}`);
      }

      // Remove existing headers first
      const headerComponents = canvasComponents.filter(isHeaderComponent);
      const nonHeaderComponents = canvasComponents.filter(comp => !isHeaderComponent(comp));

      // Create the new modern header component
      const newModernHeader = {
        id: selectedHeader.id,
        name: `${selectedHeader.name} (${serviceCount} services)`,
        category: 'navigation',
        description: selectedHeader.description,
        tags: ['dental', 'navigation', 'header', 'modern', 'react', headerType],
        isReactComponent: true,
        componentName: selectedHeader.componentName,
        config: {
          websiteId,
          selectedServiceIds: allServiceIds,
          logoUrl: null,
          siteName: website?.name || "Dental Practice",
          primaryColor: selectedHeader.primaryColor,
          secondaryColor: selectedHeader.secondaryColor,
          accentColor: selectedHeader.accentColor,
          textColor: selectedHeader.textColor,
          showAllServices: false,
          groupByCategory: true,
          maxServicesInDropdown: 12,
          customNavigation: []
        },
        instanceId: `modern-header-${Date.now()}`,
        serviceData: {
          websiteServiceCount: serviceCount,
          mappedServices: allServiceIds,
          lastMapped: new Date().toISOString(),
          headerType: headerType,
          autoCreated: true
        }
      };

      // Update canvas with new header
      setCanvasComponents([newModernHeader, ...nonHeaderComponents]);
      setNextId(prev => prev + 1);

      showSnackbar(
        `✨ ${selectedHeader.name} created with ${serviceCount} services!`,
        'success'
      );

      return newModernHeader;

    } catch (error) {
      console.error('Error creating modern header:', error);
      showSnackbar('Failed to create modern header: ' + error.message, 'error');
    }
  };

  // Improved header detection function
  const isHeaderComponent = (comp) => {
    // Check for explicit header IDs
    const headerIds = [
      // New Modern Headers
      'modern-minimalist-header',
      'glassmorphism-header',
      'gradient-modern-header',
      'corporate-professional-header',
      'futuristic-tech-header',
      // Legacy headers (deprecated)
      'react-dynamic-navigation-header',
      'dental-header-navigation',
      'dynamic-dental-header-basic',
      'dynamic-dental-header-custom',
      'enhanced-dental-navigation',
      'dental-navigation',
      'professional-dental-header',
      'smart-api-header',
      'modern-api-header'
    ];

    // Check for navigation category
    const isNavigationCategory = comp.category === 'navigation';

    // Check for header-related tags
    const hasHeaderTags = comp.tags?.some(tag =>
      tag.includes('header') ||
      tag.includes('navigation') ||
      tag.includes('nav')
    );

    // Check for header-related names
    const hasHeaderName = comp.name?.toLowerCase().includes('header') ||
                         comp.name?.toLowerCase().includes('navigation');

    // Check if it's a React header component
    const isReactHeader = comp.isReactComponent && (
      comp.componentName === 'DynamicNavigationHeader' ||
      comp.componentName === 'ModernMinimalistHeader' ||
      comp.componentName === 'GlassmorphismHeader' ||
      comp.componentName === 'GradientModernHeader' ||
      comp.componentName === 'CorporateProfessionalHeader' ||
      comp.componentName === 'FuturisticTechHeader'
    );

    // Check if component has dynamic properties
    const isDynamicHeader = comp.isDynamic || comp.customizable;

    return headerIds.includes(comp.id) ||
           isNavigationCategory ||
           hasHeaderTags ||
           hasHeaderName ||
           isReactHeader ||
           isDynamicHeader;
  };

  // Helper function to inject services into static header HTML
  const injectServicesIntoStaticHeader = async (headerHTML, newServices) => {
    // Generate service dropdown HTML
    const serviceItems = newServices.map(service =>
      `<li style="margin-bottom: 8px;">
         <a href="${websiteId ? `/website/${websiteId}/services/${service.slug || service.name.toLowerCase().replace(/\s+/g, '-')}` : `/services/${service.slug || service.name.toLowerCase().replace(/\s+/g, '-')}`}"
            style="text-decoration: none; color: #333; font-size: 14px; transition: color 0.3s;"
            onmouseover="this.style.color='#007cba'"
            onmouseout="this.style.color='#333'">
           ${service.name}
         </a>
       </li>`
    ).join('');

    // Look for existing dropdown content and append new services
    if (headerHTML.includes('dropdown-content')) {
      // Find the services dropdown UL and append new services
      return headerHTML.replace(
        /(<div[^>]*dropdown-content[^>]*>[\s\S]*?<ul[^>]*>)([\s\S]*?)(<\/ul>)/i,
        `$1$2${serviceItems}$3`
      );
    }

    // If no dropdown found, try to add services to any existing UL in navigation
    if (headerHTML.includes('<ul') && headerHTML.includes('</ul>')) {
      return headerHTML.replace(
        /(<ul[^>]*>)([\s\S]*?)(<\/ul>)/i,
        `$1$2${serviceItems}$3`
      );
    }

    // If no suitable place found, return original HTML
    console.warn('Could not find suitable location to inject services in static header');
    return headerHTML;
  };

  // Handle automatic header updates when new services are created
  const handleServiceHeaderUpdate = async (newServices) => {
    // Clear service cache to ensure fresh data
    clearServiceCache();

    // Fetch current website services from database for validation
    const currentWebsiteServices = await fetchWebsiteServices();
    const serviceCount = currentWebsiteServices.length;
    // Find all header components on the canvas using improved detection
    const headerComponents = canvasComponents.filter(isHeaderComponent);

    if (headerComponents.length === 0) {
      // No header found, create a new dynamic header with ALL website services
      const allServiceIds = currentWebsiteServices.map(s => s._id);

      const headerComponent = {
        id: 'react-dynamic-navigation-header',
        name: `Dynamic Navigation Header (${serviceCount} services)`,
        category: 'navigation',
        isReactComponent: true,
        componentName: 'DynamicNavigationHeader',
        config: {
          websiteId,
          selectedServiceIds: allServiceIds,
          groupByCategory: true,
          maxServicesInDropdown: 12,
          showAllServices: false,
          customNavigation: [],
          primaryColor: "#007cba"
        },
        instanceId: `auto-header-${Date.now()}`,
        serviceData: {
          websiteServiceCount: serviceCount,
          mappedServices: allServiceIds,
          lastMapped: new Date().toISOString()
        }
      };

      setCanvasComponents(prev => [headerComponent, ...prev]);
      setNextId(prev => prev + 1);

      showSnackbar(`Dynamic header created with ${serviceCount} website services!`, 'success');
    } else {
      // Update existing headers with ALL website services (not just new ones)
      let updatedCount = 0;
      const allServiceIds = currentWebsiteServices.map(s => s._id);

      const updatedComponents = await Promise.all(
        canvasComponents.map(async (comp) => {
          if (isHeaderComponent(comp)) {
            updatedCount++;

            // Handle React components
            if (comp.isReactComponent && comp.config) {
              return {
                ...comp,
                config: {
                  ...comp.config,
                  selectedServiceIds: allServiceIds
                },
                serviceData: {
                  websiteServiceCount: serviceCount,
                  mappedServices: allServiceIds,
                  lastMapped: new Date().toISOString()
                },
                lastUpdated: new Date().toISOString()
              };
            }

            // Handle dynamic HTML components with settings
            else if (comp.settings) {
              try {
                const updatedHeaderHTML = await serviceHeaderMapper.updateHeaderServices(
                  comp.component,
                  allServiceIds,
                  websiteId
                );

                return {
                  ...comp,
                  component: updatedHeaderHTML,
                  settings: {
                    ...comp.settings,
                    selectedServices: allServiceIds
                  },
                  serviceData: {
                    websiteServiceCount: serviceCount,
                    mappedServices: allServiceIds,
                    lastMapped: new Date().toISOString()
                  },
                  lastUpdated: new Date().toISOString()
                };
              } catch (error) {
                console.error('Error updating HTML header:', error);
                return comp; // Return unchanged if update fails
              }
            }

            // Handle static HTML headers by injecting ALL website services
            else if (comp.component && typeof comp.component === 'string') {
              try {
                const updatedHTML = await injectServicesIntoStaticHeader(comp.component, currentWebsiteServices);
                return {
                  ...comp,
                  component: updatedHTML,
                  serviceData: {
                    websiteServiceCount: serviceCount,
                    injectedServices: allServiceIds,
                    lastMapped: new Date().toISOString()
                  },
                  lastUpdated: new Date().toISOString()
                };
              } catch (error) {
                console.error('Error injecting services into static header:', error);
                return comp; // Return unchanged if injection fails
              }
            }
          }
          return comp;
        })
      );

      setCanvasComponents(updatedComponents);
      showSnackbar(`Updated ${updatedCount} header(s) with ${serviceCount} website services from database!`, 'success');
    }
  };

  const handleManualSave = async () => {
    try {
      setSaving(true);

      if (isServicePageMode && servicePageId) {
        // Transform canvas components to structured content format
        const transformedContent = transformCanvasToContent(canvasComponents, serviceInfo || {});
        // Save both components AND transformed content structure
        const saveData = {
          content: transformedContent,
          components: canvasComponents,
          globalSettings,
          changeLog: 'Manual save from drag-drop editor - content synchronized'
        };

        const saveResponse = await servicePageService.updateServicePageContent(servicePageId, saveData);

        // Verify save by reloading the data
        try {
          const verificationResponse = await servicePageService.getServicePageForEditing(servicePageId);
          if (verificationResponse.success && verificationResponse.data) {
            const verifyVersionData = verificationResponse.data.currentVersionData;
            if (verifyVersionData?.components?.length > 0) {
              console.log('✅ Components successfully saved and verified');
            } else {
              console.warn('⚠️ Components not found in verification - may be an issue with save/load');
            }
          }
        } catch (verifyError) {
          console.warn('Verification failed:', verifyError);
        }

        // Sync with unified content system if enabled
        if (unifiedContentEnabled) {
          try {
            await UnifiedContentService.updateComponents(servicePageId, canvasComponents, {
              globalSettings,
              transformedContent,
              timestamp: new Date().toISOString(),
              source: 'destack_editor_save'
            });
          } catch (error) {
            console.warn('Unified content sync failed during save:', error);
            // Don't fail the save operation if unified content sync fails
          }
        }

        showSnackbar('Service page saved and synchronized successfully!');
      } else {
        // Prepare pages data for regular website
        const updatedPages = [{
          name: 'Home',
          slug: 'home',
          title: website.name || 'Home',
          description: globalSettings.siteDescription || '',
          components: canvasComponents,
          lastModified: new Date()
        }];

        // Save to backend
        await websiteService.saveWebsiteContent(websiteId, {
          pages: updatedPages,
          globalSettings,
          changeLog: 'Manual save from drag-drop editor'
        });

        showSnackbar('Website saved successfully!');
      }
    } catch (error) {
      console.error('Save error:', error);
      const errorType = isServicePageMode ? 'service page' : 'website';
      showSnackbar(`Error saving ${errorType}: ` + error.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = () => {
    setIsPreviewMode(!isPreviewMode);
  };

  // Handle blog card click - open blog in new tab
  const handleBlogClick = (blog) => {
    const blogUrl = `/blog/${blog.slug}`;
    window.open(blogUrl, '_blank');
    console.log(`Opening blog: ${blog.title} at ${blogUrl}`);
  };

  const handlePublish = async () => {
    try {
      // First save with content synchronization
      await handleManualSave();

      if (isServicePageMode && servicePageId) {
        // Verify content synchronization before publishing
        try {
          const verificationResponse = await servicePageService.getServicePageForEditing(servicePageId);
          if (verificationResponse.success && verificationResponse.data) {
            console.log('✅ Content verification before publish:', verificationResponse.data.servicePage.content);
          }
        } catch (verifyError) {
          console.warn('Content verification failed, proceeding with publish:', verifyError);
        }
        // Publish the service page
        await servicePageService.publishServicePage(servicePageId);
        showSnackbar('Service page published and synchronized successfully!');

   } else {
        await websiteService.publishWebsite(websiteId);
        showSnackbar('Website published successfully!');
      }
    } catch (error) {
      const errorType = isServicePageMode ? 'service page' : 'website';
      showSnackbar(`Error publishing ${errorType}: ` + error.message, 'error');
      console.error(`❌ Publish error for ${errorType}:`, error);
    }
  };

  const handleTagToggle = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  // Drag and drop handlers
  const handleDragStart = (e, component) => {
    e.dataTransfer.setData('application/json', JSON.stringify(component));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    try {
      const componentData = JSON.parse(e.dataTransfer.getData('application/json'));
      const newComponent = {
        ...componentData,
        instanceId: nextId,
        position: { x: 0, y: canvasComponents.length * 120 }
      };
      setCanvasComponents(prev => [...prev, newComponent]);
      setNextId(prev => prev + 1);
      setSelectedComponent(newComponent);
      showSnackbar(`Added ${componentData.name} to canvas`);
    } catch (error) {
      console.error('Error dropping component:', error);
    }
  };

  const handleCanvasComponentSelect = (component) => {
    setSelectedComponent(component);
  };

  const handleRemoveComponent = (instanceId) => {
    setCanvasComponents(prev => prev.filter(comp => comp.instanceId !== instanceId));
    if (selectedComponent && selectedComponent.instanceId === instanceId) {
      setSelectedComponent(null);
    }
    showSnackbar('Component removed');
  };

  // Text editing functions
  const extractTextFromHTML = (htmlString) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    const textElements = [];

    // Helper function to extract text from elements
    const extractText = (element, path = '') => {
      Array.from(element.children).forEach((child, index) => {
        const currentPath = path ? `${path} > ${child.tagName.toLowerCase()}[${index}]` : `${child.tagName.toLowerCase()}[${index}]`;

        // Check if element has direct text content (not just whitespace)
        const directText = Array.from(child.childNodes)
          .filter(node => node.nodeType === Node.TEXT_NODE)
          .map(node => node.textContent.trim())
          .filter(text => text.length > 0)
          .join(' ');

        if (directText) {
          textElements.push({
            path: currentPath,
            element: child.tagName.toLowerCase(),
            originalText: directText,
            newText: directText,
            id: `${currentPath}-${textElements.length}`
          });
        }

        // Recursively check children
        if (child.children.length > 0) {
          extractText(child, currentPath);
        }
      });
    };

    extractText(doc.body);
    return textElements;
  };

  const updateComponentText = (component, updatedTexts) => {
    let updatedHTML = component.component;

    // Sort by path length (deepest first) to avoid replacing parent text before children
    const sortedTexts = [...updatedTexts].sort((a, b) => b.path.length - a.path.length);

    sortedTexts.forEach(textItem => {
      if (textItem.newText !== textItem.originalText) {
        // Simple text replacement - in a production environment, you might want more sophisticated HTML parsing
        updatedHTML = updatedHTML.replace(textItem.originalText, textItem.newText);
      }
    });

    return {
      ...component,
      component: updatedHTML
    };
  };

  const handleTextEdit = (component) => {
    const texts = extractTextFromHTML(component.component);
    if (texts.length === 0) {
      showSnackbar('No editable text found in this component', 'warning');
      return;
    }

    setEditingComponent(component);
    setExtractedTexts(texts);
    setTextEditDialogOpen(true);
  };

  const handleTextSave = () => {
    if (!editingComponent) return;

    const updatedComponent = updateComponentText(editingComponent, extractedTexts);

    setCanvasComponents(prev =>
      prev.map(comp =>
        comp.instanceId === editingComponent.instanceId ? updatedComponent : comp
      )
    );

    // Update selected component if it's the one being edited
    if (selectedComponent && selectedComponent.instanceId === editingComponent.instanceId) {
      setSelectedComponent(updatedComponent);
    }

    setTextEditDialogOpen(false);
    setEditingComponent(null);
    setExtractedTexts([]);
    showSnackbar('Text updated successfully!');
  };

  const handleTextChange = (textId, newValue) => {
    setExtractedTexts(prev =>
      prev.map(text =>
        text.id === textId ? { ...text, newText: newValue } : text
      )
    );
  };

  // Component preview functions
  const handleComponentPreview = (component) => {
    setPreviewComponent(component);
    setPreviewDialogOpen(true);
  };

  // Image upload functions
  const handleImageUpload = (component) => {
    setEditingImageComponent(component);
    setImageUploadDialogOpen(true);
  };

  // Interaction editing functions
  const handleInteractionEdit = (component) => {
    setEditingInteractionComponent(component);
    setIframeUrl('');
    setInteractionDialogOpen(true);
  };

  const handleSaveInteraction = () => {
    if (!editingInteractionComponent || !iframeUrl.trim()) {
      showSnackbar('Please enter a valid iframe URL', 'error');
      return;
    }

    // Update the component with iframe functionality
    const updatedComponent = { ...editingInteractionComponent };

    // Add iframe functionality to buttons in the component
    let updatedHTML = updatedComponent.component;

    // Find all buttons and add onclick handlers
    updatedHTML = updatedHTML.replace(
      /<button([^>]*?)>(.*?)<\/button>/gi,
      (match, attributes, content) => {
        // Check if button text contains booking-related keywords
        if (content.toLowerCase().includes('book') ||
            content.toLowerCase().includes('appointment') ||
            content.toLowerCase().includes('schedule')) {
          return `<button${attributes} onclick="window.openBookingIframe('${iframeUrl}')">${content}</button>`;
        }
        return match;
      }
    );

    updatedComponent.component = updatedHTML;
    updatedComponent.hasIframeInteraction = true;
    updatedComponent.iframeUrl = iframeUrl;

    // Update the canvas component
    setCanvasComponents(prev =>
      prev.map(comp =>
        comp.instanceId === editingInteractionComponent.instanceId
          ? updatedComponent
          : comp
      )
    );

    setInteractionDialogOpen(false);
    setEditingInteractionComponent(null);
    setIframeUrl('');
    showSnackbar('Iframe interaction added successfully!');
  };

  // Global function to open iframe modal
  const openBookingIframe = (url) => {
    setCurrentIframeUrl(url);
    setIframeModalOpen(true);
  };

  // Make the function globally available
  React.useEffect(() => {
    window.openBookingIframe = openBookingIframe;
    return () => {
      delete window.openBookingIframe;
    };
  }, []);

  const handleImageFileUpload = async (file) => {
    try {

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('image', file);

      // For now, we'll use a placeholder URL (in production, implement actual upload)
      const imageUrl = URL.createObjectURL(file);

      // Update component with new image
      if (editingImageComponent) {
        const updatedHTML = editingImageComponent.component.replace(
          /src="[^"]*"/g,
          `src="${imageUrl}"`
        );

        const updatedComponent = {
          ...editingImageComponent,
          component: updatedHTML
        };

        setCanvasComponents(prev =>
          prev.map(comp =>
            comp.instanceId === editingImageComponent.instanceId ? updatedComponent : comp
          )
        );

        if (selectedComponent && selectedComponent.instanceId === editingImageComponent.instanceId) {
          setSelectedComponent(updatedComponent);
        }

        showSnackbar('Image uploaded successfully!');
      }

      setImageUploadDialogOpen(false);
      setEditingImageComponent(null);
    } catch (error) {
      console.error('Image upload error:', error);
      showSnackbar('Error uploading image: ' + error.message, 'error');
    }
  };

  const extractImagesFromComponent = (component) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(component.component, 'text/html');
    const images = Array.from(doc.querySelectorAll('img'));
    return images.length > 0;
  };

  const hasBookingButtons = (component) => {
    if (!component || !component.component) return false;
    const buttonContent = component.component.toLowerCase();
    return buttonContent.includes('<button') && (
      buttonContent.includes('book') ||
      buttonContent.includes('appointment') ||
      buttonContent.includes('schedule')
    );
  };

  // Template functions
  const handleTemplateSelection = () => {
    setTemplateDialogOpen(true);
  };

  const loadTemplate = async (template) => {
    try {
      setLoadingTemplate(true);

      // Clear existing canvas
      setCanvasComponents([]);
      setSelectedComponent(null);

      // Load template components from layout (for dental templates) or fallback to components/sections
      const sourceComponents = template.layout || template.components || template.sections || [];

      if (!Array.isArray(sourceComponents)) {
        console.error('sourceComponents is not an array:', sourceComponents);
        throw new Error('Invalid template structure: layout/components/sections must be an array');
      }

      // Transform template layout into canvas components
      const templateComponents = sourceComponents.map((layoutItem, index) => {
        // Handle dental template layout structure
        if (layoutItem.component && layoutItem.id) {
          return {
            id: layoutItem.id,
            name: layoutItem.id.split('-').map(word =>
              word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' '),
            category: template.category || 'template',
            description: `${template.name} component`,
            tags: template.tags || [],
            component: layoutItem.component,
            instanceId: index + 1,
            position: { x: 0, y: index * 120 }
          };
        }

        // Handle existing component structure
        return {
          ...layoutItem,
          instanceId: index + 1,
          position: { x: 0, y: index * 120 }
        };
      });

      setCanvasComponents(templateComponents);
      setNextId(templateComponents.length + 1);

      // Update global settings
      setGlobalSettings({
        siteName: template.siteName || template.name || '',
        primaryColor: template.colors?.primary || template.primaryColor || '#4A90E2',
        fontFamily: template.fontFamily || 'Inter, sans-serif'
      });

      setTemplateDialogOpen(false);
      showSnackbar(`${template.name} template loaded successfully!`);
    } catch (error) {
      console.error('Template loading error:', error);
      showSnackbar('Error loading template: ' + error.message, 'error');
    } finally {
      setLoadingTemplate(false);
    }
  };


  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading Website Builder...</Typography>
      </Box>
    );
  }

  if (!website) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="error">Website not found</Typography>
        <Button onClick={() => navigate('/websites')} sx={{ mt: 2 }}>
          Back to Websites
        </Button>
      </Box>
    );
  }

  return (
    <PageBuilderErrorBoundary>
      <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* Top Header */}
        <AppBar position="static" sx={{ bgcolor: globalSettings.primaryColor || '#2563eb' }}>
          <Toolbar>
            <IconButton color="inherit" onClick={() => navigate('/websites')} sx={{ mr: 2 }}>
              <BackIcon />
            </IconButton>

            <Box sx={{ flex: 1 }}>
              <Typography variant="h6">{website.name}</Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                {website.subdomain}.docwebsite.app
              </Typography>
            </Box>

            <Stack direction="row" spacing={1}>
              {/* Only show editing controls in website and service edit modes */}
              {(isWebsiteMode || isEditMode) && (
                <>
                  <Button
                    onClick={handleManualSave}
                    startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
                    disabled={saving}
                    variant="contained"
                    color="success"
                    sx={{ bgcolor: 'success.main', '&:hover': { bgcolor: 'success.dark' } }}
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </Button>

                  <Button
                    onClick={handlePublish}
                    startIcon={<PublishIcon />}
                    variant="contained"
                    sx={{ bgcolor: 'warning.main', '&:hover': { bgcolor: 'warning.dark' } }}
                  >
                    Publish
                  </Button>
                </>
              )}

              {/* Preview button available in both modes */}
              <Button
                onClick={handlePreview}
                startIcon={<PreviewIcon />}
                variant="outlined"
                color="inherit"
                sx={{ borderColor: 'white', color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
              >
                {isPreviewMode ? 'Exit Preview' : 'Preview'}
              </Button>

              {/* Edit button only in display mode */}
              {isViewMode && (
                <Button
                  onClick={() => {
                    // Navigate to edit mode
                    if (servicePage && serviceInfo) {
                      const editUrl = `/full-destack-editor?servicePageId=${servicePage._id}&mode=service&websiteId=${websiteId}`;
                      navigate(editUrl);
                    }
                  }}
                  startIcon={<EditIcon />}
                  variant="contained"
                  sx={{ bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' } }}
                >
                  Edit This Page
                </Button>
              )}

              <Button
                onClick={() => setEnhancedServiceSelectorOpen(true)}
                startIcon={<ServicesIcon />}
                variant="outlined"
                color="inherit"
                sx={{ borderColor: 'white', color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
                title="AI Service Generator - Select multiple services and generate content"
              >
                AI Services
              </Button>

              <IconButton color="inherit" onClick={handleTemplateSelection} title="Load Template">
                <TemplateIcon />
              </IconButton>
              <IconButton color="inherit" onClick={() => setSettingsDialogOpen(true)}>
                <SettingsIcon />
              </IconButton>
            </Stack>
          </Toolbar>
        </AppBar>

        <Box sx={{ display: 'flex', flex: 1 }}>
          {/* Left Sidebar - Component Filter & Library - Only in website and service edit modes */}
          {!isPreviewMode && (isWebsiteMode || isEditMode) && (
            <Box sx={{ width: 350, borderRight: 1, borderColor: 'divider', display: 'flex', flexDirection: 'column', bgcolor: 'grey.50' }}>
              {/* Filter Section */}
              <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', bgcolor: 'white' }}>
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                  <FilterIcon sx={{ mr: 1 }} />
                  Component Library
                </Typography>

                {/* Search */}
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search components..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ mr: 1, color: 'grey.500' }} />
                  }}
                  sx={{ mb: 2 }}
                />

                {/* Category Filter */}
                <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    label="Category"
                  >
                    {(categories || []).map(cat => (
                      <MenuItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Tag Filter */}
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                  Filter by tags:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                  {(availableTags || []).map(tag => (
                    <Chip
                      key={tag}
                      label={tag}
                      size="small"
                      variant={selectedTags.includes(tag) ? 'filled' : 'outlined'}
                      onClick={() => handleTagToggle(tag)}
                      sx={{
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        '&:hover': { bgcolor: selectedTags.includes(tag) ? undefined : 'action.hover' }
                      }}
                    />
                  ))}
                </Box>

                {selectedTags.length > 0 && (
                  <Button
                    size="small"
                    onClick={() => setSelectedTags([])}
                    startIcon={<CloseIcon />}
                    sx={{ mb: 1 }}
                  >
                    Clear Tags
                  </Button>
                )}
              </Box>

              {/* Components List */}
              <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {filteredComponents.length} components available
                </Typography>

                {/* Debug info */}
                {process.env.NODE_ENV === 'development' && (
                  <Typography variant="caption" color="info.main" sx={{ display: 'block', mb: 1 }}>
                    Debug: {components.length} total, {filteredComponents.length} filtered, category: {selectedCategory}
                  </Typography>
                )}

                <Grid container spacing={1}>
                  {(filteredComponents || []).map((component) => (
                    <Grid item xs={12} key={component.id}>
                      <Card
                        sx={{
                          '&:hover': { bgcolor: 'action.hover', transform: 'translateY(-2px)' },
                          transition: 'all 0.2s',
                          position: 'relative'
                        }}
                      >
                        <Box
                          sx={{
                            cursor: 'grab',
                            '&:active': { cursor: 'grabbing' }
                          }}
                          draggable
                          onDragStart={(e) => handleDragStart(e, component)}
                        >
                          <CardContent sx={{ p: 2, pb: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <DragIcon sx={{ mr: 1, color: 'grey.400' }} />
                              <Typography variant="body2" fontWeight="medium">
                                {component.name}
                              </Typography>
                            </Box>

                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                              {component.description}
                            </Typography>

                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                              <Chip
                                label={component.category}
                                size="small"
                                color="primary"
                                variant="outlined"
                              />
                              {(component.tags?.slice(0, 2) || []).map(tag => (
                                <Chip
                                  key={tag}
                                  label={tag}
                                  size="small"
                                  variant="outlined"
                                  sx={{ fontSize: '0.7rem' }}
                                />
                              ))}
                            </Box>
                          </CardContent>
                        </Box>

                        {/* Preview Button */}
                        <Box sx={{ px: 2, pb: 2 }}>
                          <Button
                            fullWidth
                            size="small"
                            variant="outlined"
                            startIcon={<VisibilityIcon />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleComponentPreview(component);
                            }}
                            sx={{
                              borderColor: 'primary.main',
                              color: 'primary.main',
                              '&:hover': {
                                bgcolor: 'primary.main',
                                color: 'white'
                              }
                            }}
                          >
                            Preview
                          </Button>
                        </Box>
                      </Card>
                    </Grid>
                  ))}
                </Grid>

                {filteredComponents.length === 0 && (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No components match your filters
                    </Typography>
                    <Button
                      size="small"
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedCategory('all');
                        setSelectedTags([]);
                      }}
                      sx={{ mt: 1 }}
                    >
                      Clear Filters
                    </Button>
                  </Box>
                )}
              </Box>
            </Box>
          )}

          {/* Main Canvas */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {/* Canvas Area */}
            <Box
              sx={{
                flex: 1,
                overflow: 'auto',
                p: isPreviewMode ? 0 : 3,
                bgcolor: isPreviewMode ? 'white' : 'grey.100'
              }}
            >
              <Paper
                sx={{
                  minHeight: '100%',
                  bgcolor: 'white',
                  borderRadius: isPreviewMode ? 0 : 2,
                  border: isPreviewMode ? 'none' : '2px dashed',
                  borderColor: 'grey.300',
                  p: isPreviewMode ? 0 : 3,
                  '&:hover': !isPreviewMode ? { borderColor: 'primary.main' } : {}
                }}
                onDrop={!isPreviewMode ? handleDrop : undefined}
                onDragOver={!isPreviewMode ? (e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'copy';
                } : undefined}
              >
                {canvasComponents.length === 0 ? (
                  !isPreviewMode && (
                    <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
                      <Typography variant="h6" sx={{ mb: 2 }}>
                        Start Building Your Website
                      </Typography>
                      <Typography variant="body2">
                        Drag components from the left sidebar to start building your website
                      </Typography>
                    </Box>
                  )
                ) : (
                  <Box>
                    {(canvasComponents || []).map((component) => (
                      <Box
                        key={component.instanceId}
                        sx={{
                          mb: isPreviewMode ? 0 : 3,
                          position: 'relative',
                          border: (isPreviewMode || isViewMode) ? 'none' : selectedComponent?.instanceId === component.instanceId ? '2px solid' : '1px solid transparent',
                          borderColor: selectedComponent?.instanceId === component.instanceId ? 'primary.main' : 'transparent',
                          borderRadius: 1,
                          '&:hover': (!isPreviewMode && (isWebsiteMode || isEditMode)) ? {
                            borderColor: 'primary.main',
                            '& .component-controls': { opacity: 1 }
                          } : {}
                        }}
                        onClick={!isPreviewMode && (isWebsiteMode || isEditMode) ? () => handleCanvasComponentSelect(component) : undefined}
                      >
                        {/* Component Controls - Only in website and service edit modes */}
                        {!isPreviewMode && (isWebsiteMode || isEditMode) && (
                          <Box
                            className="component-controls"
                            sx={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              opacity: selectedComponent?.instanceId === component.instanceId ? 1 : 0,
                              transition: 'opacity 0.2s',
                              zIndex: 10,
                              display: 'flex',
                              gap: 1
                            }}
                          >
                            <IconButton
                              size="small"
                              sx={{ bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' } }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCanvasComponentSelect(component);
                              }}
                              title="Select Component"
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              sx={{ bgcolor: 'success.main', color: 'white', '&:hover': { bgcolor: 'success.dark' } }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTextEdit(component);
                              }}
                              title="Edit Text"
                            >
                              <TextIcon fontSize="small" />
                            </IconButton>
                            {extractImagesFromComponent(component) && (
                              <IconButton
                                size="small"
                                sx={{ bgcolor: 'orange.main', color: 'white', '&:hover': { bgcolor: 'orange.dark' } }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleImageUpload(component);
                                }}
                                title="Upload Image"
                              >
                                <ImageIcon fontSize="small" />
                              </IconButton>
                            )}
                            <IconButton
                              size="small"
                              sx={{ bgcolor: 'error.main', color: 'white', '&:hover': { bgcolor: 'error.dark' } }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveComponent(component.instanceId);
                              }}
                              title="Remove Component"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        )}

                        {/* Component Content */}
                        <ComponentRenderer
                          component={component}
                          config={component.config || {}}
                          websiteId={websiteId}
                          isPreview={false}
                        />
                      </Box>
                    ))}
                  </Box>
                )}
              </Paper>
            </Box>
          </Box>

          {/* Right Sidebar - Properties - Only in website and service edit modes */}
          {!isPreviewMode && (isWebsiteMode || isEditMode) && (
            <Box sx={{ width: 300, borderLeft: 1, borderColor: 'divider', p: 2 }}>
              <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 2 }}>
                Properties
              </Typography>

              {selectedComponent ? (
                <Box>
                  <Typography variant="body2" fontWeight="medium" sx={{ mb: 1 }}>
                    {selectedComponent.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                    {selectedComponent.category}
                  </Typography>

                  <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                    Description:
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {selectedComponent.description}
                  </Typography>

                  <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                    Tags:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                    {(selectedComponent.tags || []).map(tag => (
                      <Chip key={tag} label={tag} size="small" variant="outlined" />
                    ))}
                  </Box>

                  <Stack spacing={2}>
                    <Button
                      fullWidth
                      variant="contained"
                      color="success"
                      onClick={() => handleTextEdit(selectedComponent)}
                      startIcon={<TextIcon />}
                    >
                      Edit Text
                    </Button>
                    {extractImagesFromComponent(selectedComponent) && (
                      <Button
                        fullWidth
                        variant="contained"
                        sx={{ bgcolor: 'orange.main', '&:hover': { bgcolor: 'orange.dark' } }}
                        onClick={() => handleImageUpload(selectedComponent)}
                        startIcon={<ImageIcon />}
                      >
                        Upload Image
                      </Button>
                    )}
                    {hasBookingButtons(selectedComponent) && (
                      <Button
                        fullWidth
                        variant="contained"
                        sx={{ bgcolor: 'purple.main', '&:hover': { bgcolor: 'purple.dark' } }}
                        onClick={() => handleInteractionEdit(selectedComponent)}
                        startIcon={<SettingsIcon />}
                      >
                        Add Booking Iframe
                      </Button>
                    )}
                    <Button
                      fullWidth
                      variant="outlined"
                      color="error"
                      onClick={() => handleRemoveComponent(selectedComponent.instanceId)}
                      startIcon={<DeleteIcon />}
                    >
                      Remove Component
                    </Button>
                  </Stack>

                  {/* Dynamic Header Configuration */}
                  <DynamicHeaderHandler
                    selectedComponent={selectedComponent}
                    onUpdateComponent={(updatedComponent) => {
                      setCanvasComponents(prev =>
                        prev.map(comp =>
                          comp.instanceId === updatedComponent.instanceId
                            ? updatedComponent
                            : comp
                        )
                      );
                      setSelectedComponent(updatedComponent);
                      showSnackbar('Header configuration updated');
                    }}
                    websiteId={websiteId}
                  />
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Select a component on the canvas to edit its properties
                </Typography>
              )}
            </Box>
          )}
        </Box>

        {/* Settings Dialog */}
        <Dialog open={settingsDialogOpen} onClose={() => setSettingsDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Website Settings</DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 1 }}>
              <TextField
                fullWidth
                label="Site Name"
                value={globalSettings.siteName}
                onChange={(e) => setGlobalSettings(prev => ({ ...prev, siteName: e.target.value }))}
              />
              <TextField
                fullWidth
                label="Site Description"
                multiline
                rows={2}
                value={globalSettings.siteDescription}
                onChange={(e) => setGlobalSettings(prev => ({ ...prev, siteDescription: e.target.value }))}
              />
              <TextField
                fullWidth
                label="Primary Color"
                type="color"
                value={globalSettings.primaryColor}
                onChange={(e) => setGlobalSettings(prev => ({ ...prev, primaryColor: e.target.value }))}
              />
              <TextField
                fullWidth
                label="Secondary Color"
                type="color"
                value={globalSettings.secondaryColor}
                onChange={(e) => setGlobalSettings(prev => ({ ...prev, secondaryColor: e.target.value }))}
              />
              <TextField
                fullWidth
                label="Font Family"
                value={globalSettings.fontFamily}
                onChange={(e) => setGlobalSettings(prev => ({ ...prev, fontFamily: e.target.value }))}
                helperText="CSS font family (e.g., 'Inter, sans-serif')"
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSettingsDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => {
              setSettingsDialogOpen(false);
              showSnackbar('Settings updated! Save to apply changes.');
            }} variant="contained">Update Settings</Button>
          </DialogActions>
        </Dialog>

        {/* Text Edit Dialog */}
        <Dialog open={textEditDialogOpen} onClose={() => setTextEditDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
            <TextIcon sx={{ mr: 1 }} />
            Edit Text Content
            {editingComponent && (
              <Chip
                label={editingComponent.name}
                size="small"
                sx={{ ml: 2 }}
              />
            )}
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Edit the text content found in this component. Changes will be applied to the HTML structure.
            </Typography>

            {extractedTexts.length > 0 ? (
              <Stack spacing={3}>
                {(extractedTexts || []).map((textItem, index) => (
                  <Box key={textItem.id}>
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                      {textItem.element.toUpperCase()} element #{index + 1}
                    </Typography>
                    <TextField
                      fullWidth
                      multiline
                      minRows={1}
                      maxRows={6}
                      value={textItem.newText}
                      onChange={(e) => handleTextChange(textItem.id, e.target.value)}
                      placeholder="Enter text content..."
                      variant="outlined"
                      sx={{ mb: 1 }}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontStyle: 'italic' }}>
                      Original: "{textItem.originalText}"
                    </Typography>
                  </Box>
                ))}
              </Stack>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  No editable text found in this component.
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setTextEditDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleTextSave}
              variant="contained"
              startIcon={<SaveIcon />}
              disabled={extractedTexts.length === 0}
            >
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>

        {/* Component Preview Dialog */}
        <Dialog
          open={previewDialogOpen}
          onClose={() => setPreviewDialogOpen(false)}
          maxWidth="lg"
          fullWidth
          sx={{
            '& .MuiDialog-paper': {
              minHeight: '80vh'
            }
          }}
        >
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <VisibilityIcon sx={{ mr: 1 }} />
              Component Preview
              {previewComponent && (
                <Chip
                  label={previewComponent.name}
                  size="small"
                  sx={{ ml: 2 }}
                />
              )}
            </Box>
            <IconButton onClick={() => setPreviewDialogOpen(false)}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>

          <DialogContent sx={{ p: 0 }}>
            {previewComponent ? (
              <Box>
                {/* Component Info Header */}
                <Box sx={{ p: 3, bgcolor: 'grey.50', borderBottom: 1, borderColor: 'divider' }}>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    {previewComponent.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {previewComponent.description}
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    <Chip
                      label={previewComponent.category}
                      size="small"
                      color="primary"
                      variant="filled"
                    />
                    {(previewComponent.tags || []).map(tag => (
                      <Chip
                        key={tag}
                        label={tag}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Box>

                {/* Live Component Preview */}
                <Box
                  sx={{
                    p: 4,
                    bgcolor: 'white',
                    minHeight: '400px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                  }}
                >
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, textAlign: 'center' }}>
                    Live Preview:
                  </Typography>

                  {/* Container for the component preview */}
                  <Box
                    sx={{
                      border: '1px dashed',
                      borderColor: 'grey.300',
                      borderRadius: 1,
                      p: 2,
                      bgcolor: 'white',
                      '& *': {
                        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important'
                      }
                    }}
                  >
                    <ComponentRenderer
                      component={previewComponent}
                      config={previewComponent.config || {}}
                      websiteId={websiteId}
                      isPreview={true}
                    />
                  </Box>

                  {/* Component Code Display */}
                  <Box sx={{ mt: 4 }}>
                    <Typography variant="subtitle2" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                      <Box component="span" sx={{ mr: 1 }}>📝</Box>
                      HTML Code:
                    </Typography>
                    <Paper
                      sx={{
                        p: 2,
                        bgcolor: 'grey.100',
                        border: '1px solid',
                        borderColor: 'grey.300',
                        borderRadius: 1,
                        maxHeight: '300px',
                        overflow: 'auto'
                      }}
                    >
                      <Typography
                        component="pre"
                        variant="body2"
                        sx={{
                          fontFamily: 'Monaco, "Courier New", monospace',
                          fontSize: '0.75rem',
                          lineHeight: 1.4,
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-all',
                          margin: 0,
                          color: 'text.primary'
                        }}
                      >
                        {previewComponent.component}
                      </Typography>
                    </Paper>
                  </Box>
                </Box>
              </Box>
            ) : (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  No component selected for preview.
                </Typography>
              </Box>
            )}
          </DialogContent>

          <DialogActions sx={{ p: 3, pt: 2 }}>
            <Button onClick={() => setPreviewDialogOpen(false)}>Close</Button>
            {previewComponent && (
              <Button
                onClick={() => {
                  setPreviewDialogOpen(false);
                  // Simulate drag and drop by adding to canvas
                  const newComponent = {
                    ...previewComponent,
                    instanceId: nextId,
                    position: { x: 0, y: canvasComponents.length * 120 }
                  };
                  setCanvasComponents(prev => [...prev, newComponent]);
                  setNextId(prev => prev + 1);
                  setSelectedComponent(newComponent);
                  showSnackbar(`Added ${previewComponent.name} to canvas`);
                }}
                variant="contained"
                startIcon={<AddIcon />}
              >
                Add to Canvas
              </Button>
            )}
          </DialogActions>
        </Dialog>

        {/* Image Upload Dialog */}
        <Dialog
          open={imageUploadDialogOpen}
          onClose={() => setImageUploadDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
            <ImageIcon sx={{ mr: 1 }} />
            Upload Custom Image
            {editingImageComponent && (
              <Chip
                label={editingImageComponent.name}
                size="small"
                sx={{ ml: 2 }}
              />
            )}
          </DialogTitle>

          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Upload your own images to personalize your dental practice website. Supported formats: JPG, PNG, WebP (max 5MB)
            </Typography>

            {/* File Upload Area */}
            <Box
              sx={{
                border: '2px dashed',
                borderColor: 'grey.300',
                borderRadius: 2,
                p: 6,
                textAlign: 'center',
                bgcolor: 'grey.50',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: 'primary.50'
                },
                transition: 'all 0.2s',
                cursor: 'pointer'
              }}
              component="label"
            >
              <input
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    handleImageFileUpload(file);
                  }
                }}
              />

              <UploadIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" sx={{ mb: 1 }}>
                Click to upload image
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Or drag and drop your image here
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                Recommended: High-quality images work best for professional websites
              </Typography>
            </Box>

            {/* Image Guidelines */}
            <Box sx={{ mt: 4 }}>
              <Typography variant="subtitle2" sx={{ mb: 2 }}>
                📸 Image Guidelines for Best Results:
              </Typography>
              <Box sx={{ pl: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  • <strong>Professional Photos:</strong> Use high-quality images of your practice, team, or equipment
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  • <strong>Optimal Size:</strong> 1200x800 pixels or larger for crisp display
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  • <strong>File Format:</strong> JPG for photos, PNG for graphics with transparency
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  • <strong>Content Ideas:</strong> Office interior, team photos, equipment, patient testimonials
                </Typography>
              </Box>
            </Box>

            {/* Quick Image Suggestions */}
            <Box sx={{ mt: 4 }}>
              <Typography variant="subtitle2" sx={{ mb: 2 }}>
                🎯 Quick Suggestions for Dental Practice Images:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {[
                  'Modern dental chair',
                  'Welcoming reception area',
                  'Professional team photo',
                  'State-of-the-art equipment',
                  'Comfortable treatment room',
                  'Clean sterilization area',
                  'Happy patient testimonial',
                  'Kids-friendly play area'
                ].map((suggestion) => (
                  <Chip
                    key={suggestion}
                    label={suggestion}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: '0.75rem' }}
                  />
                ))}
              </Box>
            </Box>
          </DialogContent>

          <DialogActions>
            <Button onClick={() => setImageUploadDialogOpen(false)}>Cancel</Button>
            <Button
              variant="outlined"
              startIcon={<VisibilityIcon />}
              onClick={() => {
                // Open stock photo suggestions
                showSnackbar('Stock photo library coming soon!', 'info');
              }}
            >
              Browse Stock Photos
            </Button>
          </DialogActions>
        </Dialog>

        {/* Template Selection Dialog */}
        <Dialog
          open={templateDialogOpen}
          onClose={() => setTemplateDialogOpen(false)}
          maxWidth="xl"
          fullWidth
          sx={{
            '& .MuiDialog-paper': {
              minHeight: '80vh'
            }
          }}
        >
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <MagicIcon sx={{ mr: 1 }} />
              Choose Your Perfect Dental Website
            </Box>
            <IconButton onClick={() => setTemplateDialogOpen(false)}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>

          <DialogContent sx={{ p: 4 }}>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4, textAlign: 'center' }}>
              Select from our professionally designed dental website templates. Each template is fully customizable and optimized for dental practices.
            </Typography>

            <Box sx={{ mt: 4, p: 3, bgcolor: 'blue.50', borderRadius: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <MagicIcon sx={{ mr: 1 }} />
                Template Features:
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" color="text.secondary">
                    ✨ Modern animations and effects
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" color="text.secondary">
                    📱 Fully responsive design
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" color="text.secondary">
                    🎨 Customizable colors and fonts
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" color="text.secondary">
                    🦷 Dental-specific content
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </DialogContent>

          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setTemplateDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={() => {
                if (selectedTemplate) {
                  loadTemplate(selectedTemplate);
                }
              }}
              variant="contained"
              disabled={!selectedTemplate || loadingTemplate}
              startIcon={loadingTemplate ? <CircularProgress size={16} /> : <MagicIcon />}
            >
              {loadingTemplate ? 'Loading Template...' : 'Load Selected Template'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Iframe Interaction Dialog */}
        <Dialog open={interactionDialogOpen} onClose={() => setInteractionDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle sx={{ borderBottom: 1, borderColor: 'divider' }}>
            Add Booking Iframe to Buttons
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Add iframe functionality to booking buttons in this component. When users click on booking buttons,
              an iframe modal will open with your booking system.
            </Typography>

            <TextField
              fullWidth
              label="Iframe URL"
              placeholder="https://your-booking-system.com/embed"
              value={iframeUrl}
              onChange={(e) => setIframeUrl(e.target.value)}
              variant="outlined"
              sx={{ mb: 2 }}
              helperText="Enter the URL of your booking system that will be displayed in the iframe"
            />

            <Alert severity="info" sx={{ mt: 2 }}>
              This will automatically add click handlers to buttons containing words like "Book", "Appointment", or "Schedule"
            </Alert>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setInteractionDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleSaveInteraction}
              variant="contained"
              disabled={!iframeUrl.trim()}
            >
              Add Iframe Interaction
            </Button>
          </DialogActions>
        </Dialog>

        {/* Iframe Modal */}
        <Dialog
          open={iframeModalOpen}
          onClose={() => setIframeModalOpen(false)}
          maxWidth="lg"
          fullWidth
          PaperProps={{
            sx: { height: '90vh' }
          }}
        >
          <DialogTitle sx={{ borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Book Your Appointment
            <IconButton onClick={() => setIframeModalOpen(false)}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ p: 0, height: '100%' }}>
            {currentIframeUrl && (
              <iframe
                src={currentIframeUrl}
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none'
                }}
                title="Booking System"
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Enhanced Service Selector - AI Multi-Service Generator */}
        {enhancedServiceSelectorOpen && websiteId && (
          <EnhancedServiceSelector
            websiteId={websiteId}
            onServicesGenerated={(result) => {
              // Handle successful batch service generation
              showSnackbar(
                `Successfully generated ${result.successfulGenerations} of ${result.totalSelected} service pages with AI content!`,
                'success'
              );

              // Auto-configure modern header with generated services
              if (result.selectedServiceIds.length > 0) {
                // Auto-create modern minimalist header as default
                 createModernHeadersWithServiceMapping('minimalist');

                showSnackbar(
                  'Modern navigation header added to your website with generated services!',
                  'info'
                );
              }
            }}
            onClose={() => setEnhancedServiceSelectorOpen(false)}
          />
        )}

        {/* Unified Content Sidebar - Edit Mode Only */}
        {isServicePageMode && servicePageId && isEditMode && (
          <DestackUnifiedContentSidebar
            servicePageId={servicePageId}
            websiteId={websiteId}
            isVisible={unifiedContentSidebarVisible}
            onToggle={() => setUnifiedContentSidebarVisible(!unifiedContentSidebarVisible)}
            onSyncTriggered={(syncType) => {
              setSnackbar({
                open: true,
                message: `Content synchronized (${syncType})`,
                severity: 'success'
              });
            }}
            canvasComponents={canvasComponents}
            globalSettings={{}} // Add global settings if available
          />
        )}

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </PageBuilderErrorBoundary>
  );
};

export default SimpleDragDropBuilder;