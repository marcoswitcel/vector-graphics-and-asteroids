"use strict";
class SoundResourceManager {
    constructor() {
        this.autoStartDownload = false;
        this.entries = new Map;
    }
    add(resourceName, resourceLocation) {
        if (!this.entries.has(resourceName)) {
            const soundResourceEntry = new SoundResourceEntry(resourceLocation, this.autoStartDownload);
            this.entries.set(resourceName, soundResourceEntry);
        }
    }
    loadAll() {
        this.entries.forEach((entry) => {
            entry.startLoading();
        });
    }
}
