const DOMUpdateOverlay = document.querySelector(".update-overlay");
const DOMUpdateStatusAvailable = DOMUpdateOverlay.querySelector(".update-status-available");
const DOMUpdateStatusLatest = DOMUpdateOverlay.querySelector(".update-status-latest");
const DOMUpdateActionsAvailable = DOMUpdateOverlay.querySelector(".update-actions-available");
const DOMUpdateActionsLatest = DOMUpdateOverlay.querySelector(".update-actions-latest");

// Check Updates
function CheckForUpdates(showIfLatest) {
    api.getCurrentVersion().then(function(versionData) {
        DOMUpdateStatusAvailable.classList.remove("active");
        DOMUpdateStatusLatest.classList.remove("active");
        DOMUpdateActionsAvailable.classList.remove("active");
        DOMUpdateActionsLatest.classList.remove("active");

        if(versionData.join(".") != app.getVersion() && !isDev) {
            DOMUpdateOverlay.classList.add("active");
            DOMUpdateStatusAvailable.classList.add("active");
            DOMUpdateActionsAvailable.classList.add("active");
        } else {
            if(showIfLatest) {
                DOMUpdateOverlay.classList.add("active");
                DOMUpdateStatusLatest.classList.add("active");
                DOMUpdateActionsLatest.classList.add("active");
            }
        }
    }).catch(function(error) {
        NavigateToSection(6);
        console.error(error);
    });
}

function DownloadUpdate() {
    shell.openExternal("https://spinsha.re/client/download");
}
function IgnoreUpdate() {
    DOMUpdateOverlay.classList.remove("active");
}

CheckForUpdates(false);