# Shopify Integration Guide

Complete guide for integrating the U INSPIRE Wall with your Shopify store for automated capsule merchandise creation and sales.

## 🎯 Integration Overview

The Shopify integration enables:
- **Automated product creation** from featured threads
- **Customer email management** for drop notifications
- **Order fulfillment** with story attribution
- **Analytics tracking** for conversion metrics

## 🏗️ Architecture Options

### Option 1: Shopify App Embed (Recommended)
- **Embedded directly** in your Shopify store
- **Native checkout** experience
- **Customer data** automatically synced
- **Theme integration** with existing design

### Option 2: External Integration
- **Subdomain hosting** (inspire.uninspiredcollective.com)
- **API-based** product creation
- **Deep linking** to Shopify checkout
- **More flexibility** in design and features

### Option 3: Theme Section
- **Native theme** integration
- **Limited functionality** but seamless UX
- **Shopify hosting** and management
- **Easier maintenance** and updates

## 🔧 Shopify Setup

### 1. Create Private App
1. Go to **Settings → Apps and sales channels**
2. Click **Develop apps**
3. Create **private app** named "U INSPIRE Wall"
4. Configure API scopes (see below)

### 2. Required API Scopes
```
Admin API Permissions:
- Products: Read and write
- Product listings: Read and write  
- Inventory: Read and write
- Orders: Read
- Customers: Read and write
- Files: Read and write
- Themes: Read (if using theme integration)

Storefront API Permissions:
- Products: Read
- Collections: Read
- Customer tags: Read
```

### 3. Get API Credentials
After creating the app:
- **API Key** and **Secret Key**
- **Access Token** for Admin API
- **Storefront Access Token**
- **Shop domain** (yourstore.myshopify.com)

## ⚙️ Configuration Files

### Update `config/shopify-config.js`
```javascript
const SHOPIFY_CONFIG = {
  SHOP_DOMAIN: 'uninspiredcollective.myshopify.com',
  API_VERSION: '2024-01',
  ADMIN_API: {
    ACCESS_TOKEN: 'shppa_XXXXXXXXXXXXXXXX',
    ENDPOINTS: {
      PRODUCTS: '/admin/api/2024-01/products.json',
      CUSTOMERS: '/admin/api/2024-01/customers.json',
      ORDERS: '/admin/api/2024-01/orders.json'
    }
  },
  STOREFRONT_API: {
    ACCESS_TOKEN: 'XXXXXXXXXXXXXXXX',
    ENDPOINT: '/api/2024-01/graphql.json'
  },
  WEBHOOK_SECRET: 'your_webhook_secret_here'
};
```

## 🛍️ Product Creation Workflow

### 1. Featured Thread Selection
When a thread is marked as `capsule_feature: true` in Airtable:

```javascript
async function createCapsuleProduct(thread) {
  const product = {
    product: {
      title: `Thread #${thread.thread_number} - ${thread.emotion}`,
      body_html: `
        <p><strong>Anonymous Story:</strong></p>
        <blockquote>"${thread.message}"</blockquote>
        <p><em>Part of the ${thread.drop_id} collection - Breaking the Cycle</em></p>
      `,
      vendor: 'UNINSPIRED™',
      product_type: 'Capsule Collection',
      tags: `capsule,${thread.emotion},${thread.drop_id},featured-thread`,
      variants: [
        {
          option1: 'S',
          price: '45.00',
          inventory_quantity: 25,
          inventory_management: 'shopify'
        },
        {
          option1: 'M', 
          price: '45.00',
          inventory_quantity: 50,
          inventory_management: 'shopify'
        },
        {
          option1: 'L',
          price: '45.00', 
          inventory_quantity: 50,
          inventory_management: 'shopify'
        },
        {
          option1: 'XL',
          price: '45.00',
          inventory_quantity: 25,
          inventory_management: 'shopify'
        }
      ],
      options: [
        {
          name: 'Size',
          values: ['S', 'M', 'L', 'XL']
        }
      ],
      images: [
        {
          src: `https://yourcdn.com/capsule-designs/${thread.id}-mockup.jpg`,
          alt: `Thread #${thread.thread_number} Design Mockup`
        }
      ]
    }
  };

  return await shopifyAPI.post('/admin/api/2024-01/products.json', product);
}
```

### 2. Collection Management
Create collections for each drop:

```javascript
async function createDropCollection(drop) {
  const collection = {
    custom_collection: {
      title: drop.title,
      body_html: drop.theme_summary,
      handle: drop.id.toLowerCase().replace('_', '-'),
      sort_order: 'created-desc',
      published: true
    }
  };

  return await shopifyAPI.post('/admin/api/2024-01/custom_collections.json', collection);
}
```

## 📧 Customer Management

### 1. Email Capture Integration
Sync email signups from U INSPIRE Wall to Shopify customers:

```javascript
async function createShopifyCustomer(email, source = 'u-inspire-wall') {
  const customer = {
    customer: {
      email: email,
      accepts_marketing: true,
      tags: `u-inspire-subscriber,${source}`,
      note: 'Signed up for capsule drop notifications via U INSPIRE Wall'
    }
  };

  return await shopifyAPI.post('/admin/api/2024-01/customers.json', customer);
}
```

### 2. Notification System
Set up automated emails for:
- **Drop announcements** (new theme launched)
- **Capsule releases** (featured threads now available)
- **Order confirmations** with story context
- **Shipping updates** with community highlights

## 🎨 Design Asset Generation

### 1. Automated Mockup Creation
Generate product images programmatically:

```javascript
async function generateThreadDesign(thread) {
  const designData = {
    thread_number: thread.thread_number,
    message: thread.message,
    emotion: thread.emotion,
    emotion_color: EMOTION_COLORS[thread.emotion],
    background_style: 'minimal',
    text_layout: 'vertical-stack'
  };

  // Call design generation API or service
  const mockupUrl = await generateDesignMockup(designData);
  
  // Upload to Shopify Files API
  return await uploadToShopifyFiles(mockupUrl, `thread-${thread.id}-mockup.jpg`);
}
```

### 2. Brand Consistency
Ensure all generated products match UNINSPIRED™ aesthetic:
- **Color palette** from emotion mapping
- **Typography** using Koulen and Inter fonts
- **Layout templates** for consistency
- **Brand elements** and logo placement

## 📊 Analytics Integration

### 1. Track Conversion Metrics
Monitor the journey from thread to purchase:

```javascript
const TRACKING_EVENTS = {
  THREAD_SUBMITTED: 'thread_submitted',
  THREAD_FEATURED: 'thread_featured', 
  PRODUCT_VIEWED: 'capsule_product_viewed',
  PRODUCT_PURCHASED: 'capsule_product_purchased',
  EMAIL_SIGNUP: 'email_signup_capsule'
};

