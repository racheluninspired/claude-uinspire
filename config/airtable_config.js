/**
 * Airtable Configuration for U INSPIRE Wall
 * 
 * IMPORTANT: Never commit real API keys to version control
 * Use environment variables in production
 */

// DEVELOPMENT CONFIGURATION
const AIRTABLE_CONFIG = {
  // Replace with your actual Airtable base ID
  BASE_ID: process.env.AIRTABLE_BASE_ID || 'appZWj3wGRGuyH1jM',
  
  // Replace with your actual Airtable API key
  API_KEY: process.env.AIRTABLE_API_KEY || 'patvhuOYlQMobVvaX.833baeed2d1adc99382b343e61b0fde48a02f81fd4f987d5fdc33f53d7bbc7f9',
  
  // Table names (must match your Airtable base)
  TABLES: {
    THREADS: 'Threads',
    DROPS: 'Drops'
  },
  
  // API endpoints
  get ENDPOINTS() {
    return {
      THREADS: `https://api.airtable.com/v0/${this.BASE_ID}/${this.TABLES.THREADS}`,
      DROPS: `https://api.airtable.com/v0/${this.BASE_ID}/${this.TABLES.DROPS}`
    };
  },
  
  // Request headers
  get HEADERS() {
    return {
      'Authorization': `Bearer ${this.API_KEY}`,
      'Content-Type': 'application/json'
    };
  }
};

// EMOTION CONFIGURATION
const EMOTION_COLORS = {
  love: '#ff2eff',
  grief: '#8a8a8a',
  rage: '#ff360a',
  relief: '#00ffe0',
  shame: '#d4d4d4',
  joy: '#fffb00',
  fear: '#a6a6a6',
  calm: '#c8b8a6',
  empowerment: '#ff008c',
  hope: '#b8ff10'
};

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

// API HELPER FUNCTIONS
class AirtableAPI {
  constructor() {
    this.baseId = AIRTABLE_CONFIG.BASE_ID;
    this.apiKey = AIRTABLE_CONFIG.API_KEY;
    this.headers = AIRTABLE_CONFIG.HEADERS;
  }

  // Validate configuration
  isConfigured() {
    return this.baseId && this.baseId !== 'appZWj3wGRGuyH1jM' &&
           this.apiKey && this.apiKey !== 'patvhuOYlQMobVvaX.833baeed2d1adc99382b343e61b0fde48a02f81fd4f987d5fdc33f53d7bbc7f9';
  }

