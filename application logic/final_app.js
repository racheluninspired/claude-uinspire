/**
 * U INSPIRE Wall - Main Application JavaScript
 * UNINSPIRED™ Collective
 */

// GLOBAL VARIABLES
let threads = [];
let selectedEmotion = null;
let currentDrop = null;

// EMOTION COLOR MAP (matches Airtable config)
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

// APPLICATION INITIALIZATION
class UInspireApp {
    constructor() {
        this.airtableAPI = window.airtableAPI;
        this.isInitialized = false;
        
        // Bind methods
        this.init = this.init.bind(this);
        this.loadData = this.loadData.bind(this);
        this.renderWall = this.renderWall.bind(this);
        this.renderFeaturedStories = this.renderFeaturedStories.bind(this);
        this.updateStats = this.updateStats.bind(this);
        this.updateCountdown = this.updateCountdown.bind(this);
    }

    // Initialize application
    async init() {
        try {
            console.log('Initializing U INSPIRE Wall...');
            
            // Check if Airtable is configured
            if (!this.airtableAPI || !this.airtableAPI.isConfigured()) {
                this.showConfigurationError();
                return;
            }

            // Set up event listeners
            this.setupEventListeners();
            
            // Load initial data
            await this.loadData();
            
            // Start periodic updates
            this.startPeriodicUpdates();
            
            this.isInitialized = true;
            console.log('U INSPIRE Wall initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize U INSPIRE Wall:', error);
            this.showError('Failed to load the application. Please refresh the page.');
        }
    }

    // Load data from Airtable
    async loadData() {
        try {
            console.log('Loading data from Airtable...');
            
            // Load current drop info
            currentDrop = await this.airtableAPI.getCurrentDrop();
            
            // Load threads for current drop
            const dropId = currentDrop?.id || 'drop_003';
            threads = await this.airtableAPI.getThreads(dropId);
            
            console.log(`Loaded ${threads.length} threads for ${dropId}`);
            
            // Update UI
            this.renderWall();
            this.renderFeaturedStories();
            this.updateStats();
            this.updateCountdown();
            
        } catch (error) {
            console.error('Error loading data:', error);
            this.showError('Unable to load stories. Please check your connection.');
        }
    }

