const App = {
    async init() {
        MapManager.init();
        
        try {
            const location = await LocationManager.getInitialPosition();
            LocationManager.updateDisplay(location.lat, location.lon);
            MapManager.setUserLocation(location.lat, location.lon);
            
            LocationManager.startWatching();
            PlaneManager.startTracking(location);
            
        } catch (error) {
            LocationManager.showError(error.message);
            document.getElementById('status-text').textContent = 'Error';
        }
    },

    destroy() {
        PlaneManager.stop();
        LocationManager.stopWatching();
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => App.init());

// Cleanup on page unload
window.addEventListener('beforeunload', () => App.destroy());