  // Get all threads for current drop
  async getThreads(dropId = 'drop_003', status = 'Accepted') {
    if (!this.isConfigured()) {
      throw new Error('Airtable not configured. Please update config/airtable-config.js');
    }

    const filterFormula = `AND({status}='${status}',{drop_id}='${dropId}')`;
    const url = `${AIRTABLE_CONFIG.ENDPOINTS.THREADS}?filterByFormula=${encodeURIComponent(filterFormula)}&sort[0][field]=created_at&sort[0][direction]=desc`;
    
    try {
      const response = await fetch(url, {
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`Airtable API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.records.map(record => ({
        id: record.id,
        ...record.fields,
        reactions: this.parseReactions(record.fields.reactions)
      }));
    } catch (error) {
      console.error('Error fetching threads:', error);
      throw error;
    }
  }

  // Submit new thread
  async submitThread(threadData) {
    if (!this.isConfigured()) {
      throw new Error('Airtable not configured. Please update config/airtable-config.js');
    }

    const submission = {
      fields: {
        message: threadData.message,
        emotion: threadData.emotion || 'hope',
        status: 'Pending',
        drop_id: threadData.drop_id || 'drop_003',
        email: threadData.email,
        created_at: new Date().toISOString(),
        reactions: JSON.stringify({
          heart: 0,
          fire: 0,
          sparkles: 0,
          sad: 0,
          rage: 0
        })
      }
    };

    try {
      const response = await fetch(AIRTABLE_CONFIG.ENDPOINTS.THREADS, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(submission)
      });

      if (!response.ok) {
        throw new Error(`Failed to submit thread: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error submitting thread:', error);
      throw error;
    }
  }

  // Update thread reactions
  async updateReactions(threadId, reactionType) {
    if (!this.isConfigured()) {
      throw new Error('Airtable not configured. Please update config/airtable-config.js');
    }

    try {
      // First get current reactions
      const currentThread = await this.getThreadById(threadId);
      if (!currentThread) {
        throw new Error('Thread not found');
      }

      const reactions = currentThread.reactions || {};
      reactions[reactionType] = (reactions[reactionType] || 0) + 1;

      const update = {
        fields: {
          reactions: JSON.stringify(reactions)
        }
      };

      const response = await fetch(`${AIRTABLE_CONFIG.ENDPOINTS.THREADS}/${threadId}`, {
        method: 'PATCH',
        headers: this.headers,
        body: JSON.stringify(update)
      });

      if (!response.ok) {
        throw new Error(`Failed to update reactions: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating reactions:', error);
      throw error;
    }
  }

  // Get single thread by ID
  async getThreadById(threadId) {
    if (!this.isConfigured()) {
      throw new Error('Airtable not configured. Please update config/airtable-config.js');
    }

    try {
      const response = await fetch(`${AIRTABLE_CONFIG.ENDPOINTS.THREADS}/${threadId}`, {
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`Failed to get thread: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return {
        id: data.id,
        ...data.fields,
        reactions: this.parseReactions(data.fields.reactions)
      };
    } catch (error) {
      console.error('Error getting thread:', error);
      throw error;
    }
  }

  // Get current drop information
  async getCurrentDrop() {
    if (!this.isConfigured()) {
      throw new Error('Airtable not configured. Please update config/airtable-config.js');
    }

    const filterFormula = `{archived}=FALSE()`;
    const url = `${AIRTABLE_CONFIG.ENDPOINTS.DROPS}?filterByFormula=${encodeURIComponent(filterFormula)}&sort[0][field]=drop_close&sort[0][direction]=desc&maxRecords=1`;
    
    try {
      const response = await fetch(url, {
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`Failed to get current drop: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.records.length > 0 ? {
        id: data.records[0].id,
        ...data.records[0].fields
      } : null;
    } catch (error) {
      console.error('Error getting current drop:', error);
      throw error;
    }
  }

  // Get featured threads for capsule
  async getFeaturedThreads(dropId = 'drop_003') {
    if (!this.isConfigured()) {
      throw new Error('Airtable not configured. Please update config/airtable-config.js');
    }

    const filterFormula = `AND({status}='Accepted',{drop_id}='${dropId}',{capsule_feature}=TRUE())`;
    const url = `${AIRTABLE_CONFIG.ENDPOINTS.THREADS}?filterByFormula=${encodeURIComponent(filterFormula)}&sort[0][field]=created_at&sort[0][direction]=desc`;
    
    try {
      const response = await fetch(url, {
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`Failed to get featured threads: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.records.map(record => ({
        id: record.id,
        ...record.fields,
        reactions: this.parseReactions(record.fields.reactions)
      }));
    } catch (error) {
      console.error('Error getting featured threads:', error);
      throw error;
    }
  }

  // Utility function to parse reactions JSON
  parseReactions(reactionsString) {
    try {
      return reactionsString ? JSON.parse(reactionsString) : {
        heart: 0,
        fire: 0,
        sparkles: 0,
        sad: 0,
        rage: 0
      };
    } catch (error) {
      console.error('Error parsing reactions:', error);
      return {
        heart: 0,
        fire: 0,
        sparkles: 0,
        sad: 0,
        rage: 0
      };
    }
  }

  // Get thread statistics
  async getDropStatistics(dropId = 'drop_003') {
    if (!this.isConfigured()) {
      throw new Error('Airtable not configured. Please update config/airtable-config.js');
    }

    try {
      const threads = await this.getThreads(dropId);
      const totalReactions = threads.reduce((sum, thread) => {
        const reactions = thread.reactions || {};
        return sum + Object.values(reactions).reduce((a, b) => a + b, 0);
      }, 0);

      const emotionCounts = threads.reduce((counts, thread) => {
        counts[thread.emotion] = (counts[thread.emotion] || 0) + 1;
        return counts;
      }, {});

      const topEmotion = Object.keys(emotionCounts).reduce((a, b) => 
        emotionCounts[a] > emotionCounts[b] ? a : b, 'hope');

      return {
        totalThreads: threads.length,
        totalReactions,
        emotionCounts,
        topEmotion,
        spotsRemaining: Math.max(0, 150 - threads.length),
        featuredCount: threads.filter(t => t.capsule_feature).length
      };
    } catch (error) {
      console.error('Error getting statistics:', error);
      throw error;
    }
  }
}

// RATE LIMITING
class RateLimiter {
  constructor(requestsPerSecond = 5) {
    this.requestsPerSecond = requestsPerSecond;
    this.requests = [];
  }

  async throttle() {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < 1000);
    
    if (this.requests.length >= this.requestsPerSecond) {
      const oldestRequest = Math.min(...this.requests);
      const waitTime = 1000 - (now - oldestRequest);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.requests.push(now);
  }
}

// ERROR HANDLING
class AirtableError extends Error {
  constructor(message, status, response) {
    super(message);
    this.name = 'AirtableError';
    this.status = status;
    this.response = response;
  }
}

// VALIDATION HELPERS
const VALIDATORS = {
  emotion: (emotion) => Object.keys(EMOTION_COLORS).includes(emotion),
  
  message: (message) => {
    if (!message || typeof message !== 'string') return false;
    if (message.length < 5) return false;
    if (message.length > 500) return false;
    return true;
  },
  
  email: (email) => {
    if (!email) return true; // Email is optional
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },
  
  dropId: (dropId) => {
    if (!dropId) return false;
    return /^drop_\d{3}$/.test(dropId);
  }
};

// Create singleton instance
const airtableAPI = new AirtableAPI();
const rateLimiter = new RateLimiter();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    AIRTABLE_CONFIG,
    EMOTION_COLORS,
    EMOTION_LABELS,
    AirtableAPI,
    airtableAPI,
    rateLimiter,
    VALIDATORS,
    AirtableError
  };
} else {
  // Browser environment
  window.AIRTABLE_CONFIG = AIRTABLE_CONFIG;
  window.EMOTION_COLORS = EMOTION_COLORS;
  window.EMOTION_LABELS = EMOTION_LABELS;
  window.airtableAPI = airtableAPI;
  window.VALIDATORS = VALIDATORS;
}
