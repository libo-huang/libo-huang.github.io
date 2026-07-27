(function () {
    'use strict';

    const isChinese = document.documentElement.lang.toLowerCase().startsWith('zh');
    const text = isChinese ? {
        backToTop: '返回顶部',
        moreNews: '更多动态',
        lessNews: '收起动态',
        publications: count => `共 ${count} 篇`,
        copied: '已复制',
        copy: '复制',
        failed: '失败'
    } : {
        backToTop: 'Back to Top',
        moreNews: 'More News',
        lessNews: 'Less News',
        publications: count => `${count} publications`,
        copied: 'copied',
        copy: 'copy',
        failed: 'failed'
    };

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    function copyText(value) {
        if (navigator.clipboard && window.isSecureContext) {
            return navigator.clipboard.writeText(value);
        }
        return new Promise((resolve, reject) => {
            const textarea = document.createElement('textarea');
            textarea.value = value;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            try {
                document.execCommand('copy') ? resolve() : reject(new Error('Copy failed'));
            } catch (error) {
                reject(error);
            } finally {
                textarea.remove();
            }
        });
    }

    function copyToClipboard(button) {
        const preElement = button.closest('pre').cloneNode(true);
        const clonedButton = preElement.querySelector('.copy-button');
        if (clonedButton) clonedButton.remove();

        copyText(preElement.innerText.trim()).then(() => {
            button.textContent = text.copied;
            button.classList.add('copy-success');
            window.setTimeout(() => {
                button.textContent = text.copy;
                button.classList.remove('copy-success');
            }, 2000);
        }).catch(() => {
            button.textContent = text.failed;
            button.classList.add('copy-error');
            window.setTimeout(() => {
                button.textContent = text.copy;
                button.classList.remove('copy-error');
            }, 2000);
        });
    }

    function toggleBibtex(button) {
        const pubItem = button.closest('.pub-item');
        const codeBlock = pubItem.querySelector('.code-block');
        const shouldOpen = codeBlock.hidden || getComputedStyle(codeBlock).display === 'none';
        codeBlock.hidden = !shouldOpen;
        codeBlock.classList.toggle('is-open', shouldOpen);
        button.classList.toggle('active', shouldOpen);
        button.setAttribute('aria-expanded', String(shouldOpen));
    }

    function setupPublicationActions() {
        const publications = document.querySelector('.pub-scroll-container');
        if (!publications) return;
        publications.querySelectorAll('.js-bibtex-toggle').forEach(button => {
            button.setAttribute('aria-expanded', 'false');
        });
        publications.addEventListener('click', event => {
            const citeButton = event.target.closest('.js-bibtex-toggle');
            if (citeButton) {
                toggleBibtex(citeButton);
                return;
            }
            const copyButton = event.target.closest('.js-copy');
            if (copyButton) copyToClipboard(copyButton);
        });
    }

    function setupNews() {
        const button = document.getElementById('more-news-btn');
        const hiddenItems = document.querySelectorAll('.more-news');
        if (!button || !hiddenItems.length) return;

        const setButton = expanded => {
            button.innerHTML = `${expanded ? text.lessNews : text.moreNews} <i class="fas fa-chevron-${expanded ? 'up' : 'down'}" aria-hidden="true"></i>`;
            button.classList.toggle('active', expanded);
            button.setAttribute('aria-expanded', String(expanded));
        };
        setButton(false);

        button.addEventListener('click', () => {
            const shouldShow = Array.from(hiddenItems).some(item => getComputedStyle(item).display === 'none');
            document.getElementById('news-list').classList.toggle('show-all', shouldShow);
            setButton(shouldShow);
        });
    }

    function setupPublicationSearch() {
        const input = document.getElementById('publication-search-input');
        const count = document.getElementById('publication-search-count');
        const empty = document.getElementById('publication-search-empty');
        const container = document.querySelector('.pub-scroll-container');
        const items = Array.from(document.querySelectorAll('.pub-item'));
        if (!input || !count || !empty || !container) return;

        const update = () => {
            const terms = input.value.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
            let visibleCount = 0;
            items.forEach(item => {
                const searchableText = Array.from(item.querySelectorAll('.pub-title, .pub-authors, .pub-venue'))
                    .map(element => element.textContent).join(' ').toLocaleLowerCase();
                const matches = terms.every(term => searchableText.includes(term));
                item.hidden = !matches;
                if (matches) visibleCount += 1;
            });
            count.textContent = terms.length ? `${visibleCount} / ${items.length}` : text.publications(items.length);
            empty.hidden = visibleCount !== 0;
            container.hidden = visibleCount === 0;
        };

        input.addEventListener('input', update);
        input.addEventListener('keydown', event => {
            if (event.key === 'Escape' && input.value) {
                input.value = '';
                update();
            }
        });
        update();
    }

    function setupNavigation() {
        const links = Array.from(document.querySelectorAll('.navbar-links a[href^="#"]'));
        const sections = links.map(link => document.querySelector(link.getAttribute('href'))).filter(Boolean);

        links.forEach(anchor => {
            anchor.addEventListener('click', event => {
                const target = document.querySelector(anchor.getAttribute('href'));
                if (!target) return;
                event.preventDefault();
                const navbarHeight = window.innerWidth <= 768 ? 55 : 45;
                window.scrollTo({
                    top: target.offsetTop - navbarHeight - 20,
                    behavior: prefersReducedMotion.matches ? 'auto' : 'smooth'
                });
            });
        });

        let scheduled = false;
        window.addEventListener('scroll', () => {
            if (scheduled) return;
            scheduled = true;
            window.requestAnimationFrame(() => {
                let current = sections[0] ? `#${sections[0].id}` : '';
                sections.forEach(section => {
                    if (window.scrollY >= section.offsetTop - 110) current = `#${section.id}`;
                });
                links.forEach(link => {
                    const active = link.getAttribute('href') === current;
                    link.classList.toggle('active', active);
                    active ? link.setAttribute('aria-current', 'location') : link.removeAttribute('aria-current');
                });
                scheduled = false;
            });
        }, { passive: true });
    }

    function setupEmail() {
        document.querySelectorAll('.email-protect').forEach(element => {
            const address = `${element.dataset.user}@${element.dataset.domain}`;
            const anchor = document.createElement('a');
            anchor.href = `mailto:${address}`;
            anchor.textContent = `${element.dataset.user}(at)${element.dataset.domain}`;
            element.replaceChildren(anchor);
        });
    }

    function setupContactCards() {
        const container = document.querySelector('.contact-info');
        if (!container) return;

        const items = Array.from(container.querySelectorAll('.contact-line'));
        let activeItem = null;
        let pinnedItem = null;
        let closeTimer = null;

        const details = new Map();
        items.forEach((item, index) => {
            const detail = Array.from(item.children).find(child => !child.classList.contains('icon-fixed'));
            if (!detail) return;
            if (item.dataset.contact === 'wechat') {
                detail.classList.add('wechat-value-source');
                item.tabIndex = 0;
                item.setAttribute('role', 'button');
                item.setAttribute('aria-controls', 'wechat-qr');
                item.setAttribute('aria-expanded', 'false');
                item.setAttribute('aria-label', item.dataset.label || 'WeChat');
                return;
            }
            detail.classList.add('contact-popover');
            detail.dataset.label = item.dataset.label || '';
            detail.id = `contact-detail-${index + 1}`;
            detail.setAttribute('role', 'group');
            item.tabIndex = 0;
            item.setAttribute('role', 'button');
            item.setAttribute('aria-controls', detail.id);
            item.setAttribute('aria-expanded', 'false');
            item.setAttribute('aria-label', item.dataset.label || detail.textContent.trim());
            details.set(item, detail);
            document.body.appendChild(detail);
        });
        container.classList.add('is-enhanced');

        const position = (item, detail) => {
            const itemRect = item.getBoundingClientRect();
            const detailRect = detail.getBoundingClientRect();
            const edge = 10;
            const gap = 12;
            const preferredLeft = itemRect.left + itemRect.width / 2 - detailRect.width / 2;
            const left = Math.min(
                Math.max(edge, preferredLeft),
                Math.max(edge, window.innerWidth - detailRect.width - edge)
            );
            let top = itemRect.top - detailRect.height - gap;
            const below = top < edge;
            if (below) top = itemRect.bottom + gap;
            detail.classList.toggle('is-below', below);
            detail.style.left = `${Math.round(left)}px`;
            detail.style.top = `${Math.round(top)}px`;
            detail.style.setProperty(
                '--contact-arrow-left',
                `${Math.round(Math.min(Math.max(14, itemRect.left + itemRect.width / 2 - left), detailRect.width - 14))}px`
            );
        };

        const hide = (item, force = false) => {
            if (!item || (pinnedItem === item && !force)) return;
            const detail = details.get(item);
            if (detail) detail.classList.remove('is-visible');
            item.setAttribute('aria-expanded', 'false');
            if (activeItem === item) activeItem = null;
            if (force && pinnedItem === item) pinnedItem = null;
        };

        const show = item => {
            window.clearTimeout(closeTimer);
            if (activeItem && activeItem !== item) hide(activeItem, true);
            const detail = details.get(item);
            if (!detail) return;
            activeItem = item;
            detail.classList.add('is-visible');
            item.setAttribute('aria-expanded', 'true');
            position(item, detail);
        };

        const scheduleHide = item => {
            window.clearTimeout(closeTimer);
            closeTimer = window.setTimeout(() => hide(item), 100);
        };

        items.forEach(item => {
            const detail = details.get(item);
            if (!detail) return;
            item.addEventListener('mouseenter', () => show(item));
            item.addEventListener('mouseleave', () => scheduleHide(item));
            item.addEventListener('focus', () => show(item));
            item.addEventListener('blur', () => scheduleHide(item));
            item.addEventListener('click', event => {
                event.stopPropagation();
                if (pinnedItem === item) {
                    hide(item, true);
                } else {
                    if (pinnedItem) hide(pinnedItem, true);
                    pinnedItem = item;
                    show(item);
                }
            });
            item.addEventListener('keydown', event => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    item.click();
                }
            });
            detail.addEventListener('mouseenter', () => window.clearTimeout(closeTimer));
            detail.addEventListener('mouseleave', () => scheduleHide(item));
            detail.addEventListener('click', event => event.stopPropagation());
        });

        const closeAll = () => {
            if (activeItem) hide(activeItem, true);
            pinnedItem = null;
        };
        document.addEventListener('click', closeAll);
        document.addEventListener('keydown', event => {
            if (event.key === 'Escape') closeAll();
        });
        const reposition = () => {
            if (activeItem) position(activeItem, details.get(activeItem));
        };
        window.addEventListener('resize', reposition);
        window.addEventListener('scroll', reposition, { passive: true });
    }

    function setupWechat() {
        const button = document.querySelector('.wechat-hover');
        const iconTrigger = document.querySelector('[data-contact="wechat"]');
        const qrcode = button && button.querySelector('.qrcode');
        if (!button || !iconTrigger || !qrcode) return;

        let pinned = false;
        qrcode.classList.add('wechat-floating-qrcode');
        document.body.appendChild(qrcode);

        const position = () => {
            const buttonRect = iconTrigger.getBoundingClientRect();
            const qrWidth = qrcode.offsetWidth || 166;
            const qrHeight = qrcode.offsetHeight || 166;
            const edge = 8;
            const gap = 12;
            const left = Math.min(
                Math.max(edge, buttonRect.left + buttonRect.width / 2 - qrWidth / 2),
                Math.max(edge, window.innerWidth - qrWidth - edge)
            );
            let top = buttonRect.top - qrHeight - gap;
            const below = top < edge;
            if (below) top = buttonRect.bottom + gap;
            qrcode.style.left = `${Math.round(left)}px`;
            qrcode.style.top = `${Math.round(top)}px`;
            qrcode.classList.toggle('is-below', below);
            qrcode.style.setProperty(
                '--wechat-arrow-left',
                `${Math.round(Math.min(Math.max(14, buttonRect.left + buttonRect.width / 2 - left), qrWidth - 14))}px`
            );
        };

        const show = () => {
            position();
            qrcode.classList.add('is-visible');
            button.setAttribute('aria-expanded', 'true');
            iconTrigger.setAttribute('aria-expanded', 'true');
        };

        const close = (force = false) => {
            if (pinned && !force) return;
            if (force) pinned = false;
            qrcode.classList.remove('is-visible');
            button.setAttribute('aria-expanded', 'false');
            iconTrigger.setAttribute('aria-expanded', 'false');
        };

        iconTrigger.addEventListener('mouseenter', show);
        iconTrigger.addEventListener('mouseleave', () => close());
        iconTrigger.addEventListener('focus', show);
        iconTrigger.addEventListener('blur', () => close());
        iconTrigger.addEventListener('click', event => {
            event.stopPropagation();
            pinned = !pinned;
            pinned ? show() : close(true);
        });
        document.addEventListener('click', () => close(true));
        document.addEventListener('keydown', event => {
            if (event.key === 'Escape') close(true);
        });
        window.addEventListener('resize', () => {
            if (qrcode.classList.contains('is-visible')) position();
        });
        window.addEventListener('scroll', () => {
            if (qrcode.classList.contains('is-visible')) position();
        }, { passive: true });
    }

    document.addEventListener('DOMContentLoaded', () => {
        const year = document.getElementById('copyright-year');
        if (year) {
            const current = new Date().getFullYear();
            year.textContent = current > 2024 ? `2024–${current}` : '2024';
        }
        if (typeof window.addBackToTop === 'function') {
            window.addBackToTop({ backgroundColor: '#fff', innerHTML: text.backToTop, textColor: '#333' });
        }
        setupNews();
        setupPublicationSearch();
        setupPublicationActions();
        setupNavigation();
        setupEmail();
        setupContactCards();
        setupWechat();
    });
})();
