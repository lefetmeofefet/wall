function showToast(message, {duration = 3000, error = false} = {}) {
    Toastify({
        text: message,
        duration: duration,
        gravity: "top", // `top` or `bottom`
        position: "right", // `left`, `center` or `right`
        backgroundColor: error ? "linear-gradient(to right, #ff3f3d, #ff8351)" : undefined,
        close: true // Add close button
    }).showToast();
}

export {showToast}
