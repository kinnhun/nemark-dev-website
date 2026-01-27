(function () {
    'use strict';

    // Motion Graphics Scroll Handler
    // Principle: Scroll = Timeline (Scrubbing)

    class MotionController {
        constructor() {
            this.sections = [];
            this.init();
        }

        init() {
            // Wait for DOM content to be fully loaded (including included HTML)
            // We can hook into the existing loader or just poll/wait
            // For chaos-free prototype, let's wait a bit or expose an init method
            window.addEventListener('load', () => {
                // Give a slight buffer for includes.js to finish replacing placeholders
                setTimeout(() => this.scanSections(), 500);
            });

            window.addEventListener('scroll', () => this.onScroll(), { passive: true });
        }

        scanSections() {
            // Find all containers marked for motion
            const containers = document.querySelectorAll('[data-motion-container]');
            this.sections = Array.from(containers).map(el => ({
                el: el,
                rect: { top: 0, height: 0 } // Cache rects? Maybe purely dynamic for now
            }));
            this.onScroll(); // Initial pass
        }

        onScroll() {
            const viewportHeight = window.innerHeight;
            const scrollTop = window.scrollY;

            this.sections.forEach(section => {
                const rect = section.el.getBoundingClientRect();
                
                // Calculate progress: 0 when top of section enters bottom of viewport
                // 1 when bottom of section leaves top of viewport (or customizable range)
                
                // For "Reveal": We want 0 -> 1 as it enters the center
                // Let's define: Start = Top enters viewport bottom. End = Top reaches viewport center (faster reveal)
                
                // Standard progress (0 to 1 as it traverses the screen)
                const start = rect.top + scrollTop - viewportHeight;
                const end = rect.top + scrollTop + rect.height;
                const totalDist = end - start;
                
                // Simplified view progression for CSS vars
                // 0 = section just entering bottom
                // 1 = section fully visible / centered
                
                // Let's use intersection ratio-like logic but with scroll mapping
                // We map [Entry, Center] to [0, 1] for reveal
                
                let entryProgress = 0;
                
                // Distance of element top from viewport bottom
                const distinctFromBottom = viewportHeight - rect.top;
                
                // If rect.top is viewportHeight, dist is 0.
                // If rect.top is 0 (top of screen), dist is viewportHeight.
                
                if (distinctFromBottom > 0) {
                    // It's entering or visible
                    // Normalize: 0 to 1 over a range of say.. 50% viewport height
                    entryProgress = distinctFromBottom / (viewportHeight * 0.8); 
                }
                
                // Clamp
                entryProgress = Math.min(Math.max(entryProgress, 0), 1);
                
                // Update CSS Variable
                section.el.style.setProperty('--scroll-progress', entryProgress);
                
                // Specific Logic for different effects (Mask, Text)
                // We can drive this purely via CSS calc() using --scroll-progress
                // OR update specific elements here for more complex logic
                this.updateChildren(section, entryProgress);
            });
        }

        updateChildren(section, progress) {
            // Manual scrubbing for complex elements if CSS isn't enough
            const el = section.el;
            
            // Mask Reveal
            const mask = el.querySelector('.motion-reveal-mask');
            if (mask) {
                // Reveal from bottom up: clip-path inset(100% 0 0 0) -> inset(0 0 0 0)
                const clipVal = (1 - progress) * 100;
                mask.style.clipPath = `inset(${clipVal}% 0 0 0)`;
            }
            
            // Staggered Text
            // We want text lines to appear one by one as progress triggers them
            // Line 1: 0.2 - 0.3
            // Line 2: 0.3 - 0.4
            const lines = el.querySelectorAll('.motion-text-line');
            lines.forEach((line, index) => {
                // Determine trigger range for this line
                const start = 0.2 + (index * 0.1);
                
                // If we have passed the start threshold, make it visible
                if (progress > start) {
                    line.classList.add('is-visible');
                    line.style.opacity = '1'; // Ensure inline override matches class
                    line.style.transform = 'translateY(0)';
                } else {
                    line.classList.remove('is-visible');
                    // Optional: Reset inline styles if we want scrubbing backwards to hide it again
                    // But for carousel content, we might want it to stay visible once revealed
                   if (progress < 0.1) { // Only hide if scrolled back up significantly
                        line.style.opacity = '0';
                        line.style.transform = 'translateY(20px)';
                   }
                }
            });
        }
    }

    // Expose for debugging or manual re-scan
    window.MotionController = new MotionController();

})();
