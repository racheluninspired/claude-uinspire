# claude-uinspire
U INSPIRE WALL

Anonymous stories become wearable art through time-limited drops

A community-built emotional art piece where users submit anonymous stories that are styled, stacked vertically, and clipped into the phrase "U INSPIRE." Each drop is time-limited and themed, with top stories becoming limited capsule merchandise.
🎯 Project Overview
The U INSPIRE Wall transforms anonymous emotional stories into:

Visual art clipped into "U INSPIRE" text shape
Community engagement through emoji voting
Limited merchandise featuring top stories
Collective healing through shared experiences

🚀 Features

✅ Anonymous story submission with emotion tagging
✅ Real-time emoji voting (❤️ 🔥 ✨ 😭 😤)
✅ Live countdown timer for drop deadlines
✅ TikTok/IG-style story cards for featured content
✅ SVG text clipping for visual wall display
✅ Mobile-first responsive design
✅ Airtable integration for data management
✅ Shopify integration for merchandise

🛠 Tech Stack

Frontend: HTML5, CSS3, Vanilla JavaScript
Database: Airtable
Commerce: Shopify API
Hosting: GitHub Pages / Netlify / Vercel
Fonts: Google Fonts (Koulen, Inter)

📦 Installation

Clone the repository
bashgit clone https://github.com/YOUR_USERNAME/u-inspire-wall.git
cd u-inspire-wall

Configure Airtable

Create Airtable base with provided schema
Update config/airtable-config.js with your credentials


Configure Shopify (Optional)

Set up Shopify API access
Update config/shopify-config.js with your credentials


Deploy

Push to GitHub
Connect to Netlify/Vercel for auto-deployment



⚙️ Configuration
Airtable Setup
See docs/airtable-setup.md for detailed database schema and configuration.
Shopify Integration
See docs/shopify-integration.md for commerce setup and product creation workflow.
🎨 Brand Guidelines

Primary Colors: #ff2eff (love), #f8ff00 (accent)
Typography: Koulen (display), Inter (body)
Aesthetic: Dark gradients, neon accents, glassmorphism
Voice: Raw, unfiltered, empowering

📱 Browser Support

Chrome 90+
Firefox 88+
Safari 14+
Edge 90+
Mobile browsers (iOS Safari, Chrome Mobile)

🔧 Development
Local Development
bash# Serve locally (Python)
python -m http.server 8000

# Or use Live Server in VS Code
Project Structure
u-inspire-wall/
├── index.html              # Main application
├── assets/
│   ├── css/styles.css      # Compiled styles
│   ├── js/app.js           # Main application logic
│   └── images/             # Static images
├── config/
│   ├── airtable-config.js  # Airtable configuration
│   └── shopify-config.js   # Shopify configuration
├── docs/                   # Documentation
└── README.md
🚀 Deployment
Netlify (Recommended)

Connect GitHub repository
Build command: none
Publish directory: /
Environment variables in Netlify dashboard

GitHub Pages

Go to Settings → Pages
Source: Deploy from branch
Branch: main / docs

📊 Analytics & Metrics
Track key metrics:

Submission conversion rate
Emoji engagement per thread
Email signup conversion
Capsule merchandise sales

🛡️ Security & Privacy

Anonymous submissions - no personal data stored
Email encryption for notifications
Content moderation before publication
GDPR compliant data handling

🤝 Contributing

Fork the repository
Create feature branch (git checkout -b feature/amazing-feature)
Commit changes (git commit -m 'Add amazing feature')
Push to branch (git push origin feature/amazing-feature)
Open Pull Request

📄 License
This project is licensed under the MIT License - see the LICENSE file for details.
🙏 Acknowledgments

UNINSPIRED™ Collective - Brand and vision
Community contributors - Anonymous stories and engagement
Airtable - Database and content management
Shopify - E-commerce platform

📞 Support
For technical support or questions:

# Airtable Database Integration

## 📊 Database Structure

The U INSPIRE Wall uses Airtable as its primary database with a carefully designed schema to support the community-driven storytelling platform.

### Database Tables

#### **Threads Table** (`ThreadsGrid view 3`)
Main table for user story submissions:

| Field | Type | Purpose |
|-------|------|---------|
| `submission_id` | Text | Unique identifier for each thread (T001, T002, etc.) |
| `text_snippet` | Long Text | The user's anonymous story content |
| `emotion_tag` | Text | Comma-separated emotion tags (grief,hope,relief) |
| `upvote_count` | Number | Community engagement metric |
| `drop_id` | Number | Links thread to specific drop (1, 2, 3...) |
| `wall_status` | Select | Moderation status (Pending, Accepted, Rejected) |
| `optional_name` | Text | Optional display name (defaults to "Anonymous") |
| `email_for_drop` | Email | For capsule notifications (optional) |
| `timestamp` | DateTime | Submission time |
| `expanded_story` | Long Text | Extended version for featured content |
| `reactions` | JSON | Emoji reaction counts |

#### **Drops Table** (`DropsGrid view 1`)
Configuration for themed submission periods:

