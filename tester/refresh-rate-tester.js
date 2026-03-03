let frameCount = 0;
let startTime = performance.now();
let refreshRateEstimate = 0;


function estimateRefreshRate(currentTime) {
    frameCount++;
    const elapsedTime = currentTime - startTime;

    if (elapsedTime >= 1000) { // Check if one second has passed
        refreshRateEstimate = frameCount;
        console.log(`Estimated refresh rate: ${refreshRateEstimate} Hz (or FPS)`);
        // Reset or stop the estimation here
        // startTime = currentTime;
        // frameCount = 0;
        refreshRate = refreshRateEstimate;
        return; 

    }

    // Continue the loop
    requestAnimationFrame(estimateRefreshRate);
}

// Start the estimation
requestAnimationFrame(estimateRefreshRate);
