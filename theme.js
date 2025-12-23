// 初始化主题
const initTheme = () => {
    const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedTheme = localStorage.getItem('theme') || (isSystemDark ? 'dark' : 'light');
    DOM.html.setAttribute('data-theme', savedTheme);
    DOM.themeToggle.innerHTML = savedTheme === 'dark' 
        ? '<i class="fa-solid fa-sun"></i>' 
        : '<i class="fa-solid fa-moon"></i>';
};

// 绑定主题切换事件
const bindThemeEvent = () => {
    DOM.themeToggle.addEventListener('click', () => {
        const currentTheme = DOM.html.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        DOM.html.style.transition = 'var(--transition-slow)';
        DOM.html.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        DOM.themeToggle.innerHTML = newTheme === 'dark' 
            ? '<i class="fa-solid fa-sun"></i>' 
            : '<i class="fa-solid fa-moon"></i>';
        announce(`${newTheme === 'dark' ? '深色' : '浅色'}模式已开启`);
    });

    // 监听系统主题变化
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', debounce((e) => {
        if (!localStorage.getItem('theme')) {
            const newTheme = e.matches ? 'dark' : 'light';
            DOM.html.setAttribute('data-theme', newTheme);
            DOM.themeToggle.innerHTML = newTheme === 'dark' 
                ? '<i class="fa-solid fa-sun"></i>' 
                : '<i class="fa-solid fa-moon"></i>';
        }
    }));
};