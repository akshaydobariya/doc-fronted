// Modern Header Components Export
// This file exports all modern header variants for the website builder

export { default as DynamicNavigationHeader } from '../DynamicNavigationHeader';
export { default as ModernMinimalistHeader } from '../ModernMinimalistHeader';
export { default as GlassmorphismHeader } from '../GlassmorphismHeader';
export { default as GradientModernHeader } from '../GradientModernHeader';
export { default as CorporateProfessionalHeader } from '../CorporateProfessionalHeader';
export { default as FuturisticTechHeader } from '../FuturisticTechHeader';

// Header component registry for dynamic loading
export const HEADER_COMPONENTS = {
  DynamicNavigationHeader: () => import('../DynamicNavigationHeader'),
  ModernMinimalistHeader: () => import('../ModernMinimalistHeader'),
  GlassmorphismHeader: () => import('../GlassmorphismHeader'),
  GradientModernHeader: () => import('../GradientModernHeader'),
  CorporateProfessionalHeader: () => import('../CorporateProfessionalHeader'),
  FuturisticTechHeader: () => import('../FuturisticTechHeader'),
};

// Header metadata for the builder
export const HEADER_METADATA = {
  'modern-minimalist-header': {
    id: 'modern-minimalist-header',
    name: 'Modern Minimalist Header',
    description: 'Clean, minimal design with perfect typography',
    componentName: 'ModernMinimalistHeader',
    category: 'navigation',
    tags: ['minimal', 'clean', 'modern', 'navigation'],
    primaryColor: '#2563eb',
    textColor: '#1f2937',
    preview: '/assets/previews/minimalist-header.jpg'
  },
  'glassmorphism-header': {
    id: 'glassmorphism-header',
    name: 'Glassmorphism Header',
    description: 'Modern glass effect with backdrop blur',
    componentName: 'GlassmorphismHeader',
    category: 'navigation',
    tags: ['glass', 'blur', 'modern', 'transparent'],
    primaryColor: '#6366f1',
    textColor: '#1e293b',
    preview: '/assets/previews/glassmorphism-header.jpg'
  },
  'gradient-modern-header': {
    id: 'gradient-modern-header',
    name: 'Gradient Modern Header',
    description: 'Bold gradient design with vibrant colors',
    componentName: 'GradientModernHeader',
    category: 'navigation',
    tags: ['gradient', 'colorful', 'bold', 'vibrant'],
    primaryColor: '#8b5cf6',
    secondaryColor: '#06b6d4',
    textColor: '#ffffff',
    preview: '/assets/previews/gradient-header.jpg'
  },
  'corporate-professional-header': {
    id: 'corporate-professional-header',
    name: 'Corporate Professional Header',
    description: 'Business-focused design with professional styling',
    componentName: 'CorporateProfessionalHeader',
    category: 'navigation',
    tags: ['corporate', 'professional', 'business', 'formal'],
    primaryColor: '#1565c0',
    secondaryColor: '#0d47a1',
    textColor: '#263238',
    preview: '/assets/previews/corporate-header.jpg'
  },
  'futuristic-tech-header': {
    id: 'futuristic-tech-header',
    name: 'Futuristic Tech Header',
    description: 'High-tech design with neon accents and animations',
    componentName: 'FuturisticTechHeader',
    category: 'navigation',
    tags: ['futuristic', 'tech', 'neon', 'animated'],
    primaryColor: '#00ff88',
    secondaryColor: '#0099ff',
    accentColor: '#ff0066',
    textColor: '#ffffff',
    preview: '/assets/previews/futuristic-header.jpg'
  }
};

// Helper function to get header configuration by type
export const getHeaderConfig = (headerType) => {
  return HEADER_METADATA[`${headerType}-header`] || HEADER_METADATA['modern-minimalist-header'];
};

// Helper function to dynamically load header component
export const loadHeaderComponent = async (componentName) => {
  if (HEADER_COMPONENTS[componentName]) {
    const module = await HEADER_COMPONENTS[componentName]();
    return module.default;
  }
  throw new Error(`Header component ${componentName} not found`);
};