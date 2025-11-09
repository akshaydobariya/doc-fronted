import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Blog Service
 * Handles all blog-related API calls
 */
class BlogService {
  constructor() {
    this.apiClient = axios.create({
      baseURL: `${API_BASE_URL}/blogs`,
      withCredentials: true,
    });
  }

  // Public blog endpoints
  async getAllBlogs(params = {}) {
    const { data } = await this.apiClient.get('/', { params });
    return data;
  }

  async getBlogBySlug(slug) {
    const { data } = await this.apiClient.get(`/slug/${slug}`);
    return data;
  }

  async getBlogsByService(servicePageId, limit = 6) {
    const { data } = await this.apiClient.get(`/service/${servicePageId}`, {
      params: { limit }
    });
    return data;
  }

  async getFeaturedBlogs(limit = 6) {
    const { data } = await this.apiClient.get('/featured', { params: { limit } });
    return data;
  }

  async getRelatedBlogs(blogId, limit = 3) {
    const { data } = await this.apiClient.get(`/related/${blogId}`, {
      params: { limit }
    });
    return data;
  }

  async searchBlogs(query, filters = {}) {
    const { data } = await this.apiClient.get('/search', {
      params: { q: query, ...filters }
    });
    return data;
  }

  async getBlogsByCategory(category, limit = 10) {
    const { data } = await this.apiClient.get(`/category/${category}`, {
      params: { limit }
    });
    return data;
  }

  // Admin blog endpoints (require authentication)
  async createBlog(blogData) {
    const { data } = await this.apiClient.post('/', blogData);
    return data;
  }

  async generateBlog(generationData) {
    const { data } = await this.apiClient.post('/generate', generationData);
    return data;
  }

  async updateBlog(blogId, blogData) {
    const { data } = await this.apiClient.put(`/${blogId}`, blogData);
    return data;
  }

  async deleteBlog(blogId) {
    const { data } = await this.apiClient.delete(`/${blogId}`);
    return data;
  }

  async togglePublishBlog(blogId) {
    const { data } = await this.apiClient.patch(`/${blogId}/toggle-publish`);
    return data;
  }

  // Utility methods
  formatReadingTime(minutes) {
    return `${minutes} min read`;
  }

  formatPublishDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  generateBlogUrl(slug) {
    return `/blog/${slug}`;
  }

  generateBlogExcerpt(introduction, maxLength = 150) {
    if (!introduction) return '';
    return introduction.length > maxLength
      ? introduction.substring(0, maxLength) + '...'
      : introduction;
  }

  // Helper for blog cards
  formatBlogCardData(blog) {
    return {
      id: blog._id,
      title: blog.title,
      slug: blog.slug,
      excerpt: this.generateBlogExcerpt(blog.introduction),
      readingTime: this.formatReadingTime(blog.readingTime),
      publishDate: this.formatPublishDate(blog.publishedAt),
      category: blog.category,
      tags: blog.tags || [],
      url: this.generateBlogUrl(blog.slug),
      featuredImage: blog.featuredImage?.url || null,
      author: blog.author || 'Dr. Professional'
    };
  }
}

export default new BlogService();