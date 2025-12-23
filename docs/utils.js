// 防抖函数
const debounce = (fn, delay = 100) => {
    let timer = null;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
    };
};

// 无障碍播报函数
const announce = (message) => {
    const announcer = document.createElement('div');
    announcer.className = 'sr-only';
    announcer.setAttribute('aria-live', 'polite');
    announcer.textContent = message;
    document.body.appendChild(announcer);
    setTimeout(() => document.body.removeChild(announcer), 2000);
};

// 消息反馈提示函数
const showMessageFeedback = (message) => {
    DOM.messageFeedback.textContent = message;
    DOM.messageFeedback.classList.add('show');
    setTimeout(() => DOM.messageFeedback.classList.remove('show'), 2000);
};

// HTML转义函数（防XSS）
const escapeHtml = (str) => {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
};

// 波纹动效函数
const initRippleEffect = () => {
    DOM.rippleContainers.forEach(container => {
        container.addEventListener('click', function(e) {
            if (this.classList.contains('send-btn') && this.disabled) return;
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            ripple.style.width = ripple.style.height = `${size}px`;
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;
            ripple.classList.add('ripple');
            this.appendChild(ripple);
            setTimeout(() => ripple.remove(), 600);
        });
    });
};