    // Set up event listeners
    setupEventListeners() {
        // Modal controls
        const submitBtns = document.querySelectorAll('.submit-story-btn, .cta-primary');
        submitBtns.forEach(btn => {
            btn.addEventListener('click', () => this.openSubmissionModal());
        });

        // Close modal events
        const closeBtn = document.querySelector('.close-modal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeSubmissionModal());
        }

        const modalOverlay = document.getElementById('submissionModal');
        if (modalOverlay) {
            modalOverlay.addEventListener('click', (e) => {
                if (e.target === modalOverlay) {
                    this.closeSubmissionModal();
                }
            });
        }

        // Form submission
        const form = document.getElementById('submissionForm');
        if (form) {
            form.addEventListener('submit', (e) => this.handleFormSubmission(e));
        }

        // Emotion selection
        document.querySelectorAll('.emotion-option').forEach(option => {
            option.addEventListener('click', (e) => this.selectEmotion(e));
        });

        // Notification signup
        const notifyBtn = document.querySelector('.notify-btn');
        if (notifyBtn) {
            notifyBtn.addEventListener('click', () => this.signupForNotifications());
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeSubmissionModal();
            }
        });
    }

    // Modal functions
    openSubmissionModal() {
        const modal = document.getElementById('submissionModal');
        if (modal) {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            
            // Focus on message textarea
            const textarea = modal.querySelector('textarea[name="message"]');
            if (textarea) {
                setTimeout(() => textarea.focus(), 100);
            }
        }
    }

    closeSubmissionModal() {
        const modal = document.getElementById('submissionModal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
            
            // Reset form
            this.resetForm();
        }
    }

    // Emotion selection
    selectEmotion(event) {
        // Remove selected class from all options
        document.querySelectorAll('.emotion-option').forEach(opt => {
            opt.classList.remove('selected');
        });
        
        // Add selected class to clicked option
        event.target.classList.add('selected');
        selectedEmotion = event.target.dataset.emotion;
        
        console.log('Selected emotion:', selectedEmotion);
    }

    // Form submission
    async handleFormSubmission(event) {
        event.preventDefault();
        
        const submitBtn = event.target.querySelector('.submit-btn');
        const originalText = submitBtn.textContent;
        
        try {
            // Show loading state
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner"></span>Submitting...';
            
            // Get form data
            const formData = new FormData(event.target);
            const submission = {
                message: formData.get('message').trim(),
                emotion: selectedEmotion || 'hope',
                email: formData.get('email')?.trim() || '',
                drop_id: currentDrop?.id || 'drop_003'
            };

            // Validate submission
            if (!this.validateSubmission(submission)) {
                return;
            }

            // Submit to Airtable
            await this.airtableAPI.submitThread(submission);
            
            // Success feedback
            this.showSuccess('Your thread has been submitted! You\'ll receive your thread number via email.');
            this.closeSubmissionModal();
            
            // Refresh data after short delay
            setTimeout(() => this.loadData(), 2000);
            
        } catch (error) {
            console.error('Submission error:', error);
            this.showError('Failed to submit your thread. Please try again.');
        } finally {
            // Reset button
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    }

    // Validate form submission
    validateSubmission(submission) {
        if (!window.VALIDATORS) {
            console.error('Validators not loaded');
            return false;
        }

        if (!window.VALIDATORS.message(submission.message)) {
            this.showError('Please enter a message between 5 and 500 characters.');
            return false;
        }

        if (!window.VALIDATORS.emotion(submission.emotion)) {
            this.showError('Please select an emotion.');
            return false;
        }

        if (submission.email && !window.VALIDATORS.email(submission.email)) {
            this.showError('Please enter a valid email address.');
            return false;
        }

        return true;
    }

    // Reset form
    resetForm() {
        const form = document.getElementById('submissionForm');
        if (form) {
            form.reset();
        }
        
        // Clear emotion selection
        document.querySelectorAll('.emotion-option').forEach(opt => {
            opt.classList.remove('selected');
        });
        selectedEmotion = null;
    }

    // Render the main wall
    renderWall() {
        const svg = document.getElementById('inspireSvg');
        if (!svg || !threads.length) return;

        // Create clip path and render threads
        svg.innerHTML = `
            <defs>
                <clipPath id="uInspireClip">
                    <!-- U shape -->
                    <path d="M40 50 L40 180 Q40 220 80 220 Q120 220 120 180 L120 50 L100 50 L100 180 Q100 200 80 200 Q60 200 60 180 L60 50 Z"/>
                    <!-- I shape -->
                    <rect x="160" y="50" width="20" height="170"/>
                    <!-- N shape -->
                    <path d="M40 280 L40 450 L60 450 L60 320 L100 450 L120 450 L120 280 L100 280 L100 410 L60 280 Z"/>
                    <!-- S shape -->
                    <path d="M160 280 Q140 280 140 300 Q140 320 160 320 L180 320 Q200 320 200 340 Q200 360 180 360 L140 360 L140 380 L180 380 Q220 380 220 340 Q220 300 180 300 L160 300 Q140 300 140 280 Q140 260 160 260 L200 260 L200 240 L160 240 Q120 240 120 280 Z"/>
                    <!-- P shape -->
                    <path d="M240 280 L240 450 L260 450 L260 380 L280 380 Q320 380 320 340 Q320 300 280 300 L260 300 L260 280 Z M260 320 L280 320 Q300 320 300 340 Q300 360 280 360 L260 360 Z"/>
                    <!-- I shape -->
                    <rect x="340" y="280" width="20" height="170"/>
                    <!-- R shape -->
                    <path d="M60 500 L60 650 L80 650 L80 600 L100 600 L120 650 L140 650 L115 600 Q140 600 140 575 Q140 550 115 550 L80 550 L80 500 Z M80 520 L115 520 Q120 520 120 535 Q120 550 115 550 L80 550 Z"/>
                    <!-- E shape -->
                    <path d="M160 500 L160 650 L220 650 L220 630 L180 630 L180 590 L210 590 L210 570 L180 570 L180 520 L220 520 L220 500 Z"/>
                </clipPath>
            </defs>
            <rect width="400" height="600" fill="#f7f5f0" clip-path="url(#uInspireClip)"/>
            <g clip-path="url(#uInspireClip)">
                ${threads.slice(0, 150).map((thread, index) => {
                    const x = 50 + (index * 15) % 350;
                    const y = 80 + Math.floor(index / 23) * 40;
                    const fontSize = Math.min(14, Math.max(8, 8 + (this.getTotalReactions(thread) * 0.5)));
                    const color = EMOTION_COLORS[thread.emotion] || '#111';
                    
                    return `
                        <text x="${x}" y="${y}" 
                              class="thread-text" 
                              style="font-size: ${fontSize}px; fill: ${color};" 
                              data-thread="${thread.id}"
                              onclick="app.showThreadDetails('${thread.id}')">
                            <tspan>${this.truncateText(thread.message, 30)}</tspan>
                        </text>
                    `;
                }).join('')}
            </g>
        `;
    }

    // Render featured stories
    renderFeaturedStories() {
        const container = document.getElementById('featured-stories');
        if (!container || !threads.length) return;

        const featured = threads
            .filter(thread => thread.capsule_feature)
            .sort((a, b) => this.getTotalReactions(b) - this.getTotalReactions(a))
            .slice(0, 5);

        if (featured.length === 0) {
            container.innerHTML = '<p style="text-align: center; opacity: 0.6;">No featured stories yet. Keep voting!</p>';
            return;
        }

        container.innerHTML = featured.map((thread, index) => `
            <div class="story-card">
                <div class="story-header">
                    <div class="thread-badge">#${String(thread.thread_number || index + 1).padStart(3, '0')}</div>
                    <div class="emotion-dot" style="background-color: ${EMOTION_COLORS[thread.emotion]};"></div>
                </div>
                <div class="story-content">
                    <div class="story-text">"${thread.message}"</div>
                </div>
                <div class="story-footer">
                    <div class="story-reactions">
                        <div class="reaction" onclick="app.reactToThread('${thread.id}', 'heart')">❤️ ${thread.reactions?.heart || 0}</div>
                        <div class="reaction" onclick="app.reactToThread('${thread.id}', 'fire')">🔥 ${thread.reactions?.fire || 0}</div>
                        <div class="reaction" onclick="app.reactToThread('${thread.id}', 'sparkles')">✨ ${thread.reactions?.sparkles || 0}</div>
                    </div>
                    <div class="story-time">${this.getTimeAgo(thread.created_at)}</div>
                </div>
            </div>
        `).join('');
    }

    // Handle emoji reactions
    async reactToThread(threadId, reactionType) {
        try {
            // Optimistic update
            const threadIndex = threads.findIndex(t => t.id === threadId);
            if (threadIndex !== -1) {
                threads[threadIndex].reactions = threads[threadIndex].reactions || {};
                threads[threadIndex].reactions[reactionType] = (threads[threadIndex].reactions[reactionType] || 0) + 1;
                
                // Re-render immediately for responsiveness
                this.renderFeaturedStories();
                this.renderWall();
            }

            // Update in Airtable
            await this.airtableAPI.updateReactions(threadId, reactionType);
            
        } catch (error) {
            console.error('Error updating reaction:', error);
            // Reload data to correct optimistic update if it failed
            this.loadData();
        }
    }

    // Update statistics
    updateStats() {
        const totalThreads = threads.length;
        const spotsLeft = Math.max(0, 150 - totalThreads);
        
        // Update submission count displays
        const submissionCounts = document.querySelectorAll('#submission-count, #stories-count');
        submissionCounts.forEach(el => {
            if (el) el.textContent = totalThreads;
        });

        const spotsLeftElements = document.querySelectorAll('#spots-left');
        spotsLeftElements.forEach(el => {
            if (el) el.textContent = spotsLeft;
        });

        // Update next thread number
        const nextThreadNumber = document.getElementById('next-thread-number');
        if (nextThreadNumber) {
            nextThreadNumber.textContent = String(totalThreads + 1).padStart(3, '0');
        }

        // Update ticker with live stats
        this.updateTicker();
    }

    // Update countdown timer
    updateCountdown() {
        const countdownElement = document.getElementById('countdown');
        if (!countdownElement) return;

        const dropEndDate = currentDrop?.drop_close ? new Date(currentDrop.drop_close) : new Date('2025-05-26T23:59:59');
        const now = new Date();
        const timeLeft = dropEndDate - now;

        if (timeLeft > 0) {
            const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
            const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

            countdownElement.textContent = 
                `${days.toString().padStart(2, '0')}:${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        } else {
            countdownElement.textContent = 'DROP CLOSED';
            countdownElement.style.color = '#ff360a';
        }
    }

    // Update ticker content
    updateTicker() {
        const ticker = document.getElementById('ticker');
        if (!ticker) return;

        const totalReactions = threads.reduce((sum, thread) => sum + this.getTotalReactions(thread), 0);
        const topThread = threads.reduce((top, thread) => 
            this.getTotalReactions(thread) > this.getTotalReactions(top) ? thread : top, 
            threads[0] || {}
        );

        const tickerItems = [
            `🔥 Drop closes in ${this.getTimeRemaining()}`,
            `❤️ Top thread: "${this.truncateText(topThread.message || 'Loading...', 40)}"`,
            `✨ ${threads.length}/150 submissions received`,
            `😭 ${totalReactions} total reactions`,
            `🔥 Most reactions: ${this.getTotalReactions(topThread)}`,
            `❤️ Community strength: GROWING DAILY`
        ];

        ticker.innerHTML = tickerItems.map(item => `<div class="ticker-item">${item}</div>`).join('');
    }

    // Email notification signup
    signupForNotifications() {
        const email = prompt('Enter your email for capsule drop notifications:');
        if (email && this.isValidEmail(email)) {
            // In production, this would integrate with your email service
            try {
                // Store email for notifications (implement your email service here)
                localStorage.setItem('u_inspire_email', email);
                this.showSuccess('Thanks! You\'ll be notified when the capsule drops.');
            } catch (error) {
                console.error('Error saving email:', error);
                this.showSuccess('Thanks! You\'ll be notified when the capsule drops.');
            }
        } else if (email) {
            this.showError('Please enter a valid email address.');
        }
    }

    // Show thread details
    showThreadDetails(threadId) {
        const thread = threads.find(t => t.id === threadId);
        if (!thread) return;

        const totalReactions = this.getTotalReactions(thread);
        const message = `Thread #${String(thread.thread_number || '001').padStart(3, '0')}\n\n"${thread.message}"\n\nEmotion: ${thread.emotion}\nTotal reactions: ${totalReactions}`;
        
        alert(message);
    }

    // Start periodic updates
    startPeriodicUpdates() {
        // Update countdown every second
        setInterval(() => this.updateCountdown(), 1000);
        
        // Refresh data every 30 seconds
        setInterval(() => this.loadData(), 30000);
        
        // Update ticker animation every 20 seconds
        setInterval(() => this.updateTicker(), 20000);
    }

    // Utility functions
    getTotalReactions(thread) {
        if (!thread || !thread.reactions) return 0;
        const reactions = typeof thread.reactions === 'string' ? 
            JSON.parse(thread.reactions) : thread.reactions;
        return Object.values(reactions).reduce((sum, count) => sum + (count || 0), 0);
    }

    truncateText(text, maxLength) {
        if (!text) return '';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }

    getTimeAgo(dateString) {
        if (!dateString) return 'Unknown';
        
        const now = new Date();
        const created = new Date(dateString);
        const diffInHours = Math.floor((now - created) / (1000 * 60 * 60));
        
        if (diffInHours < 1) return 'Just now';
        if (diffInHours < 24) return `${diffInHours}h ago`;
        return `${Math.floor(diffInHours / 24)}d ago`;
    }

    getTimeRemaining() {
        if (!currentDrop?.drop_close) return '2d 14h';
        
        const now = new Date();
        const end = new Date(currentDrop.drop_close);
        const timeLeft = end - now;
        
        if (timeLeft <= 0) return 'CLOSED';
        
        const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        
        return `${days}d ${hours}h`;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Error handling and user feedback
    showError(message) {
        this.showNotification(message, 'error');
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'error' ? '#ff360a' : type === 'success' ? '#b8ff10' : '#111'};
            color: ${type === 'success' ? '#111' : 'white'};
            padding: 16px 24px;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            z-index: 10000;
            max-width: 300px;
            font-weight: 500;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        notification.textContent = message;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Remove after 5 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 5000);
    }

    showConfigurationError() {
        const errorHtml = `
            <div style="text-align: center; padding: 40px; background: #fff; margin: 20px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                <h2 style="color: #ff360a; margin-bottom: 16px;">Configuration Required</h2>
                <p style="margin-bottom: 16px; color: #666;">Please configure your Airtable credentials in <code>config/airtable-config.js</code></p>
                <p style="font-size: 14px; color: #999;">See the setup guide in <code>docs/airtable-setup.md</code> for detailed instructions.</p>
            </div>
        `;
        
        document.body.innerHTML = errorHtml;
    }
}

