/**
 * MAISON NOIRE — The Form of Silence
 * Interaction & Motion Controller
 *
 * Progressive enhancement: the page is fully readable without this file.
 * The head script in index.html adds `js-motion` (and `js-parallax` on fine pointers).
 * This file confirms it by adding `motion-ready`; if that never happens, the head
 * script removes the motion classes after 3s and all content stays visible.
 */
(function () {
    'use strict';

    var root = document.documentElement;
    var reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    var motionAllowed = 'IntersectionObserver' in window && !reduceMotionQuery.matches;

    // Fallback if the head gate did not run for any reason
    if (motionAllowed && !root.classList.contains('js-motion')) {
        root.classList.add('js-motion');
    }

    function disableMotion() {
        root.classList.remove('js-motion', 'js-parallax');
    }

    /* ----------------------------------------------------------------------
       1. Navigation controller (mobile drawer)
       ---------------------------------------------------------------------- */
    function initNavigation() {
        var navToggle = document.getElementById('navToggle');
        var siteNav = document.getElementById('siteNav');
        if (!navToggle || !siteNav) { return; }

        function closeNav() {
            siteNav.classList.remove('is-active');
            navToggle.setAttribute('aria-expanded', 'false');
        }

        navToggle.addEventListener('click', function () {
            var isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
            navToggle.setAttribute('aria-expanded', String(!isExpanded));
            siteNav.classList.toggle('is-active');
        });

        // Close the drawer after choosing a section
        siteNav.querySelectorAll('a[href^="#"]').forEach(function (link) {
            link.addEventListener('click', closeNav);
        });

        // Escape closes the drawer and returns focus to the toggle
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && siteNav.classList.contains('is-active')) {
                closeNav();
                navToggle.focus();
            }
        });

        // Clicking outside the header closes the drawer
        document.addEventListener('click', function (e) {
            if (!siteNav.classList.contains('is-active')) { return; }
            var header = document.getElementById('site-header');
            if (header && !header.contains(e.target)) { closeNav(); }
        });
    }

    /* ----------------------------------------------------------------------
       2. Scroll-triggered reveals (one IntersectionObserver, no scroll math)
       ---------------------------------------------------------------------- */
    function initReveals() {
        if (!motionAllowed) { return; }

        var targets = document.querySelectorAll('.motion-reveal');
        if (!targets.length) { return; }

        var observer = new IntersectionObserver(function (entries, obs) {
            var cardIndex = 0;

            entries.forEach(function (entry) {
                // Reveal anything entering view, and anything already scrolled past (e.g. after an anchor jump)
                var passed = !entry.isIntersecting && entry.boundingClientRect.top < 0;
                if (!entry.isIntersecting && !passed) { return; }

                var el = entry.target;

                // Cards that enter together (one grid row) get a short, intentional stagger
                if (el.classList.contains('reveal-card') && entry.isIntersecting) {
                    el.style.setProperty('--d', Math.min(cardIndex, 3) * 110 + 'ms');
                    cardIndex += 1;
                }

                el.classList.add('is-revealed');
                obs.unobserve(el);
            });
        }, {
            root: null,
            rootMargin: '0px 0px -8% 0px',
            threshold: 0.1
        });

        targets.forEach(function (el) { observer.observe(el); });
    }

    /* ----------------------------------------------------------------------
       3. Subtle parallax (hero + signature image)
       Fine pointers only. One passive scroll listener, gated by an
       IntersectionObserver and requestAnimationFrame; it only writes a CSS
       variable (--parallax-y) that the stylesheet applies via `translate`.
       ---------------------------------------------------------------------- */
    function initParallax() {
        if (!motionAllowed || !root.classList.contains('js-parallax')) { return; }

        var items = Array.prototype.map.call(document.querySelectorAll('[data-parallax]'), function (img) {
            return {
                img: img,
                frame: img.parentElement,
                strength: parseFloat(img.getAttribute('data-parallax')) || 0.03,
                visible: false
            };
        });
        if (!items.length) { return; }

        var ticking = false;

        function update() {
            ticking = false;
            var vh = window.innerHeight;
            items.forEach(function (item) {
                if (!item.visible) { return; }
                var rect = item.frame.getBoundingClientRect();
                // -1 (frame centre at the bottom edge) ... +1 (at the top edge)
                var progress = (rect.top + rect.height / 2 - vh / 2) / (vh / 2 + rect.height / 2);
                progress = Math.max(-1, Math.min(1, progress));
                item.img.style.setProperty('--parallax-y', (-progress * rect.height * item.strength).toFixed(1) + 'px');
            });
        }

        function requestUpdate() {
            if (!ticking) {
                ticking = true;
                window.requestAnimationFrame(update);
            }
        }

        var visibilityObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                items.forEach(function (item) {
                    if (item.frame === entry.target) { item.visible = entry.isIntersecting; }
                });
            });
            requestUpdate();
        }, { rootMargin: '10% 0px 10% 0px' });

        items.forEach(function (item) { visibilityObserver.observe(item.frame); });
        window.addEventListener('scroll', requestUpdate, { passive: true });
        window.addEventListener('resize', requestUpdate);
        requestUpdate();
    }

    /* ----------------------------------------------------------------------
       4. Campaign film
       - preload="none" in markup: nothing downloads until playback starts
       - silent, looping playback starts only while the film is on screen
       - never autoplays under reduced motion or Data Saver
       - a visitor's explicit pause is respected
       ---------------------------------------------------------------------- */
    function initCampaignVideo() {
        var video = document.getElementById('campaignVideo');
        var toggle = document.getElementById('videoPlayToggle');
        if (!video || !toggle) { return; }

        // Custom toggle replaces the native controls (which remain as the no-JS fallback)
        video.removeAttribute('controls');
        video.muted = true;
        toggle.hidden = false;

        var userPaused = false;
        var connection = navigator.connection || {};
        var autoplayAllowed = motionAllowed && !connection.saveData;

        function setUi(playing) {
            toggle.setAttribute('aria-label', playing ? 'Pause campaign film' : 'Play campaign film');
            toggle.innerHTML = playing
                ? '<span class="play-icon" aria-hidden="true">&#9646;&#9646;</span><span class="toggle-text">Pause Study</span>'
                : '<span class="play-icon" aria-hidden="true">&#9654;</span><span class="toggle-text">Play Study</span>';
        }

        function safePlay() {
            var attempt = video.play();
            if (attempt && typeof attempt.catch === 'function') {
                attempt.catch(function () { setUi(false); });
            }
        }

        video.addEventListener('play', function () { setUi(true); });
        video.addEventListener('pause', function () { setUi(false); });

        toggle.addEventListener('click', function () {
            if (video.paused) {
                userPaused = false;
                safePlay();
            } else {
                userPaused = true;
                video.pause();
            }
        });

        if (!('IntersectionObserver' in window)) { setUi(false); return; }

        // Warm up metadata shortly before the section arrives
        var nearObserver = new IntersectionObserver(function (entries, obs) {
            if (entries[0].isIntersecting) {
                if (video.preload === 'none') { video.preload = 'metadata'; }
                obs.disconnect();
            }
        }, { rootMargin: '600px 0px' });
        nearObserver.observe(video);

        // Play while visible, pause when out of view
        var playObserver = new IntersectionObserver(function (entries) {
            var entry = entries[0];
            if (entry.isIntersecting) {
                if (autoplayAllowed && !userPaused && video.paused) { safePlay(); }
            } else if (!video.paused) {
                video.pause();
            }
        }, { threshold: 0.35 });
        playObserver.observe(video);

        setUi(false);
    }

    /* ----------------------------------------------------------------------
       Boot
       ---------------------------------------------------------------------- */
    function init() {
        initNavigation();

        try {
            initReveals();
            initParallax();
        } catch (err) {
            // Never leave content hidden because an enhancement failed
            disableMotion();
        }

        initCampaignVideo();

        if (root.classList.contains('js-motion')) {
            root.classList.add('motion-ready');
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // If the visitor switches on reduced motion mid-session, stop motion immediately
    var onReduceChange = function (e) {
        if (e.matches) {
            disableMotion();
            var video = document.getElementById('campaignVideo');
            if (video && !video.paused) { video.pause(); }
        }
    };
    if (reduceMotionQuery.addEventListener) {
        reduceMotionQuery.addEventListener('change', onReduceChange);
    } else if (reduceMotionQuery.addListener) {
        reduceMotionQuery.addListener(onReduceChange);
    }
})();
