import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Snackbar,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Card,
  CardContent,
  Grid,
  Stack,
  AppBar,
  Toolbar,
  Paper
} from '@mui/material';
import {
  Save as SaveIcon,
  Preview as PreviewIcon,
  Settings as SettingsIcon,
  ArrowBack as BackIcon,
  Publish as PublishIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  Close as CloseIcon,
  DragIndicator as DragIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  TextFields as TextIcon,
  Visibility as VisibilityIcon,
  Add as AddIcon,
  Image as ImageIcon,
  CloudUpload as UploadIcon
} from '@mui/icons-material';
import PageBuilderErrorBoundary from './PageBuilderErrorBoundary';
import websiteService from '../../services/websiteService';

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
  const [uploadingImage, setUploadingImage] = useState(false);
  const [editingImageComponent, setEditingImageComponent] = useState(null);

  // Available categories and tags for dental practice
  const categories = [
    { value: 'all', label: 'All Components' },
    { value: 'hero', label: 'Hero Sections' },
    { value: 'services', label: 'Dental Services' },
    { value: 'about', label: 'About Practice' },
    { value: 'team', label: 'Doctor & Team' },
    { value: 'testimonials', label: 'Patient Reviews' },
    { value: 'gallery', label: 'Practice Gallery' },
    { value: 'appointments', label: 'Booking Forms' },
    { value: 'contact', label: 'Contact Info' },
    { value: 'navigation', label: 'Navigation' },
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
    if (websiteId) {
      loadWebsite();
      loadComponents();
    } else {
      navigate('/websites');
    }
  }, [websiteId, navigate]);

  useEffect(() => {
    // Filter components based on search term, category, and tags
    let filtered = components;

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

  const loadWebsite = async () => {
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
  };

  const loadComponents = async () => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/builder/components/full`);

      if (response.ok) {
        const componentsData = await response.json();
        if (componentsData.components) {
          setComponents(componentsData.components);
          setFilteredComponents(componentsData.components);
          return;
        }
      }

      // Comprehensive dental-specific components
      const dentalComponents = [
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

      setComponents(dentalComponents);
      setFilteredComponents(dentalComponents);
    } catch (error) {
      console.error('Error loading components:', error);
      showSnackbar('Error loading components, using fallback', 'warning');
    }
  };

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

  const handleImageFileUpload = async (file) => {
    try {
      setUploadingImage(true);

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
    } finally {
      setUploadingImage(false);
    }
  };

  const extractImagesFromComponent = (component) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(component.component, 'text/html');
    const images = Array.from(doc.querySelectorAll('img'));
    return images.length > 0;
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
                    {categories.map(cat => (
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
                  {availableTags.map(tag => (
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

                <Grid container spacing={1}>
                  {filteredComponents.map((component) => (
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
                              {component.tags?.slice(0, 2).map(tag => (
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
                    {canvasComponents.map((component) => (
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
                    {selectedComponent.tags?.map(tag => (
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
                {extractedTexts.map((textItem, index) => (
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
                    {previewComponent.tags?.map(tag => (
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