/**
 * Shopify Configuration for U INSPIRE Wall
 * 
 * IMPORTANT: Never commit real API keys to version control
 * Use environment variables in production
 */

// SHOPIFY CONFIGURATION
const SHOPIFY_CONFIG = {
  // Replace with your actual Shopify store domain
  SHOP_DOMAIN: process.env.SHOPIFY_SHOP_DOMAIN || 'uninspiredcollective.myshopify.com',
  
  // API Version
  API_VERSION: '2024-01',
  
  // Admin API Configuration
  ADMIN_API: {
    ACCESS_TOKEN: process.env.SHOPIFY_ACCESS_TOKEN || 'shppa_XXXXXXXXXXXXXXXX',
    
    get ENDPOINTS() {
      const baseUrl = `https://${SHOPIFY_CONFIG.SHOP_DOMAIN}/admin/api/${SHOPIFY_CONFIG.API_VERSION}`;
      return {
        PRODUCTS: `${baseUrl}/products.json`,
        COLLECTIONS: `${baseUrl}/custom_collections.json`,
        CUSTOMERS: `${baseUrl}/customers.json`,
        ORDERS: `${baseUrl}/orders.json`,
        METAFIELDS: `${baseUrl}/metafields.json`,
        FILES: `${baseUrl}/files.json`
      };
    },
    
    get HEADERS() {
      return {
        'X-Shopify-Access-Token': this.ACCESS_TOKEN,
        'Content-Type': 'application/json'
      };
    }
  },
  
  // Storefront API Configuration
  STOREFRONT_API: {
    ACCESS_TOKEN: process.env.SHOPIFY_STOREFRONT_TOKEN || 'XXXXXXXXXXXXXXXX',
    
    get ENDPOINT() {
      return `https://${SHOPIFY_CONFIG.SHOP_DOMAIN}/api/${SHOPIFY_CONFIG.API_VERSION}/graphql.json`;
    },
    
    get HEADERS() {
      return {
        'X-Shopify-Storefront-Access-Token': this.ACCESS_TOKEN,
        'Content-Type': 'application/json'
      };
    }
  },
  
  // Webhook Configuration
  WEBHOOK_SECRET: process.env.SHOPIFY_WEBHOOK_SECRET || 'your_webhook_secret_here',
  
  // Product Configuration
  PRODUCT_DEFAULTS: {
    vendor: 'UNINSPIRED™',
    product_type: 'Capsule Collection',
    status: 'draft', // Start as draft for review
    published: false,
    template_suffix: 'capsule-thread'
  },
  
  // Pricing Configuration
  PRICING: {
    base_price: '45.00',
    currency: 'USD',
    sizes: ['S', 'M', 'L', 'XL'],
    inventory_per_size: {
      'S': 25,
      'M': 50, 
      'L': 50,
      'XL': 25
    }
  }
};

// SHOPIFY API HELPER CLASS
class ShopifyAPI {
  constructor() {
    this.adminAPI = SHOPIFY_CONFIG.ADMIN_API;
    this.storefrontAPI = SHOPIFY_CONFIG.STOREFRONT_API;
  }

  // Validate configuration
  isConfigured() {
    return SHOPIFY_CONFIG.SHOP_DOMAIN && 
           SHOPIFY_CONFIG.SHOP_DOMAIN !== 'uninspiredcollective.myshopify.com' &&
           this.adminAPI.ACCESS_TOKEN && 
           this.adminAPI.ACCESS_TOKEN !== 'shppa_XXXXXXXXXXXXXXXX';
  }

