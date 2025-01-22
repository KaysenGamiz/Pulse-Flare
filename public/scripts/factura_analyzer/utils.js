function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast();
    }).catch(err => {
        console.error('Error al copiar el UUID:', err);
    });
}

function showToast() {
    const toast = document.getElementById("toast");
    toast.classList.add("show"); // Muestra la ventanita con fade in

    // Oculta la ventanita después de 4 segundos con fade out
    setTimeout(() => {
        toast.classList.remove("show");
    }, 4000);
}