| Field | Type | Purpose |
|-------|------|---------|
| `drop_id` | Number | Sequential drop identifier (1, 2, 3...) |
| `drop_status` | Select | Current status (live, closed) |
| `theme` | Text | Drop theme ("Breaking the Cycle", "Unwritten Goodbyes") |
| `prompt_question` | Long Text | Submission prompt for users |
| `launch_date` | Date | When submissions open |
| `est_close_date` | Date | Planned closing date |
| `capsule_url` | URL | Link to merchandise collection |
| `top_emotions` | Text | Most common emotions for this drop |

#### **Comments Table** (`CommentsGrid view 1`)
Threaded discussions on submissions:

| Field | Type | Purpose |
|-------|------|---------|
| `thread_id` | Number | Links to original thread |
| `submission_link` | Text | References specific thread submission |
| `message` | Long Text | Comment content |
| `wall_status` | Select | Moderation status (Pending, Accepted, Rejected) |
| `author_name` | Text | Comment author (defaults to "Anonymous") |
| `timestamp` | DateTime | Comment time |
| `drop_id` | Number | Associated drop |

## 🔄 Data Flow & Moderation

### Submission Workflow
1. **User submits** anonymous story through web interface
2. **Thread created** with status "Pending" in Airtable
3. **Moderator reviews** content and updates `wall_status`
4. **Accepted threads** appear on live wall
5. **Community engagement** through upvotes and comments

### Drop Management
- Each drop has a **125 submission limit**
- Drops progress: `live` → `closed` → `archived`
- **Sequential drop IDs** (001, 002, 003...)
- **Themed prompts** guide community submissions

### Content Moderation
- **All submissions** start as "Pending"
- **Manual review** required before public display
- **Comments system** with same moderation workflow
- **Featured threads** can be selected for merchandise

## 🛠 Technical Implementation

### Environment Variables (Netlify)
```env
AIRTABLE_BASE_ID=appZWj3wGRGuyH1jM
AIRTABLE_API_KEY=pat[your_token_here]
```

### API Integration
- **Real-time data fetching** from Airtable
- **Automatic fallback** to sample data if API unavailable
- **Rate limiting** compliance (5 requests/second)
- **Error handling** with graceful degradation

### Key Features Implemented
- ✅ **Dynamic drop loading** based on `drop_status='live'`
- ✅ **Thread filtering** by drop and acceptance status
- ✅ **Real-time submission** with form validation
- ✅ **Comment threading** linked to original submissions
- ✅ **Upvote tracking** and community engagement metrics
- ✅ **Email capture** for capsule merchandise notifications

## 📈 Scaling Considerations

### Current Limits
- **125 threads per drop** (business requirement)
- **50,000 records per base** (Airtable limit)
- **5 API requests/second** (rate limiting)
- **20GB attachment storage** (Airtable limit)

### Performance Optimizations
- **Field-specific queries** to minimize data transfer
- **Pagination support** for large datasets
- **Caching strategies** for frequently accessed data
- **Batch operations** for bulk updates

## 🔐 Security & Privacy

### Data Protection
- **Anonymous submissions** - no required personal data
- **Email encryption** for notification preferences
- **API key security** via environment variables
- **Content moderation** before public display

### GDPR Compliance
- **Minimal data collection** (only what's necessary)
- **User consent** for email notifications
- **Data retention policies** for old drops
- **Right to deletion** support

## 🚀 Setup Instructions

### 1. Create Airtable Base
1. Sign up at [airtable.com](https://airtable.com)
2. Create base named "U INSPIRE Wall"
3. Set up tables with exact field names from schema above
4. Configure single-select options for `emotion_tag` and `wall_status`

### 2. Generate API Credentials
1. Go to [airtable.com/create/tokens](https://airtable.com/create/tokens)
2. Create token with `data.records:read` and `data.records:write` scopes
3. Select your U INSPIRE Wall base
4. Copy token for environment variables

### 3. Configure Application
1. Add environment variables to Netlify dashboard
2. Update `config/airtable_config.js` with your base structure
3. Test API connection with sample data
4. Deploy and verify functionality

## 📊 Sample Data Structure

### Example Thread Record
```json
{
  "submission_id": "T001",
  "text_snippet": "I stopped pretending to be okay and finally asked for help",
  "emotion_tag": "relief,hope",
  "upvote_count": 26,
  "drop_id": 2,
  "wall_status": "Accepted",
  "optional_name": "Anonymous",
  "timestamp": "2025-05-19T16:27:00.000Z"
}
```

### Example Drop Record
```json
{
  "drop_id": 2,
  "drop_status": "live",
  "theme": "Unwritten Goodbyes",
  "prompt_question": "What do you wish you'd said before they left?",
  "launch_date": "2025-05-21",
  "top_emotions": "regret,sadness,hope"
}
```

## 🔧 Troubleshooting

### Common Issues
- **"No active drop found"**: Ensure you have a record with `drop_status='live'`
- **Threads not loading**: Check `wall_status='Accepted'` and correct `drop_id`
- **API rate limiting**: Implement delays between requests
- **Environment variables**: Verify correct setup in Netlify dashboard

### Support Resources
- [Airtable API Documentation](https://airtable.com/developers/web/api/introduction)
- [Detailed Setup Guide](docs/airtable_setup.md)
- [Field Mapping Reference](config/airtable_config.js)

Email: support@uninspiredcollective.com
Documentation: /docs folder
Issues: GitHub Issues tab


Built with ❤️ for the UNINSPIRED™ community
