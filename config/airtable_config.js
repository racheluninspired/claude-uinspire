/**
 * Secure Airtable Configuration - Client Side
 * Calls Netlify Functions instead of direct API access
 */

// Secure client-side API that calls Netlify functions
class AirtableAPI {
  constructor() {
    this.apiEndpoint = '/.netlify/functions/airtable';
    this.isConfigured = true; // Always true when using Netlify functions
  }

  // Check if API is configured
  isConfigured() {
    return true; // Always configured when using server-side functions
  }

  // Get current live drop
  async getCurrentDrop() {
    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ path: 'getCurrentDrop' })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching current drop:', error);
      return this.getMockDrop();
    }
  }

  // Get threads for specific drop
  async getThreads(dropId = 'drop_003') {
    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          path: 'getThreads',
          dropId: dropId 
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const threads = await response.json();
      console.log(`Loaded ${threads.length} threads from Airtable via Netlify`);
      return threads;
    } catch (error) {
      console.error('Error fetching threads:', error);
      return this.getMockThreads();
    }
  }

  // Submit new thread
  async submitThread(threadData) {
    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          path: 'submitThread',
          threadData: threadData
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Thread submitted successfully:', result);
      return result;
    } catch (error) {
      console.error('Error submitting thread:', error);
      throw error;
    }
  }

  // Update reaction counts
  async updateReactions(threadId, reactionType) {
    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          path: 'updateReactions',
          threadId: threadId,
          reactionType: reactionType
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating reactions:', error);
      // Don't throw - reactions are non-critical
    }
  }

  // Mock data fallbacks (same as before)
  getMockDrop() {
    return {
      id: 'drop_003',
      title: 'Breaking the Cycle',
      theme_summary: 'Share the moment when you broke free from something that was holding you back',
      drop_status: 'live',
      launch_date: '2025-05-20',
      est_close_date: '2025-05-26'
    };
  }

  getMockThreads() {
    return [
      { 
        id: "001", 
        message: "I stopped pretending to be okay and finally asked for help", 
        emotion: "relief", 
        thread_number: 1, 
        reactions: { heart: 89, fire: 34, sparkles: 67 },
        created_at: "2025-05-23T10:30:00.000Z"
      },
      { 
        id: "002", 
        message: "Finding strength in vulnerability instead of hiding behind walls", 
        emotion: "empowerment", 
        thread_number: 2, 
        reactions: { heart: 72, fire: 28, sparkles: 45 },
        created_at: "2025-05-23T09:15:00.000Z"
      },
      { 
        id: "003", 
        message: "Angry at everything because I was really angry at myself", 
        emotion: "rage", 
        thread_number: 3, 
        reactions: { heart: 56, fire: 91, sparkles: 23 },
        created_at: "2025-05-23T08:45:00.000Z"
      },
      { 
        id: "004", 
        message: "Learning to forgive myself first before expecting it from others", 
        emotion: "empowerment", 
        thread_number: 4, 
        reactions: { heart: 88, fire: 42, sparkles: 61 },
        created_at: "2025-05-23T07:20:00.000Z"
      },
      { 
        id: "005", 
        message: "Finally breathing again after years of holding my breath", 
        emotion: "relief", 
        thread_number: 5, 
        reactions: { heart: 94, fire: 38, sparkles: 72 },
        created_at: "2025-05-23T06:30:00.000Z"
      },
      { 
        id: "006", 
        message: "Some days you just need to cry and that's perfectly okay", 
        emotion: "grief", 
        thread_number: 6, 
        reactions: { heart: 103, fire: 19, sparkles: 84 },
        created_at: "2025-05-22T22:15:00.000Z"
      },
      { 
        id: "007", 
        message: "Love is worth fighting for even when everything feels broken", 
        emotion: "love", 
        thread_number: 7, 
        reactions: { heart: 127, fire: 45, sparkles: 89 },
        created_at: "2025-05-22T21:00:00.000Z"
      },
      { 
        id: "008", 
        message: "Every small step counts when you're climbing out of darkness", 
        emotion: "hope", 
        thread_number: 8, 
        reactions: { heart: 76, fire: 52, sparkles: 94 },
        created_at: "2025-05-22T19:45:00.000Z"
      },
      { 
        id: "009", 
        message: "The silence is deafening but I'm learning to sit with it", 
        emotion: "grief", 
        thread_number: 9, 
        reactions: { heart: 67, fire: 31, sparkles: 48 },
        created_at: "2025-05-22T18:30:00.000Z"
      },
      { 
        id: "010", 
        message: "I choose myself today even when it feels selfish", 
        emotion: "empowerment", 
        thread_number: 10, 
        reactions: { heart: 98, fire: 73, sparkles: 56 },
        created_at: "2025-05-22T17:15:00.000Z"
      }
    ];
  }
}

// EMOTION COLOR MAP (matches your brand)
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
  hope: '#b8ff10',
  nostalgia: '#c8b8a6',
  resentment: '#8B4513'
};

// Initialize API instance
window.airtableAPI = new AirtableAPI();
window.EMOTION_COLORS = EMOTION_COLORS;

console.log('✅ Secure Airtable API configured via Netlify Functions');
