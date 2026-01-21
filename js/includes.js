/**
 * Include Header, Footer & Hero Components
 * Load shared components from includes folder
 */
(function () {
    'use strict';

    // Get base path for includes (relative to current page)
    function getBasePath() {
        const path = window.location.pathname;
        const depth = (path.match(/\//g) || []).length - 1;
        if (depth === 0 || path.endsWith('/index.html') || path === '/') {
            return '';
        }
        return '../'.repeat(depth);
    }

    // Load HTML content into element
    async function loadInclude(elementId, file) {
        const element = document.getElementById(elementId);
        if (!element) return false;

        const basePath = getBasePath();
        const url = basePath + 'includes/' + file;

        try {
            const response = await fetch(url);
            if (response.ok) {
                const html = await response.text();
                element.innerHTML = html;
                return true;
            } else {
                console.error('Failed to load:', url);
                return false;
            }
        } catch (error) {
            console.error('Error loading include:', error);
            return false;
        }
    }

    // Create slide HTML from team member data
    function createSlideHTML(member) {
        return `
            <div class="slider-item">
                <div class="overlay"></div>
                <div class="container-fluid px-md-0">
                    <div class="row d-md-flex no-gutters slider-text align-items-end justify-content-end" data-scrollax-parent="true">
                        <div class="one-third order-md-last img" style="background-image:url(${member.image});">
                            <div class="overlay"></div>
                            <div class="overlay-1"></div>
                        </div>
                        <div class="one-forth d-flex align-items-center fadeInUp ftco-animated" data-scrollax=" properties: { translateY: '70%' }">
                            <div class="text">
                                <span class="subheading">${member.subheading}</span>
                                <h1 class="mb-4 mt-3">${member.headline}</h1>
                                <p class="member-info"><strong>${member.name}</strong> - ${member.role}</p>
                                <p>
                                    <a href="#contact-section" class="btn btn-primary">${member.ctaHire}</a>
                                    <a href="#" class="btn btn-primary btn-outline-primary">${member.ctaCV}</a>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Load team data and render slider
    async function loadTeamSlider() {
        const slider = document.getElementById('team-slider');
        if (!slider) return;

        const basePath = getBasePath();
        const url = basePath + 'data/team.json';

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to load team data');

            const data = await response.json();

            // Generate HTML for all team members
            const slidesHTML = data.team.map(member => createSlideHTML(member)).join('');
            slider.innerHTML = slidesHTML;

            // Reinitialize owl carousel after adding slides
            if (typeof $ !== 'undefined' && $.fn.owlCarousel) {
                $(slider).owlCarousel({
                    loop: true,
                    autoplay: true,
                    autoplayTimeout: 5000,
                    margin: 0,
                    animateOut: 'fadeOut',
                    animateIn: 'fadeIn',
                    nav: false,
                    autoplayHoverPause: true,
                    items: 1,
                    navText: [
                        "<span class='ion-ios-arrow-back'></span>",
                        "<span class='ion-ios-arrow-forward'></span>"
                    ],
                    responsive: {
                        0: { items: 1 },
                        600: { items: 1 },
                        1000: { items: 1 }
                    }
                });
            }

        } catch (error) {
            console.error('Error loading team slider:', error);
            // Fallback: show a default slide
            slider.innerHTML = `
                <div class="slider-item">
                    <div class="overlay"></div>
                    <div class="container-fluid px-md-0">
                        <div class="row d-md-flex no-gutters slider-text align-items-end justify-content-end">
                            <div class="one-third order-md-last img" style="background-image:url(images/bg_1.jpg);">
                                <div class="overlay"></div>
                                <div class="overlay-1"></div>
                            </div>
                            <div class="one-forth d-flex align-items-center fadeInUp ftco-animated">
                                <div class="text">
                                    <span class="subheading">Welcome to Nemark Dev Team</span>
                                    <h1 class="mb-4 mt-3">Building <span>Modern</span> Web Solutions</h1>
                                    <p><a href="#contact-section" class="btn btn-primary">Contact Us</a></p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    // Initialize progress circles (for dynamically loaded content)
    function initProgressCircles() {
        if (typeof $ === 'undefined') return;

        function percentageToDegrees(percentage) {
            return percentage / 100 * 360;
        }

        $(".progress").each(function () {
            var value = $(this).attr('data-value');
            var left = $(this).find('.progress-left .progress-bar');
            var right = $(this).find('.progress-right .progress-bar');

            if (value > 0) {
                if (value <= 50) {
                    right.css('transform', 'rotate(' + percentageToDegrees(value) + 'deg)');
                } else {
                    right.css('transform', 'rotate(180deg)');
                    left.css('transform', 'rotate(' + percentageToDegrees(value - 50) + 'deg)');
                }
            }
        });
    }

    // Initialize on DOM ready
    document.addEventListener('DOMContentLoaded', async function () {
        // Load header and footer (don't wait)
        loadInclude('header-placeholder', 'header.html');
        loadInclude('footer-placeholder', 'footer.html');
        loadInclude('counter-placeholder', 'counter.html');
        loadInclude('about-placeholder', 'about.html');

        // Load skills and THEN init progress circles
        const skillsLoaded = await loadInclude('skills-placeholder', 'skills.html');
        if (skillsLoaded) {
            initProgressCircles();
        }

        // Load services
        loadInclude('services-placeholder', 'services.html');
        loadInclude('hireme-placeholder', 'hireme.html');
        loadInclude('projects-placeholder', 'projects.html');
        loadInclude('blog-placeholder', 'blog.html');
        loadInclude('contact-placeholder', 'contact.html');

        // Load testimony and THEN init carousel
        const testimonyLoaded = await loadInclude('testimony-placeholder', 'testimony.html');
        if (testimonyLoaded && typeof $ !== 'undefined' && $.fn.owlCarousel) {
            $('.carousel-testimony').owlCarousel({
                center: true,
                loop: true,
                autoplay: true,
                autoplaySpeed: 2000,
                items: 1,
                margin: 30,
                stagePadding: 0,
                nav: false,
                navText: ['<span class="ion-ios-arrow-back">', '<span class="ion-ios-arrow-forward">'],
                responsive: {
                    0: { items: 1 },
                    600: { items: 2 },
                    1000: { items: 3 }
                }
            });
        }

        // Load hero and THEN load team data
        const heroLoaded = await loadInclude('hero-placeholder', 'hero.html');
        if (heroLoaded) {
            await loadTeamSlider();
        }
    });
})();
