(function () {
    'use strict';

    const STORAGE_KEY = 'preferred-theme-mode';
    const MODES = ['auto', 'light', 'dark'];
    let sessionMode = 'auto';

    function readMode() {
        try {
            const savedMode = localStorage.getItem(STORAGE_KEY);
            sessionMode = MODES.includes(savedMode) ? savedMode : sessionMode;
            return sessionMode;
        } catch (error) {
            return sessionMode;
        }
    }

    function resolveTheme(mode, date) {
        if (mode !== 'auto') return mode;
        const hour = (date || new Date()).getHours();
        return hour >= 7 && hour < 19 ? 'light' : 'dark';
    }

    function applyTheme(mode) {
        const theme = resolveTheme(mode);
        const root = document.documentElement;
        root.dataset.themeMode = mode;
        root.dataset.theme = theme;
        root.style.colorScheme = theme;

        const themeColor = document.querySelector('meta[name="theme-color"]');
        if (themeColor) {
            themeColor.content = theme === 'dark' ? '#0f172a' : '#0156a3';
        }

        updateButton(mode, theme);
    }

    function updateButton(mode, theme) {
        const button = document.getElementById('theme-toggle');
        if (!button) return;

        const isChinese = document.documentElement.lang.toLowerCase().startsWith('zh');
        const labels = isChinese
            ? { auto: '◐ 自动', light: '☀ 白天', dark: '☾ 黑夜' }
            : { auto: '◐ Auto', light: '☀ Light', dark: '☾ Dark' };
        const resolvedText = isChinese
            ? (theme === 'dark' ? '当前为黑夜主题' : '当前为白天主题')
            : (theme === 'dark' ? 'Currently using dark theme' : 'Currently using light theme');

        button.textContent = labels[mode];
        button.dataset.mode = mode;
        button.setAttribute('aria-label', isChinese ? '切换主题模式' : 'Change theme mode');
        button.title = resolvedText + (isChinese ? '；点击切换模式' : '; click to change mode');
    }

    // Apply before the page is painted to avoid a light-theme flash at night.
    applyTheme(readMode());

    document.addEventListener('DOMContentLoaded', function () {
        const button = document.getElementById('theme-toggle');
        if (!button) return;

        updateButton(readMode(), document.documentElement.dataset.theme);
        button.addEventListener('click', function () {
            const currentMode = readMode();
            const nextMode = MODES[(MODES.indexOf(currentMode) + 1) % MODES.length];
            sessionMode = nextMode;
            try {
                localStorage.setItem(STORAGE_KEY, nextMode);
            } catch (error) {
                // The selected mode still works for this page if storage is unavailable.
            }
            applyTheme(nextMode);
        });
    });

    window.addEventListener('storage', function (event) {
        if (event.key === STORAGE_KEY) applyTheme(readMode());
    });

    // Keep automatic mode accurate when a page remains open across 07:00 or 19:00.
    window.setInterval(function () {
        if (readMode() === 'auto') applyTheme('auto');
    }, 60000);
})();
