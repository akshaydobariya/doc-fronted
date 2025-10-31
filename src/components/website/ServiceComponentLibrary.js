import React, { useState } from 'react';

const ServiceComponentLibrary = ({ onComponentAdd, editingCapabilities }) => {
  const [activeCategory, setActiveCategory] = useState('content');

  // Service-specific component definitions
  const componentCategories = {
    content: {
      label: 'Content Sections',
      icon: '📝',
      components: [
        {
          type: 'ServiceHero',
          name: 'Hero Section',
          description: 'Main header with title, subtitle, and call-to-action',
          icon: '🎯',
          defaultProps: {
            title: 'Professional Dental Service',
            subtitle: 'Expert care for your dental needs',
            description: 'Experience comprehensive dental care with our state-of-the-art technology and experienced team.',
            ctaText: 'Book Appointment',
            backgroundImage: '',
            backgroundColor: '#2563eb'
          }
        },
        {
          type: 'ServiceOverview',
          name: 'Service Overview',
          description: 'Detailed overview of the dental service',
          icon: '📋',
          defaultProps: {
            title: 'Service Overview',
            content: 'Our comprehensive dental service provides patients with the highest quality care using the latest technology and techniques.',
            highlights: [
              'State-of-the-art equipment',
              'Experienced professionals',
              'Personalized treatment plans'
            ]
          }
        },
        {
          type: 'ServiceBenefits',
          name: 'Benefits List',
          description: 'Showcase benefits of the dental service',
          icon: '✅',
          defaultProps: {
            title: 'Benefits of Our Service',
            introduction: 'Experience the advantages of choosing our dental care:',
            benefits: [
              {
                title: 'Pain-Free Procedure',
                description: 'Advanced techniques ensure comfortable treatment',
                icon: '😌'
              },
              {
                title: 'Quick Recovery',
                description: 'Minimally invasive approach for faster healing',
                icon: '⚡'
              },
              {
                title: 'Long-Lasting Results',
                description: 'Durable solutions that stand the test of time',
                icon: '⏱️'
              }
            ]
          }
        },
        {
          type: 'ServiceProcedure',
          name: 'Procedure Steps',
          description: 'Step-by-step procedure explanation',
          icon: '📝',
          defaultProps: {
            title: 'The Procedure',
            introduction: 'Our streamlined process ensures optimal results:',
            steps: [
              {
                stepNumber: 1,
                title: 'Initial Consultation',
                description: 'Comprehensive examination and treatment planning',
                duration: '30 minutes'
              },
              {
                stepNumber: 2,
                title: 'Preparation',
                description: 'Preparation of the treatment area',
                duration: '15 minutes'
              },
              {
                stepNumber: 3,
                title: 'Treatment',
                description: 'Professional treatment execution',
                duration: '45 minutes'
              },
              {
                stepNumber: 4,
                title: 'Follow-up',
                description: 'Post-treatment care and instructions',
                duration: '15 minutes'
              }
            ],
            additionalInfo: 'All procedures are performed in a comfortable, sterile environment with the latest dental technology.'
          }
        },
        {
          type: 'ServiceFAQ',
          name: 'FAQ Section',
          description: 'Frequently asked questions and answers',
          icon: '❓',
          defaultProps: {
            title: 'Frequently Asked Questions',
            introduction: 'Common questions about our dental service:',
            questions: [
              {
                question: 'How long does the procedure take?',
                answer: 'The typical procedure takes between 60-90 minutes, depending on individual needs.',
                order: 1
              },
              {
                question: 'Is the procedure painful?',
                answer: 'We use advanced pain management techniques to ensure your comfort throughout the procedure.',
                order: 2
              },
              {
                question: 'What is the recovery time?',
                answer: 'Most patients can return to normal activities within 24-48 hours.',
                order: 3
              }
            ]
          }
        }
      ]
    },
    layout: {
      label: 'Layout Elements',
      icon: '📐',
      components: [
        {
          type: 'TwoColumnSection',
          name: 'Two Column Layout',
          description: 'Split content into two columns',
          icon: '📊',
          defaultProps: {
            leftContent: {
              type: 'text',
              content: 'Left column content'
            },
            rightContent: {
              type: 'text',
              content: 'Right column content'
            },
            backgroundColor: '#ffffff'
          }
        },
        {
          type: 'ImageTextSection',
          name: 'Image & Text',
          description: 'Image alongside text content',
          icon: '🖼️',
          defaultProps: {
            image: '',
            title: 'Section Title',
            content: 'Descriptive text content',
            imagePosition: 'left',
            backgroundColor: '#ffffff'
          }
        },
        {
          type: 'VideoSection',
          name: 'Video Section',
          description: 'Embedded video with description',
          icon: '🎥',
          defaultProps: {
            videoUrl: '',
            title: 'Video Title',
            description: 'Video description',
            thumbnail: '',
            autoplay: false
          }
        }
      ]
    },
    interactive: {
      label: 'Interactive Elements',
      icon: '🎮',
      components: [
        {
          type: 'ServiceCTA',
          name: 'Call to Action',
          description: 'Compelling call-to-action section',
          icon: '🎯',
          defaultProps: {
            title: 'Ready to Schedule Your Appointment?',
            subtitle: 'Take the first step towards better dental health',
            buttonText: 'Book Now',
            phoneNumber: '(555) 123-4567',
            email: 'contact@dentalcare.com',
            backgroundColor: '#2563eb'
          }
        },
        {
          type: 'ContactForm',
          name: 'Contact Form',
          description: 'Patient contact and inquiry form',
          icon: '📋',
          defaultProps: {
            title: 'Get in Touch',
            fields: [
              { type: 'text', name: 'name', label: 'Full Name', required: true },
              { type: 'email', name: 'email', label: 'Email', required: true },
              { type: 'tel', name: 'phone', label: 'Phone Number', required: false },
              { type: 'textarea', name: 'message', label: 'Message', required: true }
            ],
            submitText: 'Send Message'
          }
        },
        {
          type: 'TestimonialSlider',
          name: 'Testimonials',
          description: 'Patient testimonials and reviews',
          icon: '💬',
          defaultProps: {
            title: 'What Our Patients Say',
            testimonials: [
              {
                name: 'Sarah Johnson',
                text: 'Excellent service and professional care. Highly recommended!',
                rating: 5,
                image: ''
              },
              {
                name: 'Michael Davis',
                text: 'The staff was friendly and the procedure was pain-free.',
                rating: 5,
                image: ''
              }
            ]
          }
        },
        {
          type: 'PricingTable',
          name: 'Pricing Table',
          description: 'Service pricing and packages',
          icon: '💰',
          defaultProps: {
            title: 'Service Pricing',
            plans: [
              {
                name: 'Basic Package',
                price: 299,
                priceNote: 'starting from',
                features: ['Initial consultation', 'Basic treatment', 'Follow-up visit'],
                isPopular: false
              },
              {
                name: 'Premium Package',
                price: 599,
                priceNote: 'starting from',
                features: ['Comprehensive consultation', 'Advanced treatment', 'Extended follow-up', 'Priority scheduling'],
                isPopular: true
              }
            ],
            disclaimer: 'Prices may vary based on individual treatment needs.'
          }
        }
      ]
    },
    media: {
      label: 'Media & Gallery',
      icon: '🖼️',
      components: [
        {
          type: 'ImageGallery',
          name: 'Image Gallery',
          description: 'Photo gallery for before/after images',
          icon: '📸',
          defaultProps: {
            title: 'Before & After Gallery',
            images: [],
            columns: 3,
            lightbox: true
          }
        },
        {
          type: 'BeforeAfterSlider',
          name: 'Before/After Slider',
          description: 'Interactive before and after comparison',
          icon: '🔄',
          defaultProps: {
            title: 'See the Results',
            cases: [
              {
                beforeImage: '',
                afterImage: '',
                title: 'Case Study 1',
                description: 'Dental restoration results'
              }
            ]
          }
        },
        {
          type: 'TeamSection',
          name: 'Team Members',
          description: 'Showcase dental team members',
          icon: '👥',
          defaultProps: {
            title: 'Meet Our Team',
            members: [
              {
                name: 'Dr. John Smith',
                title: 'Lead Dentist',
                bio: 'Experienced dental professional with 15+ years in practice',
                image: '',
                credentials: ['DDS', 'Cosmetic Dentistry Specialist']
              }
            ]
          }
        }
      ]
    }
  };

  const handleComponentAdd = (component) => {
    if (onComponentAdd) {
      onComponentAdd({
        type: component.type,
        props: { ...component.defaultProps },
        children: []
      });
    }
  };

  const isComponentAvailable = (component) => {
    if (!editingCapabilities) return true;

    // Check if component editing is allowed based on editing mode
    switch (component.type) {
      case 'ServiceHero':
      case 'ServiceOverview':
      case 'ServiceBenefits':
      case 'ServiceProcedure':
      case 'ServiceFAQ':
      case 'ServiceCTA':
        return editingCapabilities.canEditContent;

      case 'TwoColumnSection':
      case 'ImageTextSection':
      case 'VideoSection':
        return editingCapabilities.canEditLayout;

      default:
        return editingCapabilities.canEditComponents;
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Component Library</h3>
        <p className="text-sm text-gray-600 mt-1">
          Add service-specific components to build your page
        </p>
      </div>

      {/* Category Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-4" aria-label="Tabs">
          {Object.entries(componentCategories).map(([key, category]) => (
            <button
              key={key}
              onClick={() => setActiveCategory(key)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeCategory === key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{category.icon}</span>
              {category.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Component Grid */}
      <div className="p-4 max-h-96 overflow-y-auto">
        <div className="grid grid-cols-1 gap-3">
          {componentCategories[activeCategory].components.map((component) => {
            const available = isComponentAvailable(component);

            return (
              <div
                key={component.type}
                className={`p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors ${
                  available
                    ? 'cursor-pointer hover:bg-gray-50'
                    : 'opacity-50 cursor-not-allowed bg-gray-50'
                }`}
                onClick={() => available && handleComponentAdd(component)}
              >
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">{component.icon}</span>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900">
                      {component.name}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">
                      {component.description}
                    </p>
                    {!available && (
                      <p className="text-xs text-red-500 mt-1">
                        Not available in current editing mode
                      </p>
                    )}
                  </div>
                  <button
                    className={`text-sm px-2 py-1 rounded ${
                      available
                        ? 'text-blue-600 hover:bg-blue-50'
                        : 'text-gray-400 cursor-not-allowed'
                    }`}
                    disabled={!available}
                  >
                    Add
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Help Text */}
      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <p className="text-xs text-gray-600">
          💡 <strong>Tip:</strong> Components are customized for dental services and include
          industry-specific content and layouts. Drag and drop to reorder components after adding them.
        </p>
      </div>
    </div>
  );
};

// Default props
ServiceComponentLibrary.defaultProps = {
  editingCapabilities: {
    canEditContent: true,
    canEditComponents: true,
    canEditLayout: true
  },
  onComponentAdd: () => {}
};

export default ServiceComponentLibrary;