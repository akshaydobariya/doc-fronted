/**
 * SEO Utilities
 * Helper functions for generating SEO metadata for dental services and pages
 */

/**
 * Generate optimized meta title for dental services
 * @param {string} serviceName - Name of the dental service
 * @param {string} practiceLocation - Location of the practice (optional)
 * @param {string} practiceName - Name of the practice (optional)
 * @returns {string} Optimized meta title
 */
export const generateServiceMetaTitle = (serviceName, practiceLocation = '', practiceName = '') => {
  const locationPart = practiceLocation ? ` in ${practiceLocation}` : '';
  const practicePart = practiceName ? ` | ${practiceName}` : ' | Professional Dental Care';

  // Keep within 60 character limit
  const baseTitle = `${serviceName}${locationPart}${practicePart}`;

  if (baseTitle.length <= 60) {
    return baseTitle;
  }

  // Fallback to shorter version if too long
  return `${serviceName}${practicePart}`.substring(0, 60);
};

/**
 * Generate optimized meta description for dental services
 * @param {string} serviceName - Name of the dental service
 * @param {string} serviceDescription - Brief description of the service
 * @param {string} practiceLocation - Location of the practice (optional)
 * @param {Array} benefits - Key benefits of the service (optional)
 * @returns {string} Optimized meta description
 */
export const generateServiceMetaDescription = (serviceName, serviceDescription, practiceLocation = '', benefits = []) => {
  const locationPart = practiceLocation ? ` in ${practiceLocation}` : '';
  const benefitsPart = benefits.length > 0 ? ` Benefits: ${benefits.slice(0, 2).join(', ')}.` : '';

  let description = `${serviceDescription}${locationPart}.${benefitsPart} Schedule your consultation today.`;

  // Keep within 160 character limit
  if (description.length > 160) {
    description = `${serviceDescription}${locationPart}. Schedule consultation today.`;
  }

  if (description.length > 160) {
    description = `${serviceDescription}. Book appointment today.`;
  }

  return description.substring(0, 160);
};

/**
 * Generate SEO-optimized keywords for dental services
 * @param {string} serviceName - Name of the dental service
 * @param {string} category - Service category
 * @param {string} practiceLocation - Location of the practice (optional)
 * @param {Array} customKeywords - Additional custom keywords (optional)
 * @returns {Array} Array of SEO keywords
 */
export const generateServiceKeywords = (serviceName, category, practiceLocation = '', customKeywords = []) => {
  const baseKeywords = [
    serviceName.toLowerCase(),
    `${serviceName.toLowerCase()} treatment`,
    `${serviceName.toLowerCase()} procedure`,
    'dental care',
    'dentist',
    category.replace('-', ' ')
  ];

  const locationKeywords = practiceLocation ? [
    `dentist ${practiceLocation.toLowerCase()}`,
    `${serviceName.toLowerCase()} ${practiceLocation.toLowerCase()}`,
    `dental care ${practiceLocation.toLowerCase()}`
  ] : [];

  const categorySpecificKeywords = getCategorySpecificKeywords(category);

  // Combine all keywords and remove duplicates
  const allKeywords = [
    ...baseKeywords,
    ...locationKeywords,
    ...categorySpecificKeywords,
    ...customKeywords
  ];

  return [...new Set(allKeywords)].slice(0, 10); // Limit to 10 keywords
};

/**
 * Get category-specific keywords
 * @param {string} category - Service category
 * @returns {Array} Category-specific keywords
 */
