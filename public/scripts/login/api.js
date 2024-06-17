document.getElementById('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        if (response.ok) {
            window.location.href = '/';
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al iniciar sesión');
    }
});

// Verifica si hay una sesión activa al cargar la página
document.addEventListener('DOMContentLoaded', function () {
    fetch('/check-session')
        .then(response => response.json())
        .then(data => {
            if (data.isLoggedIn) {
                window.location.href = '/';
            }
        });
});
