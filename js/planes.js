const PlaneManager = {
    planes: new Map(),
    updateInterval: null,

    async fetchPlanes(lat, lon) {
        const bounds = 0.5;
        const url = `https://opensky-network.org/api/states/all?` +
                   `lamin=${lat - bounds}&lamax=${lat + bounds}&` +
                   `lomin=${lon - bounds}&lomax=${lon + bounds}`;

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('Fetch failed');
            const data = await response.json();
            return data.states || [];
        } catch (error) {
            console.error('Error fetching planes:', error);
            return [];
        }
    },

    processPlanes(planesData, userLat, userLon) {
        return planesData.map(plane => ({
            icao: plane[0],
            callsign: (plane[1] || 'Unknown').trim(),
            origin: plane[2] || 'Unknown',
            latitude: plane[6],
            longitude: plane[5],
            altitude: plane[7],
            velocity: plane[9],
            heading: plane[10] || 0,
            distance: Utils.calculateDistance(userLat, userLon, plane[6], plane[5])
        })).sort((a, b) => a.distance - b.distance);
    },

    updateUI(planesData) {
        const listContainer = document.getElementById('plane-list');
        const planeCount = document.getElementById('plane-count');
        
        document.getElementById('initial-loading')?.remove();

        if (planesData.length === 0) {
            listContainer.innerHTML = `
                <div class="no-planes">
                    <div class="no-planes-icon">✈️</div>
                    <div>No aircraft in range</div>
                    <div style="font-size: 12px; margin-top: 5px; color: #666;">Check back shortly</div>
                </div>
            `;
            planeCount.textContent = '0';
            return;
        }

        planeCount.textContent = planesData.length;
        listContainer.innerHTML = '';

        planesData.forEach(plane => {
            const card = this.createPlaneCard(plane);
            listContainer.appendChild(card);
        });
    },

    createPlaneCard(plane) {
        const card = document.createElement('div');
        card.className = 'plane-card';
        card.dataset.icao = plane.icao;

        const altitude = plane.altitude ? Math.round(plane.altitude * 3.28084) : 'N/A';
        const velocity = plane.velocity ? Math.round(plane.velocity * 2.23694) : 'N/A';

        card.innerHTML = `
            <div class="distance-badge">${plane.distance.toFixed(1)} km</div>
            <div class="plane-header">
                <span class="plane-callsign">${plane.callsign}</span>
                <span class="plane-altitude">${altitude !== 'N/A' ? altitude + ' ft' : 'N/A'}</span>
            </div>
            <div class="plane-details">
                <div class="detail-item">
                    <span class="detail-icon">🛫</span>
                    <span>${plane.origin}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-icon">💨</span>
                    <span>${velocity !== 'N/A' ? velocity + ' mph' : 'N/A'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-icon">🧭</span>
                    <span>${Math.round(plane.heading)}°</span>
                </div>
                <div class="detail-item">
                    <span class="detail-icon">📡</span>
                    <span>${plane.icao}</span>
                </div>
            </div>
        `;

        card.addEventListener('click', () => {
            document.querySelectorAll('.plane-card').forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            MapManager.focusOnPlane(plane.latitude, plane.longitude, plane.icao);
        });

        card.addEventListener('mouseenter', () => MapManager.highlightPlane(plane.icao));
        card.addEventListener('mouseleave', () => MapManager.unhighlightPlane(plane.icao));

        return card;
    },

    updateMap(planesData) {
        const currentIcaos = new Set(planesData.map(p => p.icao));
        MapManager.clearOldPlanes(currentIcaos);

        planesData.forEach(plane => {
            MapManager.updatePlaneMarker(
                plane.icao,
                plane.latitude,
                plane.longitude,
                plane.heading,
                [plane.icao, plane.callsign, plane.origin, null, null, plane.longitude, 
                 plane.latitude, plane.altitude, null, plane.velocity, plane.heading]
            );
        });
    },

    async refresh(userLocation) {
        if (!userLocation) return;
        
        document.getElementById('status-text').textContent = 'Updating...';
        
        const rawData = await this.fetchPlanes(userLocation.lat, userLocation.lon);
        const processed = this.processPlanes(rawData, userLocation.lat, userLocation.lon);
        
        this.updateUI(processed);
        this.updateMap(processed);
        
        document.getElementById('last-update').textContent = Utils.formatTime(new Date());
        document.getElementById('status-text').textContent = 'Live';
    },

    startTracking(userLocation) {
        this.refresh(userLocation);
        this.updateInterval = setInterval(() => this.refresh(userLocation), 10000);
    },

    stop() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }
};