function trackEvent(event, properties) {
  // Send to analytics service (Google Analytics, Mixpanel, etc.)
  analytics.track(event, {
    ...properties,
    source: 'u-inspire-wall',
    timestamp: new Date().toISOString()
  });
}
```

### 2. Shopify Analytics
Leverage Shopify's built-in analytics:
- **Product performance** by thread emotion
- **Customer acquisition** from U INSPIRE Wall
- **Revenue attribution** to specific drops
- **Conversion rates** at each funnel stage

## 🔄 Webhook Configuration

### 1. Set Up Webhooks
Configure webhooks for real-time updates:

```javascript
const WEBHOOKS = {
  ORDER_CREATED: '/webhooks/order-created',
  ORDER_PAID: '/webhooks/order-paid',
  CUSTOMER_CREATED: '/webhooks/customer-created'
};

// Handle order creation
app.post('/webhooks/order-created', (req, res) => {
  const order = req.body;
  
  // Check if order contains capsule products
  const capsuleItems = order.line_items.filter(item => 
    item.product_tags?.includes('capsule')
  );
  
  if (capsuleItems.length > 0) {
    // Update Airtable with purchase data
    updateThreadPurchaseMetrics(capsuleItems);
    
    // Send community notification
    notifyCommunityOfPurchase(capsuleItems);
  }
  
  res.status(200).send('OK');
});
```

### 2. Security
Verify webhook authenticity:

```javascript
function verifyShopifyWebhook(data, hmacHeader) {
  const calculatedHmac = crypto
    .createHmac('sha256', SHOPIFY_CONFIG.WEBHOOK_SECRET)
    .update(data, 'utf8')
    .digest('base64');
    
  return calculatedHmac === hmacHeader;
}
```

## 🚀 Deployment Strategies

### Option A: Shopify App
1. **Package as Shopify app**
2. **Submit to app store** (optional)
3. **Install in your store**
4. **Configure via app settings**

### Option B: External Service
1. **Deploy to cloud service** (Vercel, Netlify)
2. **Set up API endpoints** for Shopify integration
3. **Configure webhooks** pointing to your service
4. **Handle authentication** and security

### Option C: Shopify Scripts
1. **Use Shopify Scripts** for checkout customization
2. **Theme modifications** for embedded experience
3. **Liquid templating** for dynamic content
4. **Asset management** through theme files

## 🔒 Security Best Practices

### API Security
- **Secure credential storage** (environment variables)
- **Rate limiting** for API calls
- **Webhook verification** for all incoming requests
- **HTTPS enforcement** for all communications

### Data Privacy
- **PCI compliance** for payment processing
- **GDPR compliance** for EU customers
- **Data encryption** in transit and at rest
- **Regular security audits** and updates

## 🧪 Testing

### 1. Development Environment
Set up test store for development:

```bash
# Use Shopify CLI for local development
npm install -g @shopify/cli
shopify app create node
shopify app serve
```

### 2. Test Scenarios
- **Product creation** from featured threads
- **Customer registration** and email capture
- **Order processing** and fulfillment
- **Webhook delivery** and handling
- **Error handling** and recovery

## 📈 Scaling Considerations

### Performance
- **Caching strategies** for product data
- **Batch processing** for bulk operations
- **CDN usage** for asset delivery
- **Database optimization** for queries

### Growth Planning
- **Multi-store support** for expansion
- **International markets** and currencies
- **Inventory management** across channels
- **Customer service** integration

## 🆘 Troubleshooting

### Common Issues

**API Rate Limits**
- Implement exponential backoff
- Use bulk operations when possible
- Monitor API call usage

**Product Creation Failures**
- Validate all required fields
- Check image URL accessibility
- Verify inventory settings

**Webhook Delivery Issues**
- Confirm endpoint accessibility
- Verify HTTPS certificate
- Check webhook secret configuration

### Support Resources
- [Shopify API Documentation](https://shopify.dev/api)
- [Shopify Community](https://community.shopify.com)
- [Partner Support](https://partners.shopify.com/support)