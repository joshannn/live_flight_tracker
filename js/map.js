const MapManager = {
    map: null,
    userMarker: null,
    planeMarkers: new Map(),
    planeTrails: new Map(),

    init() {
        this.map = L.map('map', {
            zoomControl: false,
            attributionControl: false
        }).setView([20, 0], 2);

        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            maxZoom: 19,
            subdomains: 'abcd'
        }).addTo(this.map);

        L.control.zoom({ position: 'bottomright' }).addTo(this.map);
    },

    setUserLocation(lat, lon) {
        this.map.setView([lat, lon], 10);

        const userIcon = L.divIcon({
            className: 'user-location',
            html: `<div style="width: 16px; height: 16px; background: #89CFF0; border-radius: 50%; 
                   border: 3px solid #000; box-shadow: 0 0 20px #89CFF0;"></div>`,
            iconSize: [16, 16],
            iconAnchor: [8, 8]
        });

        this.userMarker = L.marker([lat, lon], {
            icon: userIcon,
            zIndexOffset: 1000
        }).addTo(this.map);

        L.circle([lat, lon], {
            radius: 50000,
            className: 'radar-circle'
        }).addTo(this.map);
    },

    createPlaneIcon(heading) {
        return L.divIcon({
            html: Utils.createPlaneSVG(heading),
            className: 'plane-icon',
            iconSize: [28, 28],
            iconAnchor: [14, 14]
        });
    },

    updatePlaneMarker(icao, lat, lon, heading, planeData) {
        if (this.planeMarkers.has(icao)) {
            const marker = this.planeMarkers.get(icao);
            marker.setLatLng([lat, lon]);
            marker.setIcon(this.createPlaneIcon(heading));

            const trail = this.planeTrails.get(icao);
            const latLngs = trail.getLatLngs();
            latLngs.push([lat, lon]);
            if (latLngs.length > 15) latLngs.shift();
            trail.setLatLngs(latLngs);
        } else {
            const marker = L.marker([lat, lon], {
                icon: this.createPlaneIcon(heading)
            }).addTo(this.map);

            const callsign = (planeData[1] || 'Unknown').trim();
            const altitude = planeData[7] ? Math.round(planeData[7] * 3.28084) : 'N/A';
            const velocity = planeData[9] ? Math.round(planeData[9] * 2.23694) : 'N/A';

            marker.bindPopup(`
                <div style="font-family: monospace;">
                    <strong style="color: #89CFF0; font-size: 14px;">${callsign}</strong><br>
                    <span style="color: #888; font-size: 12px;">ICAO: ${icao}</span><br>
                    <hr style="border-color: #333; margin: 8px 0;">
                    Altitude: <span style="color: #fff;">${altitude} ft</span><br>
                    Speed: <span style="color: #fff;">${velocity} mph</span>
                </div>
            `);

            this.planeMarkers.set(icao, marker);

            const trail = L.polyline([[lat, lon]], {
                className: 'trail-line'
            }).addTo(this.map);
            this.planeTrails.set(icao, trail);
        }
    },

    removePlane(icao) {
        if (this.planeMarkers.has(icao)) {
            this.map.removeLayer(this.planeMarkers.get(icao));
            this.planeMarkers.delete(icao);
        }
        if (this.planeTrails.has(icao)) {
            this.map.removeLayer(this.planeTrails.get(icao));
            this.planeTrails.delete(icao);
        }
    },

    focusOnPlane(lat, lon, icao) {
        this.map.setView([lat, lon], 12);
        const marker = this.planeMarkers.get(icao);
        if (marker) marker.openPopup();
    },

    highlightPlane(icao) {
        const marker = this.planeMarkers.get(icao);
        if (marker) {
            marker.setZIndexOffset(2000);
            const el = marker.getElement();
            if (el) el.style.transform += ' scale(1.3)';
        }
    },

    unhighlightPlane(icao) {
        const marker = this.planeMarkers.get(icao);
        if (marker) {
            marker.setZIndexOffset(0);
        }
    },

    clearOldPlanes(currentIcaos) {
        this.planeMarkers.forEach((marker, icao) => {
            if (!currentIcaos.has(icao)) {
                this.removePlane(icao);
            }
        });
    }
};