# Airtable Setup Guide

This guide walks you through setting up your Airtable database for the U INSPIRE Wall project.

## 📋 Database Schema

### Threads Table

| Field Name | Field Type | Options | Description |
|------------|------------|---------|-------------|
| `id` | Auto Number | Auto-generated | Unique thread identifier |
| `message` | Long Text | Required | The user's story/thread content |
| `expanded_story` | Long Text | Optional | Extended version for featured threads |
| `emotion` | Single Select | See options below | Emotional category |
| `reactions` | Long Text | JSON format | Emoji reaction counts |
| `status` | Single Select | Pending, Accepted, Rejected | Moderation status |
| `drop_id` | Single Line Text | e.g., "drop_003" | Which drop this belongs to |
| `capsule_feature` | Checkbox | Boolean | Featured in merchandise |
| `created_at` | Date | Auto-populated | Submission timestamp |
| `email` | Email | Optional | For capsule notifications |
| `thread_number` | Number | Auto-calculated | Display number (#001, #002) |

#### Emotion Options:
```
love, grief, rage, relief, shame, joy, fear, calm, empowerment, hope
```

#### Reactions JSON Format:
```json
{
  "heart": 0,
  "fire": 0,
  "sparkles": 0,
  "sad": 0,
  "rage": 0
}
```

### Drops Table

| Field Name | Field Type | Options | Description |
|------------|------------|---------|-------------|
| `id` | Auto Number | Auto-generated | Unique drop identifier |
| `title` | Single Line Text | e.g., "Breaking the Cycle" | Drop theme title |
| `theme_summary` | Long Text | Required | Drop description |
| `drop_open` | Date | Date/Time | When submissions open |
| `drop_close` | Date | Date/Time | Submission deadline |
| `archived` | Checkbox | Boolean | Is drop complete |
| `max_threads` | Number | Default: 150 | Maximum submissions |
| `current_count` | Number | Calculated | Current submission count |

## 🔧 Airtable Configuration Steps

### 1. Create New Base
1. Go to [airtable.com](https://airtable.com)
2. Click "Create a base"
3. Choose "Start from scratch"
4. Name it "U INSPIRE Wall"

### 2. Set Up Threads Table
1. Rename "Table 1" to "Threads"
2. Add all fields from schema above
3. Configure field types and options
4. Set up single select options for `emotion` and `status`

### 3. Set Up Drops Table
1. Add new table called "Drops"
2. Add all fields from schema above
3. Create your first drop record:
   ```
   Title: Breaking the Cycle
   Theme Summary: Stories about breaking negative patterns
   Drop Open: [Current date]
   Drop Close: [Future date]
   Max Threads: 150
   ```

### 4. Create Views
Create these views in the Threads table:

**Accepted Threads**
- Filter: Status = "Accepted"
- Sort: Created At (newest first)

**Featured Threads**
- Filter: Status = "Accepted" AND Capsule Feature = true
- Sort: Reactions (highest first)

**Pending Moderation**
- Filter: Status = "Pending"
- Sort: Created At (oldest first)

### 5. Set Up Automations (Optional)
Create automations for:
- **Auto-numbering threads** when status changes to "Accepted"
- **Email notifications** when capsule features are selected
- **Slack notifications** for new submissions

## 🔑 API Configuration

### 1. Generate API Key
1. Go to [airtable.com/account](https://airtable.com/account)
2. Click "Generate API key"
3. Copy and save securely

### 2. Get Base ID
1. Go to [airtable.com/api](https://airtable.com/api)
2. Select your "U INSPIRE Wall" base
3. Copy the Base ID from the URL or documentation

### 3. Update Configuration File
Edit `config/airtable-config.js`:

```javascript
const AIRTABLE_CONFIG = {
  BASE_ID: 'appXXXXXXXXXXXXXX', // Your base ID
  API_KEY: 'keyXXXXXXXXXXXXXX', // Your API key
  TABLES: {
    THREADS: 'Threads',
    DROPS: 'Drops'
  },
  ENDPOINTS: {
    THREADS: `https://api.airtable.com/v0/appXXXXXXXXXXXXXX/Threads`,
    DROPS: `https://api.airtable.com/v0/appXXXXXXXXXXXXXX/Drops`
  }
};
```

## 📊 Sample Data

### Sample Thread Record
```json
{
  "fields": {
    "message": "I stopped pretending to be okay and finally asked for help",
    "emotion": "relief",
    "reactions": "{\"heart\": 89, \"fire\": 34, \"sparkles\": 67, \"sad\": 12, \"rage\": 3}",
    "status": "Accepted",
    "drop_id": "drop_003",
    "capsule_feature": true,
    "created_at": "2025-05-23T10:30:00.000Z",
    "thread_number": 1
  }
}
```

### Sample Drop Record
```json
{
  "fields": {
    "title": "Breaking the Cycle",
    "theme_summary": "Stories about breaking negative patterns and cycles in life",
    "drop_open": "2025-05-20T00:00:00.000Z",
    "drop_close": "2025-05-26T23:59:59.000Z",
    "archived": false,
    "max_threads": 150,
    "current_count": 127
  }
}
```

## 🔐 Security Best Practices

### API Key Security
- **Never commit** API keys to public repositories
- Use **environment variables** in production
- **Regenerate keys** if compromised
- **Limit permissions** to necessary operations only

### Data Privacy
- **No personal identifiers** in thread content
- **Hash email addresses** for notifications
- **Regular data cleanup** of old submissions
- **GDPR compliance** for EU users

## 🧪 Testing Your Setup

### Test API Connection
```javascript
// Test basic connection
fetch('https://api.airtable.com/v0/YOUR_BASE_ID/Threads?maxRecords=1', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY'
  }
})
.then(response => response.json())
.then(data => console.log('Connection successful:', data));
```

### Test Data Submission
```javascript
// Test creating a new thread
fetch('https://api.airtable.com/v0/YOUR_BASE_ID/Threads', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    fields: {
      message: "Test submission",
      emotion: "hope",
      status: "Pending",
      drop_id: "drop_003"
    }
  })
});
```

## 🔄 Backup Strategy

### Regular Backups
- **Weekly CSV exports** of all data
- **Monthly base duplications** for version control
- **Automated backups** using Airtable API
- **External storage** for long-term retention

### Data Recovery
- **Version history** available in Airtable
- **Restore from CSV** for major data loss
- **API recreation** scripts for automation
- **Manual entry** as last resort

## 📈 Scaling Considerations

### Performance Optimization
- **Pagination** for large datasets
- **Caching** frequent queries
- **Rate limiting** compliance
- **Batch operations** for bulk updates

### Storage Limits
- **Airtable limits:** 50,000 records per base
- **Attachment limits:** 20GB per base
- **API limits:** 5 requests per second
- **Upgrade plans** for higher limits

## 🆘 Troubleshooting

### Common Issues

**403 Forbidden**
- Check API key validity
- Verify base permissions
- Confirm table names match

**422 Unprocessable Entity**
- Validate field types
- Check required fields
- Verify single select options

**Rate Limiting**
- Implement request delays
- Use batch operations
- Consider caching strategies

### Support Resources
- [Airtable API Documentation](https://airtable.com/api)
- [Airtable Community](https://community.airtable.com)
- [Support Contact](https://support.airtable.com)