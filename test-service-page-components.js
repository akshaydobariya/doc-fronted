// Test script to verify service page component generation
// This can be run in browser console to test the function

const testServicePageContent = {
  hero: {
    title: "Laser Dentistry - Advanced Treatment",
    subtitle: "Pain-free procedures with cutting-edge technology",
    description: "Experience the future of dental care with our state-of-the-art laser treatments.",
    ctaText: "Book Consultation"
  },
  overview: {
    title: "What is Laser Dentistry?",
    content: "Laser dentistry represents the latest advancement in dental care technology.",
    highlights: [
      "Minimally invasive procedures",
      "Faster healing times",
      "Reduced discomfort"
    ]
  },
  benefits: {
    title: "Why Choose Laser Dentistry?",
    introduction: "Discover the advantages of modern laser dental treatments.",
    list: [
      {
        icon: "⚡",
        title: "Pain-Free Treatment",
        description: "Laser technology reduces discomfort during procedures."
      },
      {
        icon: "🔬",
        title: "Precision Care",
        description: "Highly accurate treatment targeting specific areas."
      }
    ]
  },
  procedure: {
    title: "The Laser Dentistry Process",
    introduction: "Our step-by-step approach ensures optimal results.",
    steps: [
      {
        stepNumber: 1,
        title: "Consultation",
        description: "Comprehensive examination and treatment planning.",
        duration: "30 minutes"
      },
      {
        stepNumber: 2,
        title: "Laser Treatment",
        description: "Precise laser application for optimal results.",
        duration: "45-60 minutes"
      }
    ]
  },
  faq: {
    title: "Frequently Asked Questions",
    introduction: "Get answers to common questions about laser dentistry.",
    questions: [
      {
        question: "Is laser dentistry safe?",
        answer: "Yes, laser dentistry is FDA-approved and has been safely used for decades."
      },
      {
        question: "How long does recovery take?",
        answer: "Most patients experience faster healing compared to traditional methods."
      }
    ]
  },
  cta: {
    title: "Ready to Experience Laser Dentistry?",
    subtitle: "Schedule your consultation today",
    buttonText: "Book Now",
    phoneNumber: "(555) 123-4567",
    email: "info@dentalpractice.com"
  }
};

// Function to test component generation (copy from SimpleDragDropBuilder.js)
function generateServicePageComponents(content) {
  const components = [];
  let componentId = 1;

  // Hero Section Component
  if (content.hero) {
    const heroId = `service-hero-${componentId++}`;
    components.push({
      id: heroId,
      type: 'ServiceHero',
      name: 'Service Hero Section',
      category: 'hero',
      description: 'Professional service hero with call-to-action',
      tags: ['hero', 'service', 'cta'],
      instanceId: `${heroId}-${Date.now()}`,
      component: `
        <section class="service-hero" style="background: linear-gradient(135deg, #F66123, #FF8C42); color: white; text-align: center; padding: 80px 20px;">
          <div class="container" style="max-width: 1200px; margin: 0 auto;">
            <h1 data-text="true" style="font-size: 3.5rem; font-weight: bold; margin-bottom: 1rem; line-height: 1.2;">
              ${content.hero.title || 'Professional Dental Service'}
            </h1>
            <p data-text="true" style="font-size: 1.5rem; margin-bottom: 1rem; opacity: 0.95;">
              ${content.hero.subtitle || 'Expert care with advanced technology'}
            </p>
            <p data-text="true" style="font-size: 1.1rem; margin-bottom: 2rem; opacity: 0.9; max-width: 600px; margin-left: auto; margin-right: auto;">
              ${content.hero.description || 'Experience the latest in dental care with our professional team'}
            </p>
            <a href="#contact" data-text="true" style="background: #32373c; color: white; padding: 15px 40px; text-decoration: none; border-radius: 7px; font-weight: 600; display: inline-block; margin: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.3); transition: transform 0.3s;">
              ${content.hero.ctaText || 'Book Consultation'}
            </a>
          </div>
        </section>
      `,
      props: content.hero,
      config: content.hero
    });
  }

  return components;
}

// Test the function
console.log('Testing service page component generation...');
const generatedComponents = generateServicePageComponents(testServicePageContent);
console.log('Generated components:', generatedComponents);
console.log('Number of components:', generatedComponents.length);
console.log('First component structure:', generatedComponents[0]);

// Check if components have required Destack properties
const firstComponent = generatedComponents[0];
console.log('Component validation:');
console.log('- Has ID:', !!firstComponent.id);
console.log('- Has instanceId:', !!firstComponent.instanceId);
console.log('- Has component field:', !!firstComponent.component);
console.log('- Has data-text attributes:', firstComponent.component.includes('data-text="true"'));
console.log('- Has proper styling:', firstComponent.component.includes('#F66123'));