// Utility Functions
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);
const isMobile = () => window.innerWidth <= 768;

// Debounce Function
const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// Mobile Menu Handler
class MobileMenu {
    constructor() {
        this.menuBtn = $('#mobileMenuBtn');
        this.nav = $('#navLinks');
        this.overlay = $('#menuOverlay');
        this.isOpen = false;

        if (!this.menuBtn || !this.nav || !this.overlay) return;

        this.init();
    }

    init() {
        this.menuBtn.addEventListener('click', () => this.toggleMenu());
        this.overlay.addEventListener('click', () => this.closeMenu());
        
        // Close menu when clicking nav links
        this.nav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => this.closeMenu());
        });

        // Handle escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closeMenu();
        });

        // Handle resize
        window.addEventListener('resize', debounce(() => {
            if (!isMobile() && this.isOpen) {
                this.closeMenu();
            }
        }, 250));
    }

    toggleMenu() {
        this.isOpen ? this.closeMenu() : this.openMenu();
    }

    openMenu() {
        this.menuBtn.classList.add('active');
        this.nav.classList.add('active');
        this.overlay.classList.add('active');
        document.body.classList.add('no-scroll');
        this.isOpen = true;

        // Trap focus within menu
        this.nav.querySelector('a')?.focus();
    }

    closeMenu() {
        this.menuBtn.classList.remove('active');
        this.nav.classList.remove('active');
        this.overlay.classList.remove('active');
        document.body.classList.remove('no-scroll');
        this.isOpen = false;

        // Return focus to menu button
        this.menuBtn.focus();
    }
}

// Before/After Image Slider
class BeforeAfterSlider {
    constructor(element) {
        this.element = element;
        this.before = element.querySelector('.before');
        this.after = element.querySelector('.after');
        this.slider = element.querySelector('.slider');
        
        if (!this.before || !this.after || !this.slider) return;
        
        this.isActive = false;
        this.currentX = 50;
        
        this.init();
    }

    init() {
        // Set initial styles
        this.element.style.position = 'relative';
        this.before.style.position = 'absolute';
        this.before.style.top = '0';
        this.before.style.left = '0';
        this.before.style.width = '100%';
        this.before.style.height = '100%';
        this.after.style.position = 'absolute';
        this.after.style.top = '0';
        this.after.style.left = '0';
        this.after.style.width = '100%';
        this.after.style.height = '100%';
        
        // Set initial position
        this.updateSliderPosition(50);
        
        // Mouse events
        this.element.addEventListener('mousedown', (e) => this.startSliding(e));
        document.addEventListener('mousemove', (e) => this.slide(e));
        document.addEventListener('mouseup', () => this.stopSliding());
        
        // Touch events
        this.element.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.startSliding(e.touches[0]);
        });
        document.addEventListener('touchmove', (e) => this.slide(e.touches[0]));
        document.addEventListener('touchend', () => this.stopSliding());
        
        // Accessibility
        this.setupAccessibility();
    }

    setupAccessibility() {
        this.slider.setAttribute('role', 'slider');
        this.slider.setAttribute('aria-valuemin', '0');
        this.slider.setAttribute('aria-valuemax', '100');
        this.slider.setAttribute('aria-valuenow', '50');
        this.slider.setAttribute('tabindex', '0');
        
        this.slider.addEventListener('keydown', (e) => {
            const step = 5;
            if (e.key === 'ArrowLeft') {
                this.updateSliderPosition(Math.max(0, this.currentX - step));
            } else if (e.key === 'ArrowRight') {
                this.updateSliderPosition(Math.min(100, this.currentX + step));
            }
        });
    }

    startSliding(e) {
        this.isActive = true;
        this.element.classList.add('sliding');
        this.slide(e);
    }

    slide(e) {
        if (!this.isActive) return;
        
        const rect = this.element.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const position = Math.min(Math.max(0, x * 100), 100);
        
        this.updateSliderPosition(position);
    }

    stopSliding() {
        this.isActive = false;
        this.element.classList.remove('sliding');
    }

    updateSliderPosition(position) {
        this.currentX = position;
        requestAnimationFrame(() => {
            // Update the before image clip
            this.before.style.clipPath = `inset(0 ${100 - position}% 0 0)`;
            
            // Update the after image clip
            this.after.style.clipPath = `inset(0 0 0 ${position}%)`;
            
            // Update slider position
            this.slider.style.left = `${position}%`;
            this.slider.setAttribute('aria-valuenow', position.toFixed(0));
        });
    }
}

