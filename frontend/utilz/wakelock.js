let wakeLock = null

// Function to request a wake lock
async function requestWakeLock() {
    try {
        wakeLock = await navigator.wakeLock.request('screen')
        console.log("Wake lock acquired")

        wakeLock.addEventListener('release', () => {
            console.log('Wake lock was released');
            wakeLock = null
        })
    } catch (err) {
        console.error(`Wake lock request failed: ${err.name}, ${err.message}`);
    }
}

// Re-request wake lock when the page becomes visible again
document.addEventListener('visibilitychange', async () => {
    if (wakeLock == null && document.visibilityState === 'visible') {
        await requestWakeLock();
    }
});

// Initial wake lock request when the page loads
requestWakeLock();
