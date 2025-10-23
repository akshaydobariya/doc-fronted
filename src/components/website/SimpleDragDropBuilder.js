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
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import websiteService from '../../services/websiteService';
import PageBuilderErrorBoundary from './PageBuilderErrorBoundary';
import dentalWebsiteSections from '../../data/DENTAL_WEBSITE_SECTIONS';

/**
 * Simple Drag Drop Builder - Clean implementation without Destack complications
 */
const SimpleDragDropBuilder = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const websiteId = searchParams.get('websiteId');

  // Website state
  const [website, setWebsite] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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

  // Debug effect to catch rendering errors
  useEffect(() => {
    console.log('SimpleDragDropBuilder rendered with states:', {
      components: components?.length || 0,
      filteredComponents: filteredComponents?.length || 0,
      canvasComponents: canvasComponents?.length || 0,
      dentalWebsiteTemplates: dentalWebsiteTemplates?.length || 0
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

  const loadWebsite = useCallback(async () => {
    try {
      setIsLoading(true);
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

      showSnackbar('Website loaded successfully');
    } catch (error) {
      console.error('Load website error:', error);
      showSnackbar('Error loading website: ' + error.message, 'error');
      navigate('/websites');
    } finally {
      setIsLoading(false);
    }
  }, [websiteId]);

  const loadComponents = useCallback(async () => {
    try {
      console.log('Loading components...');
      console.log('dentalWebsiteSections loaded:', dentalWebsiteSections?.length, 'sections');

      // Skip API call for now and use local dental components directly
      // const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      // const response = await fetch(`${apiUrl}/builder/components/full`);

      // if (response.ok) {
      //   const componentsData = await response.json();
      //   if (componentsData.components) {
      //     console.log('API components loaded:', componentsData.components.length);
      //     setComponents(componentsData.components);
      //     setFilteredComponents(componentsData.components);
      //     return;
      //   }
      // }

      console.log('Using dental components...');

      // Comprehensive dental-specific components including extracted HTML sections
      const dentalComponents = [
        // Add the extracted HTML sections from Untitled-1.html
        ...dentalWebsiteSections,
        // Hero Sections
        {
          id: 'dental-hero-main',
          name: 'Main Dental Hero',
          category: 'hero',
          description: 'Professional dental practice hero with appointment booking',
          tags: ['dental', 'hero', 'professional', 'appointment'],
          component: '<section class="relative bg-gradient-to-br from-blue-50 to-white py-20 lg:py-32"><div class="absolute inset-0 bg-white/50"></div><div class="relative container mx-auto px-4"><div class="grid lg:grid-cols-2 gap-12 items-center"><div class="text-center lg:text-left"><div class="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-6">🦷 Trusted Dental Care Since 2010</div><h1 class="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">Your Smile is Our <span class="text-blue-600">Priority</span></h1><p class="text-xl text-gray-600 mb-8 leading-relaxed">Experience exceptional dental care with our state-of-the-art technology and compassionate team. We make every visit comfortable and stress-free.</p><div class="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"><button class="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg">Book Appointment</button><button class="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-600 hover:text-white transition-all">Emergency Care</button></div></div><div class="text-center"><img src="https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=600&h=500&fit=crop" alt="Modern Dental Office" class="rounded-2xl shadow-2xl mx-auto max-w-full h-auto"></div></div></div></section>'
        },
        {
          id: 'dental-hero-welcome',
          name: 'Welcome Hero Section',
          category: 'hero',
          description: 'Warm welcome message for dental patients',
          tags: ['dental', 'welcome', 'patient-friendly', 'modern'],
          component: '<section class="bg-white py-20"><div class="container mx-auto px-4 text-center"><div class="max-w-4xl mx-auto"><h1 class="text-5xl lg:text-7xl font-bold text-gray-900 mb-8">Welcome to <span class="text-blue-600">Bright Smiles</span> Dental</h1><p class="text-2xl text-gray-600 mb-12 leading-relaxed">Where advanced dentistry meets personalized care. Creating beautiful, healthy smiles for the whole family.</p><div class="grid md:grid-cols-3 gap-8 mb-12"><div class="bg-blue-50 p-6 rounded-xl"><div class="text-4xl mb-4">🏆</div><h3 class="text-xl font-bold text-gray-900 mb-2">Award Winning</h3><p class="text-gray-600">Recognized for excellence in dental care</p></div><div class="bg-green-50 p-6 rounded-xl"><div class="text-4xl mb-4">🛡️</div><h3 class="text-xl font-bold text-gray-900 mb-2">Pain-Free</h3><p class="text-gray-600">Advanced techniques for comfortable treatment</p></div><div class="bg-purple-50 p-6 rounded-xl"><div class="text-4xl mb-4">⚡</div><h3 class="text-xl font-bold text-gray-900 mb-2">Same Day</h3><p class="text-gray-600">Emergency appointments available</p></div></div><button class="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-12 py-4 rounded-full font-bold text-lg hover:shadow-lg transition-all transform hover:scale-105">Schedule Your Visit</button></div></div></section>'
        },

        // Services Sections
        {
          id: 'dental-services-comprehensive',
          name: 'Comprehensive Services',
          category: 'services',
          description: 'Complete dental services grid with icons',
          tags: ['dental', 'services', 'comprehensive', 'icons'],
          component: '<section class="py-20 bg-gray-50"><div class="container mx-auto px-4"><div class="text-center mb-16"><h2 class="text-4xl font-bold text-gray-900 mb-4">Complete Dental Care</h2><p class="text-xl text-gray-600 max-w-3xl mx-auto">From routine cleanings to advanced procedures, we offer comprehensive dental services for patients of all ages.</p></div><div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8"><div class="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all group"><div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-all"><span class="text-3xl group-hover:text-white transition-all">🦷</span></div><h3 class="text-2xl font-bold text-gray-900 mb-4">General Dentistry</h3><p class="text-gray-600 mb-6">Cleanings, fillings, crowns, and preventive care to maintain optimal oral health.</p><ul class="text-sm text-gray-500 space-y-2"><li>• Regular Cleanings</li><li>• Dental Fillings</li><li>• Root Canal Therapy</li><li>• Crowns & Bridges</li></ul></div><div class="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all group"><div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-green-600 transition-all"><span class="text-3xl group-hover:text-white transition-all">✨</span></div><h3 class="text-2xl font-bold text-gray-900 mb-4">Cosmetic Dentistry</h3><p class="text-gray-600 mb-6">Transform your smile with our advanced cosmetic dental procedures.</p><ul class="text-sm text-gray-500 space-y-2"><li>• Teeth Whitening</li><li>• Porcelain Veneers</li><li>• Smile Makeovers</li><li>• Bonding & Contouring</li></ul></div><div class="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all group"><div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-purple-600 transition-all"><span class="text-3xl group-hover:text-white transition-all">🔧</span></div><h3 class="text-2xl font-bold text-gray-900 mb-4">Restorative</h3><p class="text-gray-600 mb-6">Restore function and appearance with our restorative treatments.</p><ul class="text-sm text-gray-500 space-y-2"><li>• Dental Implants</li><li>• Dentures</li><li>• Bridges</li><li>• Full Mouth Restoration</li></ul></div><div class="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all group"><div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-red-600 transition-all"><span class="text-3xl group-hover:text-white transition-all">🚨</span></div><h3 class="text-2xl font-bold text-gray-900 mb-4">Emergency Care</h3><p class="text-gray-600 mb-6">24/7 emergency dental care when you need it most.</p><ul class="text-sm text-gray-500 space-y-2"><li>• Severe Tooth Pain</li><li>• Broken Teeth</li><li>• Dental Trauma</li><li>• Same-Day Appointments</li></ul></div><div class="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all group"><div class="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-indigo-600 transition-all"><span class="text-3xl group-hover:text-white transition-all">👨‍👩‍👧‍👦</span></div><h3 class="text-2xl font-bold text-gray-900 mb-4">Family Dentistry</h3><p class="text-gray-600 mb-6">Comprehensive dental care for patients of all ages.</p><ul class="text-sm text-gray-500 space-y-2"><li>• Pediatric Dentistry</li><li>• Adult Care</li><li>• Senior Dentistry</li><li>• Family Packages</li></ul></div><div class="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all group"><div class="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-yellow-600 transition-all"><span class="text-3xl group-hover:text-white transition-all">📐</span></div><h3 class="text-2xl font-bold text-gray-900 mb-4">Orthodontics</h3><p class="text-gray-600 mb-6">Straighten your teeth with modern orthodontic solutions.</p><ul class="text-sm text-gray-500 space-y-2"><li>• Traditional Braces</li><li>• Clear Aligners</li><li>• Invisalign</li><li>• Retainers</li></ul></div></div></div></section>'
        },

        // About Practice
        {
          id: 'dental-about-practice',
          name: 'About Our Practice',
          category: 'about',
          description: 'Professional practice introduction with image',
          tags: ['dental', 'about', 'professional', 'practice'],
          component: '<section class="py-20 bg-white"><div class="container mx-auto px-4"><div class="grid lg:grid-cols-2 gap-16 items-center"><div><img src="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&h=400&fit=crop" alt="Modern Dental Office Interior" class="rounded-2xl shadow-2xl w-full h-auto"></div><div><div class="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-6">About Our Practice</div><h2 class="text-4xl font-bold text-gray-900 mb-6">Excellence in Dental Care Since 2010</h2><p class="text-lg text-gray-600 mb-8 leading-relaxed">Our state-of-the-art dental practice combines cutting-edge technology with compassionate care to deliver exceptional results. We believe every patient deserves personalized attention and the highest quality treatment.</p><div class="grid grid-cols-2 gap-8 mb-8"><div class="text-center"><div class="text-3xl font-bold text-blue-600 mb-2">15+</div><div class="text-gray-600">Years Experience</div></div><div class="text-center"><div class="text-3xl font-bold text-blue-600 mb-2">5000+</div><div class="text-gray-600">Happy Patients</div></div><div class="text-center"><div class="text-3xl font-bold text-blue-600 mb-2">98%</div><div class="text-gray-600">Satisfaction Rate</div></div><div class="text-center"><div class="text-3xl font-bold text-blue-600 mb-2">24/7</div><div class="text-gray-600">Emergency Care</div></div></div><button class="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all">Learn More About Us</button></div></div></div></section>'
        },

        // Doctor & Team
        {
          id: 'dental-team-profiles',
          name: 'Doctor & Team Profiles',
          category: 'team',
          description: 'Professional team member showcase',
          tags: ['dental', 'team', 'doctor', 'professional'],
          component: '<section class="py-20 bg-gray-50"><div class="container mx-auto px-4"><div class="text-center mb-16"><h2 class="text-4xl font-bold text-gray-900 mb-4">Meet Our Expert Team</h2><p class="text-xl text-gray-600 max-w-3xl mx-auto">Our experienced dental professionals are committed to providing you with the highest quality care in a comfortable, friendly environment.</p></div><div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8"><div class="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all group"><div class="relative"><img src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop" alt="Dr. Sarah Johnson" class="w-full h-80 object-cover group-hover:scale-105 transition-all duration-300"><div class="absolute bottom-4 left-4 right-4"><div class="bg-white/90 backdrop-blur-sm rounded-lg p-4"><h3 class="text-xl font-bold text-gray-900">Dr. Sarah Johnson</h3><p class="text-blue-600 font-medium">Lead Dentist & Practice Owner</p></div></div></div><div class="p-6"><p class="text-gray-600 mb-4">Dr. Johnson brings over 15 years of experience in comprehensive dental care, specializing in cosmetic and restorative dentistry.</p><div class="mb-4"><h4 class="font-semibold text-gray-900 mb-2">Specializations:</h4><div class="flex flex-wrap gap-2"><span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">Cosmetic Dentistry</span><span class="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">Implants</span><span class="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">Orthodontics</span></div></div><button class="text-blue-600 font-semibold hover:text-blue-700 transition-all">View Full Bio →</button></div></div><div class="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all group"><div class="relative"><img src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop" alt="Dr. Michael Chen" class="w-full h-80 object-cover group-hover:scale-105 transition-all duration-300"><div class="absolute bottom-4 left-4 right-4"><div class="bg-white/90 backdrop-blur-sm rounded-lg p-4"><h3 class="text-xl font-bold text-gray-900">Dr. Michael Chen</h3><p class="text-blue-600 font-medium">Oral Surgeon</p></div></div></div><div class="p-6"><p class="text-gray-600 mb-4">Dr. Chen specializes in oral surgery and dental implants, providing advanced surgical solutions with precision and care.</p><div class="mb-4"><h4 class="font-semibold text-gray-900 mb-2">Specializations:</h4><div class="flex flex-wrap gap-2"><span class="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">Oral Surgery</span><span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">Dental Implants</span><span class="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">Extractions</span></div></div><button class="text-blue-600 font-semibold hover:text-blue-700 transition-all">View Full Bio →</button></div></div><div class="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all group"><div class="relative"><img src="https://images.unsplash.com/photo-1594824388191-fac898c1ce7e?w=400&h=400&fit=crop" alt="Lisa Rodriguez" class="w-full h-80 object-cover group-hover:scale-105 transition-all duration-300"><div class="absolute bottom-4 left-4 right-4"><div class="bg-white/90 backdrop-blur-sm rounded-lg p-4"><h3 class="text-xl font-bold text-gray-900">Lisa Rodriguez</h3><p class="text-blue-600 font-medium">Dental Hygienist</p></div></div></div><div class="p-6"><p class="text-gray-600 mb-4">Lisa is dedicated to helping patients maintain optimal oral health through professional cleanings and preventive education.</p><div class="mb-4"><h4 class="font-semibold text-gray-900 mb-2">Specializations:</h4><div class="flex flex-wrap gap-2"><span class="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">Preventive Care</span><span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">Cleanings</span><span class="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">Education</span></div></div><button class="text-blue-600 font-semibold hover:text-blue-700 transition-all">View Full Bio →</button></div></div></div></div></section>'
        },

        // Testimonials
        {
          id: 'dental-testimonials-modern',
          name: 'Patient Testimonials',
          category: 'testimonials',
          description: 'Modern testimonial section with patient reviews',
          tags: ['dental', 'testimonials', 'reviews', 'trust'],
          component: '<section class="py-20 bg-blue-600"><div class="container mx-auto px-4"><div class="text-center text-white mb-16"><h2 class="text-4xl font-bold mb-4">What Our Patients Say</h2><p class="text-xl text-blue-100 max-w-3xl mx-auto">Don\'t just take our word for it. Hear from real patients about their experiences at our practice.</p></div><div class="grid md:grid-cols-3 gap-8"><div class="bg-white rounded-xl p-8 shadow-xl"><div class="flex items-center mb-6"><img src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=80&h=80&fit=crop" alt="Patient" class="w-16 h-16 rounded-full object-cover mr-4"><div><h4 class="font-bold text-gray-900">Emma Thompson</h4><div class="text-yellow-400 text-lg">★★★★★</div></div></div><p class="text-gray-600 italic mb-4">"Dr. Johnson and her team made my dental implant procedure so comfortable. I was nervous at first, but their caring approach put me at ease. My new smile looks amazing!"</p><p class="text-sm text-gray-500">Dental Implant Patient</p></div><div class="bg-white rounded-xl p-8 shadow-xl"><div class="flex items-center mb-6"><img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop" alt="Patient" class="w-16 h-16 rounded-full object-cover mr-4"><div><h4 class="font-bold text-gray-900">James Wilson</h4><div class="text-yellow-400 text-lg">★★★★★</div></div></div><p class="text-gray-600 italic mb-4">"Best dental experience I\'ve ever had! The office is modern, the staff is friendly, and Dr. Chen\'s expertise in oral surgery is exceptional. Highly recommend!"</p><p class="text-sm text-gray-500">Oral Surgery Patient</p></div><div class="bg-white rounded-xl p-8 shadow-xl"><div class="flex items-center mb-6"><img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop" alt="Patient" class="w-16 h-16 rounded-full object-cover mr-4"><div><h4 class="font-bold text-gray-900">Maria Garcia</h4><div class="text-yellow-400 text-lg">★★★★★</div></div></div><p class="text-gray-600 italic mb-4">"My family has been coming here for years. They treat my kids so well and make dental visits fun! Professional, caring, and always on time."</p><p class="text-sm text-gray-500">Family Patient</p></div></div><div class="text-center mt-12"><button class="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all">Read More Reviews</button></div></div></section>'
        },

        // Gallery
        {
          id: 'dental-gallery-modern',
          name: 'Practice Gallery',
          category: 'gallery',
          description: 'Modern image gallery showcasing the practice',
          tags: ['dental', 'gallery', 'images', 'practice'],
          component: '<section class="py-20 bg-white"><div class="container mx-auto px-4"><div class="text-center mb-16"><h2 class="text-4xl font-bold text-gray-900 mb-4">Our Beautiful Practice</h2><p class="text-xl text-gray-600 max-w-3xl mx-auto">Take a virtual tour of our state-of-the-art dental facility designed for your comfort and care.</p></div><div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"><div class="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all"><img src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=500&h=400&fit=crop" alt="Reception Area" class="w-full h-80 object-cover group-hover:scale-110 transition-all duration-500"><div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div><div class="absolute bottom-6 left-6 text-white"><h3 class="text-xl font-bold mb-2">Welcoming Reception</h3><p class="text-sm opacity-90">Comfortable waiting area with modern amenities</p></div></div><div class="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all"><img src="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=500&h=400&fit=crop" alt="Treatment Room" class="w-full h-80 object-cover group-hover:scale-110 transition-all duration-500"><div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div><div class="absolute bottom-6 left-6 text-white"><h3 class="text-xl font-bold mb-2">Treatment Rooms</h3><p class="text-sm opacity-90">State-of-the-art equipment for optimal care</p></div></div><div class="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all"><img src="https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=500&h=400&fit=crop" alt="Technology" class="w-full h-80 object-cover group-hover:scale-110 transition-all duration-500"><div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div><div class="absolute bottom-6 left-6 text-white"><h3 class="text-xl font-bold mb-2">Advanced Technology</h3><p class="text-sm opacity-90">Digital X-rays and modern diagnostic tools</p></div></div><div class="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all"><img src="https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=500&h=400&fit=crop" alt="Sterilization" class="w-full h-80 object-cover group-hover:scale-110 transition-all duration-500"><div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div><div class="absolute bottom-6 left-6 text-white"><h3 class="text-xl font-bold mb-2">Sterilization Center</h3><p class="text-sm opacity-90">Highest standards of hygiene and safety</p></div></div><div class="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all"><img src="https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?w=500&h=400&fit=crop" alt="Consultation" class="w-full h-80 object-cover group-hover:scale-110 transition-all duration-500"><div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div><div class="absolute bottom-6 left-6 text-white"><h3 class="text-xl font-bold mb-2">Consultation Room</h3><p class="text-sm opacity-90">Private space for treatment planning</p></div></div><div class="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all"><img src="https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=500&h=400&fit=crop" alt="Kids Area" class="w-full h-80 object-cover group-hover:scale-110 transition-all duration-500"><div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div><div class="absolute bottom-6 left-6 text-white"><h3 class="text-xl font-bold mb-2">Kids Play Area</h3><p class="text-sm opacity-90">Fun and engaging space for young patients</p></div></div></div></div></section>'
        },

        // Appointment Forms
        {
          id: 'dental-appointment-form-comprehensive',
          name: 'Comprehensive Appointment Form',
          category: 'appointments',
          description: 'Detailed appointment booking form for dental patients',
          tags: ['dental', 'appointment', 'booking', 'form'],
          component: '<section class="py-20 bg-gradient-to-br from-blue-50 to-indigo-100"><div class="container mx-auto px-4 max-w-4xl"><div class="bg-white rounded-2xl shadow-2xl overflow-hidden"><div class="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-12 text-center text-white"><div class="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6"><span class="text-4xl">📅</span></div><h2 class="text-3xl font-bold mb-4">Schedule Your Appointment</h2><p class="text-xl text-blue-100">We\'re here to help you achieve your perfect smile</p></div><form class="p-8 space-y-8"><div class="grid md:grid-cols-2 gap-6"><div><label class="block text-sm font-semibold text-gray-700 mb-3">First Name *</label><input type="text" required class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-all" placeholder="Enter your first name"></div><div><label class="block text-sm font-semibold text-gray-700 mb-3">Last Name *</label><input type="text" required class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-all" placeholder="Enter your last name"></div></div><div class="grid md:grid-cols-2 gap-6"><div><label class="block text-sm font-semibold text-gray-700 mb-3">Email Address *</label><input type="email" required class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-all" placeholder="your@email.com"></div><div><label class="block text-sm font-semibold text-gray-700 mb-3">Phone Number *</label><input type="tel" required class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-all" placeholder="(555) 123-4567"></div></div><div><label class="block text-sm font-semibold text-gray-700 mb-3">Type of Service</label><select class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-all"><option>Select a service</option><option>General Cleaning & Checkup</option><option>Cosmetic Consultation</option><option>Dental Implant Consultation</option><option>Emergency Appointment</option><option>Orthodontic Consultation</option><option>Teeth Whitening</option><option>Root Canal Treatment</option><option>Other</option></select></div><div class="grid md:grid-cols-2 gap-6"><div><label class="block text-sm font-semibold text-gray-700 mb-3">Preferred Date</label><input type="date" class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-all"></div><div><label class="block text-sm font-semibold text-gray-700 mb-3">Preferred Time</label><select class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-all"><option>Select preferred time</option><option>8:00 AM - 9:00 AM</option><option>9:00 AM - 10:00 AM</option><option>10:00 AM - 11:00 AM</option><option>11:00 AM - 12:00 PM</option><option>1:00 PM - 2:00 PM</option><option>2:00 PM - 3:00 PM</option><option>3:00 PM - 4:00 PM</option><option>4:00 PM - 5:00 PM</option></select></div></div><div><label class="block text-sm font-semibold text-gray-700 mb-3">Insurance Provider</label><select class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-all"><option>Select your insurance</option><option>Delta Dental</option><option>Aetna</option><option>Cigna</option><option>MetLife</option><option>Blue Cross Blue Shield</option><option>Humana</option><option>No Insurance</option><option>Other</option></select></div><div><label class="block text-sm font-semibold text-gray-700 mb-3">Describe your concern or reason for visit</label><textarea rows="4" class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-all resize-none" placeholder="Please describe any pain, concerns, or specific treatments you\'re interested in..."></textarea></div><div class="flex items-center"><input type="checkbox" id="terms" class="w-5 h-5 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500"><label for="terms" class="ml-3 text-sm text-gray-600">I agree to the <a href="#" class="text-blue-600 hover:text-blue-700 font-medium">Terms of Service</a> and <a href="#" class="text-blue-600 hover:text-blue-700 font-medium">Privacy Policy</a></label></div><button type="submit" class="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-8 rounded-lg font-bold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-lg">Book My Appointment</button><p class="text-center text-sm text-gray-500 mt-4">We\'ll contact you within 24 hours to confirm your appointment</p></form></div></div></section>'
        },

        // Contact Information
        {
          id: 'dental-contact-info',
          name: 'Contact Information',
          category: 'contact',
          description: 'Complete practice contact details',
          tags: ['dental', 'contact', 'information', 'location'],
          component: '<section class="py-20 bg-gray-50"><div class="container mx-auto px-4"><div class="text-center mb-16"><h2 class="text-4xl font-bold text-gray-900 mb-4">Visit Our Practice</h2><p class="text-xl text-gray-600 max-w-3xl mx-auto">Conveniently located with ample parking and accessible facilities</p></div><div class="grid lg:grid-cols-2 gap-12"><div class="space-y-8"><div class="bg-white p-8 rounded-xl shadow-lg"><div class="flex items-start space-x-4"><div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0"><span class="text-blue-600 text-xl">📍</span></div><div><h3 class="text-xl font-bold text-gray-900 mb-2">Practice Location</h3><p class="text-gray-600 leading-relaxed">123 Dental Care Boulevard<br>Suite 200<br>Springfield, ST 12345</p><button class="text-blue-600 font-semibold hover:text-blue-700 transition-all mt-3">Get Directions →</button></div></div></div><div class="bg-white p-8 rounded-xl shadow-lg"><div class="flex items-start space-x-4"><div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0"><span class="text-green-600 text-xl">📞</span></div><div><h3 class="text-xl font-bold text-gray-900 mb-2">Phone & Emergency</h3><div class="space-y-2 text-gray-600"><p><strong>Main Office:</strong> (555) 123-4567</p><p><strong>Emergency:</strong> (555) 123-9999</p><p><strong>Text Us:</strong> (555) 123-4567</p></div><button class="text-green-600 font-semibold hover:text-green-700 transition-all mt-3">Call Now →</button></div></div></div><div class="bg-white p-8 rounded-xl shadow-lg"><div class="flex items-start space-x-4"><div class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0"><span class="text-purple-600 text-xl">🕒</span></div><div><h3 class="text-xl font-bold text-gray-900 mb-2">Office Hours</h3><div class="space-y-2 text-gray-600"><p><strong>Monday - Thursday:</strong> 8:00 AM - 6:00 PM</p><p><strong>Friday:</strong> 8:00 AM - 4:00 PM</p><p><strong>Saturday:</strong> 9:00 AM - 2:00 PM</p><p><strong>Sunday:</strong> Emergency Only</p></div></div></div></div></div><div class="bg-gray-300 rounded-xl h-96 flex items-center justify-center"><div class="text-center text-gray-600"><span class="text-4xl mb-4 block">🗺️</span><p class="text-lg font-medium">Interactive Map</p><p class="text-sm">Practice location and directions</p></div></div></div></div></section>'
        },

        // Navigation
        {
          id: 'dental-navbar-professional',
          name: 'Professional Dental Navbar',
          category: 'navigation',
          description: 'Clean navigation bar for dental practices',
          tags: ['dental', 'navigation', 'professional', 'header'],
          component: '<nav class="bg-white shadow-lg sticky top-0 z-50"><div class="container mx-auto px-4"><div class="flex justify-between items-center py-4"><div class="flex items-center space-x-3"><div class="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center"><span class="text-white text-2xl font-bold">🦷</span></div><div><h1 class="text-2xl font-bold text-gray-900">Bright Smiles Dental</h1><p class="text-sm text-gray-500">Excellence in Dental Care</p></div></div><div class="hidden lg:flex items-center space-x-8"><a href="#" class="text-gray-700 hover:text-blue-600 font-medium transition-all">Home</a><a href="#" class="text-gray-700 hover:text-blue-600 font-medium transition-all">About</a><div class="relative group"><button class="text-gray-700 hover:text-blue-600 font-medium transition-all flex items-center">Services <span class="ml-1">▼</span></button><div class="absolute top-full left-0 bg-white shadow-xl rounded-lg py-4 w-64 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all"><a href="#" class="block px-6 py-2 hover:bg-blue-50 text-gray-700 hover:text-blue-600">General Dentistry</a><a href="#" class="block px-6 py-2 hover:bg-blue-50 text-gray-700 hover:text-blue-600">Cosmetic Dentistry</a><a href="#" class="block px-6 py-2 hover:bg-blue-50 text-gray-700 hover:text-blue-600">Orthodontics</a><a href="#" class="block px-6 py-2 hover:bg-blue-50 text-gray-700 hover:text-blue-600">Emergency Care</a></div></div><a href="#" class="text-gray-700 hover:text-blue-600 font-medium transition-all">Team</a><a href="#" class="text-gray-700 hover:text-blue-600 font-medium transition-all">Contact</a></div><div class="flex items-center space-x-4"><button class="text-blue-600 font-semibold hover:text-blue-700 transition-all">Patient Portal</button><button class="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all transform hover:scale-105">Book Appointment</button></div></div></div></nav>'
        },

        // Patient Education
        {
          id: 'dental-education-tips',
          name: 'Dental Health Tips',
          category: 'education',
          description: 'Educational content for patients about dental health',
          tags: ['dental', 'education', 'tips', 'health'],
          component: '<section class="py-20 bg-white"><div class="container mx-auto px-4"><div class="text-center mb-16"><h2 class="text-4xl font-bold text-gray-900 mb-4">Dental Health Tips</h2><p class="text-xl text-gray-600 max-w-3xl mx-auto">Simple habits for maintaining excellent oral health at home</p></div><div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8"><div class="text-center group"><div class="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-600 transition-all"><span class="text-4xl group-hover:text-white transition-all">🪥</span></div><h3 class="text-xl font-bold text-gray-900 mb-4">Brush Properly</h3><p class="text-gray-600 leading-relaxed">Brush twice daily for 2 minutes using fluoride toothpaste and a soft-bristled brush.</p></div><div class="text-center group"><div class="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-green-600 transition-all"><span class="text-4xl group-hover:text-white transition-all">🧵</span></div><h3 class="text-xl font-bold text-gray-900 mb-4">Floss Daily</h3><p class="text-gray-600 leading-relaxed">Daily flossing removes plaque and food particles between teeth where brushes can\'t reach.</p></div><div class="text-center group"><div class="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-purple-600 transition-all"><span class="text-4xl group-hover:text-white transition-all">🚭</span></div><h3 class="text-xl font-bold text-gray-900 mb-4">Avoid Tobacco</h3><p class="text-gray-600 leading-relaxed">Tobacco use increases risk of gum disease, tooth loss, and oral cancer.</p></div><div class="text-center group"><div class="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-orange-600 transition-all"><span class="text-4xl group-hover:text-white transition-all">🍎</span></div><h3 class="text-xl font-bold text-gray-900 mb-4">Eat Healthy</h3><p class="text-gray-600 leading-relaxed">Limit sugary snacks and drinks. Choose tooth-friendly foods like fruits, vegetables, and dairy.</p></div></div><div class="bg-blue-50 rounded-2xl p-8 mt-16"><div class="grid lg:grid-cols-2 gap-12 items-center"><div><h3 class="text-3xl font-bold text-gray-900 mb-6">When to See Your Dentist</h3><div class="space-y-4"><div class="flex items-start space-x-3"><span class="text-red-500 text-xl">⚠️</span><div><h4 class="font-semibold text-gray-900">Persistent tooth pain</h4><p class="text-gray-600 text-sm">Don\'t ignore pain - it often indicates a problem that needs attention</p></div></div><div class="flex items-start space-x-3"><span class="text-red-500 text-xl">🩸</span><div><h4 class="font-semibold text-gray-900">Bleeding or swollen gums</h4><p class="text-gray-600 text-sm">These can be early signs of gum disease</p></div></div><div class="flex items-start space-x-3"><span class="text-blue-500 text-xl">📅</span><div><h4 class="font-semibold text-gray-900">Regular checkups</h4><p class="text-gray-600 text-sm">Visit every 6 months for cleanings and preventive care</p></div></div></div><button class="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all mt-6">Schedule Checkup</button></div><div class="text-center"><div class="w-48 h-48 bg-blue-200 rounded-full flex items-center justify-center mx-auto"><span class="text-6xl">😁</span></div><p class="text-lg text-gray-600 mt-4">Healthy habits lead to beautiful smiles!</p></div></div></div></div></section>'
        }
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
  }, []);

  // Load website and components on mount
  useEffect(() => {
    if (websiteId) {
      loadWebsite();
      loadComponents();
    } else {
      navigate('/websites');
    }
  }, [websiteId, navigate, loadWebsite, loadComponents]);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleManualSave = async () => {
    try {
      setSaving(true);

      // Prepare pages data
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
    } catch (error) {
      console.error('Save error:', error);
      showSnackbar('Error saving website: ' + error.message, 'error');
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
      await websiteService.publishWebsite(websiteId);
      showSnackbar('Website published successfully!');
    } catch (error) {
      showSnackbar('Error publishing website: ' + error.message, 'error');
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

  // Complete dental website templates
  const dentalWebsiteTemplates = [
    {
      id: 'modern-dental-clinic',
      name: 'Modern Dental Clinic',
      description: 'A clean, professional template perfect for general dental practices',
      category: 'General Dentistry',
      image: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=400&h=300&fit=crop',
      tags: ['modern', 'clean', 'professional', 'general'],
      components: [
        'dental-hero-main',
        'dental-services-comprehensive',
        'dental-about-practice',
        'dental-team-grid',
        'dental-testimonials-slider',
        'dental-appointment-form',
        'dental-contact-footer'
      ],
      layout: [
        {
          id: 'dental-hero-main',
          component: '<section class="relative bg-gradient-to-br from-blue-50 to-white py-20 lg:py-32"><div class="absolute inset-0 bg-white/50"></div><div class="relative container mx-auto px-4"><div class="grid lg:grid-cols-2 gap-12 items-center"><div class="text-center lg:text-left"><div class="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-6">🦷 Professional Dental Care Since 2010</div><h1 class="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">Your Smile is Our <span class="text-blue-600">Priority</span></h1><p class="text-xl text-gray-600 mb-8 leading-relaxed">Experience exceptional dental care with our state-of-the-art technology and compassionate team. We make every visit comfortable and stress-free.</p><div class="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"><button class="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg">Book Appointment</button><button class="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-600 hover:text-white transition-all">Emergency Care</button></div><div class="mt-8 flex items-center justify-center lg:justify-start gap-6"><div class="text-center"><div class="text-2xl font-bold text-blue-600">5000+</div><div class="text-sm text-gray-600">Happy Patients</div></div><div class="text-center"><div class="text-2xl font-bold text-blue-600">15+</div><div class="text-sm text-gray-600">Years Experience</div></div><div class="text-center"><div class="text-2xl font-bold text-blue-600">24/7</div><div class="text-sm text-gray-600">Emergency Care</div></div></div></div><div class="text-center"><img src="https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=600&h=500&fit=crop" alt="Modern Dental Office" class="rounded-2xl shadow-2xl mx-auto max-w-full h-auto"></div></div></div></section>'
        },
        {
          id: 'dental-services-comprehensive',
          component: '<section class="py-20 bg-gray-50"><div class="container mx-auto px-4"><div class="text-center mb-16"><h2 class="text-4xl font-bold text-gray-900 mb-4">Complete Dental Care Services</h2><p class="text-xl text-gray-600 max-w-3xl mx-auto">From routine cleanings to advanced procedures, we offer comprehensive dental services for patients of all ages.</p></div><div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8"><div class="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all group"><div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-all"><span class="text-3xl group-hover:text-white transition-all">🦷</span></div><h3 class="text-2xl font-bold text-gray-900 mb-4">General Dentistry</h3><p class="text-gray-600 mb-6">Cleanings, fillings, crowns, and preventive care to maintain optimal oral health.</p><ul class="text-sm text-gray-500 space-y-2"><li>• Regular Cleanings & Exams</li><li>• Dental Fillings</li><li>• Root Canal Therapy</li><li>• Crowns & Bridges</li></ul></div><div class="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all group"><div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-green-600 transition-all"><span class="text-3xl group-hover:text-white transition-all">✨</span></div><h3 class="text-2xl font-bold text-gray-900 mb-4">Cosmetic Dentistry</h3><p class="text-gray-600 mb-6">Transform your smile with our advanced cosmetic dental procedures.</p><ul class="text-sm text-gray-500 space-y-2"><li>• Professional Teeth Whitening</li><li>• Porcelain Veneers</li><li>• Smile Makeovers</li><li>• Bonding & Contouring</li></ul></div><div class="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all group"><div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-purple-600 transition-all"><span class="text-3xl group-hover:text-white transition-all">🔧</span></div><h3 class="text-2xl font-bold text-gray-900 mb-4">Restorative Dentistry</h3><p class="text-gray-600 mb-6">Restore function and appearance with our restorative treatments.</p><ul class="text-sm text-gray-500 space-y-2"><li>• Dental Implants</li><li>• Partial & Full Dentures</li><li>• Fixed Bridges</li><li>• Full Mouth Restoration</li></ul></div><div class="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all group"><div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-red-600 transition-all"><span class="text-3xl group-hover:text-white transition-all">🚨</span></div><h3 class="text-2xl font-bold text-gray-900 mb-4">Emergency Care</h3><p class="text-gray-600 mb-6">24/7 emergency dental care when you need it most.</p><ul class="text-sm text-gray-500 space-y-2"><li>• Severe Tooth Pain Relief</li><li>• Broken/Chipped Teeth</li><li>• Dental Trauma Care</li><li>• Same-Day Appointments</li></ul></div><div class="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all group"><div class="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-indigo-600 transition-all"><span class="text-3xl group-hover:text-white transition-all">👨‍👩‍👧‍👦</span></div><h3 class="text-2xl font-bold text-gray-900 mb-4">Family Dentistry</h3><p class="text-gray-600 mb-6">Comprehensive dental care for patients of all ages.</p><ul class="text-sm text-gray-500 space-y-2"><li>• Pediatric Dentistry</li><li>• Adult Preventive Care</li><li>• Senior Dental Services</li><li>• Family Treatment Plans</li></ul></div><div class="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all group"><div class="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-yellow-600 transition-all"><span class="text-3xl group-hover:text-white transition-all">📐</span></div><h3 class="text-2xl font-bold text-gray-900 mb-4">Orthodontics</h3><p class="text-gray-600 mb-6">Straighten your teeth with modern orthodontic solutions.</p><ul class="text-sm text-gray-500 space-y-2"><li>• Traditional Metal Braces</li><li>• Clear Ceramic Braces</li><li>• Invisalign Clear Aligners</li><li>• Retainers & Follow-up</li></ul></div></div></div></section>'
        },
        {
          id: 'dental-about-practice',
          component: '<section class="py-20 bg-white"><div class="container mx-auto px-4"><div class="grid lg:grid-cols-2 gap-16 items-center"><div><h2 class="text-4xl font-bold text-gray-900 mb-6">About Our Practice</h2><p class="text-xl text-gray-600 mb-8 leading-relaxed">For over 15 years, we have been dedicated to providing exceptional dental care in a comfortable, state-of-the-art environment. Our team combines the latest technology with a gentle, patient-centered approach.</p><div class="grid md:grid-cols-2 gap-6 mb-8"><div class="flex items-start gap-4"><div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0"><span class="text-blue-600 text-xl">🏆</span></div><div><h3 class="font-bold text-gray-900 mb-2">Award-Winning Care</h3><p class="text-gray-600 text-sm">Recognized for excellence in patient care and clinical outcomes.</p></div></div><div class="flex items-start gap-4"><div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0"><span class="text-green-600 text-xl">🛡️</span></div><div><h3 class="font-bold text-gray-900 mb-2">Advanced Technology</h3><p class="text-gray-600 text-sm">Latest equipment for precise, comfortable treatments.</p></div></div><div class="flex items-start gap-4"><div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0"><span class="text-purple-600 text-xl">❤️</span></div><div><h3 class="font-bold text-gray-900 mb-2">Patient Comfort</h3><p class="text-gray-600 text-sm">Anxiety-free environment with sedation options available.</p></div></div><div class="flex items-start gap-4"><div class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0"><span class="text-orange-600 text-xl">⚡</span></div><div><h3 class="font-bold text-gray-900 mb-2">Flexible Scheduling</h3><p class="text-gray-600 text-sm">Convenient appointment times including evenings and weekends.</p></div></div></div><button class="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all">Learn More About Us</button></div><div class="text-center"><img src="https://images.unsplash.com/photo-1551076805-e1869033e561?w=600&h=500&fit=crop" alt="Modern Dental Equipment" class="rounded-2xl shadow-xl mx-auto max-w-full h-auto"></div></div></div></section>'
        },
        {
          id: 'dental-team-grid',
          component: '<section class="py-20 bg-gray-50"><div class="container mx-auto px-4"><div class="text-center mb-16"><h2 class="text-4xl font-bold text-gray-900 mb-4">Meet Our Expert Team</h2><p class="text-xl text-gray-600 max-w-3xl mx-auto">Our experienced team of dental professionals is committed to providing you with the highest quality care in a comfortable environment.</p></div><div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8"><div class="bg-white rounded-xl shadow-lg overflow-hidden group hover:shadow-xl transition-all"><img src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=300&fit=crop" alt="Dr. Sarah Johnson" class="w-full h-64 object-cover group-hover:scale-105 transition-all duration-300"><div class="p-6"><h3 class="text-xl font-bold text-gray-900 mb-2">Dr. Sarah Johnson</h3><p class="text-blue-600 font-medium mb-3">Lead Dentist, DDS</p><p class="text-gray-600 text-sm mb-4">15+ years of experience in general and cosmetic dentistry. Specializes in smile makeovers and restorative procedures.</p><div class="flex gap-2"><span class="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">General Dentistry</span><span class="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full">Cosmetic</span></div></div></div><div class="bg-white rounded-xl shadow-lg overflow-hidden group hover:shadow-xl transition-all"><img src="https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=300&fit=crop" alt="Dr. Michael Chen" class="w-full h-64 object-cover group-hover:scale-105 transition-all duration-300"><div class="p-6"><h3 class="text-xl font-bold text-gray-900 mb-2">Dr. Michael Chen</h3><p class="text-blue-600 font-medium mb-3">Oral Surgeon, DDS, MS</p><p class="text-gray-600 text-sm mb-4">Board-certified oral surgeon specializing in dental implants, wisdom teeth removal, and complex extractions.</p><div class="flex gap-2"><span class="px-3 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">Oral Surgery</span><span class="px-3 py-1 bg-red-100 text-red-800 text-xs rounded-full">Implants</span></div></div></div><div class="bg-white rounded-xl shadow-lg overflow-hidden group hover:shadow-xl transition-all"><img src="https://images.unsplash.com/photo-1594824792090-0c319962da1a?w=400&h=300&fit=crop" alt="Dr. Emily Rodriguez" class="w-full h-64 object-cover group-hover:scale-105 transition-all duration-300"><div class="p-6"><h3 class="text-xl font-bold text-gray-900 mb-2">Dr. Emily Rodriguez</h3><p class="text-blue-600 font-medium mb-3">Pediatric Dentist, DDS</p><p class="text-gray-600 text-sm mb-4">Specialized in children\'s dentistry with a gentle approach that makes kids feel comfortable and safe.</p><div class="flex gap-2"><span class="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Pediatric</span><span class="px-3 py-1 bg-pink-100 text-pink-800 text-xs rounded-full">Prevention</span></div></div></div></div></div></section>'
        },
        {
          id: 'dental-appointment-form',
          component: '<section class="py-20 bg-blue-600"><div class="container mx-auto px-4"><div class="grid lg:grid-cols-2 gap-12 items-center"><div class="text-white"><h2 class="text-4xl font-bold mb-6">Schedule Your Appointment Today</h2><p class="text-xl text-blue-100 mb-8 leading-relaxed">Take the first step towards a healthier, more beautiful smile. Our friendly team is ready to provide you with exceptional dental care.</p><div class="space-y-4"><div class="flex items-center gap-4"><div class="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center"><span class="text-white text-xl">📅</span></div><div><h3 class="font-bold text-white">Flexible Scheduling</h3><p class="text-blue-100 text-sm">Evening and weekend appointments available</p></div></div><div class="flex items-center gap-4"><div class="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center"><span class="text-white text-xl">💳</span></div><div><h3 class="font-bold text-white">Insurance Accepted</h3><p class="text-blue-100 text-sm">We work with most dental insurance plans</p></div></div><div class="flex items-center gap-4"><div class="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center"><span class="text-white text-xl">🚨</span></div><div><h3 class="font-bold text-white">Emergency Care</h3><p class="text-blue-100 text-sm">Same-day appointments for dental emergencies</p></div></div></div></div><div class="bg-white p-8 rounded-2xl shadow-xl"><h3 class="text-2xl font-bold text-gray-900 mb-6">Book Your Appointment</h3><form class="space-y-4"><div class="grid md:grid-cols-2 gap-4"><input type="text" placeholder="First Name" class="w-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"><input type="text" placeholder="Last Name" class="w-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"></div><input type="email" placeholder="Email Address" class="w-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"><input type="tel" placeholder="Phone Number" class="w-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"><div class="grid md:grid-cols-2 gap-4"><input type="date" class="w-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"><select class="w-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"><option>Preferred Time</option><option>9:00 AM</option><option>11:00 AM</option><option>2:00 PM</option><option>4:00 PM</option></select></div><select class="w-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"><option>Service Needed</option><option>General Checkup</option><option>Cleaning</option><option>Cosmetic Consultation</option><option>Emergency Care</option><option>Other</option></select><textarea placeholder="Additional Message (Optional)" rows="3" class="w-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"></textarea><button type="submit" class="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-all">Schedule Appointment</button></form></div></div></div></section>'
        },
        {
          id: 'dental-contact-footer',
          component: '<footer class="bg-gray-900 text-white py-16"><div class="container mx-auto px-4"><div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12"><div><h3 class="text-xl font-bold mb-6">SmileCare Dental</h3><p class="text-gray-300 mb-6 leading-relaxed">Your trusted partner for comprehensive dental care. Creating beautiful, healthy smiles for the whole family.</p><div class="flex gap-4"><a href="#" class="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-all"><span class="text-sm">f</span></a><a href="#" class="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-all"><span class="text-sm">t</span></a><a href="#" class="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-all"><span class="text-sm">in</span></a></div></div><div><h3 class="text-xl font-bold mb-6">Services</h3><ul class="space-y-3 text-gray-300"><li><a href="#" class="hover:text-blue-400 transition-all">General Dentistry</a></li><li><a href="#" class="hover:text-blue-400 transition-all">Cosmetic Dentistry</a></li><li><a href="#" class="hover:text-blue-400 transition-all">Dental Implants</a></li><li><a href="#" class="hover:text-blue-400 transition-all">Orthodontics</a></li><li><a href="#" class="hover:text-blue-400 transition-all">Emergency Care</a></li></ul></div><div><h3 class="text-xl font-bold mb-6">Contact Info</h3><div class="space-y-3 text-gray-300"><div class="flex items-center gap-3"><span class="text-blue-400">📍</span><span>123 Dental Street<br>Health City, HC 12345</span></div><div class="flex items-center gap-3"><span class="text-blue-400">📞</span><span>(555) 123-4567</span></div><div class="flex items-center gap-3"><span class="text-blue-400">✉️</span><span>info@smilecare.com</span></div></div></div><div><h3 class="text-xl font-bold mb-6">Office Hours</h3><div class="space-y-2 text-gray-300"><div class="flex justify-between"><span>Monday - Friday</span><span class="text-blue-400">8AM - 6PM</span></div><div class="flex justify-between"><span>Saturday</span><span class="text-blue-400">9AM - 4PM</span></div><div class="flex justify-between"><span>Sunday</span><span class="text-blue-400">Emergency Only</span></div></div></div></div><div class="border-t border-gray-800 pt-8"><div class="flex flex-col md:flex-row justify-between items-center gap-4"><p class="text-gray-400">© 2024 SmileCare Dental. All rights reserved.</p><div class="flex gap-6 text-gray-400 text-sm"><a href="#" class="hover:text-blue-400 transition-all">Privacy Policy</a><a href="#" class="hover:text-blue-400 transition-all">Terms of Service</a><a href="#" class="hover:text-blue-400 transition-all">Sitemap</a></div></div></div></div></footer>'
        }
      ]
    },
    {
      id: 'orthodontist-specialist',
      name: 'Orthodontist Specialist',
      description: 'Specialized template for orthodontic practices focusing on braces and aligners',
      category: 'Orthodontics',
      image: 'https://images.unsplash.com/photo-1609840114035-3c981b782dfe?w=400&h=300&fit=crop',
      tags: ['orthodontics', 'braces', 'invisalign', 'specialist'],
      components: [
        'orthodontist-hero',
        'orthodontist-treatments',
        'orthodontist-before-after',
        'orthodontist-process',
        'orthodontist-consultation',
        'orthodontist-footer'
      ],
      layout: [
        {
          id: 'orthodontist-hero',
          component: '<section class="relative bg-gradient-to-br from-purple-50 to-indigo-50 py-20 lg:py-32"><div class="container mx-auto px-4"><div class="grid lg:grid-cols-2 gap-12 items-center"><div class="text-center lg:text-left"><div class="inline-flex items-center px-4 py-2 bg-purple-100 text-purple-800 rounded-full text-sm font-medium mb-6">⭐ Award-Winning Orthodontists</div><h1 class="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">Transform Your Smile with Expert <span class="text-purple-600">Orthodontic Care</span></h1><p class="text-xl text-gray-600 mb-8 leading-relaxed">Achieve the perfect smile with our cutting-edge orthodontic treatments. From traditional braces to Invisalign, we make beautiful smiles accessible and comfortable.</p><div class="grid grid-cols-3 gap-6 mb-8"><div class="text-center"><div class="text-3xl font-bold text-purple-600">5000+</div><div class="text-sm text-gray-600">Happy Patients</div></div><div class="text-center"><div class="text-3xl font-bold text-purple-600">15+</div><div class="text-sm text-gray-600">Years Experience</div></div><div class="text-center"><div class="text-3xl font-bold text-purple-600">98%</div><div class="text-sm text-gray-600">Success Rate</div></div></div><div class="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"><button class="bg-purple-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-purple-700 transition-all transform hover:scale-105 shadow-lg">Free Consultation</button><button class="border-2 border-purple-600 text-purple-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-purple-600 hover:text-white transition-all">View Treatments</button></div></div><div class="text-center relative"><img src="https://images.unsplash.com/photo-1609840114035-3c981b782dfe?w=600&h=500&fit=crop" alt="Perfect Orthodontic Smile" class="rounded-2xl shadow-2xl mx-auto max-w-full h-auto"><div class="absolute top-4 right-4 bg-white px-4 py-2 rounded-full shadow-lg"><span class="text-purple-600 font-semibold text-sm">🛡️ Painless Treatment</span></div></div></div></div></section>'
        },
        {
          id: 'orthodontist-treatments',
          component: '<section class="py-20 bg-white"><div class="container mx-auto px-4"><div class="text-center mb-16"><h2 class="text-4xl font-bold text-gray-900 mb-4">Our Orthodontic Treatments</h2><p class="text-xl text-gray-600 max-w-3xl mx-auto">Comprehensive solutions for every orthodontic need, from traditional braces to the latest clear aligner technology.</p></div><div class="grid lg:grid-cols-3 gap-8"><div class="relative bg-gradient-to-br from-purple-50 to-white p-8 rounded-2xl shadow-lg border-2 border-purple-200"><div class="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white px-4 py-2 rounded-full text-sm font-bold">Most Popular</div><div class="text-center mb-6"><div class="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4"><span class="text-4xl">🦷</span></div><h3 class="text-2xl font-bold text-gray-900 mb-2">Invisalign Clear Aligners</h3><p class="text-gray-600">Nearly invisible aligners that straighten teeth comfortably without metal braces.</p></div><ul class="space-y-3 mb-8"><li class="flex items-center gap-3"><span class="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">✓</span><span class="text-gray-700">Virtually invisible</span></li><li class="flex items-center gap-3"><span class="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">✓</span><span class="text-gray-700">Removable for eating</span></li><li class="flex items-center gap-3"><span class="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">✓</span><span class="text-gray-700">Comfortable fit</span></li><li class="flex items-center gap-3"><span class="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">✓</span><span class="text-gray-700">Shorter treatment time</span></li></ul><div class="text-center mb-6"><div class="text-3xl font-bold text-purple-600">Starting at $3,500</div><div class="text-gray-600">$150/month payment plans</div></div><button class="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-all">Learn More</button></div><div class="bg-white p-8 rounded-2xl shadow-lg border border-gray-200"><div class="text-center mb-6"><div class="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4"><span class="text-4xl">🔧</span></div><h3 class="text-2xl font-bold text-gray-900 mb-2">Traditional Metal Braces</h3><p class="text-gray-600">Time-tested metal braces with modern improvements for effective tooth alignment.</p></div><ul class="space-y-3 mb-8"><li class="flex items-center gap-3"><span class="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">✓</span><span class="text-gray-700">Most effective option</span></li><li class="flex items-center gap-3"><span class="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">✓</span><span class="text-gray-700">Durable and reliable</span></li><li class="flex items-center gap-3"><span class="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">✓</span><span class="text-gray-700">Cost-effective</span></li><li class="flex items-center gap-3"><span class="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">✓</span><span class="text-gray-700">Suitable for all ages</span></li></ul><div class="text-center mb-6"><div class="text-3xl font-bold text-blue-600">Starting at $2,800</div><div class="text-gray-600">$120/month payment plans</div></div><button class="w-full border-2 border-blue-600 text-blue-600 py-3 rounded-lg font-semibold hover:bg-blue-600 hover:text-white transition-all">Learn More</button></div><div class="bg-white p-8 rounded-2xl shadow-lg border border-gray-200"><div class="text-center mb-6"><div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"><span class="text-4xl">💎</span></div><h3 class="text-2xl font-bold text-gray-900 mb-2">Clear Ceramic Braces</h3><p class="text-gray-600">Tooth-colored brackets that blend with your natural teeth for a discrete appearance.</p></div><ul class="space-y-3 mb-8"><li class="flex items-center gap-3"><span class="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">✓</span><span class="text-gray-700">Less noticeable</span></li><li class="flex items-center gap-3"><span class="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">✓</span><span class="text-gray-700">Same effectiveness as metal</span></li><li class="flex items-center gap-3"><span class="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">✓</span><span class="text-gray-700">Comfortable</span></li><li class="flex items-center gap-3"><span class="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">✓</span><span class="text-gray-700">Stain-resistant</span></li></ul><div class="text-center mb-6"><div class="text-3xl font-bold text-green-600">Starting at $3,200</div><div class="text-gray-600">$135/month payment plans</div></div><button class="w-full border-2 border-green-600 text-green-600 py-3 rounded-lg font-semibold hover:bg-green-600 hover:text-white transition-all">Learn More</button></div></div><div class="mt-16 bg-gray-50 p-8 rounded-2xl"><h3 class="text-2xl font-bold text-gray-900 text-center mb-8">Your Orthodontic Journey</h3><div class="grid md:grid-cols-4 gap-6"><div class="text-center"><div class="w-16 h-16 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">1</div><h4 class="font-bold text-gray-900 mb-2">Free Consultation</h4><p class="text-gray-600 text-sm">Comprehensive examination and treatment planning</p></div><div class="text-center"><div class="w-16 h-16 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">2</div><h4 class="font-bold text-gray-900 mb-2">Custom Treatment Plan</h4><p class="text-gray-600 text-sm">Personalized approach based on your unique needs</p></div><div class="text-center"><div class="w-16 h-16 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">3</div><h4 class="font-bold text-gray-900 mb-2">Treatment Begins</h4><p class="text-gray-600 text-sm">Start your journey to a perfect smile</p></div><div class="text-center"><div class="w-16 h-16 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">4</div><h4 class="font-bold text-gray-900 mb-2">Beautiful Results</h4><p class="text-gray-600 text-sm">Enjoy your new confident smile</p></div></div></div></div></section>'
        },
        {
          id: 'orthodontist-consultation',
          component: '<section class="py-20 bg-gradient-to-br from-purple-600 to-indigo-600 text-white"><div class="container mx-auto px-4"><div class="grid lg:grid-cols-2 gap-12 items-center"><div><h2 class="text-4xl font-bold mb-6">Start Your Smile Journey Today</h2><p class="text-xl text-purple-100 mb-8 leading-relaxed">Book your free consultation and discover how we can transform your smile with expert orthodontic care.</p><div class="space-y-6"><div class="flex items-center gap-4"><div class="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center"><span class="text-2xl">👨‍⚕️</span></div><div><h3 class="font-bold text-white text-lg">Expert Evaluation</h3><p class="text-purple-100">Comprehensive examination by our orthodontists</p></div></div><div class="flex items-center gap-4"><div class="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center"><span class="text-2xl">📊</span></div><div><h3 class="font-bold text-white text-lg">Custom Treatment Plan</h3><p class="text-purple-100">Personalized approach for your unique needs</p></div></div><div class="flex items-center gap-4"><div class="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center"><span class="text-2xl">💰</span></div><div><h3 class="font-bold text-white text-lg">Flexible Financing</h3><p class="text-purple-100">Affordable payment plans and insurance options</p></div></div></div></div><div class="bg-white p-8 rounded-2xl shadow-2xl"><h3 class="text-2xl font-bold text-gray-900 mb-6">Book Your Free Consultation</h3><form class="space-y-4"><div class="grid md:grid-cols-2 gap-4"><input type="text" placeholder="First Name" class="w-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"><input type="text" placeholder="Last Name" class="w-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"></div><input type="email" placeholder="Email Address" class="w-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"><input type="tel" placeholder="Phone Number" class="w-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"><select class="w-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"><option>Patient Age</option><option>Child (7-12)</option><option>Teen (13-17)</option><option>Adult (18+)</option></select><select class="w-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"><option>Treatment Interest</option><option>Invisalign</option><option>Traditional Braces</option><option>Clear Braces</option><option>General Consultation</option></select><textarea placeholder="Tell us about your smile goals..." rows="3" class="w-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"></textarea><button type="submit" class="w-full bg-purple-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-purple-700 transition-all">Schedule Free Consultation</button></form><p class="text-sm text-gray-500 text-center mt-4">* Free consultation includes examination and treatment planning</p></div></div></div></section>'
        },
        {
          id: 'orthodontist-footer',
          component: '<footer class="bg-gray-900 text-white py-16"><div class="container mx-auto px-4"><div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12"><div><h3 class="text-xl font-bold mb-6">StraightSmile Orthodontics</h3><p class="text-gray-300 mb-6 leading-relaxed">Expert orthodontic care creating beautiful, confident smiles for patients of all ages. Your journey to a perfect smile starts here.</p><div class="flex gap-4"><a href="#" class="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-purple-600 transition-all"><span class="text-sm">f</span></a><a href="#" class="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-purple-600 transition-all"><span class="text-sm">ig</span></a><a href="#" class="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-purple-600 transition-all"><span class="text-sm">yt</span></a></div></div><div><h3 class="text-xl font-bold mb-6">Treatments</h3><ul class="space-y-3 text-gray-300"><li><a href="#" class="hover:text-purple-400 transition-all">Invisalign</a></li><li><a href="#" class="hover:text-purple-400 transition-all">Traditional Braces</a></li><li><a href="#" class="hover:text-purple-400 transition-all">Clear Braces</a></li><li><a href="#" class="hover:text-purple-400 transition-all">Retainers</a></li><li><a href="#" class="hover:text-purple-400 transition-all">Surgical Orthodontics</a></li></ul></div><div><h3 class="text-xl font-bold mb-6">Contact Info</h3><div class="space-y-3 text-gray-300"><div class="flex items-center gap-3"><span class="text-purple-400">📍</span><span>456 Smile Avenue<br>Orthodontics City, OC 54321</span></div><div class="flex items-center gap-3"><span class="text-purple-400">📞</span><span>(555) 987-6543</span></div><div class="flex items-center gap-3"><span class="text-purple-400">✉️</span><span>info@straightsmileortho.com</span></div></div></div><div><h3 class="text-xl font-bold mb-6">Office Hours</h3><div class="space-y-2 text-gray-300"><div class="flex justify-between"><span>Mon - Thu</span><span class="text-purple-400">8AM - 5PM</span></div><div class="flex justify-between"><span>Friday</span><span class="text-purple-400">8AM - 4PM</span></div><div class="flex justify-between"><span>Saturday</span><span class="text-purple-400">By Appointment</span></div><div class="flex justify-between"><span>Sunday</span><span class="text-purple-400">Closed</span></div></div></div></div><div class="border-t border-gray-800 pt-8"><div class="flex flex-col md:flex-row justify-between items-center gap-4"><p class="text-gray-400">© 2024 StraightSmile Orthodontics. All rights reserved.</p><div class="flex gap-6 text-gray-400 text-sm"><a href="#" class="hover:text-purple-400 transition-all">Privacy Policy</a><a href="#" class="hover:text-purple-400 transition-all">Terms of Service</a><a href="#" class="hover:text-purple-400 transition-all">Sitemap</a></div></div></div></div></footer>'
        }
      ]
    },
    {
      id: 'pediatric-dentist',
      name: 'Pediatric Dentist',
      description: 'Fun, colorful template designed specifically for children\'s dental care',
      category: 'Pediatric Dentistry',
      image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop',
      tags: ['pediatric', 'children', 'fun', 'colorful', 'family'],
      components: [
        'pediatric-hero',
        'pediatric-services',
        'pediatric-team',
        'pediatric-appointment',
        'pediatric-footer'
      ],
      layout: [
        {
          id: 'pediatric-hero',
          component: '<section class="relative bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 py-20 lg:py-32 overflow-hidden"><div class="absolute inset-0"><div class="absolute top-10 left-10 w-20 h-20 bg-yellow-300 rounded-full opacity-60"></div><div class="absolute top-32 right-20 w-16 h-16 bg-blue-300 rounded-full opacity-60"></div><div class="absolute bottom-20 left-32 w-12 h-12 bg-green-300 rounded-full opacity-60"></div><div class="absolute bottom-40 right-10 w-24 h-24 bg-pink-300 rounded-full opacity-60"></div></div><div class="relative container mx-auto px-4"><div class="grid lg:grid-cols-2 gap-12 items-center"><div class="text-center lg:text-left"><div class="inline-flex items-center px-4 py-2 bg-rainbow-gradient text-white rounded-full text-sm font-medium mb-6">🌈 Making Dental Visits Fun Since 2010!</div><h1 class="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">Happy Teeth for <span class="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">Happy Kids!</span></h1><p class="text-xl text-gray-600 mb-8 leading-relaxed">We make dental care fun and stress-free for children. Our gentle, kid-friendly approach helps your little ones develop healthy dental habits for life!</p><div class="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8"><button class="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-lg transition-all transform hover:scale-105">Schedule Visit</button><button class="border-2 border-purple-500 text-purple-500 px-8 py-4 rounded-full font-semibold text-lg hover:bg-purple-500 hover:text-white transition-all">Virtual Tour</button></div><div class="grid grid-cols-4 gap-4 text-center"><div class="bg-white p-4 rounded-2xl shadow-lg"><div class="text-2xl mb-2">🎮</div><div class="text-sm font-bold text-gray-900">Fun Games</div></div><div class="bg-white p-4 rounded-2xl shadow-lg"><div class="text-2xl mb-2">🏆</div><div class="text-sm font-bold text-gray-900">Rewards</div></div><div class="bg-white p-4 rounded-2xl shadow-lg"><div class="text-2xl mb-2">🎪</div><div class="text-sm font-bold text-gray-900">Playful</div></div><div class="bg-white p-4 rounded-2xl shadow-lg"><div class="text-2xl mb-2">💝</div><div class="text-sm font-bold text-gray-900">Prizes</div></div></div></div><div class="text-center relative"><img src="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&h=500&fit=crop" alt="Happy Children at Dentist" class="rounded-3xl shadow-2xl mx-auto max-w-full h-auto"><div class="absolute -top-4 -right-4 bg-yellow-400 text-yellow-900 px-4 py-2 rounded-full shadow-lg font-bold">No More Fears! 😊</div></div></div></div></section>'
        },
        {
          id: 'pediatric-services',
          component: '<section class="py-20 bg-white"><div class="container mx-auto px-4"><div class="text-center mb-16"><h2 class="text-4xl font-bold text-gray-900 mb-4">Super Fun Dental Services!</h2><p class="text-xl text-gray-600 max-w-3xl mx-auto">We offer gentle, kid-friendly dental care that makes every visit an adventure. From tiny tots to teenagers!</p></div><div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8"><div class="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all group"><div class="w-20 h-20 bg-blue-200 rounded-full flex items-center justify-content mx-auto mb-6 group-hover:animate-bounce"><span class="text-4xl mx-auto">🦷</span></div><h3 class="text-2xl font-bold text-gray-900 mb-4 text-center">Gentle Cleanings</h3><p class="text-gray-600 mb-6 text-center">Fun, thorough cleanings that feel like a game! We use special flavored toothpaste and gentle techniques.</p><ul class="text-sm text-gray-700 space-y-2"><li class="flex items-center gap-2"><span class="text-green-500">✨</span> Bubble gum flavored polish</li><li class="flex items-center gap-2"><span class="text-green-500">✨</span> Gentle vibrating tools</li><li class="flex items-center gap-2"><span class="text-green-500">✨</span> Fun music and cartoons</li><li class="flex items-center gap-2"><span class="text-green-500">✨</span> Sticker rewards!</li></ul></div><div class="bg-gradient-to-br from-purple-50 to-purple-100 p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all group"><div class="w-20 h-20 bg-purple-200 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:animate-bounce"><span class="text-4xl">🛡️</span></div><h3 class="text-2xl font-bold text-gray-900 mb-4 text-center">Fluoride Treatments</h3><p class="text-gray-600 mb-6 text-center">Superhero protection for teeth! Special fluoride treatments that taste like yummy fruit flavors.</p><ul class="text-sm text-gray-700 space-y-2"><li class="flex items-center gap-2"><span class="text-green-500">✨</span> Strawberry, grape, or mint</li><li class="flex items-center gap-2"><span class="text-green-500">✨</span> Quick and painless</li><li class="flex items-center gap-2"><span class="text-green-500">✨</span> Strengthens tooth enamel</li><li class="flex items-center gap-2"><span class="text-green-500">✨</span> Cavity prevention</li></ul></div><div class="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all group"><div class="w-20 h-20 bg-green-200 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:animate-bounce"><span class="text-4xl">🔍</span></div><h3 class="text-2xl font-bold text-gray-900 mb-4 text-center">Tooth Detective Work</h3><p class="text-gray-600 mb-6 text-center">We use special detective tools to look for cavity monsters and keep teeth healthy!</p><ul class="text-sm text-gray-700 space-y-2"><li class="flex items-center gap-2"><span class="text-green-500">✨</span> Digital X-rays (super fast!)</li><li class="flex items-center gap-2"><span class="text-green-500">✨</span> Cavity detection</li><li class="flex items-center gap-2"><span class="text-green-500">✨</span> Growth monitoring</li><li class="flex items-center gap-2"><span class="text-green-500">✨</span> Fun explanations</li></ul></div><div class="bg-gradient-to-br from-yellow-50 to-yellow-100 p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all group"><div class="w-20 h-20 bg-yellow-200 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:animate-bounce"><span class="text-4xl">🌟</span></div><h3 class="text-2xl font-bold text-gray-900 mb-4 text-center">Sealants</h3><p class="text-gray-600 mb-6 text-center">Magic protective coatings that keep the cavity monsters away from back teeth!</p><ul class="text-sm text-gray-700 space-y-2"><li class="flex items-center gap-2"><span class="text-green-500">✨</span> Invisible protection</li><li class="flex items-center gap-2"><span class="text-green-500">✨</span> No shots needed</li><li class="flex items-center gap-2"><span class="text-green-500">✨</span> Lasts for years</li><li class="flex items-center gap-2"><span class="text-green-500">✨</span> Prevents 80% of cavities</li></ul></div><div class="bg-gradient-to-br from-pink-50 to-pink-100 p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all group"><div class="w-20 h-20 bg-pink-200 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:animate-bounce"><span class="text-4xl">🎨</span></div><h3 class="text-2xl font-bold text-gray-900 mb-4 text-center">Colorful Fillings</h3><p class="text-gray-600 mb-6 text-center">If we find any cavity monsters, we fix them with special tooth-colored materials!</p><ul class="text-sm text-gray-700 space-y-2"><li class="flex items-center gap-2"><span class="text-green-500">✨</span> Looks natural</li><li class="flex items-center gap-2"><span class="text-green-500">✨</span> Strong and durable</li><li class="flex items-center gap-2"><span class="text-green-500">✨</span> Gentle process</li><li class="flex items-center gap-2"><span class="text-green-500">✨</span> No metal needed</li></ul></div><div class="bg-gradient-to-br from-indigo-50 to-indigo-100 p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all group"><div class="w-20 h-20 bg-indigo-200 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:animate-bounce"><span class="text-4xl">🎪</span></div><h3 class="text-2xl font-bold text-gray-900 mb-4 text-center">Emergency Care</h3><p class="text-gray-600 mb-6 text-center">Uh oh! Tooth accidents happen. We\'re here to help make everything better quickly!</p><ul class="text-sm text-gray-700 space-y-2"><li class="flex items-center gap-2"><span class="text-green-500">✨</span> Same-day appointments</li><li class="flex items-center gap-2"><span class="text-green-500">✨</span> Pain relief</li><li class="flex items-center gap-2"><span class="text-green-500">✨</span> Gentle treatment</li><li class="flex items-center gap-2"><span class="text-green-500">✨</span> Parent support</li></ul></div></div></div></section>'
        },
        {
          id: 'pediatric-appointment',
          component: '<section class="py-20 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500"><div class="container mx-auto px-4"><div class="grid lg:grid-cols-2 gap-12 items-center"><div class="text-white"><h2 class="text-4xl font-bold mb-6">Ready for a Fun Dental Adventure?</h2><p class="text-xl text-purple-100 mb-8 leading-relaxed">Book your child\'s appointment today and discover why kids love coming to see us! No more dental fears, just smiles and fun!</p><div class="space-y-6"><div class="flex items-center gap-4"><div class="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center"><span class="text-2xl">🎮</span></div><div><h3 class="font-bold text-white text-lg">Fun Games & Activities</h3><p class="text-purple-100">Interactive games and toys in our waiting area</p></div></div><div class="flex items-center gap-4"><div class="w-12 h-12 bg-green-400 rounded-full flex items-center justify-center"><span class="text-2xl">🏆</span></div><div><h3 class="font-bold text-white text-lg">Reward System</h3><p class="text-purple-100">Stickers, prizes, and certificates for brave kids</p></div></div><div class="flex items-center gap-4"><div class="w-12 h-12 bg-blue-400 rounded-full flex items-center justify-center"><span class="text-2xl">👨‍👩‍👧‍👦</span></div><div><h3 class="font-bold text-white text-lg">Parent-Friendly</h3><p class="text-purple-100">We welcome parents in the treatment room</p></div></div></div></div><div class="bg-white p-8 rounded-3xl shadow-2xl"><h3 class="text-2xl font-bold text-gray-900 mb-6 text-center">Schedule Your Child\'s Visit</h3><form class="space-y-4"><div class="grid md:grid-cols-2 gap-4"><input type="text" placeholder="Parent/Guardian Name" class="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"><input type="text" placeholder="Child\'s Name" class="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"></div><div class="grid md:grid-cols-2 gap-4"><input type="email" placeholder="Email Address" class="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"><input type="tel" placeholder="Phone Number" class="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"></div><div class="grid md:grid-cols-2 gap-4"><select class="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"><option>Child\'s Age</option><option>2-3 years (Toddler)</option><option>4-6 years (Preschool)</option><option>7-10 years (School Age)</option><option>11-14 years (Preteen)</option><option>15-17 years (Teen)</option></select><select class="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"><option>Visit Type</option><option>First Visit/Checkup</option><option>Cleaning</option><option>Check a Problem</option><option>Emergency</option><option>Follow-up</option></select></div><textarea placeholder="Tell us about your child\'s dental needs or any concerns..." rows="3" class="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"></textarea><div class="flex items-center gap-3 text-sm text-gray-600"><input type="checkbox" class="w-4 h-4 text-purple-600"><span>My child has been to a dentist before</span></div><div class="flex items-center gap-3 text-sm text-gray-600"><input type="checkbox" class="w-4 h-4 text-purple-600"><span>My child has dental anxiety/fears</span></div><button type="submit" class="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg transition-all transform hover:scale-105">🌟 Book Fun Dental Visit! 🌟</button></form><p class="text-sm text-gray-500 text-center mt-4">✨ First visits include a fun tour and special welcome gift!</p></div></div></div></section>'
        },
        {
          id: 'pediatric-footer',
          component: '<footer class="bg-gradient-to-r from-purple-800 to-pink-800 text-white py-16"><div class="container mx-auto px-4"><div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12"><div><h3 class="text-xl font-bold mb-6">🌈 Happy Teeth Pediatric Dentistry</h3><p class="text-purple-100 mb-6 leading-relaxed">Making dental visits fun and educational for kids since 2010. We believe every child deserves a healthy, beautiful smile!</p><div class="flex gap-4"><a href="#" class="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center hover:bg-yellow-300 transition-all text-purple-800 font-bold">f</a><a href="#" class="w-10 h-10 bg-pink-400 rounded-full flex items-center justify-center hover:bg-pink-300 transition-all text-purple-800 font-bold">ig</a><a href="#" class="w-10 h-10 bg-blue-400 rounded-full flex items-center justify-center hover:bg-blue-300 transition-all text-purple-800 font-bold">yt</a></div></div><div><h3 class="text-xl font-bold mb-6">🦷 Our Services</h3><ul class="space-y-3 text-purple-100"><li><a href="#" class="hover:text-yellow-300 transition-all">• Gentle Cleanings</a></li><li><a href="#" class="hover:text-yellow-300 transition-all">• Fluoride Treatments</a></li><li><a href="#" class="hover:text-yellow-300 transition-all">• Sealants</a></li><li><a href="#" class="hover:text-yellow-300 transition-all">• Colorful Fillings</a></li><li><a href="#" class="hover:text-yellow-300 transition-all">• Emergency Care</a></li></ul></div><div><h3 class="text-xl font-bold mb-6">📞 Contact Info</h3><div class="space-y-3 text-purple-100"><div class="flex items-center gap-3"><span class="text-yellow-300">🏠</span><span>789 Smile Street<br>Happy Valley, HV 98765</span></div><div class="flex items-center gap-3"><span class="text-yellow-300">📱</span><span>(555) KID-TEETH<br>(555) 543-8338</span></div><div class="flex items-center gap-3"><span class="text-yellow-300">💌</span><span>smile@happyteethkids.com</span></div></div></div><div><h3 class="text-xl font-bold mb-6">🕐 Office Hours</h3><div class="space-y-2 text-purple-100"><div class="flex justify-between"><span>Monday - Friday</span><span class="text-yellow-300">8AM - 5PM</span></div><div class="flex justify-between"><span>Saturday</span><span class="text-yellow-300">9AM - 2PM</span></div><div class="flex justify-between"><span>Sunday</span><span class="text-yellow-300">Closed</span></div><div class="mt-4 p-3 bg-yellow-400 text-purple-800 rounded-lg text-sm"><strong>🚨 Emergency Line:</strong><br>Available 24/7 for dental emergencies</div></div></div></div><div class="border-t border-purple-600 pt-8"><div class="flex flex-col md:flex-row justify-between items-center gap-4"><p class="text-purple-200">© 2024 Happy Teeth Pediatric Dentistry. All rights reserved. 🌟</p><div class="flex gap-6 text-purple-200 text-sm"><a href="#" class="hover:text-yellow-300 transition-all">Privacy Policy</a><a href="#" class="hover:text-yellow-300 transition-all">Terms of Service</a><a href="#" class="hover:text-yellow-300 transition-all">Fun Zone</a></div></div></div></div></footer>'
        }
      ]
    },
    {
      id: 'cosmetic-dentist',
      name: 'Cosmetic Dentist',
      description: 'Elegant template showcasing smile transformations and aesthetic procedures',
      category: 'Cosmetic Dentistry',
      image: 'https://images.unsplash.com/photo-1606811971618-4486d14f3f99?w=400&h=300&fit=crop',
      tags: ['cosmetic', 'aesthetic', 'smile', 'transformation', 'luxury'],
      components: [
        'cosmetic-hero',
        'cosmetic-services',
        'cosmetic-gallery',
        'cosmetic-consultation',
        'cosmetic-footer'
      ],
      layout: [
        {
          id: 'cosmetic-hero',
          component: '<section class="relative bg-gradient-to-br from-rose-50 to-pink-50 py-20 lg:py-32"><div class="container mx-auto px-4"><div class="grid lg:grid-cols-2 gap-12 items-center"><div class="text-center lg:text-left"><div class="inline-flex items-center px-4 py-2 bg-rose-100 text-rose-800 rounded-full text-sm font-medium mb-6">✨ Award-Winning Cosmetic Dentistry</div><h1 class="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">Transform Your Smile, <span class="text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-pink-600">Transform Your Life</span></h1><p class="text-xl text-gray-600 mb-8 leading-relaxed">Discover the confidence that comes with a perfect smile. Our advanced cosmetic dental procedures create stunning, natural-looking results that last a lifetime.</p><div class="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8"><button class="bg-gradient-to-r from-rose-600 to-pink-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:shadow-lg transition-all transform hover:scale-105">Free Smile Analysis</button><button class="border-2 border-rose-600 text-rose-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-rose-600 hover:text-white transition-all">View Gallery</button></div><div class="grid grid-cols-3 gap-6 text-center"><div class="bg-white p-4 rounded-xl shadow-lg"><div class="text-3xl font-bold text-rose-600">1000+</div><div class="text-sm text-gray-600">Smile Makeovers</div></div><div class="bg-white p-4 rounded-xl shadow-lg"><div class="text-3xl font-bold text-rose-600">98%</div><div class="text-sm text-gray-600">Satisfaction Rate</div></div><div class="bg-white p-4 rounded-xl shadow-lg"><div class="text-3xl font-bold text-rose-600">20+</div><div class="text-sm text-gray-600">Years Experience</div></div></div></div><div class="text-center relative"><img src="https://images.unsplash.com/photo-1606811971618-4486d14f3f99?w=600&h=500&fit=crop" alt="Beautiful Smile Transformation" class="rounded-2xl shadow-2xl mx-auto max-w-full h-auto"><div class="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-white px-6 py-3 rounded-full shadow-xl"><span class="text-rose-600 font-bold">🏆 Best Cosmetic Dentist 2024</span></div></div></div></div></section>'
        },
        {
          id: 'cosmetic-services',
          component: '<section class="py-20 bg-white"><div class="container mx-auto px-4"><div class="text-center mb-16"><h2 class="text-4xl font-bold text-gray-900 mb-4">Premium Cosmetic Services</h2><p class="text-xl text-gray-600 max-w-3xl mx-auto">Artistry meets science in our comprehensive cosmetic dental treatments. Each procedure is tailored to enhance your unique features.</p></div><div class="grid lg:grid-cols-2 gap-16 mb-16"><div class="bg-gradient-to-br from-rose-50 to-pink-50 p-8 rounded-2xl"><h3 class="text-2xl font-bold text-gray-900 mb-6">✨ Teeth Whitening</h3><p class="text-gray-600 mb-6">Professional whitening that delivers dramatically whiter teeth up to 8 shades brighter in just one visit.</p><div class="grid md:grid-cols-2 gap-4 mb-6"><div class="bg-white p-4 rounded-lg"><h4 class="font-bold text-gray-900 mb-2">In-Office</h4><ul class="text-sm text-gray-600 space-y-1"><li>• Results in 1 hour</li><li>• Up to 8 shades whiter</li><li>• Professional supervision</li><li>• Immediate results</li></ul></div><div class="bg-white p-4 rounded-lg"><h4 class="font-bold text-gray-900 mb-2">Take-Home</h4><ul class="text-sm text-gray-600 space-y-1"><li>• Custom-fitted trays</li><li>• Gradual whitening</li><li>• Convenience of home</li><li>• Long-lasting results</li></ul></div></div><button class="bg-rose-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-rose-700 transition-all">Learn More</button></div><div class="bg-gradient-to-br from-purple-50 to-indigo-50 p-8 rounded-2xl"><h3 class="text-2xl font-bold text-gray-900 mb-6">💎 Porcelain Veneers</h3><p class="text-gray-600 mb-6">Ultra-thin porcelain shells that cover imperfections and create a perfect, natural-looking smile.</p><div class="space-y-4 mb-6"><div class="flex items-center gap-3"><span class="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">✓</span><span class="text-gray-700">Corrects chips, cracks, and gaps</span></div><div class="flex items-center gap-3"><span class="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">✓</span><span class="text-gray-700">Stain-resistant and durable</span></div><div class="flex items-center gap-3"><span class="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">✓</span><span class="text-gray-700">Natural appearance</span></div><div class="flex items-center gap-3"><span class="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">✓</span><span class="text-gray-700">Lasts 15-20 years</span></div></div><button class="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-all">Learn More</button></div></div><div class="grid md:grid-cols-3 gap-8"><div class="text-center group"><div class="w-20 h-20 bg-gradient-to-br from-rose-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-all"><span class="text-3xl">🎨</span></div><h3 class="text-xl font-bold text-gray-900 mb-3">Smile Design</h3><p class="text-gray-600">Comprehensive smile makeovers using digital technology to plan your perfect smile.</p></div><div class="text-center group"><div class="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-all"><span class="text-3xl">🔧</span></div><h3 class="text-xl font-bold text-gray-900 mb-3">Dental Bonding</h3><p class="text-gray-600">Quick and affordable solution for minor imperfections using tooth-colored composite resin.</p></div><div class="text-center group"><div class="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-all"><span class="text-3xl">✂️</span></div><h3 class="text-xl font-bold text-gray-900 mb-3">Gum Contouring</h3><p class="text-gray-600">Reshape your gum line for a more balanced and proportionate smile appearance.</p></div></div></div></section>'
        },
        {
          id: 'cosmetic-consultation',
          component: '<section class="py-20 bg-gradient-to-br from-rose-600 to-pink-600 text-white"><div class="container mx-auto px-4"><div class="grid lg:grid-cols-2 gap-12 items-center"><div><h2 class="text-4xl font-bold mb-6">Start Your Smile Transformation</h2><p class="text-xl text-rose-100 mb-8 leading-relaxed">Book your complimentary smile analysis and discover how we can enhance your natural beauty with personalized cosmetic treatments.</p><div class="space-y-6"><div class="flex items-center gap-4"><div class="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center"><span class="text-2xl">📸</span></div><div><h3 class="font-bold text-white text-lg">Digital Smile Analysis</h3><p class="text-rose-100">Advanced imaging to visualize your new smile</p></div></div><div class="flex items-center gap-4"><div class="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center"><span class="text-2xl">💰</span></div><div><h3 class="font-bold text-white text-lg">Flexible Financing</h3><p class="text-rose-100">0% interest payment plans available</p></div></div><div class="flex items-center gap-4"><div class="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center"><span class="text-2xl">🎯</span></div><div><h3 class="font-bold text-white text-lg">Personalized Treatment</h3><p class="text-rose-100">Custom approach for your unique goals</p></div></div></div></div><div class="bg-white p-8 rounded-2xl shadow-2xl"><h3 class="text-2xl font-bold text-gray-900 mb-6">Free Smile Consultation</h3><form class="space-y-4"><div class="grid md:grid-cols-2 gap-4"><input type="text" placeholder="First Name" class="w-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-600 focus:border-transparent"><input type="text" placeholder="Last Name" class="w-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-600 focus:border-transparent"></div><input type="email" placeholder="Email Address" class="w-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-600 focus:border-transparent"><input type="tel" placeholder="Phone Number" class="w-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-600 focus:border-transparent"><select class="w-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-600 focus:border-transparent"><option>What are you most interested in?</option><option>Teeth Whitening</option><option>Porcelain Veneers</option><option>Complete Smile Makeover</option><option>Dental Bonding</option><option>Gum Contouring</option><option>General Consultation</option></select><textarea placeholder="Tell us about your smile goals and concerns..." rows="3" class="w-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-600 focus:border-transparent"></textarea><div class="flex items-center gap-3 text-sm text-gray-600"><input type="checkbox" class="w-4 h-4 text-rose-600"><span>I\'m interested in financing options</span></div><button type="submit" class="w-full bg-gradient-to-r from-rose-600 to-pink-600 text-white py-4 rounded-lg font-semibold text-lg hover:shadow-lg transition-all">Book Free Consultation</button></form><p class="text-sm text-gray-500 text-center mt-4">* Includes digital smile analysis and treatment planning ($200 value)</p></div></div></div></section>'
        },
        {
          id: 'cosmetic-footer',
          component: '<footer class="bg-gray-900 text-white py-16"><div class="container mx-auto px-4"><div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12"><div><h3 class="text-xl font-bold mb-6">✨ Radiant Smiles Cosmetic Dentistry</h3><p class="text-gray-300 mb-6 leading-relaxed">Artistry and precision in cosmetic dentistry. Creating beautiful, confident smiles that transform lives through advanced aesthetic procedures.</p><div class="flex gap-4"><a href="#" class="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-rose-600 transition-all"><span class="text-sm">f</span></a><a href="#" class="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-rose-600 transition-all"><span class="text-sm">ig</span></a><a href="#" class="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-rose-600 transition-all"><span class="text-sm">yt</span></a></div></div><div><h3 class="text-xl font-bold mb-6">Cosmetic Services</h3><ul class="space-y-3 text-gray-300"><li><a href="#" class="hover:text-rose-400 transition-all">Teeth Whitening</a></li><li><a href="#" class="hover:text-rose-400 transition-all">Porcelain Veneers</a></li><li><a href="#" class="hover:text-rose-400 transition-all">Smile Makeovers</a></li><li><a href="#" class="hover:text-rose-400 transition-all">Dental Bonding</a></li><li><a href="#" class="hover:text-rose-400 transition-all">Gum Contouring</a></li></ul></div><div><h3 class="text-xl font-bold mb-6">Contact Info</h3><div class="space-y-3 text-gray-300"><div class="flex items-center gap-3"><span class="text-rose-400">📍</span><span>321 Beauty Boulevard<br>Smile City, SC 13579</span></div><div class="flex items-center gap-3"><span class="text-rose-400">📞</span><span>(555) RADIANT<br>(555) 723-4268</span></div><div class="flex items-center gap-3"><span class="text-rose-400">✉️</span><span>smile@radiantsmiles.com</span></div></div></div><div><h3 class="text-xl font-bold mb-6">Office Hours</h3><div class="space-y-2 text-gray-300"><div class="flex justify-between"><span>Monday - Thursday</span><span class="text-rose-400">8AM - 6PM</span></div><div class="flex justify-between"><span>Friday</span><span class="text-rose-400">8AM - 4PM</span></div><div class="flex justify-between"><span>Saturday</span><span class="text-rose-400">9AM - 3PM</span></div><div class="flex justify-between"><span>Sunday</span><span class="text-rose-400">Closed</span></div></div></div></div><div class="border-t border-gray-800 pt-8"><div class="flex flex-col md:flex-row justify-between items-center gap-4"><p class="text-gray-400">© 2024 Radiant Smiles Cosmetic Dentistry. All rights reserved.</p><div class="flex gap-6 text-gray-400 text-sm"><a href="#" class="hover:text-rose-400 transition-all">Privacy Policy</a><a href="#" class="hover:text-rose-400 transition-all">Terms of Service</a><a href="#" class="hover:text-rose-400 transition-all">Smile Gallery</a></div></div></div></div></footer>'
        }
      ]
    }
  ];

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
                        <div dangerouslySetInnerHTML={{ __html: component.component }} />
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
                    <div dangerouslySetInnerHTML={{ __html: previewComponent.component }} />
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

            <Grid container spacing={4}>
              {(dentalWebsiteTemplates || []).map((template) => (
                <Grid item xs={12} md={6} lg={4} key={template.id}>
                  <Card
                    sx={{
                      height: '100%',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: 6
                      },
                      border: selectedTemplate?.id === template.id ? '2px solid' : '2px solid transparent',
                      borderColor: selectedTemplate?.id === template.id ? 'primary.main' : 'transparent'
                    }}
                    onClick={() => setSelectedTemplate(template)}
                  >
                    <Box sx={{ position: 'relative', height: 200, bgcolor: 'grey.100' }}>
                      <Box
                        sx={{
                          position: 'absolute',
                          inset: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: `linear-gradient(135deg, ${template.colors?.primary || template.primaryColor || '#2563eb'}20, ${template.colors?.primary || template.primaryColor || '#2563eb'}40)`
                        }}
                      >
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h4" sx={{ mb: 1 }}>
                            🦷
                          </Typography>
                          <Typography variant="h6" fontWeight="bold">
                            {template.siteName || template.name}
                          </Typography>
                        </Box>
                      </Box>
                      {selectedTemplate?.id === template.id && (
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            width: 32,
                            height: 32,
                            bgcolor: 'primary.main',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white'
                          }}
                        >
                          ✓
                        </Box>
                      )}
                    </Box>
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                        {template.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {template.description}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <Box
                          sx={{
                            width: 16,
                            height: 16,
                            borderRadius: '50%',
                            bgcolor: template.colors?.primary || template.primaryColor || '#2563eb'
                          }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {(template.components || template.sections || []).length} Sections
                        </Typography>
                      </Box>
                      <Button
                        fullWidth
                        variant={selectedTemplate?.id === template.id ? 'contained' : 'outlined'}
                        onClick={(e) => {
                          e.stopPropagation();
                          loadTemplate(template);
                        }}
                        disabled={loadingTemplate}
                      >
                        {loadingTemplate ? 'Loading...' : 'Use This Template'}
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

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