// Testimonials Carousel
class TestimonialsCarousel {
    constructor() {
        this.container = $('.testimonials-slider');
        if (!this.container) return;

        this.slides = [...this.container.children];
        if (this.slides.length <= 1) return;

        this.currentIndex = 0;
        this.isPlaying = true;
        this.interval = null;
        
        this.init();
    }

    init() {
        this.createControls();
        this.setupSlides();
        this.startAutoPlay();
        this.setupEventListeners();
    }

    createControls() {
        const controls = document.createElement('div');
        controls.className = 'testimonial-controls';
        
        // Previous button
        const prevBtn = document.createElement('button');
        prevBtn.className = 'testimonial-nav prev';
        prevBtn.setAttribute('aria-label', 'Previous testimonial');
        prevBtn.addEventListener('click', () => this.prev());
        
        // Next button
        const nextBtn = document.createElement('button');
        nextBtn.className = 'testimonial-nav next';
        nextBtn.setAttribute('aria-label', 'Next testimonial');
        nextBtn.addEventListener('click', () => this.next());
        
        // Dots container
        const dots = document.createElement('div');
        dots.className = 'testimonial-dots';
        
        this.slides.forEach((_, index) => {
            const dot = document.createElement('button');
            dot.className = 'testimonial-dot';
            dot.setAttribute('aria-label', `Go to testimonial ${index + 1}`);
            dot.addEventListener('click', () => this.goToSlide(index));
            dots.appendChild(dot);
        });
        
        controls.appendChild(prevBtn);
        controls.appendChild(dots);
        controls.appendChild(nextBtn);
        this.container.appendChild(controls);
        
        this.dots = dots.children;
        this.updateDots();
    }

    setupSlides() {
        this.slides.forEach((slide, index) => {
            slide.setAttribute('role', 'tabpanel');
            slide.setAttribute('aria-hidden', index !== 0);
            slide.style.display = index === 0 ? 'block' : 'none';
        });
    }

    setupEventListeners() {
        // Pause on hover
        this.container.addEventListener('mouseenter', () => this.pause());
        this.container.addEventListener('mouseleave', () => this.resume());
        
        // Keyboard navigation
        this.container.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') this.prev();
            if (e.key === 'ArrowRight') this.next();
        });
    }

    startAutoPlay() {
        this.interval = setInterval(() => {
            if (this.isPlaying) this.next();
        }, 5000);
    }

    pause() {
        this.isPlaying = false;
    }

    resume() {
        this.isPlaying = true;
    }

    goToSlide(index) {
        // Hide current slide
        this.slides[this.currentIndex].style.display = 'none';
        this.slides[this.currentIndex].setAttribute('aria-hidden', 'true');
        
        // Show new slide
        this.currentIndex = index;
        this.slides[this.currentIndex].style.display = 'block';
        this.slides[this.currentIndex].setAttribute('aria-hidden', 'false');
        
        this.updateDots();
    }

    updateDots() {
        Array.from(this.dots).forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentIndex);
            dot.setAttribute('aria-current', index === this.currentIndex);
        });
    }

    next() {
        this.goToSlide((this.currentIndex + 1) % this.slides.length);
    }

    prev() {
        this.goToSlide((this.currentIndex - 1 + this.slides.length) % this.slides.length);
    }
}

// Form Validation
class FormValidator {
    constructor(form) {
        this.form = form;
        if (!this.form) return;

        this.init();
    }

    init() {
        this.form.noValidate = true;
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        this.form.querySelectorAll('input, textarea, select').forEach(field => {
            field.addEventListener('blur', () => this.validateField(field));
            field.addEventListener('input', () => this.clearError(field));
        });
    }

