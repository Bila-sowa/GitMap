const copyValueToClipboard = async (element) => {
    const COOLDOWN_MS = 3500;
    const value = element.dataset.copyValue;
    if (!value) return;

    try {
        await navigator.clipboard.writeText(value);
        element.classList.add("copied");
        setTimeout(() => element.classList.remove("copied"), COOLDOWN_MS);
    } catch (err) {
        createNotification("Copying error or copying is not allowed by your browser (especially if you launched the server on live server)", "error")
    }
};

function getRandomID(prefix) {
    return `${prefix ? prefix + "-" : ""}${Math.random().toString(16).slice(2)}`
}

function createNotification(message, type) {
    if (!message || !type) return;

    const COOLDOWN_MS = 5000;
    const icons = {
        info: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 16 16" fill="none"><path d="M7.493 0.015 C 7.442 0.021,7.268 0.039,7.107 0.055 C 5.234 0.242,3.347 1.208,2.071 2.634 C 0.660 4.211,-0.057 6.168,0.009 8.253 C 0.124 11.854,2.599 14.903,6.110 15.771 C 8.169 16.280,10.433 15.917,12.227 14.791 C 14.017 13.666,15.270 11.933,15.771 9.887 C 15.943 9.186,15.983 8.829,15.983 8.000 C 15.983 7.171,15.943 6.814,15.771 6.113 C 14.979 2.878,12.315 0.498,9.000 0.064 C 8.716 0.027,7.683 -0.006,7.493 0.015 M8.853 1.563 C 9.967 1.707,11.010 2.136,11.944 2.834 C 12.273 3.080,12.920 3.727,13.166 4.056 C 13.727 4.807,14.142 5.690,14.330 6.535 C 14.544 7.500,14.544 8.500,14.330 9.465 C 13.916 11.326,12.605 12.978,10.867 13.828 C 10.239 14.135,9.591 14.336,8.880 14.444 C 8.456 14.509,7.544 14.509,7.120 14.444 C 5.172 14.148,3.528 13.085,2.493 11.451 C 2.279 11.114,1.999 10.526,1.859 10.119 C 1.618 9.422,1.514 8.781,1.514 8.000 C 1.514 6.961,1.715 6.075,2.160 5.160 C 2.500 4.462,2.846 3.980,3.413 3.413 C 3.980 2.846,4.462 2.500,5.160 2.160 C 6.313 1.599,7.567 1.397,8.853 1.563 M7.706 4.290 C 7.482 4.363,7.355 4.491,7.293 4.705 C 7.257 4.827,7.253 5.106,7.259 6.816 C 7.267 8.786,7.267 8.787,7.325 8.896 C 7.398 9.033,7.538 9.157,7.671 9.204 C 7.803 9.250,8.197 9.250,8.329 9.204 C 8.462 9.157,8.602 9.033,8.675 8.896 C 8.733 8.787,8.733 8.786,8.741 6.816 C 8.749 4.664,8.749 4.662,8.596 4.481 C 8.472 4.333,8.339 4.284,8.040 4.276 C 7.893 4.272,7.743 4.278,7.706 4.290 M7.786 10.530 C 7.597 10.592,7.410 10.753,7.319 10.932 C 7.249 11.072,7.237 11.325,7.294 11.495 C 7.388 11.780,7.697 12.000,8.000 12.000 C 8.303 12.000,8.612 11.780,8.706 11.495 C 8.763 11.325,8.751 11.072,8.681 10.932 C 8.616 10.804,8.460 10.646,8.333 10.580 C 8.217 10.520,7.904 10.491,7.786 10.530" fill="currentColor" fill-rule="evenodd"/></svg>`,
        warning: `<svg aria-hidden="true" width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 15H12.01M12 12V9M4.98207 19H19.0179C20.5615 19 21.5233 17.3256 20.7455 15.9923L13.7276 3.96153C12.9558 2.63852 11.0442 2.63852 10.2724 3.96153L3.25452 15.9923C2.47675 17.3256 3.43849 19 4.98207 19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
        error: `<svg aria-hidden="true" width="40" height="40" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><path d="M32.085,56.058c6.165,-0.059 12.268,-2.619 16.657,-6.966c5.213,-5.164 7.897,-12.803 6.961,-20.096c-1.605,-12.499 -11.855,-20.98 -23.772,-20.98c-9.053,0 -17.853,5.677 -21.713,13.909c-2.955,6.302 -2.96,13.911 0,20.225c3.832,8.174 12.488,13.821 21.559,13.908c0.103,0.001 0.205,0.001 0.308,0Zm-0.282,-4.003c-9.208,-0.089 -17.799,-7.227 -19.508,-16.378c-1.204,-6.452 1.07,-13.433 5.805,-18.015c5.53,-5.35 14.22,-7.143 21.445,-4.11c6.466,2.714 11.304,9.014 12.196,15.955c0.764,5.949 -1.366,12.184 -5.551,16.48c-3.672,3.767 -8.82,6.016 -14.131,6.068c-0.085,0 -0.171,0 -0.256,0Zm-12.382,-10.29l9.734,-9.734l-9.744,-9.744l2.804,-2.803l9.744,9.744l10.078,-10.078l2.808,2.807l-10.078,10.079l10.098,10.098l-2.803,2.804l-10.099,-10.099l-9.734,9.734l-2.808,-2.808Z" fill="currentColor"/></svg>`,
        success: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none"><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" stroke-width="2"/><path d="M8 12L11 15L16 9" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    };

    const notificationId = getRandomID("notification");
    const notification = `
        <div class="notification-container ${type} rounded-normal" data-notification-id="${notificationId}" role="alert">
            ${icons[type] || icons.info}
            <span>${message}</span>
            <button class="close-button close-alert-button rounded-full" type="button" aria-label="Close notification">&times;</button>
        </div>
    `;

    document.body.insertAdjacentHTML("beforeend", notification);

    const notificationElement = document.querySelector(`[data-notification-id="${notificationId}"]`);
    const closeButton = notificationElement?.querySelector(".close-alert-button");

    const closeNotification = () => {
        notificationElement?.remove();
        closeButton?.removeEventListener("click", closeNotification);
    };

    closeButton?.addEventListener("click", closeNotification);

    setTimeout(() => {
        if (notificationElement?.isConnected) {
            closeNotification();
        }
    }, COOLDOWN_MS);
}

function escapeHTML(str) {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function positionModalNearElement(modal, trigger, offset = 16) {
    if (!modal || !trigger) return;

    const triggerRect = trigger.getBoundingClientRect();

    modal.style.position = "fixed";
    modal.style.top = `${triggerRect.top}px`;
    modal.style.left = `${triggerRect.right + offset}px`;
}

const truncateTitle = (title, wordCount = 5) => {
    if (!title) return;

    const words = title.trim().split(/\s+/);
    return words.length > wordCount ? words.slice(0, 3).join(" ") + "..." : title;
};

const getVersion = async (url = "@/../package.json") => {
    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Failed to load package.json: ${response.status}`);
        }

        const packageData = await response.json();
        return packageData.version;
    } catch (error) {
        console.error('Error fetching version:', error);
    }
}

function appendHTML(HTML) {
    const body = document.body;

    if (!HTML | !body) return;

    body.insertAdjacentHTML("beforeend", HTML);
}

export {
    copyValueToClipboard,
    getRandomID,
    createNotification,
    escapeHTML,
    positionModalNearElement,
    truncateTitle,
    getVersion,
    appendHTML,
}