const getCategorySpecificKeywords = (category) => {
  const categoryKeywords = {
    'general-dentistry': [
      'preventive care',
      'oral health',
      'dental checkup',
      'teeth cleaning',
      'dental fillings',
      'routine care'
    ],
    'cosmetic-dentistry': [
      'smile makeover',
      'teeth whitening',
      'cosmetic dentist',
      'beautiful smile',
      'aesthetic dentistry',
      'smile enhancement'
    ],
    'orthodontics': [
      'teeth straightening',
      'braces',
      'clear aligners',
      'orthodontist',
      'bite correction',
      'crooked teeth'
    ],
    'oral-surgery': [
      'dental implants',
      'tooth extraction',
      'oral surgeon',
      'surgical dentistry',
      'wisdom teeth',
      'dental surgery'
    ],
    'pediatric-dentistry': [
      'kids dentist',
      'children dental care',
      'pediatric dentist',
      'child friendly',
      'family dentistry',
      'kids oral health'
    ],
    'emergency-dentistry': [
      'dental emergency',
      'urgent dental care',
      'tooth pain',
      'emergency dentist',
      'same day appointment',
      'dental trauma'
    ],
    'periodontics': [
      'gum disease',
      'gum treatment',
      'periodontist',
      'gingivitis',
      'gum health',
      'periodontal therapy'
    ],
    'endodontics': [
      'root canal',
      'endodontist',
      'root canal therapy',
      'tooth pain relief',
      'pulp treatment',
      'save tooth'
    ],
    'prosthodontics': [
      'dental prosthetics',
      'crowns and bridges',
      'dentures',
      'tooth replacement',
      'prosthodontist',
      'restorative dentistry'
    ]
  };

  return categoryKeywords[category] || [];
};

/**
 * Generate structured data (Schema.org) for dental services
 * @param {Object} service - Service object
 * @param {Object} practice - Practice information
 * @returns {Object} Schema.org structured data
 */
export const generateServiceStructuredData = (service, practice = {}) => {
  return {
    "@context": "https://schema.org",
    "@type": "MedicalProcedure",
    "name": service.name,
    "description": service.shortDescription || service.fullDescription,
    "procedureType": service.category?.replace('-', ' ') || "Dental Procedure",
    "bodyLocation": "Mouth",
    "provider": {
      "@type": "Dentist",
      "name": practice.name || "Dental Practice",
      "url": practice.website || "",
      "address": practice.address ? {
        "@type": "PostalAddress",
        "streetAddress": practice.address.street,
        "addressLocality": practice.address.city,
        "addressRegion": practice.address.state,
        "postalCode": practice.address.zipCode
      } : undefined,
      "telephone": practice.phone || "",
      "priceRange": service.pricing ? generatePriceRange(service.pricing) : undefined
    },
    "offers": service.pricing ? {
      "@type": "Offer",
      "price": service.pricing.basePrice || service.pricing.priceRange?.min,
      "priceCurrency": service.pricing.currency || "USD",
      "availability": "https://schema.org/InStock"
    } : undefined
  };
};

/**
 * Generate price range string for structured data
 * @param {Object} pricing - Pricing object
 * @returns {string} Price range string
 */
const generatePriceRange = (pricing) => {
  if (pricing.hasFixedPrice && pricing.basePrice) {
    return `$${pricing.basePrice}`;
  }

  if (pricing.priceRange) {
    if (pricing.priceRange.min && pricing.priceRange.max) {
      return `$${pricing.priceRange.min}-$${pricing.priceRange.max}`;
    }
    if (pricing.priceRange.min) {
      return `$${pricing.priceRange.min}+`;
    }
  }

  return '$';
};

/**
 * Generate Open Graph metadata for social sharing
 * @param {Object} service - Service object
 * @param {Object} practice - Practice information
 * @param {string} pageUrl - Full URL of the page
 * @returns {Object} Open Graph metadata
 */
export const generateOpenGraphData = (service, practice = {}, pageUrl = '') => {
  return {
    'og:title': generateServiceMetaTitle(service.name, practice.location, practice.name),
    'og:description': generateServiceMetaDescription(
      service.name,
      service.shortDescription,
      practice.location,
      service.benefits?.slice(0, 2)
    ),
    'og:type': 'website',
    'og:url': pageUrl,
    'og:image': service.media?.featuredImage || practice.defaultImage || '',
    'og:site_name': practice.name || 'Dental Practice',
    'og:locale': 'en_US'
  };
};

/**
 * Generate Twitter Card metadata
 * @param {Object} service - Service object
 * @param {Object} practice - Practice information
 * @returns {Object} Twitter Card metadata
 */
export const generateTwitterCardData = (service, practice = {}) => {
  return {
    'twitter:card': 'summary_large_image',
    'twitter:title': generateServiceMetaTitle(service.name, practice.location, practice.name),
    'twitter:description': generateServiceMetaDescription(
      service.name,
      service.shortDescription,
      practice.location,
      service.benefits?.slice(0, 2)
    ),
    'twitter:image': service.media?.featuredImage || practice.defaultImage || '',
    'twitter:site': practice.twitterHandle || ''
  };
};