  // Create product from featured thread
  async createCapsuleProduct(thread) {
    if (!this.isConfigured()) {
      throw new Error('Shopify not configured. Please update config/shopify-config.js');
    }

    const productData = {
      product: {
        title: `Thread #${String(thread.thread_number || '001').padStart(3, '0')} - ${EMOTION_LABELS[thread.emotion] || 'Hope'}`,
        body_html: this.generateProductDescription(thread),
        vendor: SHOPIFY_CONFIG.PRODUCT_DEFAULTS.vendor,
        product_type: SHOPIFY_CONFIG.PRODUCT_DEFAULTS.product_type,
        status: SHOPIFY_CONFIG.PRODUCT_DEFAULTS.status,
        published: SHOPIFY_CONFIG.PRODUCT_DEFAULTS.published,
        template_suffix: SHOPIFY_CONFIG.PRODUCT_DEFAULTS.template_suffix,
        tags: this.generateProductTags(thread),
        handle: `thread-${thread.thread_number || Date.now()}-${thread.emotion}`,
        
        // Product variants (sizes)
        variants: this.generateProductVariants(),
        
        // Product options
        options: [
          {
            name: 'Size',
            values: SHOPIFY_CONFIG.PRICING.sizes
          }
        ],
        
        // Product images (placeholder - replace with actual design generation)
        images: [
          {
            src: await this.generateThreadDesign(thread),
            alt: `Thread #${thread.thread_number} Design - ${thread.emotion}`
          }
        ],
        
        // SEO and metadata
        metafields: [
          {
            namespace: 'uninspired',
            key: 'thread_id',
            value: thread.id,
            type: 'single_line_text_field'
          },
          {
            namespace: 'uninspired',
            key: 'emotion',
            value: thread.emotion,
            type: 'single_line_text_field'
          },
          {
            namespace: 'uninspired',
            key: 'drop_id',
            value: thread.drop_id,
            type: 'single_line_text_field'
          },
          {
            namespace: 'uninspired',
            key: 'reaction_count',
            value: this.getTotalReactions(thread).toString(),
            type: 'number_integer'
          }
        ]
      }
    };

    try {
      const response = await fetch(this.adminAPI.ENDPOINTS.PRODUCTS, {
        method: 'POST',
        headers: this.adminAPI.HEADERS,
        body: JSON.stringify(productData)
      });

      if (!response.ok) {
        throw new Error(`Failed to create product: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      // Add to capsule collection
      await this.addToCollection(result.product.id, thread.drop_id);
      
      return result;
    } catch (error) {
      console.error('Error creating capsule product:', error);
      throw error;
    }
  }

  // Generate product description HTML
  generateProductDescription(thread) {
    const emotionColor = EMOTION_COLORS[thread.emotion] || '#b8ff10';
    const totalReactions = this.getTotalReactions(thread);
    
    return `
      <div class="thread-product-description">
        <div class="thread-story">
          <h3>Anonymous Story</h3>
          <blockquote style="border-left: 4px solid ${emotionColor}; padding-left: 16px; margin: 16px 0; font-style: italic;">
            "${thread.message}"
          </blockquote>
        </div>
        
        <div class="thread-metadata">
          <p><strong>Emotion:</strong> <span style="color: ${emotionColor};">${EMOTION_LABELS[thread.emotion] || 'Hope'}</span></p>
          <p><strong>Community Reactions:</strong> ${totalReactions} total reactions</p>
          <p><strong>Collection:</strong> ${thread.drop_id?.replace('_', ' ').toUpperCase()} - Breaking the Cycle</p>
        </div>
        
        <div class="capsule-info">
          <h4>About This Capsule</h4>
          <p>This design features an anonymous story that resonated deeply with our community. Every purchase supports the U INSPIRE Wall project and helps amplify voices that need to be heard.</p>
          <p><em>Part of the UNINSPIRED™ Collective - turning pain into purpose, one thread at a time.</em></p>
        </div>
        
        <div class="sizing-care">
          <h4>Size & Care</h4>
          <ul>
            <li>100% Premium Cotton</li>
            <li>Unisex sizing</li>
            <li>Machine wash cold, tumble dry low</li>
            <li>Print designed to last</li>
          </ul>
        </div>
      </div>
    `;
  }

  // Generate product tags
  generateProductTags(thread) {
    const tags = [
      'capsule',
      'u-inspire-wall',
      thread.emotion,
      thread.drop_id,
      'featured-thread',
      'anonymous-story',
      'community-driven',
      'limited-edition'
    ];
    
    // Add reaction-based tags
    const reactions = thread.reactions || {};
    if (reactions.heart > 50) tags.push('highly-loved');
    if (reactions.fire > 30) tags.push('powerful-story');
    if (reactions.sparkles > 20) tags.push('inspiring');
    
    return tags.join(', ');
  }

  // Generate product variants for different sizes
  generateProductVariants() {
    return SHOPIFY_CONFIG.PRICING.sizes.map(size => ({
      option1: size,
      price: SHOPIFY_CONFIG.PRICING.base_price,
      inventory_quantity: SHOPIFY_CONFIG.PRICING.inventory_per_size[size] || 25,
      inventory_management: 'shopify',
      fulfillment_service: 'manual',
      requires_shipping: true,
      taxable: true,
      sku: `UINSPIRE-${Date.now()}-${size}`,
      weight: 200, // grams
      weight_unit: 'g'
    }));
  }

  // Generate thread design (placeholder - integrate with design service)
  async generateThreadDesign(thread) {
    // In production, this would call your design generation service
    // For now, return a placeholder URL
    const designParams = new URLSearchParams({
      thread_id: thread.id,
      emotion: thread.emotion,
      message: thread.message.substring(0, 100),
      color: EMOTION_COLORS[thread.emotion]
    });
    
    // Replace with your actual design generation service
    return `https://placeholder-design-service.com/generate?${designParams}`;
  }

  // Create or get collection for drop
  async createDropCollection(drop) {
    if (!this.isConfigured()) {
      throw new Error('Shopify not configured. Please update config/shopify-config.js');
    }

    const collectionData = {
      custom_collection: {
        title: drop.title || 'Breaking the Cycle',
        body_html: drop.theme_summary || 'Anonymous stories from our community',
        handle: (drop.id || 'drop-003').toLowerCase().replace('_', '-'),
        sort_order: 'created-desc',
        published: true,
        template_suffix: 'capsule-collection'
      }
    };

    try {
      const response = await fetch(this.adminAPI.ENDPOINTS.COLLECTIONS, {
        method: 'POST',
        headers: this.adminAPI.HEADERS,
        body: JSON.stringify(collectionData)
      });

      if (!response.ok) {
        throw new Error(`Failed to create collection: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating collection:', error);
      throw error;
    }
  }

  // Add product to collection
  async addToCollection(productId, dropId) {
    // Implementation would depend on your collection structure
    // This is a simplified version
    try {
      const collectData = {
        collect: {
          product_id: productId,
          collection_id: await this.getCollectionId(dropId)
        }
      };

      const response = await fetch(`https://${SHOPIFY_CONFIG.SHOP_DOMAIN}/admin/api/${SHOPIFY_CONFIG.API_VERSION}/collects.json`, {
        method: 'POST',
        headers: this.adminAPI.HEADERS,
        body: JSON.stringify(collectData)
      });

      return await response.json();
    } catch (error) {
      console.error('Error adding to collection:', error);
      // Non-critical error, don't throw
    }
  }

  // Get collection ID by drop ID
  async getCollectionId(dropId) {
    // Simplified - in production, you'd cache these mappings
    return 'your_collection_id_here';
  }

  // Create customer for email notifications
  async createCustomer(email, source = 'u-inspire-wall') {
    if (!this.isConfigured()) {
      throw new Error('Shopify not configured. Please update config/shopify-config.js');
    }

    const customerData = {
      customer: {
        email: email,
        accepts_marketing: true,
        tags: `u-inspire-subscriber,${source}`,
        note: 'Signed up for capsule drop notifications via U INSPIRE Wall',
        marketing_opt_in_level: 'confirmed_opt_in'
      }
    };

    try {
      const response = await fetch(this.adminAPI.ENDPOINTS.CUSTOMERS, {
        method: 'POST',
        headers: this.adminAPI.HEADERS,
        body: JSON.stringify(customerData)
      });

      if (!response.ok) {
        throw new Error(`Failed to create customer: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  }

  // Update product with new reaction data
  async updateProductReactions(productId, thread) {
    const metafieldData = {
      metafield: {
        namespace: 'uninspired',
        key: 'reaction_count',
        value: this.getTotalReactions(thread).toString(),
        type: 'number_integer'
      }
    };

    try {
      const response = await fetch(`https://${SHOPIFY_CONFIG.SHOP_DOMAIN}/admin/api/${SHOPIFY_CONFIG.API_VERSION}/products/${productId}/metafields.json`, {
        method: 'POST',
        headers: this.adminAPI.HEADERS,
        body: JSON.stringify(metafieldData)
      });

      return await response.json();
    } catch (error) {
      console.error('Error updating product reactions:', error);
      // Non-critical error
    }
  }

  // Utility function to get total reactions
  getTotalReactions(thread) {
    const reactions = thread.reactions || {};
    return Object.values(reactions).reduce((sum, count) => sum + (count || 0), 0);
  }

  // Bulk create products from featured threads
  async createBulkCapsuleProducts(threads) {
    const results = [];
    const errors = [];

    for (const thread of threads) {
      try {
        const product = await this.createCapsuleProduct(thread);
        results.push(product);
        
        // Rate limiting - wait between requests
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        errors.push({ thread: thread.id, error: error.message });
      }
    }

    return { results, errors };
  }
}

// WEBHOOK HANDLERS
class ShopifyWebhooks {
  constructor() {
    this.secret = SHOPIFY_CONFIG.WEBHOOK_SECRET;
  }

  // Verify webhook authenticity
  verifyWebhook(data, hmacHeader) {
    if (!this.secret || this.secret === 'your_webhook_secret_here') {
      console.warn('Webhook secret not configured');
      return false;
    }

    const crypto = require('crypto');
    const calculatedHmac = crypto
      .createHmac('sha256', this.secret)
      .update(data, 'utf8')
      .digest('base64');
      
    return calculatedHmac === hmacHeader;
  }

  // Handle order created webhook
  async handleOrderCreated(orderData) {
    try {
      // Check if order contains capsule products
      const capsuleItems = orderData.line_items.filter(item => 
        item.product_tags?.includes('capsule') || 
        item.product_tags?.includes('u-inspire-wall')
      );

      if (capsuleItems.length > 0) {
        // Update thread metrics in Airtable
        await this.updateThreadPurchaseMetrics(capsuleItems);
        
        // Send community notification
        await this.notifyCommunityOfPurchase(capsuleItems);
      }
    } catch (error) {
      console.error('Error handling order created webhook:', error);
    }
  }

  // Update purchase metrics
  async updateThreadPurchaseMetrics(items) {
    // Implementation would update Airtable with purchase data
    console.log('Updating purchase metrics for items:', items.length);
  }

  // Notify community of purchase
  async notifyCommunityOfPurchase(items) {
    // Implementation would send notifications
    console.log('Notifying community of purchase:', items.length);
  }
}

// Create singleton instances
const shopifyAPI = new ShopifyAPI();
const shopifyWebhooks = new ShopifyWebhooks();

// Import emotion colors from Airtable config
const EMOTION_LABELS = {
  love: 'Love',
  grief: 'Grief',
  rage: 'Rage', 
  relief: 'Relief',
  shame: 'Shame',
  joy: 'Joy',
  fear: 'Fear',
  calm: 'Calm',
  empowerment: 'Empowerment',
  hope: 'Hope'
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    SHOPIFY_CONFIG,
    ShopifyAPI,
    shopifyAPI,
    ShopifyWebhooks,
    shopifyWebhooks,
    EMOTION_LABELS
  };
} else {
  // Browser environment
  window.SHOPIFY_CONFIG = SHOPIFY_CONFIG;
  window.shopifyAPI = shopifyAPI;
  window.EMOTION_LABELS = EMOTION_LABELS;
}