    validateField(field) {
        let isValid = true;
        let message = '';

        // Clear existing errors
        this.clearError(field);

        // Required field validation
        if (field.required && !field.value.trim()) {
            isValid = false;
            message = 'This field is required';
        }

        // Email validation
        if (field.type === 'email' && field.value.trim()) {
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(field.value)) {
                isValid = false;
                message = 'Please enter a valid email address';
            }
        }

        // Phone validation
        if (field.type === 'tel' && field.value.trim()) {
            const phonePattern = /^[\d\s-+()]{10,}$/;
            if (!phonePattern.test(field.value)) {
                isValid = false;
                message = 'Please enter a valid phone number';
            }
        }

        if (!isValid) {
            this.showError(field, message);
        }

        return isValid;
    }

    showError(field, message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        
        field.classList.add('error');
        field.setAttribute('aria-invalid', 'true');
        field.setAttribute('aria-describedby', `error-${field.id}`);
        errorDiv.id = `error-${field.id}`;
        
        field.parentNode.appendChild(errorDiv);
    }

    clearError(field) {
        const errorDiv = field.parentNode.querySelector('.error-message');
        if (errorDiv) {
            errorDiv.remove();
            field.classList.remove('error');
            field.removeAttribute('aria-invalid');
            field.removeAttribute('aria-describedby');
        }
    }

    async handleSubmit(e) {
        e.preventDefault();

        let isValid = true;
        const fields = this.form.querySelectorAll('input, textarea, select');

        fields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });

        if (!isValid) {
            const firstError = this.form.querySelector('.error');
            if (firstError) {
                firstError.focus();
            }
            return;
        }

        try {
            const formData = new FormData(this.form);
            const data = Object.fromEntries(formData);
            
            // Here you would typically send the data to your server
            await this.submitForm(data);
            
            this.showMessage('success', 'Thank you! Your message has been sent successfully.');
            this.form.reset();
        } catch (error) {
            console.error('Form submission error:', error);
            this.showMessage('error', 'There was an error sending your message. Please try again.');
        }
    }

    async submitForm(data) {
        // Implement your form submission logic here
        // This is a placeholder that simulates an API call
        return new Promise((resolve) => {
            setTimeout(() => resolve({ success: true }), 1000);
        });
    }

    showMessage(type, text) {
        const message = document.createElement('div');
        message.className = `form-message ${type}`;
        message.textContent = text;
        
        this.form.parentNode.insertBefore(message, this.form);
        
        setTimeout(() => message.remove(), 5000);
    }
}

// Scroll Animation
class ScrollAnimator {
    constructor() {
        this.elements = $$('.fade-in-section');
        if (!this.elements.length) return;
        
        this.init();
    }

    init() {
        const options = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, options);

        this.elements.forEach(element => observer.observe(element));
    }
}

// Smooth Scroll
class SmoothScroll {
    constructor() {
        this.init();
    }

    init() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = anchor.getAttribute('href');
                if (targetId === '#') return;

                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize mobile menu
    new MobileMenu();

    // Initialize before/after sliders
    $$('.before-after').forEach(slider => new BeforeAfterSlider(slider));

    // Initialize testimonials carousel
    new TestimonialsCarousel();

    // Initialize form validation
    const contactForm = $('#contactForm');
    if (contactForm) new FormValidator(contactForm);

    // Initialize smooth scroll
    new SmoothScroll();

    // Initialize scroll animations
    new ScrollAnimator();

    // Update copyright year
    const yearElement = $('#currentYear');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
});

// Handle window resize events
const handleResize = debounce(() => {
    if (isMobile()) {
        document.body.classList.remove('no-scroll');
    }
}, 250);

window.addEventListener('resize', handleResize);

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    const testimonials = $('.testimonials-slider');
    if (testimonials) {
        if (document.hidden) {
            testimonials.pause?.();
        } else {
            testimonials.resume?.();
        }
    }
});
