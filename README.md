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

Email: support@uninspiredcollective.com
Documentation: /docs folder
Issues: GitHub Issues tab


Built with ❤️ for the UNINSPIRED™ community
