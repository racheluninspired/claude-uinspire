/**
 * Airtable Configuration for U INSPIRE Wall
 * Updated for Netlify Environment Variables and Actual Table Structure
 */

// Environment variable detection for Netlify
const isNetlify = typeof process !== 'undefined' && process.env;

// DEVELOPMENT CONFIGURATION
const AIRTABLE_CONFIG = {
  // Use environment variables in production, fallback to development values
  BASE_ID: isNetlify ? process.env.AIRTABLE_BASE_ID : 'appZWj3wGRGuyH1jM',
  API_KEY: isNetlify ? process.env.AIRTABLE_API_KEY : 'patvhuOYlQMobVvaX.833baeed2d1adc99382b343e61b0fde48a02f81fd4f987d5fdc33f53d7bbc7f9',
  
  // Table names (must match your actual Airtable base exactly)
  TABLES: {
    THREADS: 'ThreadsGrid view 3',  // ✅ Matches your CSV structure
    DROPS: 'DropsGrid view 1',      // ✅ Matches your CSV structure  
    COMMENTS: 'CommentsGrid view 1' // ✅ Matches your CSV structure
  },
  
  // Field mappings based on your actual CSV structure
  FIELDS: {
    THREADS: {
      RECORD_ID: 'Record ID',
      SUBMISSION_ID: 'submission_id',
      TIMESTAMP: 'timestamp',
      TEXT_SNIPPET: 'text_snippet',
      EMOTION_TAG: 'emotion_tag',
      UPVOTE_COUNT: 'upvote_count',
      DROP_ID: 'drop_id',
      WALL_STATUS: 'wall_status',
      OPTIONAL_NAME: 'optional_name',
      EMAIL_FOR_DROP: 'email_for_drop',
      INTERESTED_IN_CAPSULE: 'interested_in_capsule',
      SOCIAL_HANDLE: 'social_handle',
      COMMENT_TEXT: 'comment_text',
      COMMENT_FLAG: 'comment_flag',
      DRAFT_CONTENT: 'Draft Content',
      EMAIL_OPT_IN: 'email_opt_in',
      EXPANDED_STORY: 'expanded_story',
      CREATED: 'Created',
      REACTIONS: 'reactions',
      RELATE_COUNT: 'relate_count',
      STRENGTH_COUNT: 'strength_count',
      HOPE_COUNT: 'hope_count',
      THREAD: 'Thread',
      LIKE_COUNT: 'like_count',
      SUPPORT_COUNT: 'support_count',
      AI_PROMPT: 'ai_prompt',
      AI_BACKGROUND_URL: 'ai_background_URL',
      IMAGE_STATUS: 'image_status',
      LAST_MODIFIED: 'Last Modified'
    },
    DROPS: {
      DROP_ID: 'drop_id',
      DROP_STATUS: 'drop_status',
      THEME: 'theme',
      PROMPT_QUESTION: 'prompt_question',
      CAPSULE_URL: 'capsule_url',
      WALL_IMAGE_URL: 'wall_image_url',
      TOP_EMOTIONS: 'top_emotions',
      FEATURED_THREAD_ID: 'featured_thread_id',
      DROP_SUMMARY: 'drop_summary',
      LAUNCH_DATE: 'launch_date',
      EST_CLOSE_DATE: 'est_close_date',
      COMMENTS: 'Comments',
      THREADS: 'Threads'
    },
    COMMENTS: {
      THREAD_ID: 'thread_id',
      SUBMISSION_LINK: 'submission_link',
      MESSAGE: 'message',
      TIMESTAMP: 'timestamp',
      WALL_STATUS: 'wall_status',
      REACTIONS: 'reactions',
      AUTHOR_NAME: 'author_name',
      AUTHOR_AVATAR: 'author_avatar',
      LIKE_COUNT: 'like_count',
      DROP_ID: 'drop_id'
    }
  },
  
  // API endpoints
  get ENDPOINTS() {
    return {
      THREADS: `https://api.airtable.com/v0/${this.BASE_ID}/${encodeURIComponent(this.TABLES.THREADS)}`,
      DROPS: `https://api.airtable.com/v0/${this.BASE_ID}/${encodeURIComponent(this.TABLES.DROPS)}`,
      COMMENTS: `https://api.airtable.com/v0/${this.BASE_ID}/${encodeURIComponent(this.TABLES.COMMENTS)}`
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

// EMOTION CONFIGURATION (matches your existing structure)
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
  hope: 'Hope',
  nostalgia: 'Nostalgia',
  resentment: 'Resentment'
};

// Enhanced Airtable API Class
class AirtableAPI {
  constructor() {
    this.baseId = AIRTABLE_CONFIG.BASE_ID;
    this.apiKey = AIRTABLE_CONFIG.API_KEY;
    this.headers = AIRTABLE_CONFIG.HEADERS;
    this.endpoints = AIRTABLE_CONFIG.ENDPOINTS;
    this.fields = AIRTABLE_CONFIG.FIELDS;
  }

  // Validate configuration
  isConfigured() {
    return this.baseId && this.apiKey && 
           this.baseId !== 'appZWj3wGRGuyH1jM' &&
           this.apiKey !== 'patvhuOYlQMobVvaX.833baeed2d1adc99382b343e61b0fde48a02f81fd4f987d5fdc33f53d7bbc7f9';
  }

  // Get current live drop
  async getCurrentDrop() {
    if (!this.isConfigured()) {
      console.warn('Airtable not configured, using mock data');
      return this.getMockDrop();
    }

    try {
      const filterFormula = `{${this.fields.DROPS.DROP_STATUS}}='live'`;
      const url = `${this.endpoints.DROPS}?filterByFormula=${encodeURIComponent(filterFormula)}&maxRecords=1&sort[0][field]=${this.fields.DROPS.DROP_ID}&sort[0][direction]=desc`;
      
      const response = await fetch(url, {
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.records.length > 0) {
        const record = data.records[0];
        return {
          airtable_id: record.id,
          id: record.fields[this.fields.DROPS.DROP_ID],
          drop_status: record.fields[this.fields.DROPS.DROP_STATUS],
          theme: record.fields[this.fields.DROPS.THEME],
          prompt_question: record.fields[this.fields.DROPS.PROMPT_QUESTION],
          capsule_url: record.fields[this.fields.DROPS.CAPSULE_URL],
          wall_image_url: record.fields[this.fields.DROPS.WALL_IMAGE_URL],
          top_emotions: record.fields[this.fields.DROPS.TOP_EMOTIONS],
          featured_thread_id: record.fields[this.fields.DROPS.FEATURED_THREAD_ID],
          drop_summary: record.fields[this.fields.DROPS.DROP_SUMMARY],
          launch_date: record.fields[this.fields.DROPS.LAUNCH_DATE],
          est_close_date: record.fields[this.fields.DROPS.EST_CLOSE_DATE]
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching current drop:', error);
      return this.getMockDrop();
    }
  }

  // Get threads for a specific drop
  async getThreadsForDrop(dropId) {
    if (!this.isConfigured()) {
      console.warn('Airtable not configured, using mock data');
      return this.getMockThreads();
    }

    try {
      const filterFormula = `AND({${this.fields.THREADS.DROP_ID}}=${dropId},{${this.fields.THREADS.WALL_STATUS}}='Accepted')`;
      const url = `${this.endpoints.THREADS}?filterByFormula=${encodeURIComponent(filterFormula)}&sort[0][field]=${this.fields.THREADS.UPVOTE_COUNT}&sort[0][direction]=desc&maxRecords=125`;
      
      const response = await fetch(url, {
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      return data.records.map(record => ({
        airtable_id: record.id,
        id: record.fields[this.fields.THREADS.SUBMISSION_ID] || record.id,
        submission_id: record.fields[this.fields.THREADS.SUBMISSION_ID],
        timestamp: record.fields[this.fields.THREADS.TIMESTAMP],
        text_snippet: record.fields[this.fields.THREADS.TEXT_SNIPPET],
        emotion_tag: record.fields[this.fields.THREADS.EMOTION_TAG],
        upvote_count: record.fields[this.fields.THREADS.UPVOTE_COUNT] || 0,
        drop_id: record.fields[this.fields.THREADS.DROP_ID],
        wall_status: record.fields[this.fields.THREADS.WALL_STATUS],
        optional_name: record.fields[this.fields.THREADS.OPTIONAL_NAME],
        email_for_drop: record.fields[this.fields.THREADS.EMAIL_FOR_DROP],
        expanded_story: record.fields[this.fields.THREADS.EXPANDED_STORY],
        reactions: record.fields[this.fields.THREADS.REACTIONS],
        like_count: record.fields[this.fields.THREADS.LIKE_COUNT],
        created: record.fields[this.fields.THREADS.CREATED]
      }));
    } catch (error) {
      console.error('Error fetching threads:', error);
      return this.getMockThreads();
    }
  }

  // Get comments for a specific thread
  async getCommentsForThread(threadId) {
    if (!this.isConfigured()) {
      return [];
    }

    try {
      const filterFormula = `AND({${this.fields.COMMENTS.SUBMISSION_LINK}}='${threadId}',{${this.fields.COMMENTS.WALL_STATUS}}='Accepted')`;
      const url = `${this.endpoints.COMMENTS}?filterByFormula=${encodeURIComponent(filterFormula)}&sort[0][field]=${this.fields.COMMENTS.TIMESTAMP}&sort[0][direction]=asc`;
      
      const response = await fetch(url, {
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      return data.records.map(record => ({
        id: record.id,
        thread_id: record.fields[this.fields.COMMENTS.THREAD_ID],
        submission_link: record.fields[this.fields.COMMENTS.SUBMISSION_LINK],
        message: record.fields[this.fields.COMMENTS.MESSAGE],
        timestamp: record.fields[this.fields.COMMENTS.TIMESTAMP],
        wall_status: record.fields[this.fields.COMMENTS.WALL_STATUS],
        author_name: record.fields[this.fields.COMMENTS.AUTHOR_NAME] || 'Anonymous',
        like_count: record.fields[this.fields.COMMENTS.LIKE_COUNT] || 0,
        drop_id: record.fields[this.fields.COMMENTS.DROP_ID]
      }));
    } catch (error) {
      console.error('Error fetching comments:', error);
      return [];
    }
  }

  // Submit new thread
  async submitThread(threadData) {
    if (!this.isConfigured()) {
      throw new Error('Airtable not configured');
    }

    const submission = {
      fields: {
        [this.fields.THREADS.SUBMISSION
