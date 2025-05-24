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
            if (!this.airtableAPI.isConfigured()) {
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
                    <path d="M160 280 Q140 280 140 300 Q140 320 160 320 L180 320 Q200 320 200 340 Q200 360 180 360 L140 360 L140 380 L180 380 Q220 380 220 340 Q220 300 180 300 L160 300 Q140 300 140 280 Q140 260 160 260 L200 260 L200 240 L160 240 Q120 