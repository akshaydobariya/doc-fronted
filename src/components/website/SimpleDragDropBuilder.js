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
import { useNavigate, useSearchParams } from 'react-router-dom';
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
  const navigate = useNavigate();
  const websiteId = searchParams.get('websiteId');
  const servicePageId = searchParams.get('servicePageId');
  const mode = searchParams.get('mode'); // 'service' for service page editing

  // Website state
  const [website, setWebsite] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Service page state (when mode === 'service')
  const [servicePage, setServicePage] = useState(null);
  const [isServicePageMode, setIsServicePageMode] = useState(mode === 'service');

  // Unified content state (for service page mode)
  const [unifiedContentSidebarVisible, setUnifiedContentSidebarVisible] = useState(false);
  const [unifiedContentEnabled, setUnifiedContentEnabled] = useState(mode === 'service');

  // Debug logging for service page mode
  useEffect(() => {
    if (servicePageId || mode) {
      console.log('🔍 Service Page Mode Detection:');
      console.log('- servicePageId:', servicePageId);
      console.log('- mode:', mode);
      console.log('- isServicePageMode:', mode === 'service');
      console.log('- websiteId:', websiteId);
    }
  }, [servicePageId, mode, websiteId]);

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

  // Debug effect to catch rendering errors
  useEffect(() => {
    console.log('SimpleDragDropBuilder rendered with states:', {
      components: components?.length || 0,
      filteredComponents: filteredComponents?.length || 0,
      canvasComponents: canvasComponents?.length || 0,
    });
  });

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

    console.log('Filter applied:', {
      totalComponents: components.length,
      searchTerm,
      selectedCategory,
      selectedTags,
      filteredCount: filtered.length
    });
    console.log('Filtered components:', filtered.slice(0, 3).map(c => ({ id: c.id, name: c.name, category: c.category })));

    setFilteredComponents(filtered);
  }, [components, searchTerm, selectedCategory, selectedTags]);

  // Generate Destack components from service page content - Dynamic Based on Service Data
  const generateServicePageComponents = (content, serviceData) => {
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

    // Generate appropriate banner image based on service category
    const getBannerImage = (serviceName, category) => {
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

      return defaultImages[category] || defaultImages['general-dentistry'];
    };

    // 1. Hero Banner Section - Dynamic based on service data
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
        <section class="service-hero" style="background: white; padding: 0; margin: 0;">
          <div style="position: relative; width: 100%; height: auto;">
            <img src="${getBannerImage(serviceName, serviceCategory)}"
                 alt="${serviceName} Banner"
                 style="width: 100%; height: auto; display: block; max-height: 500px; object-fit: cover;">
            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; color: white; z-index: 2;">
              <h1 data-text="true" style="font-size: 48px; font-weight: bold; margin: 0; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">
                ${serviceName}
              </h1>
              ${serviceDescription ? `
                <p data-text="true" style="font-size: 20px; margin: 10px 0 0 0; text-shadow: 1px 1px 2px rgba(0,0,0,0.5);">
                  ${serviceDescription}
                </p>
              ` : ''}
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

    // 2. Introduction Section - Dynamic Service Introduction
    const introId = `service-intro-${componentId++}`;

    // Generate dynamic introduction based on service data
    const getServiceIntro = (serviceName, serviceData) => {
      if (content.intro) {
        return content.intro;
      }

      // If no content.intro, generate from service data
      if (serviceData?.fullDescription) {
        return serviceData.fullDescription;
      }

      // Special handling for specific services
      if (serviceName.toLowerCase().includes('laser')) {
        return 'LASER stands for Light Amplification by the Stimulated Emission of Radiation. Laser dentistry is a precise and effective way to perform many dental procedures. The potential for it to improve dental procedures rests in the dentist\'s ability to control power output and the duration of exposure on the tissue (whether gum or tooth structure), allowing for treatment of a highly specific area of focus without damaging surrounding tissues.';
      }

      // Generic template for other services
      return `${serviceName} is a professional dental treatment designed to improve your oral health and enhance your smile. Our experienced dental team uses state-of-the-art technology and proven techniques to deliver exceptional results with patient comfort as our top priority.`;
    };

    components.push({
      id: introId,
      type: 'ServiceIntro',
      name: `${serviceName} Introduction`,
      category: 'content',
      description: `Introduction explaining ${serviceName} treatment`,
      tags: ['intro', 'definition'],
      instanceId: `${introId}-${Date.now()}`,
      component: `
        <section class="service-intro" style="background: white; padding: 40px 20px;">
          <div style="max-width: 800px; margin: 0 auto; text-align: center;">
            <p data-text="true" style="font-size: 15px; line-height: 1.6; color: #000; margin: 0;">
              ${getServiceIntro(serviceName, serviceData)}
            </p>
          </div>
        </section>
      `,
      props: {
        intro: getServiceIntro(serviceName, serviceData),
        serviceName,
        serviceData
      },
      config: {
        intro: getServiceIntro(serviceName, serviceData)
      }
    });

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

    // 4. Service Features/Benefits Section - Dynamic based on service data
    const uspId = `service-usp-${componentId++}`;

    // Generate dynamic features based on service data
    const getServiceFeatures = (serviceName, serviceData) => {
      // If benefits exist in content, use them
      if (content.benefits?.list?.length > 0) {
        return content.benefits.list.slice(0, 4); // Take first 4 benefits
      }

      // If service data has benefits, convert them
      if (serviceData?.benefits?.length > 0) {
        return serviceData.benefits.slice(0, 4).map((benefit, index) => ({
          title: benefit.split(':')[0] || `Feature ${index + 1}`,
          description: benefit.split(':')[1] || benefit,
          icon: getFeatureIcon(benefit, index)
        }));
      }

      // Default features for laser dentistry
      if (serviceName.toLowerCase().includes('laser')) {
        return [
          { title: 'Precision', description: 'Laser technology allows for extremely precise treatment, targeting specific areas without damaging surrounding healthy tissue.', icon: '🎯' },
          { title: 'Comfort', description: 'Many laser procedures can be performed with minimal or no anesthesia, providing a more comfortable experience.', icon: '😌' },
          { title: 'Faster Healing', description: 'Laser energy promotes faster healing and tissue regeneration, reducing recovery time significantly.', icon: '⚡' },
          { title: 'Reduced Bleeding', description: 'Laser procedures typically result in less bleeding and swelling compared to traditional methods.', icon: '💧' }
        ];
      }

      // Generic features for other services
      return [
        { title: 'Expert Care', description: `Professional ${serviceName} treatment performed by experienced dental specialists.`, icon: '👨‍⚕️' },
        { title: 'Advanced Technology', description: 'State-of-the-art equipment and modern techniques for optimal results.', icon: '🔬' },
        { title: 'Patient Comfort', description: 'Comfortable procedures designed to minimize discomfort and anxiety.', icon: '😌' },
        { title: 'Lasting Results', description: 'Long-term solutions that improve your oral health and confidence.', icon: '✨' }
      ];
    };

    const getFeatureIcon = (benefit, index) => {
      const icons = ['🎯', '😌', '⚡', '💧', '🦷', '✨', '🔬', '👨‍⚕️'];
      if (benefit.toLowerCase().includes('precision') || benefit.toLowerCase().includes('accurate')) return '🎯';
      if (benefit.toLowerCase().includes('comfort') || benefit.toLowerCase().includes('pain')) return '😌';
      if (benefit.toLowerCase().includes('healing') || benefit.toLowerCase().includes('fast') || benefit.toLowerCase().includes('quick')) return '⚡';
      if (benefit.toLowerCase().includes('bleeding') || benefit.toLowerCase().includes('blood')) return '💧';
      if (benefit.toLowerCase().includes('dental') || benefit.toLowerCase().includes('tooth')) return '🦷';
      return icons[index % icons.length];
    };

    const features = getServiceFeatures(serviceName, serviceData);
    const sectionTitle = serviceName.toLowerCase().includes('laser')
      ? 'Next-Generation Laser Dentistry'
      : `Why Choose ${serviceName}?`;

    components.push({
      id: uspId,
      type: 'ServiceUSP',
      name: `${serviceName} Features`,
      category: 'features',
      description: `Key features and benefits of ${serviceName}`,
      tags: ['usp', 'features', 'benefits'],
      instanceId: `${uspId}-${Date.now()}`,
      component: `
        <section class="service-usp" style="background: white; padding: 60px 20px;">
          <div style="max-width: 1200px; margin: 0 auto;">
            <h2 data-text="true" style="font-size: 32px; font-weight: bold; text-align: center; margin-bottom: 40px; color: #000;">
              ${sectionTitle}
            </h2>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 30px;">
              ${features.map(feature => `
                <div style="text-align: center; padding: 20px;">
                  <div style="font-size: 48px; margin-bottom: 15px;">${feature.icon}</div>
                  <h3 data-text="true" style="font-size: 20px; font-weight: bold; margin-bottom: 10px; color: #000;">
                    ${feature.title}
                  </h3>
                  <p data-text="true" style="font-size: 15px; line-height: 1.5; color: #000; margin: 0;">
                    ${feature.description}
                  </p>
                </div>
              `).join('')}
            </div>
          </div>
        </section>
      `,
      props: {
        features,
        serviceName,
        sectionTitle
      },
      config: {
        features,
        sectionTitle
      }
    });

    // 5. Benefits Section - Dynamic bullet points based on service data
    const benefitsId = `service-benefits-${componentId++}`;

    // Generate dynamic benefits based on service data
    const getServiceBenefits = (serviceName, serviceData) => {
      // If content has detailed benefits list, use them
      if (content.benefits?.list?.length > 0) {
        return content.benefits.list.map(benefit =>
          typeof benefit === 'string' ? benefit : benefit.description || benefit.title
        );
      }

      // If service data has benefits, use them
      if (serviceData?.benefits?.length > 0) {
        return serviceData.benefits;
      }

      // Default benefits for laser dentistry (keeping original for compatibility)
      if (serviceName.toLowerCase().includes('laser')) {
        return [
          'Procedures performed using soft tissue dental lasers may not require sutures (stitches)',
          'Certain laser dentistry procedures do not require anesthesia',
          'Laser dentistry minimizes bleeding because the high-energy light beam aids in the clotting (coagulation) of exposed blood vessels, thus inhibiting blood loss',
          'Bacterial infections are minimized because the high-energy beam sterilizes the area being worked on',
          'Damage to surrounding tissue is minimized',
          'Wounds heal faster and tissues can be regenerated'
        ];
      }

      // Generic benefits for other services
      return [
        `Improved oral health and function with ${serviceName} treatment`,
        'Professional care using state-of-the-art dental technology',
        'Minimally invasive techniques for maximum patient comfort',
        'Long-lasting results with proper care and maintenance',
        'Experienced dental team with specialized training',
        'Comprehensive treatment planning for optimal outcomes'
      ];
    };

    const benefits = getServiceBenefits(serviceName, serviceData);
    const benefitsTitle = content.benefits?.title || `Benefits of ${serviceName}`;

    components.push({
      id: benefitsId,
      type: 'ServiceBenefits',
      name: `${serviceName} Benefits`,
      category: 'benefits',
      description: `Key benefits of ${serviceName} treatment`,
      tags: ['benefits', 'advantages'],
      instanceId: `${benefitsId}-${Date.now()}`,
      component: `
        <section class="service-benefits" style="background: white; padding: 50px 20px;">
          <div style="max-width: 800px; margin: 0 auto;">
            <h2 data-text="true" style="font-size: 28px; font-weight: bold; text-align: center; margin-bottom: 30px; color: #000;">
              ${benefitsTitle}
            </h2>
            <ul style="list-style: disc; padding-left: 20px; line-height: 2; font-size: 15px; color: #000;">
              ${benefits.map(benefit => `
                <li data-text="true">${benefit}</li>
              `).join('')}
            </ul>
          </div>
        </section>
      `,
      props: {
        benefits,
        benefitsTitle,
        serviceName
      },
      config: {
        benefits,
        benefitsTitle
      }
    });

    // 6. Procedures Section - Dynamic based on service data
    const proceduresId = `service-procedures-${componentId++}`;

    // Generate dynamic procedures based on service data
    const getServiceProcedures = (serviceName, serviceData) => {
      // If content has procedure steps, use them
      if (content.procedure?.steps?.length > 0) {
        return content.procedure.steps.slice(0, 3).map(step => ({
          title: step.title,
          description: step.description,
          image: getDefaultProcedureImage(step.title, serviceName)
        }));
      }

      // Default procedures for laser dentistry
      if (serviceName.toLowerCase().includes('laser')) {
        return [
          {
            title: 'Crown Lengthening',
            description: 'Laser dentistry can reshape gum tissue to expose a healthy tooth structure and improve the appearance of a gummy smile.',
            image: 'https://nahidmahmud.com/test-website/test01/wp-content/uploads/2025/09/Crown-Lengthening.png'
          },
          {
            title: 'Treating Tongue Conditions',
            description: 'Lasers can treat tongue-tie conditions and other tongue-related issues with minimal discomfort and faster healing.',
            image: 'https://nahidmahmud.com/test-website/test01/wp-content/uploads/2025/09/Treating-tongue.png'
          },
          {
            title: 'Removing Soft Tissue',
            description: 'Precise removal of soft tissue folds from ill-fitting dentures without pain and minimal bleeding.',
            image: 'https://nahidmahmud.com/test-website/test01/wp-content/uploads/2025/09/Removing-soft-tissue.png'
          }
        ];
      }

      // Generic procedures for other services
      return [
        {
          title: `Initial ${serviceName} Consultation`,
          description: `Comprehensive examination and assessment to determine the best ${serviceName} treatment plan for your needs.`,
          image: getDefaultProcedureImage('consultation', serviceName)
        },
        {
          title: `${serviceName} Treatment`,
          description: `Professional ${serviceName} procedure performed using advanced dental technology and techniques.`,
          image: getDefaultProcedureImage('treatment', serviceName)
        },
        {
          title: 'Follow-up Care',
          description: `Post-treatment monitoring and care instructions to ensure optimal healing and long-lasting results.`,
          image: getDefaultProcedureImage('followup', serviceName)
        }
      ];
    };

    const getDefaultProcedureImage = (procedureType, serviceName) => {
      const defaultImages = {
        consultation: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200',
        treatment: 'https://images.unsplash.com/photo-1606811971618-4486d14f3f99?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200',
        followup: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200'
      };

      return defaultImages[procedureType] || defaultImages.treatment;
    };

    const procedures = getServiceProcedures(serviceName, serviceData);
    const proceduresTitle = content.procedure?.title || `Common ${serviceName} Procedures`;

    components.push({
      id: proceduresId,
      type: 'ServiceProcedures',
      name: `${serviceName} Procedures`,
      category: 'procedures',
      description: `Common ${serviceName} procedures and treatments`,
      tags: ['procedures', 'treatments'],
      instanceId: `${proceduresId}-${Date.now()}`,
      component: `
        <section class="service-procedures" style="background: white; padding: 60px 20px;">
          <div style="max-width: 1200px; margin: 0 auto;">
            <h2 data-text="true" style="font-size: 28px; font-weight: bold; text-align: center; margin-bottom: 40px; color: #000;">
              ${proceduresTitle}
            </h2>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 40px;">
              ${procedures.map(procedure => `
                <div style="text-align: center;">
                  <img src="${procedure.image}"
                       alt="${procedure.title}" style="width: 200px; height: 150px; object-fit: cover; border-radius: 8px; margin-bottom: 20px;">
                  <h3 data-text="true" style="font-size: 20px; font-weight: bold; margin-bottom: 15px; color: #000;">
                    ${procedure.title}
                  </h3>
                  <p data-text="true" style="font-size: 15px; line-height: 1.6; color: #000; margin: 0;">
                    ${procedure.description}
                  </p>
                </div>
              `).join('')}
            </div>
          </div>
        </section>
      `,
      props: {
        procedures,
        proceduresTitle,
        serviceName
      },
      config: {
        procedures,
        proceduresTitle
      }
    });

    // 7. FAQ Section - Expanded questions as in reference
    const faqId = `service-faq-${componentId++}`;
    components.push({
      id: faqId,
      type: 'ServiceFAQ',
      name: 'Frequently Asked Questions',
      category: 'faq',
      description: 'Comprehensive FAQ section with 15 questions',
      tags: ['faq', 'questions'],
      instanceId: `${faqId}-${Date.now()}`,
      component: `
        <section class="service-faq" style="background: white; padding: 60px 20px;">
          <div style="max-width: 1000px; margin: 0 auto;">
            <h2 data-text="true" style="font-size: 28px; font-weight: bold; text-align: center; margin-bottom: 40px; color: #000;">
              Frequently Asked Questions
            </h2>
            <div style="space-y: 1rem;">
              <div class="faq-item" style="background: #f8f9fa; border-radius: 8px; overflow: hidden; margin-bottom: 10px;">
                <button class="faq-question" onclick="toggleFAQ(0)" style="width: 100%; text-align: left; padding: 15px; font-weight: 600; background: none; border: none; cursor: pointer; font-size: 15px; color: #000; display: flex; justify-content: space-between; align-items: center;">
                  <span data-text="true">What is laser dentistry?</span>
                  <span style="font-size: 18px; transition: transform 0.3s;">+</span>
                </button>
                <div class="faq-answer" id="faq-0" style="display: none; padding: 0 15px 15px; color: #000; line-height: 1.6; font-size: 15px;">
                  <span data-text="true">Laser dentistry is the use of lasers to treat a number of different dental conditions. It became commercially used in clinical dental practice for procedures involving tooth tissue in 1989.</span>
                </div>
              </div>
              <div class="faq-item" style="background: #f8f9fa; border-radius: 8px; overflow: hidden; margin-bottom: 10px;">
                <button class="faq-question" onclick="toggleFAQ(1)" style="width: 100%; text-align: left; padding: 15px; font-weight: 600; background: none; border: none; cursor: pointer; font-size: 15px; color: #000; display: flex; justify-content: space-between; align-items: center;">
                  <span data-text="true">Is laser dentistry safe?</span>
                  <span style="font-size: 18px; transition: transform 0.3s;">+</span>
                </button>
                <div class="faq-answer" id="faq-1" style="display: none; padding: 0 15px 15px; color: #000; line-height: 1.6; font-size: 15px;">
                  <span data-text="true">Yes, laser dentistry is considered safe when performed by a trained dental professional. The FDA has approved laser use for various dental procedures.</span>
                </div>
              </div>
              <div class="faq-item" style="background: #f8f9fa; border-radius: 8px; overflow: hidden; margin-bottom: 10px;">
                <button class="faq-question" onclick="toggleFAQ(2)" style="width: 100%; text-align: left; padding: 15px; font-weight: 600; background: none; border: none; cursor: pointer; font-size: 15px; color: #000; display: flex; justify-content: space-between; align-items: center;">
                  <span data-text="true">Does laser dentistry hurt?</span>
                  <span style="font-size: 18px; transition: transform 0.3s;">+</span>
                </button>
                <div class="faq-answer" id="faq-2" style="display: none; padding: 0 15px 15px; color: #000; line-height: 1.6; font-size: 15px;">
                  <span data-text="true">Most laser dentistry procedures cause little to no pain and may require minimal or no anesthesia.</span>
                </div>
              </div>
            </div>
            <script>
              function toggleFAQ(index) {
                const answer = document.getElementById('faq-' + index);
                const button = answer.previousElementSibling.querySelector('span:last-child');
                if (answer.style.display === 'none' || answer.style.display === '') {
                  answer.style.display = 'block';
                  button.textContent = '-';
                } else {
                  answer.style.display = 'none';
                  button.textContent = '+';
                }
              }
            </script>
          </div>
        </section>
      `,
      props: {},
      config: {}
    });

    return components;
  };

  const loadWebsite = useCallback(async () => {
    try {
      setIsLoading(true);

      // Load service page if in service mode
      if (isServicePageMode && servicePageId) {
        const servicePageResponse = await servicePageService.getServicePageForEditing(servicePageId);
        if (servicePageResponse.success && servicePageResponse.data && servicePageResponse.data.servicePage) {
          setServicePage(servicePageResponse.data.servicePage);
          setWebsite(servicePageResponse.data.servicePage.websiteId);

          // Load service page components
          const currentVersionData = servicePageResponse.data.currentVersionData;
          if (currentVersionData && currentVersionData.components) {
            setCanvasComponents(currentVersionData.components);
          } else {
            // Generate components from service page content with service data
            console.log('🔧 Generating service page components from content:', servicePageResponse.data.servicePage.content);
            console.log('🔧 Service data:', servicePageResponse.data.serviceInfo);
            const serviceComponents = generateServicePageComponents(
              servicePageResponse.data.servicePage.content,
              servicePageResponse.data.serviceInfo
            );
            console.log('✅ Generated service page components:', serviceComponents);
            console.log(`📊 Component count: ${serviceComponents.length}`);
            setCanvasComponents(serviceComponents);
            // Update the next ID counter to avoid conflicts
            setNextId(prev => prev + serviceComponents.length);

            if (serviceComponents.length > 0) {
              console.log('🎨 First component preview:', serviceComponents[0]);
              showSnackbar(`Loaded ${serviceComponents.length} service page sections`, 'success');
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
        console.log('🔧 Service page mode: Skipping full component library load');
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

      console.log('Total dental components:', dentalComponents.length);
      console.log('First 3 components:', dentalComponents.slice(0, 3).map(c => ({ id: c.id, name: c.name, category: c.category })));

      setComponents(dentalComponents);
      setFilteredComponents(dentalComponents);

      console.log('Components set successfully');
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
  }, [websiteId, servicePageId, mode, navigate, loadWebsite, loadComponents]);

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
          console.log('🚀 Auto-mapping services to headers on website builder load...');

          // Check if we have services in database
          const serviceCount = await getWebsiteServiceCount();
          const headerComponents = canvasComponents.filter(isHeaderComponent);

          console.log(`Auto-mapping status: ${serviceCount} services, ${headerComponents.length} headers`);

          if (serviceCount > 0) {
            if (headerComponents.length === 0) {
              // No headers exist, create a modern default header with services
              console.log('Creating new modern header with services...');
              await createModernDefaultHeaderWithServices();
            } else {
              // Headers exist, update them with current services
              console.log('Updating existing headers with services...');
              await syncHeadersWithDatabase();
            }
          } else {
            console.log('⚠️ No services found in database for auto-mapping');
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
      console.log('Initial load completed, ready for auto-mapping');
    }
  }, [isLoading, websiteId]);

  const showSnackbar = useCallback((message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  }, []);

  // Setup service creation event listener (simplified)
  useEffect(() => {
    // Simple event handler that doesn't depend on complex functions
    const handleServiceCreated = (event) => {
      console.log('🎉 Service created event received in builder:', event.detail);

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
      console.log('🚀 Using cached services data');
      return servicesCache.current;
    }

    try {
      console.log('Fetching services for website:', websiteId);

      // First try to get service pages for this website (integrated services)
      const servicePages = await serviceService.getServicePages(websiteId, {
        isIntegrated: true,
        status: 'all' // Get both draft and published
      });

      console.log('Found service pages:', servicePages);

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
        // Try to get website-specific services instead of all services
        console.log('No service pages found, checking website-specific services');
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
            console.log('Found website-specific services:', websiteServices.length);
          } else {
            // Only use empty array if truly no services exist for this website
            console.log('No services associated with this website');
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

      console.log('Final processed website services (cached):', websiteServices);
      return websiteServices;

    } catch (error) {
      console.error('Error fetching website services:', error);
      // Return empty array instead of all services to prevent wrong service count
      console.log('Service fetch failed, returning empty array for website-specific context');
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
    console.log('🗑️ Clearing services cache');
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
      console.log('Creating modern default header with database services...');

      const currentWebsiteServices = await fetchWebsiteServices();
      const serviceCount = currentWebsiteServices.length;

      if (serviceCount === 0) {
        console.log('No services to add to header');
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
      console.log('Modern header created:', modernHeader);

    } catch (error) {
      console.error('Error creating modern default header:', error);
      showSnackbar('Failed to create modern header', 'error');
    }
  };

  // Create 5 Modern Headers with service mapping
  const createModernHeadersWithServiceMapping = async (headerType = 'minimalist') => {
    try {
      console.log(`Creating modern ${headerType} header with service mapping...`);

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

      console.log(`Removing ${headerComponents.length} existing header(s) and adding ${selectedHeader.name}...`);

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

      console.log('Modern header created:', {
        type: headerType,
        servicesCount: serviceCount,
        removedHeaders: headerComponents.length,
        newHeader: newModernHeader.name
      });

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
    console.log('Auto-updating headers with new services:', newServices);

    // Clear service cache to ensure fresh data
    clearServiceCache();

    // Fetch current website services from database for validation
    const currentWebsiteServices = await fetchWebsiteServices();
    const serviceCount = currentWebsiteServices.length;

    console.log(`Website ${websiteId} has ${serviceCount} services in database`);
    console.log('Current website services:', currentWebsiteServices.map(s => ({ id: s._id, name: s.name })));

    // Find all header components on the canvas using improved detection
    const headerComponents = canvasComponents.filter(isHeaderComponent);

    console.log('Found header components:', headerComponents.map(h => ({ id: h.id, name: h.name, category: h.category })));

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
        // Save service page content
        await servicePageService.updateServicePageComponents(servicePageId, {
          components: canvasComponents,
          globalSettings,
          changeLog: 'Manual save from drag-drop editor'
        });

        // Sync with unified content system if enabled
        if (unifiedContentEnabled) {
          try {
            await UnifiedContentService.updateComponents(servicePageId, canvasComponents, {
              globalSettings,
              timestamp: new Date().toISOString(),
              source: 'destack_editor_save'
            });
            console.log('Unified content synced during save');
          } catch (error) {
            console.warn('Unified content sync failed during save:', error);
            // Don't fail the save operation if unified content sync fails
          }
        }

        showSnackbar('Service page saved successfully!');
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

  const handlePublish = async () => {
    try {
      await handleManualSave();

      if (isServicePageMode && servicePageId) {
        await servicePageService.publishServicePage(servicePageId);
        showSnackbar('Service page published successfully!');
      } else {
        await websiteService.publishWebsite(websiteId);
        showSnackbar('Website published successfully!');
      }
    } catch (error) {
      const errorType = isServicePageMode ? 'service page' : 'website';
      showSnackbar(`Error publishing ${errorType}: ` + error.message, 'error');
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
      console.log('Loading template:', template);

      // Clear existing canvas
      setCanvasComponents([]);
      setSelectedComponent(null);

      // Load template components from layout (for dental templates) or fallback to components/sections
      const sourceComponents = template.layout || template.components || template.sections || [];
      console.log('Source components:', sourceComponents);

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

      console.log('Template components loaded:', templateComponents);

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
                onClick={handlePreview}
                startIcon={<PreviewIcon />}
                variant="outlined"
                color="inherit"
                sx={{ borderColor: 'white', color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
              >
                {isPreviewMode ? 'Edit' : 'Preview'}
              </Button>

              <Button
                onClick={handlePublish}
                startIcon={<PublishIcon />}
                variant="contained"
                sx={{ bgcolor: 'warning.main', '&:hover': { bgcolor: 'warning.dark' } }}
              >
                Publish
              </Button>

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
          {/* Left Sidebar - Component Filter & Library */}
          {!isPreviewMode && (
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
                          border: isPreviewMode ? 'none' : selectedComponent?.instanceId === component.instanceId ? '2px solid' : '1px solid transparent',
                          borderColor: selectedComponent?.instanceId === component.instanceId ? 'primary.main' : 'transparent',
                          borderRadius: 1,
                          '&:hover': !isPreviewMode ? {
                            borderColor: 'primary.main',
                            '& .component-controls': { opacity: 1 }
                          } : {}
                        }}
                        onClick={!isPreviewMode ? () => handleCanvasComponentSelect(component) : undefined}
                      >
                        {/* Component Controls */}
                        {!isPreviewMode && (
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

          {/* Right Sidebar - Properties */}
          {!isPreviewMode && (
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
              console.log('Batch services generated:', result);
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

        {/* Unified Content Sidebar - Service Page Mode Only */}
        {isServicePageMode && servicePageId && (
          <DestackUnifiedContentSidebar
            servicePageId={servicePageId}
            websiteId={websiteId}
            isVisible={unifiedContentSidebarVisible}
            onToggle={() => setUnifiedContentSidebarVisible(!unifiedContentSidebarVisible)}
            onSyncTriggered={(syncType) => {
              console.log('Unified content sync triggered:', syncType);
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