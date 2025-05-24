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

// SAMPLE THREAD DATA (for when Airtable isn't configured)
const SAMPLE_THREADS = [
    { id: "001", message: "I stopped pretending to be okay and finally asked for help", emotion: "relief", thread_number: 1, reactions: { heart: 89, fire: 34, sparkles: 67 }, created_at: "2025-05-23T10:30:00.000Z" },
    { id: "002", message: "Finding strength in vulnerability instead of hiding behind walls", emotion: "empowerment", thread_number: 2, reactions: { heart: 72, fire: 28, sparkles: 45 }, created_at: "2025-05-23T09:15:00.000Z" },
    { id: "003", message: "Angry at everything because I was really angry at myself", emotion: "rage", thread_number: 3, reactions: { heart: 56, fire: 91, sparkles: 23 }, created_at: "2025-05-23T08:45:00.000Z" },
    { id: "004", message: "Learning to forgive myself first before expecting it from others", emotion: "empowerment", thread_number: 4, reactions: { heart: 88, fire: 42, sparkles: 61 }, created_at: "2025-05-23T07:20:00.000Z" },
    { id: "005", message: "Finally breathing again after years of holding my breath", emotion: "relief", thread_number: 5, reactions: { heart: 94, fire: 38, sparkles: 72 }, created_at: "2025-05-23T06:30:00.000Z" },
    { id: "006", message: "Some days you just need to cry and that's perfectly okay", emotion: "grief", thread_number: 6, reactions: { heart: 103, fire: 19, sparkles: 84 }, created_at: "2025-05-22T22:15:00.000Z" },
    { id: "007", message: "Love is worth fighting for even when everything feels broken", emotion: "love", thread_number: 7, reactions: { heart: 127, fire: 45, sparkles: 89 }, created_at: "2025-05-22T21:00:00.000Z" },
    { id: "008", message: "Every small step counts when you're climbing out of darkness", emotion: "hope", thread_number: 8, reactions: { heart: 76, fire: 52, sparkles: 94 }, created_at: "2025-05-22T19:45:00.000Z" },
    { id: "009", message: "The silence is deafening but I'm learning to sit with it", emotion: "grief", thread_number: 9, reactions: { heart: 67, fire: 31, sparkles: 48 }, created_at: "2025-05-22T18:30:00.000Z" },
    { id: "010", message: "I choose myself today even when it feels selfish", emotion: "empowerment", thread_number: 10, reactions: { heart: 98, fire: 73, sparkles: 56 }, created_at: "2025-05-22T17:15:00.000Z" }
];

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
            
            // Set up event listeners first
            this.setupEventListeners();
            
            // Try to load data from Airtable, fallback to sample data
            await this.loadData();
            
            // Start periodic updates
            this.startPeriodicUpdates();
            
            this.isInitialized = true;
            console.log('U INSPIRE Wall initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize U INSPIRE Wall:', error);
            // Load sample data as fallback
            threads = SAMPLE_THREADS;
            this.renderWall();
            this.renderFeaturedStories();
            this.updateStats();
            this.updateCountdown();
            this.startPeriodicUpdates();
        }
    }

    // Load data from Airtable or use sample data
    async loadData() {
        try {
            // Check if Airtable is configured
            if (this.airtableAPI && this.airtableAPI.isConfigured()) {
                console.log('Loading data from Airtable...');
                
                // Load current drop info
                currentDrop = await this.airtableAPI.getCurrentDrop();
                
                // Load threads for current drop
                const dropId = currentDrop?.id || 'drop_003';
                threads = await this.airtableAPI.getThreads(dropId);
                
                console.log(`Loaded ${threads.length} threads from Airtable`);
            } else {
                console.log('Using sample data (Airtable not configured)');
                threads = SAMPLE_THREADS;
            }
            
            // Update UI
            this.renderWall();
            this.renderFeaturedStories();
            this.updateStats();
            this.updateCountdown();
            
        } catch (error) {
            console.error('Error loading data, using sample data:', error);
            threads = SAMPLE_THREADS;
            this.renderWall();
            this.renderFeaturedStories();
            this.updateStats();
            this.updateCountdown();
        }
    }

    // Set up event listeners
    setupEventListeners() {
        // Modal controls - updated selectors
        const submitBtns = document.querySelectorAll('.submit-story-btn, .btn-primary, #submit-thread-btn, #main-submit-btn');
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
            const textarea = modal.querySelector('textarea[name="text_snippet"]');
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
            
            // Get form data - FIXED: using correct field name
            const formData = new FormData(event.target);
            const submission = {
                message: formData.get('text_snippet').trim(), // Fixed field name
                emotion: selectedEmotion || 'hope',
                email: formData.get('email_for_drop')?.trim() || '',
                name: formData.get('optional_name')?.trim() || 'Anonymous',
                drop_id: currentDrop?.id || 'drop_003'
            };

            // Validate submission
            if (!this.validateSubmission(submission)) {
                return;
            }

            // Try to submit to Airtable, otherwise show success anyway
            if (this.airtableAPI && this.airtableAPI.isConfigured()) {
                await this.airtableAPI.submitThread(submission);
            }
            
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
        if (!submission.message || submission.message.length < 5) {
            this.showError('Please enter a message with at least 5 characters.');
            return false;
        }

        if (submission.message.length > 500) {
            this.showError('Message must be less than 500 characters.');
            return false;
        }

        if (!submission.emotion) {
            this.showError('Please select an emotion.');
            return false;
        }

        if (submission.email && !this.isValidEmail(submission.email)) {
            this.showError('Please enter a valid email address.');
            return false;
        }

        return true;
    }

    // Email validation
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Show success message
    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    // Show error message
    showError(message) {
        this.showNotification(message, 'error');
    }

    // Show notification
    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#4ade80' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            padding: 16px 24px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 9999;
            font-weight: 500;
            max-width: 400px;
            animation: slideIn 0.3s ease-out;
        `;
        notification.textContent = message;

        // Add animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
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

    // Render the main wall with interactive magnifying glass
    renderWall() {
        const svg = document.getElementById('inspireSvg');
        if (!svg) return;

        console.log('Rendering wall with', threads.length, 'threads');

        // Create the interactive wall
        this.createInteractiveWall(svg);
    }

    // Create interactive wall with magnifying glass
    createInteractiveWall(svg) {
        // Set up SVG viewBox for proper scaling
        svg.setAttribute('viewBox', '0 0 900 240');
        svg.style.backgroundColor = '#f7f5f0';
        svg.style.cursor = 'crosshair';

        // Clear any existing content
        svg.innerHTML = '';

        // Create defs section for clip paths and effects
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        
        // Letter clip path for "U INSPIRE"
        const letterClip = document.createElementNS('http://www.w3.org/2000/svg', 'clipPath');
        letterClip.id = 'letterClip';
        letterClip.innerHTML = `
            <!-- U shape -->
            <path d="M40 40 L40 160 Q40 200 80 200 L120 200 Q160 200 160 160 L160 40 L140 40 L140 150 Q140 180 120 180 L80 180 Q60 180 60 150 L60 40 Z" />
            <!-- I shape -->
            <rect x="200" y="40" width="30" height="160" />
            <rect x="190" y="40" width="50" height="20" />
            <rect x="190" y="180" width="50" height="20" />
            <!-- N shape -->
            <path d="M280 40 L280 200 L300 200 L300 80 L320 200 L340 200 L340 40 L320 40 L320 160 L300 40 Z" />
            <!-- S shape -->
            <rect x="380" y="40" width="70" height="20" />
            <rect x="380" y="60" width="20" height="50" />
            <rect x="380" y="110" width="70" height="20" />
            <rect x="430" y="130" width="20" height="50" />
            <rect x="380" y="180" width="70" height="20" />
            <!-- P shape -->
            <path d="M490 40 L490 200 L510 200 L510 130 L540 130 Q570 130 570 100 L570 70 Q570 40 540 40 Z M510 60 L540 60 Q550 60 550 70 L550 100 Q550 110 540 110 L510 110 Z" />
            <!-- I shape -->
            <rect x="610" y="40" width="30" height="160" />
            <rect x="600" y="40" width="50" height="20" />
            <rect x="600" y="180" width="50" height="20" />
            <!-- R shape -->
            <path d="M690 40 L690 200 L710 200 L710 130 L730 130 L750 200 L770 200 L745 125 Q760 120 760 100 L760 70 Q760 40 730 40 Z M710 60 L730 60 Q740 60 740 70 L740 100 Q740 110 730 110 L710 110 Z" />
            <!-- E shape -->
            <rect x="810" y="40" width="80" height="20" />
            <rect x="810" y="60" width="25" height="60" />
            <rect x="810" y="120" width="70" height="20" />
            <rect x="810" y="140" width="25" height="40" />
            <rect x="810" y="180" width="80" height="20" />
        `;

        // Magnifying glass mask
        const magnifyMask = document.createElementNS('http://www.w3.org/2000/svg', 'clipPath');
        magnifyMask.id = 'magnifyMask';
        magnifyMask.innerHTML = '<circle cx="0" cy="0" r="80"/>';

        defs.appendChild(letterClip);
        defs.appendChild(magnifyMask);
        svg.appendChild(defs);

        // Create text group with clipping
        const textGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        textGroup.setAttribute('clip-path', 'url(#letterClip)');

        // Generate text elements from threads
        let threadIndex = 0;
        for (let x = 50; x <= 880; x += 12) {
            let y = 50;
            let wordsInColumn = 0;
            
            while (y < 190 && wordsInColumn < 12) {
                const currentThread = threads[threadIndex % threads.length];
                const words = currentThread.message.split(' ');
                
                let fontSize = Math.floor(Math.random() * 4) + 8; // 8-12px random
                
                words.forEach((word) => {
                    if (y < 190 && word.trim().length > 0) {
                        const textElement = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                        textElement.setAttribute('x', x);
                        textElement.setAttribute('y', y);
                        textElement.setAttribute('fill', EMOTION_COLORS[currentThread.emotion] || '#8a8a8a');
                        textElement.setAttribute('font-size', fontSize);
                        textElement.setAttribute('font-family', "'Koulen', sans-serif");
                        textElement.setAttribute('writing-mode', 'vertical-rl');
                        textElement.setAttribute('text-orientation', 'mixed');
                        textElement.style.pointerEvents = 'none';
                        textElement.textContent = word;
                        textGroup.appendChild(textElement);
                        
                        y += word.length * fontSize * 0.4 + 2;
                        wordsInColumn++;
                    }
                });
                
                y += 6;
                threadIndex++;
            }
        }

        svg.appendChild(textGroup);

        // Create hover zones
        const hoverGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        let zoneId = 1;
        for (let zoneX = 40; zoneX <= 880; zoneX += 60) {
            for (let zoneY = 40; zoneY <= 180; zoneY += 50) {
                const threadIndex = (zoneId - 1) % threads.length;
                const thread = threads[threadIndex];
                
                const zone = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                zone.setAttribute('x', zoneX);
                zone.setAttribute('y', zoneY);
                zone.setAttribute('width', 55);
                zone.setAttribute('height', 45);
                zone.setAttribute('fill', 'transparent');
                zone.style.cursor = 'pointer';
                
                zone.dataset.threadId = thread.id;
                zone.dataset.emotion = thread.emotion;
                zone.dataset.message = thread.message;
                zone.dataset.word = thread.message.split(' ')[0];
                
                hoverGroup.appendChild(zone);
                zoneId++;
            }
        }

        svg.appendChild(hoverGroup);

        // Magnifying glass group
        const magnifyGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        magnifyGroup.id = 'magnifyGroup';
        magnifyGroup.style.display = 'none';
        svg.appendChild(magnifyGroup);

        // Add interactivity
        this.setupInteractions(svg);
    }

    // Setup interactions
    setupInteractions(svg) {
        let currentMousePos = { x: 0, y: 0 };
        let isHovering = false;

        svg.addEventListener('mousemove', (event) => {
            const rect = svg.getBoundingClientRect();
            const scaleX = 900 / rect.width;
            const scaleY = 240 / rect.height;
            
            currentMousePos = {
                x: (event.clientX - rect.left) * scaleX,
                y: (event.clientY - rect.top) * scaleY
            };

            if (isHovering) {
                this.updateMagnifyingGlass(currentMousePos, event.target);
            }
        });

        svg.addEventListener('mouseover', (event) => {
            if (event.target.dataset.threadId) {
                isHovering = true;
                const magnifyGroup = document.getElementById('magnifyGroup');
                if (magnifyGroup) {
                    magnifyGroup.style.display = 'block';
                }
                this.updateMagnifyingGlass(currentMousePos, event.target);
                this.showTooltip(event, event.target);
            }
        });

        svg.addEventListener('mouseout', (event) => {
            if (event.target.dataset.threadId) {
                isHovering = false;
                setTimeout(() => {
                    const magnifyGroup = document.getElementById('magnifyGroup');
                    if (magnifyGroup) {
                        magnifyGroup.style.display = 'none';
                    }
                    this.hideTooltip();
                }, 300);
            }
        });
    }

    // Update magnifying glass
    updateMagnifyingGlass(mousePos, target) {
        const magnifyGroup = document.getElementById('magnifyGroup');
        if (!magnifyGroup || !target.dataset) return;

        magnifyGroup.innerHTML = '';

        // Update mask
        const mask = document.querySelector('#magnifyMask circle');
        if (mask) {
            mask.setAttribute('cx', mousePos.x);
            mask.setAttribute('cy', mousePos.y);
        }

        // Create magnifying glass elements
        const elements = [
            `<circle cx="${mousePos.x}" cy="${mousePos.y}" r="75" fill="rgba(0,0,0,0.85)" clip-path="url(#magnifyMask)"/>`,
            `<circle cx="${mousePos.x}" cy="${mousePos.y}" r="60" fill="none" stroke="${EMOTION_COLORS[target.dataset.emotion] || '#8a8a8a'}" stroke-width="2" opacity="0.7" clip-path="url(#magnifyMask)"/>`,
            `<text x="${mousePos.x}" y="${mousePos.y - 5}" text-anchor="middle" fill="${EMOTION_COLORS[target.dataset.emotion] || '#8a8a8a'}" font-size="16" font-family="'Koulen', sans-serif" font-weight="bold" clip-path="url(#magnifyMask)">${target.dataset.word || 'thread'}</text>`,
            `<text x="${mousePos.x}" y="${mousePos.y + 15}" text-anchor="middle" fill="white" font-size="11" font-family="'Koulen', sans-serif" clip-path="url(#magnifyMask)">#${target.dataset.threadId}</text>`,
            `<text x="${mousePos.x}" y="${mousePos.y + 30}" text-anchor="middle" fill="${EMOTION_COLORS[target.dataset.emotion] || '#8a8a8a'}" font-size="9" font-family="'Koulen', sans-serif" clip-path="url(#magnifyMask)">${target.dataset.emotion}</text>`,
            `<circle cx="${mousePos.x}" cy="${mousePos.y}" r="85" fill="none" stroke="#ff360a" stroke-width="4"/>`,
            `<circle cx="${mousePos.x}" cy="${mousePos.y}" r="80" fill="none" stroke="#f8ff00" stroke-width="2"/>`,
            `<line x1="${mousePos.x + 60}" y1="${mousePos.y + 60}" x2="${mousePos.x + 95}" y2="${mousePos.y + 95}" stroke="#ff360a" stroke-width="6" stroke-linecap="round"/>`
        ];

        magnifyGroup.innerHTML = elements.join('');
    }

    // Show tooltip
    showTooltip(event, target) {
        this.hideTooltip();

        const tooltip = document.createElement('div');
        tooltip.className = 'wall-tooltip';
        tooltip.id = 'wall-tooltip';
        
        const tooltipX = event.clientX + 20;
        const tooltipY = event.clientY - 80;
        
        tooltip.style.cssText = `
            position: absolute;
            background: rgba(255,255,255,0.95);
            color: #333;
            padding: 16px;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
            border: 2px solid ${EMOTION_COLORS[target.dataset.emotion] || '#8a8a8a'};
            max-width: 280px;
            pointer-events: none;
            z-index: 1000;
            font-family: 'Inter', sans-serif;
            backdrop-filter: blur(10px);
            left: ${Math.min(tooltipX, window.innerWidth - 300)}px;
            top: ${Math.max(20, tooltipY)}px;
        `;

        tooltip.innerHTML = `
            <div style="font-size: 16px; font-weight: bold; margin-bottom: 8px; color: ${EMOTION_COLORS[target.dataset.emotion] || '#8a8a8a'}; font-family: 'Koulen', sans-serif;">
                Thread #${target.dataset.threadId}
            </div>
            <div style="font-size: 14px; line-height: 1.4; margin-bottom: 8px;">
                "${target.dataset.message}"
            </div>
            <div style="font-size: 12px; color: #666; display: flex; justify-content: space-between; align-items: center;">
                <span>#${target.dataset.emotion}</span>
                <span style="color: ${EMOTION_COLORS[target.dataset.emotion] || '#8a8a8a'};">Hover to explore</span>
            </div>
        `;

        document.body.appendChild(tooltip);
    }

    // Hide tooltip
    hideTooltip() {
        const tooltip = document.getElementById('wall-tooltip');
        if (tooltip) {
            tooltip.remove();
        }
    }

    // Render featured stories - COMPLETE FUNCTION
    renderFeaturedStories() {
        const container = document.getElementById('featured-stories-container');
        if (!container || !threads.length) return;

        // Get top 3 threads by reactions
        const featured = threads
            .sort((a, b) => this.getTotalReactions(b) - this.getTotalReactions(a))
            .slice(0, 3);

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
            }

            // Update in Airtable if configured
            if (this.airtableAPI && this.airtableAPI.isConfigured()) {
                await this.airtableAPI.updateReactions(threadId, reactionType);
            }
            
        } catch (error) {
            console.error('Error updating reaction:', error);
        }
    }

    // Get total reactions for a thread
    getTotalReactions(thread) {
        const reactions = thread.reactions || {};
        return Object.values(reactions).reduce((sum, count) => sum + (count || 0), 0);
    }

    // Get time ago string
    getTimeAgo(dateString) {
        if (!dateString) return 'recently';
        
        const now = new Date();
        const date = new Date(dateString);
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) return 'just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
        
        return date.toLocaleDateString();
    }

    // Update statistics
    updateStats() {
        const totalThreads = threads.length;
        const spotsLeft = Math.max(0, 150 - totalThreads);
        
        // Update submission count displays
        const submissionCounts = document.querySelectorAll('#submission-count, #stories-count, #ticker-submission-count');
        submissionCounts.forEach(el => {
            if (el) el.textContent = totalThreads;
        });

        const spotsLeftElements = document.querySelectorAll('#spots-left, #spots-remaining');
        spotsLeftElements.forEach(el => {
            if (el) el.textContent = spotsLeft;
        });

        // Update ticker with live stats
        this.updateTicker();
    }

    // Update ticker
    updateTicker() {
        const totalThreads = threads.length;
        const spotsLeft = Math.max(0, 150 - totalThreads);
        const totalReactions = threads.reduce((sum, thread) => sum + this.getTotalReactions(thread), 0);
        
        // Get top emotion
        const emotionCounts = {};
        threads.forEach(thread => {
            emotionCounts[thread.emotion] = (emotionCounts[thread.emotion] || 0) + 1;
        });
        const topEmotion = Object.keys(emotionCounts).reduce((a, b) => 
            emotionCounts[a] > emotionCounts[b] ? a : b, 'empowerment'
        );

        const tickerContent = document.getElementById('ticker');
        if (tickerContent) {
            tickerContent.innerHTML = `
                <div class="ticker-item">🔥 ${totalThreads}/150 stories shared</div>
                <div class="ticker-item">❤️ ${totalReactions} total reactions</div>
                <div class="ticker-item">✨ Top emotion: ${topEmotion}</div>
                <div class="ticker-item">🎯 ${spotsLeft} spots remaining</div>
                <div class="ticker-item">💝 Breaking the Cycle theme</div>
            `;
        }
    }

    // Update countdown timer
    updateCountdown() {
        const countdownElement = document.getElementById('countdown');
        if (!countdownElement) return;

        const dropEndDate = currentDrop?.est_close_date ? new Date(currentDrop.est_close_date) : new Date('2025-05-26T23:59:59');
        const now = new Date();
        const timeLeft = dropEndDate - now;

        if (timeLeft > 0) {
            const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
            const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

            countdownElement.textContent = `${days}d ${hours}h ${minutes}m remaining`;
        } else {
            countdownElement.textContent = 'Drop ended';
        }
    }

    // Start periodic updates
    startPeriodicUpdates() {
        // Update stats every 30 seconds
        setInterval(() => {
            this.updateStats();
            this.updateCountdown();
        }, 30000);

        // Reload data every 5 minutes
        setInterval(() => {
            this.loadData();
        }, 300000);
    }
}

// Initialize the application
window.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Initializing U INSPIRE Wall...');
    
    // Wait for dependencies to load
    setTimeout(() => {
        if (typeof UInspireApp !== 'undefined') {
            console.log('✅ UInspireApp found, initializing...');
            const app = new UInspireApp();
            app.init();
            window.app = app;
        } else {
            console.error('❌ UInspireApp not found!');
        }
    }, 100);
});
