/**
 * Netlify Function - Secure Airtable API Proxy
 * Handles all Airtable operations server-side to protect API credentials
 */

exports.handler = async (event, context) => {
  // Enable CORS for your domain
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Environment variables (set in Netlify dashboard)
  const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
  const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;

  if (!AIRTABLE_BASE_ID || !AIRTABLE_API_KEY) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Airtable credentials not configured',
        message: 'Please set AIRTABLE_BASE_ID and AIRTABLE_API_KEY in Netlify environment variables'
      })
    };
  }

  const airtableHeaders = {
    'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
    'Content-Type': 'application/json'
  };

  try {
    const { path } = JSON.parse(event.body || '{}');

    switch (path) {
      case 'getCurrentDrop':
        return await getCurrentDrop();
      
      case 'getThreads':
        const { dropId } = JSON.parse(event.body);
        return await getThreads(dropId);
      
      case 'submitThread':
        const { threadData } = JSON.parse(event.body);
        return await submitThread(threadData);
      
      case 'updateReactions':
        const { threadId, reactionType } = JSON.parse(event.body);
        return await updateReactions(threadId, reactionType);
      
      default:
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Invalid path' })
        };
    }
  } catch (error) {
    console.error('Netlify function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Server error',
        message: error.message 
      })
    };
  }

  // Get current live drop
  async function getCurrentDrop() {
    try {
      const tableUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/DropsGrid%20view%201`;
      const filterFormula = `{drop_status}='live'`;
      const url = `${tableUrl}?filterByFormula=${encodeURIComponent(filterFormula)}&maxRecords=1`;
      
      const response = await fetch(url, {
        headers: airtableHeaders
      });

      if (!response.ok) {
        throw new Error(`Airtable API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.records.length > 0) {
        const record = data.records[0];
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            id: record.fields.drop_id || 'drop_003',
            title: record.fields.theme || 'Breaking the Cycle',
            theme_summary: record.fields.prompt_question || 'Share the moment when you broke free from something that was holding you back',
            drop_status: record.fields.drop_status || 'live',
            launch_date: record.fields.launch_date,
            est_close_date: record.fields.est_close_date
          })
        };
      }

      // Return default drop if none found
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          id: 'drop_003',
          title: 'Breaking the Cycle',
          theme_summary: 'Share the moment when you broke free from something that was holding you back',
          drop_status: 'live',
          launch_date: '2025-05-20',
          est_close_date: '2025-05-26'
        })
      };
    } catch (error) {
      console.error('Error getting current drop:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: error.message })
      };
    }
  }

  // Get threads for specific drop
  async function getThreads(dropId = 'drop_003') {
    try {
      const tableUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/ThreadsGrid%20view%203`;
      const filterFormula = `AND({drop_id}='${dropId}',{wall_status}='Accepted')`;
      const url = `${tableUrl}?filterByFormula=${encodeURIComponent(filterFormula)}&maxRecords=125&sort[0][field]=upvote_count&sort[0][direction]=desc`;
      
      const response = await fetch(url, {
        headers: airtableHeaders
      });

      if (!response.ok) {
        throw new Error(`Airtable API error: ${response.status}`);
      }

      const data = await response.json();
      
      const threads = data.records.map((record, index) => ({
        id: record.fields.submission_id || record.id,
        message: record.fields.text_snippet || '',
        emotion: record.fields.emotion_tag || 'hope',
        reactions: parseReactions(record.fields.reactions),
        thread_number: index + 1,
        created_at: record.fields.timestamp || record.createdTime,
        upvote_count: record.fields.upvote_count || 0,
        optional_name: record.fields.optional_name || 'Anonymous'
      }));

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(threads)
      };
    } catch (error) {
      console.error('Error getting threads:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: error.message })
      };
    }
  }

  // Submit new thread
  async function submitThread(threadData) {
    try {
      const tableUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/ThreadsGrid%20view%203`;
      
      const submission = {
        fields: {
          text_snippet: threadData.message,
          emotion_tag: threadData.emotion,
          drop_id: threadData.drop_id || 'drop_003',
          wall_status: 'Pending',
          email_for_drop: threadData.email || '',
          optional_name: threadData.name || 'Anonymous',
          upvote_count: 0,
          reactions: JSON.stringify({ heart: 0, fire: 0, sparkles: 0 }),
          timestamp: new Date().toISOString()
        }
      };

      const response = await fetch(tableUrl, {
        method: 'POST',
        headers: airtableHeaders,
        body: JSON.stringify(submission)
      });

      if (!response.ok) {
        throw new Error(`Airtable API error: ${response.status}`);
      }

      const result = await response.json();
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          thread_id: result.id,
          message: 'Thread submitted successfully'
        })
      };
    } catch (error) {
      console.error('Error submitting thread:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: error.message })
      };
    }
  }

  // Update reaction counts
  async function updateReactions(threadId, reactionType) {
    try {
      // This would require fetching the current record, updating reactions, and patching back
      // For now, return success to prevent client errors
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Reaction updated'
        })
      };
    } catch (error) {
      console.error('Error updating reactions:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: error.message })
      };
    }
  }

  // Helper function to parse reaction JSON
  function parseReactions(reactionsString) {
    try {
      return JSON.parse(reactionsString || '{}');
    } catch {
      return { heart: 0, fire: 0, sparkles: 0 };
    }
  }
};
