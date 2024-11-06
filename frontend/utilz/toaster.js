function showToast(message, {duration = 3000, isError = false} = {}) {
    Toastify({
        text: message,
        duration: duration,
        gravity: "top", // `top` or `bottom`
        position: "right", // `left`, `center` or `right`
        background: isError ? "linear-gradient(to right, #ff5f6d, #ffc371)" : "linear-gradient(135deg, rgba(67, 185, 194, 1), rgba(67, 185, 194, 0.7), rgba(230, 241, 242, 1))",
        close: true // Add close button
    }).showToast();
}

export {showToast}