/**
 * Generate canonical URL for service page
 * @param {string} baseUrl - Base website URL
 * @param {string} serviceSlug - Service slug
 * @returns {string} Canonical URL
 */
export const generateCanonicalUrl = (baseUrl, serviceSlug) => {
  const cleanBaseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
  return `${cleanBaseUrl}/services/${serviceSlug}`;
};

/**
 * Generate sitemap entry for service page
 * @param {Object} service - Service object
 * @param {string} baseUrl - Base website URL
 * @param {Date} lastModified - Last modification date
 * @returns {Object} Sitemap entry
 */
export const generateSitemapEntry = (service, baseUrl, lastModified = new Date()) => {
  return {
    url: generateCanonicalUrl(baseUrl, service.slug),
    lastModified: lastModified.toISOString(),
    changeFrequency: 'monthly',
    priority: service.isPopular ? 0.8 : 0.6
  };
};

/**
 * Validate SEO metadata
 * @param {Object} seoData - SEO metadata to validate
 * @returns {Object} Validation result with suggestions
 */
export const validateSEOMetadata = (seoData) => {
  const issues = [];
  const suggestions = [];

  // Meta title validation
  if (!seoData.metaTitle) {
    issues.push('Missing meta title');
  } else if (seoData.metaTitle.length < 30) {
    suggestions.push('Meta title is quite short. Consider adding location or practice name.');
  } else if (seoData.metaTitle.length > 60) {
    issues.push('Meta title is too long (over 60 characters)');
  }

  // Meta description validation
  if (!seoData.metaDescription) {
    issues.push('Missing meta description');
  } else if (seoData.metaDescription.length < 120) {
    suggestions.push('Meta description could be longer. Consider adding benefits or call-to-action.');
  } else if (seoData.metaDescription.length > 160) {
    issues.push('Meta description is too long (over 160 characters)');
  }

  // Keywords validation
  if (!seoData.keywords || seoData.keywords.length === 0) {
    issues.push('No keywords specified');
  } else if (seoData.keywords.length > 10) {
    suggestions.push('Consider reducing keywords to focus on most important terms.');
  }

  // Focus keyword validation
  if (seoData.focusKeyword) {
    const titleIncludesFocus = seoData.metaTitle?.toLowerCase().includes(seoData.focusKeyword.toLowerCase());
    const descriptionIncludesFocus = seoData.metaDescription?.toLowerCase().includes(seoData.focusKeyword.toLowerCase());

    if (!titleIncludesFocus) {
      suggestions.push('Consider including focus keyword in meta title');
    }
    if (!descriptionIncludesFocus) {
      suggestions.push('Consider including focus keyword in meta description');
    }
  }

  return {
    isValid: issues.length === 0,
    issues,
    suggestions,
    score: Math.max(0, 100 - (issues.length * 20) - (suggestions.length * 5))
  };
};

/**
 * Generate complete SEO package for a service
 * @param {Object} service - Service object
 * @param {Object} practice - Practice information
 * @param {string} pageUrl - Full URL of the page
 * @returns {Object} Complete SEO metadata package
 */
export const generateCompleteSEOPackage = (service, practice = {}, pageUrl = '') => {
  const metaTitle = generateServiceMetaTitle(service.name, practice.location, practice.name);
  const metaDescription = generateServiceMetaDescription(
    service.name,
    service.shortDescription,
    practice.location,
    service.benefits
  );
  const keywords = generateServiceKeywords(
    service.name,
    service.category,
    practice.location,
    practice.customKeywords
  );

  const seoPackage = {
    basic: {
      metaTitle,
      metaDescription,
      keywords,
      focusKeyword: service.name.toLowerCase(),
      canonicalUrl: generateCanonicalUrl(practice.baseUrl || '', service.slug)
    },
    structured: generateServiceStructuredData(service, practice),
    openGraph: generateOpenGraphData(service, practice, pageUrl),
    twitterCard: generateTwitterCardData(service, practice),
    sitemap: generateSitemapEntry(service, practice.baseUrl || '', new Date())
  };

  // Add validation
  seoPackage.validation = validateSEOMetadata(seoPackage.basic);

  return seoPackage;
};