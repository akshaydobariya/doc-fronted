import { useState, useEffect, useRef } from 'react';
import serviceService from '../services/serviceService';

// Global cache object to store services data across all header components
// Using a Map to cache data per website
const servicesCache = new Map();

// Cache duration in milliseconds (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

/**
 * Shared Services Hook
 * Provides cached services data to prevent multiple API calls from different header components
 */
const useSharedServices = (websiteId = null) => {
  const cacheKey = websiteId || 'general';
  const cache = servicesCache.get(cacheKey) || {
    data: null,
    categories: null,
    timestamp: null,
    isLoading: false,
    promise: null,
    error: null
  };

  const [services, setServices] = useState(cache.data || []);
  const [categories, setCategories] = useState(cache.categories || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const isCacheValid = () => {
    if (!cache.data || !cache.timestamp) {
      return false;
    }
    return (Date.now() - cache.timestamp) < CACHE_DURATION;
  };

  const loadServicesData = async () => {
    // If cache is valid, use cached data
    if (isCacheValid()) {
      console.log(`🟢 Using cached services data for ${cacheKey}`);
      setServices(cache.data);
      setCategories(cache.categories);
      setError(cache.error);
      return Promise.resolve({
        services: cache.data,
        categories: cache.categories
      });
    }

    // If already loading, wait for existing promise
    if (cache.isLoading && cache.promise) {
      console.log(`🟡 Waiting for existing API call to complete for ${cacheKey}`);
      setLoading(true);
      try {
        const result = await cache.promise;
        if (mountedRef.current) {
          setServices(result.services);
          setCategories(result.categories);
          setError(null);
          setLoading(false);
        }
        return result;
      } catch (err) {
        if (mountedRef.current) {
          setError(err.message);
          setLoading(false);
        }
        throw err;
      }
    }

    // Start new API call
    console.log(`🔴 Making new API call for services (${cacheKey})`);
    cache.isLoading = true;
    setLoading(true);
    setError(null);

    cache.promise = (async () => {
      try {
        let servicesResponse, categoriesResponse;

        if (websiteId) {
          // Use website-specific API endpoint for integrated services
          console.log(`🎯 Loading services for website: ${websiteId}`);
          [servicesResponse, categoriesResponse] = await Promise.all([
            serviceService.getServicePages(websiteId, { isIntegrated: true, status: 'all' }),
            serviceService.getCategories()
          ]);
        } else {
          // Fallback to general services for components without websiteId
          console.log('📊 Loading general services');
          [servicesResponse, categoriesResponse] = await Promise.all([
            serviceService.getAllServices({ isActive: true }),
            serviceService.getCategories()
          ]);
        }

        let servicesData;
        const categoriesData = categoriesResponse.data || [];

        if (websiteId) {
          // For service pages API, extract the service data from serviceId field
          const servicePages = servicesResponse.data || [];
          servicesData = servicePages.map(servicePage => {
            // If serviceId is populated (service object), use it directly
            if (servicePage.serviceId && typeof servicePage.serviceId === 'object') {
              return servicePage.serviceId;
            }
            // If serviceId is just an ID string, we need to create a minimal service object
            return {
              _id: servicePage.serviceId || servicePage._id,
              name: servicePage.title || 'Unnamed Service',
              category: servicePage.category || 'general',
              slug: servicePage.slug || servicePage._id,
              // Add other fields from service page if needed
              shortDescription: servicePage.description || ''
            };
          }).filter(Boolean); // Remove any null/undefined services
        } else {
          // For regular services API, use data directly
          servicesData = servicesResponse.data || [];
        }

        // Update cache
        cache.data = servicesData;
        cache.categories = categoriesData;
        cache.timestamp = Date.now();
        cache.error = null;
        cache.isLoading = false;

        // Store the updated cache back in the map
        servicesCache.set(cacheKey, cache);

        const result = {
          services: servicesData,
          categories: categoriesData
        };

        // Update component state if still mounted
        if (mountedRef.current) {
          setServices(servicesData);
          setCategories(categoriesData);
          setLoading(false);
        }

        console.log(`✅ Services loaded: ${servicesData.length} services, ${categoriesData.length} categories`);
        return result;

      } catch (err) {
        console.error(`❌ Error loading services for ${cacheKey}:`, err);
        cache.error = err.message;
        cache.isLoading = false;

        // Store the updated cache back in the map
        servicesCache.set(cacheKey, cache);

        if (mountedRef.current) {
          setError(err.message);
          setServices([]);
          setCategories([]);
          setLoading(false);
        }

        throw err;
      } finally {
        cache.promise = null;
        servicesCache.set(cacheKey, cache);
      }
    })();

    return cache.promise;
  };

  const clearCache = () => {
    console.log(`🗑️ Clearing services cache for ${cacheKey}`);
    servicesCache.delete(cacheKey);
  };

  const filterServices = (selectedServiceIds = [], showAllServices = false, maxServices = null) => {
    let filteredServices = services;

    // Filter by selected IDs if not showing all
    if (!showAllServices && selectedServiceIds.length > 0) {
      filteredServices = services.filter(service =>
        selectedServiceIds.includes(service._id)
      );
    }

    // Limit number of services
    if (maxServices && filteredServices.length > maxServices) {
      filteredServices = filteredServices.slice(0, maxServices);
    }

    return filteredServices;
  };

  const groupServicesByCategory = (servicesToGroup, categoriesData = categories) => {
    return servicesToGroup.reduce((acc, service) => {
      const categoryId = service.category || 'general';
      if (!acc[categoryId]) {
        acc[categoryId] = [];
      }
      acc[categoryId].push(service);
      return acc;
    }, {});
  };

  const getCategoryDisplayName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : categoryId.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getCategoryIcon = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.icon : '🦷';
  };

  // Auto-load on mount if no cache exists
  useEffect(() => {
    if (!isCacheValid() && !cache.isLoading) {
      loadServicesData().catch(console.error);
    } else if (isCacheValid()) {
      // Use cached data immediately
      setServices(cache.data);
      setCategories(cache.categories);
      setError(cache.error);
    }
  }, [websiteId]); // Re-run when websiteId changes

  return {
    services,
    categories,
    loading,
    error,
    loadServicesData,
    clearCache,
    filterServices,
    groupServicesByCategory,
    getCategoryDisplayName,
    getCategoryIcon,
    isCacheValid: isCacheValid(),
    cacheTimestamp: cache.timestamp
  };
};

export default useSharedServices;