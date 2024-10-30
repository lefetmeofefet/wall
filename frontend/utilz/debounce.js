function debounce(func, delay) {
    let timeoutId;

    return function(...args) {
        const context = this;

        // Clear the previous timeout
        clearTimeout(timeoutId);

        // Set a new timeout
        timeoutId = setTimeout(() => {
            func.apply(context, args);
        }, delay);
    };
}

export {debounce}
