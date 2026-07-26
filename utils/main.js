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

    window.copyToClipboard = function (button) {
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
    };

    window.toggleBibtex = function (button) {
        const pubItem = button.closest('.pub-item');
        const codeBlock = pubItem.querySelector('.code-block');
        const shouldOpen = codeBlock.hidden || getComputedStyle(codeBlock).display === 'none';
        codeBlock.hidden = !shouldOpen;
        codeBlock.style.display = shouldOpen ? 'block' : 'none';
        button.classList.toggle('active', shouldOpen);
        button.setAttribute('aria-expanded', String(shouldOpen));
    };

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
            hiddenItems.forEach(item => {
                item.style.display = shouldShow ? 'list-item' : 'none';
            });
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

    function setupWechat() {
        const button = document.querySelector('.wechat-hover');
        const qrcode = button && button.querySelector('.qrcode');
        if (!button || !qrcode) return;

        let pinned = false;
        qrcode.classList.add('wechat-floating-qrcode');
        document.body.appendChild(qrcode);

        const position = () => {
            const buttonRect = button.getBoundingClientRect();
            const qrWidth = qrcode.offsetWidth || 166;
            const qrHeight = qrcode.offsetHeight || 166;
            const edge = 8;
            const gap = -70;
            let left = buttonRect.right + gap;
            if (left + qrWidth > window.innerWidth - edge) {
                left = Math.max(edge, buttonRect.left - qrWidth - gap);
            }
            const centeredTop = buttonRect.top + (buttonRect.height - qrHeight) / 2;
            const top = Math.min(
                Math.max(edge, centeredTop),
                Math.max(edge, window.innerHeight - qrHeight - edge)
            );
            qrcode.style.left = `${Math.round(left)}px`;
            qrcode.style.top = `${Math.round(top)}px`;
        };

        const show = () => {
            position();
            qrcode.classList.add('is-visible');
            button.setAttribute('aria-expanded', 'true');
        };

        const close = (force = false) => {
            if (pinned && !force) return;
            if (force) pinned = false;
            qrcode.classList.remove('is-visible');
            button.setAttribute('aria-expanded', 'false');
        };

        button.addEventListener('mouseenter', show);
        button.addEventListener('mouseleave', () => close());
        button.addEventListener('focus', show);
        button.addEventListener('blur', () => close());
        button.addEventListener('click', event => {
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
        setupNavigation();
        setupEmail();
        setupWechat();
    });
})();
