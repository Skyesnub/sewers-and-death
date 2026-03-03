import { setRefreshRate } from "../troll_script.js";

let frameCount = 0;
let startTime = null;

export function estimateRefreshRate(currentTime) {

    if (startTime === null) {
        startTime = currentTime;
    }

    frameCount++;

    const elapsedTime = currentTime - startTime;

    if (elapsedTime >= 1000) {
        const refreshRateEstimate = frameCount;

        console.log(`Estimated refresh rate: ${refreshRateEstimate-1} Hz`);

        setRefreshRate((refreshRateEstimate - 1));
        return;
    }

    requestAnimationFrame(estimateRefreshRate);
}