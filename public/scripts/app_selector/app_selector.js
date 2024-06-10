document.addEventListener('DOMContentLoaded', () => {
    const appOptions = document.querySelectorAll('.app-option');

    appOptions.forEach(option => {
        option.addEventListener('click', () => {
            const app = option.getAttribute('data-app');
            window.location.href = `/${app}`;
        });
    });
});
