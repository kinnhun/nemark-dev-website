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

    // Load HTML content into element and fix relative paths
    async function loadInclude(elementId, file) {
        const element = document.getElementById(elementId);
        if (!element) return false;

        const basePath = getBasePath();
        const url = basePath + 'includes/' + file;

        try {
            const response = await fetch(url);
            if (response.ok) {
                let html = await response.text();

                // Rewrite relative paths if we are in a subdirectory (basePath is not empty)
                if (basePath) {
                    // Create a temporary container to parse HTML
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = html;

                    // Fix hrefs
                    const links = tempDiv.querySelectorAll('[href]');
                    links.forEach(link => {
                        const href = link.getAttribute('href');
                        // Rewrite only if it's a relative path and doesn't start with http, //, #, mailto:
                        if (href && !href.match(/^(http|\/\/|#|mailto:|\/)/)) {
                            link.setAttribute('href', basePath + href);
                        }
                    });

                    // Fix srcs
                    const images = tempDiv.querySelectorAll('[src]');
                    images.forEach(img => {
                        const src = img.getAttribute('src');
                        if (src && !src.match(/^(http|\/\/|\/|data:)/)) {
                            img.setAttribute('src', basePath + src);
                        }
                    });

                    html = tempDiv.innerHTML;
                }

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
                                    <a href="${member.portfolioLink}" class="btn btn-primary">${member.ctaHire}</a>
                                    <a href="${member.cvFile}" class="btn btn-primary btn-outline-primary" download>${member.ctaCV}</a>
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

    // Initialize projects parallax scroll effect
    function initProjectsParallax() {
        const columns = document.querySelectorAll('.grid-column');
        const projectsSection = document.querySelector('#projects-section');

        if (!columns.length || !projectsSection) return;

        function handleScroll() {
            const rect = projectsSection.getBoundingClientRect();
            const windowHeight = window.innerHeight;

            // Only animate when section is visible
            if (rect.bottom > 0 && rect.top < windowHeight) {
                const scrollProgress = (windowHeight - rect.top) / (windowHeight + rect.height);

                columns.forEach((column, index) => {
                    // Alternate directions: odd columns go up, even go down
                    const direction = index % 2 === 0 ? 1 : -1;
                    const speed = 0.3 + (index % 3) * 0.15; // Vary speed slightly
                    const yOffset = (scrollProgress - 0.5) * 400 * speed * direction;
                    column.style.transform = `translateY(${yOffset}px)`;
                });
            }
        }

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll(); // Initial call
    }

    // Custom scrollspy using Intersection Observer for better accuracy
    function initCustomScrollspy() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('#ftco-nav .nav-link');

        const observerOptions = {
            root: null,
            rootMargin: '-20% 0px -70% 0px', // Active when section is near top
            threshold: 0
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const sectionId = entry.target.getAttribute('id');

                    // Update active class
                    navLinks.forEach(link => {
                        link.classList.remove('active');
                        const href = link.getAttribute('href');
                        // Check if href contains the section ID
                        if (href && href.includes(sectionId)) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        }, observerOptions);

        sections.forEach(section => {
            observer.observe(section);
        });
    }

    // Initialize animations (copied from main.js but for dynamic content)
    function initAnimations() {
        if (typeof $ === 'undefined' || !$.fn.waypoint) return;

        var i = 0;
        $('.ftco-animate').waypoint(function (direction) {

            if (direction === 'down' && !$(this.element).hasClass('ftco-animated')) {

                i++;

                $(this.element).addClass('item-animate');
                setTimeout(function () {

                    $('body .ftco-animate.item-animate').each(function (k) {
                        var el = $(this);
                        setTimeout(function () {
                            var effect = el.data('animate-effect');
                            if (effect === 'fadeIn') {
                                el.addClass('fadeIn ftco-animated');
                            } else if (effect === 'fadeInLeft') {
                                el.addClass('fadeInLeft ftco-animated');
                            } else if (effect === 'fadeInRight') {
                                el.addClass('fadeInRight ftco-animated');
                            } else {
                                el.addClass('fadeInUp ftco-animated');
                            }
                            el.removeClass('item-animate');
                        }, k * 50, 'easeInOutExpo');
                    });

                }, 100);

            }

        }, { offset: '95%' });
    }

    // Initialize on DOM ready
    document.addEventListener('DOMContentLoaded', async function () {
        // Load header and footer
        const headerLoaded = await loadInclude('header-placeholder', 'header.html');

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

        // Load projects and init parallax
        const projectsLoaded = await loadInclude('projects-placeholder', 'projects.html');
        if (projectsLoaded) {
            initProjectsParallax();
        }

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

        // Initialize scrollspy and animations AFTER all sections are loaded
        setTimeout(function () {
            if (typeof $ !== 'undefined') {
                $('body').scrollspy('refresh');
            }
            initCustomScrollspy();
            initAnimations();

            // Handle initial hash scroll
            if (window.location.hash) {
                const targetId = window.location.hash;
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    // Small delay to ensure layout is stable after animations init
                    setTimeout(() => {
                        $('html, body').animate({
                            scrollTop: $(targetElement).offset().top - 70 // Adjust for fixed header
                        }, 800, 'easeInOutExpo');
                    }, 500);
                }
            }

            // Scroll to Top Button Logic
            const mybutton = document.getElementById("scrollToTopBtn");
            if (mybutton) {
                window.onscroll = function () {
                    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
                        mybutton.style.display = "block";
                    } else {
                        mybutton.style.display = "none";
                    }
                };

                mybutton.onclick = function () {
                    $('html, body').animate({ scrollTop: 0 }, 800, 'easeInOutExpo');
                };
            }

            // Remove loader after all content is loaded
            var loader = function () {
                setTimeout(function () {
                    if ($('#ftco-loader').length > 0) {
                        $('#ftco-loader').removeClass('show');
                    }
                }, 1);
            };
            loader();

        }, 1000);
    });

})();