// ANALYTICS INTEGRATION
class Analytics {
    static track(event, properties = {}) {
        // Integration point for analytics services (Google Analytics, Mixpanel, etc.)
        console.log('Analytics:', event, properties);
        
        // Example Google Analytics integration
        if (typeof gtag !== 'undefined') {
            gtag('event', event, properties);
        }
        
        // Example Mixpanel integration
        if (typeof mixpanel !== 'undefined') {
            mixpanel.track(event, properties);
        }
    }

    static trackSubmission(emotion, messageLength) {
        this.track('thread_submitted', {
            emotion,
            message_length: messageLength,
            source: 'u_inspire_wall'
        });
    }

    static trackReaction(reactionType, threadId) {
        this.track('thread_reaction', {
            reaction_type: reactionType,
            thread_id: threadId,
            source: 'u_inspire_wall'
        });
    }

    static trackEmailSignup(source = 'capsule_notification') {
        this.track('email_signup', {
            source,
            page: 'u_inspire_wall'
        });
    }
}

// INITIALIZE APPLICATION
let app;

document.addEventListener('DOMContentLoaded', function() {
    try {
        app = new UInspireApp();
        app.init();
        
    } catch (error) {
        console.error('Failed to initialize application:', error);
        
        // Fallback error display
        document.body.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <h2 style="color: #ff360a;">Application Error</h2>
                <p>Failed to load the U INSPIRE Wall. Please refresh the page.</p>
                <button onclick="location.reload()" style="padding: 12px 24px; background: #111; color: white; border: none; border-radius: 6px; cursor: pointer; margin-top: 16px;">Reload Page</button>
            </div>
        `;
    }
});

// GLOBAL ERROR HANDLING
window.addEventListener('error', function(event) {
    console.error('Global error:', event.error);
    Analytics.track('javascript_error', {
        message: event.error.message,
        filename: event.filename,
        line: event.lineno,
        column: event.colno
    });
});

// EXPORT FOR GLOBAL ACCESS
window.UInspireApp = UInspireApp;
window.Analytics = Analytics;