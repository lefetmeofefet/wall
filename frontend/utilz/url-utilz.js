function updateUrlParams(params, replace = false) {
    const url = new URL(window.location)

    Object.keys(params).forEach(key => {
        if (params[key] != null) {
            url.searchParams.set(key, params[key])
        } else {
            url.searchParams.delete(key)
        }
    })

    if (replace) {
        history.replaceState(null, '', url)
    } else {
        history.pushState(null, '', url)
    }
}

function updatePath(newPath) {
    const currentQuery = window.location.search;  // Keep the current query parameters
    const newUrl = window.location.origin + newPath + currentQuery;

    history.pushState(null, '', newUrl);
    console.log(`Path updated to: ${newPath}`);
}

function getUrlParams() {
    const urlParams = new URLSearchParams(window.location.search)
    let params = {}
    urlParams.forEach((value, key) => params[key] = value)
    return params
}

const urlListeners = []

function registerUrlListener(listener) {
    urlListeners.push(listener)
}

// Handle back/forward navigation
window.onpopstate = function (event) {
    const currentParams = getUrlParams()
    console.log('Back or forward navigation detected. url params: ', currentParams)
    urlListeners.forEach(listener => listener(currentParams))
}

export {getUrlParams, updateUrlParams, updatePath, registerUrlListener}
