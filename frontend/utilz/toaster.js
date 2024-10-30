function showToast(message, duration) {
    Toastify({
        text: message,
        duration: duration || 3000,
        gravity: "top", // `top` or `bottom`
        position: "right", // `left`, `center` or `right`
        background: "linear-gradient(135deg, rgba(67, 185, 194, 1), rgba(67, 185, 194, 0.7), rgba(230, 241, 242, 1))",
        close: true // Add close button
    }).showToast();
}

export {showToast}
