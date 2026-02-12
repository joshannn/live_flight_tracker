const LocationManager = {
    watchId: null,
    currentLocation: null,

    async getInitialPosition() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation not supported'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.currentLocation = {
                        lat: position.coords.latitude,
                        lon: position.coords.longitude
                    };
                    resolve(this.currentLocation);
                },
                (error) => {
                    let message = 'Location unavailable';
                    switch(error.code) {
                        case error.PERMISSION_DENIED:
                            message = 'Location access denied. Enable location services.';
                            break;
                        case error.POSITION_UNAVAILABLE:
                            message = 'Location information unavailable.';
                            break;
                        case error.TIMEOUT:
                            message = 'Location request timed out.';
                            break;
                    }
                    reject(new Error(message));
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
        });
    },

    startWatching() {
        if (!navigator.geolocation) return;

        this.watchId = navigator.geolocation.watchPosition(
            (position) => {
                this.currentLocation = {
                    lat: position.coords.latitude,
                    lon: position.coords.longitude
                };
                this.onLocationUpdate?.(this.currentLocation);
            },
            null,
            { enableHighAccuracy: true }
        );
    },

    stopWatching() {
        if (this.watchId) {
            navigator.geolocation.clearWatch(this.watchId);
            this.watchId = null;
        }
    },

    updateDisplay(lat, lon) {
        document.getElementById('loc-coords').textContent = Utils.formatCoords(lat, lon);
    },

    showError(message) {
        document.getElementById('plane-list').innerHTML = `
            <div class="error-message">${message}</div>
            <button class="refresh-btn" onclick="location.reload()">Retry</button>
        `;
    }
};