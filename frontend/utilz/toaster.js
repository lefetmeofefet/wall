function showToast(message, {duration = 3000, error = false} = {}) {
    Toastify({
        text: message,
        duration: duration,
        gravity: "top", // `top` or `bottom`
        position: "right", // `left`, `center` or `right`
        backgroundColor: error ? "linear-gradient(to right, #ff3f3d, #ff8351)" : "linear-gradient(135deg,#73a5ff,#5477f5)",
        close: true // Add close button
    }).showToast();
}

export {showToast}
