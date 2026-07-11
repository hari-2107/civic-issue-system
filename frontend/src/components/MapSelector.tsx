import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet + Vite
const markerIcon = new L.Icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

interface MarkerData {
    id: number;
    latitude: number;
    longitude: number;
    title: string;
    category: string;
    status: string;
}

interface MapSelectorProps {
    latitude?: number;
    longitude?: number;
    interactive?: boolean;
    onChange?: (lat: number, lng: number) => void;
    markers?: MarkerData[];
}

// Sub-component to handle map clicks and marker placement
const LocationMarker: React.FC<{
    position: [number, number];
    setPosition: (pos: [number, number]) => void;
    onChange?: (lat: number, lng: number) => void;
}> = ({ position, setPosition, onChange }) => {
    useMapEvents({
        click(e) {
            const { lat, lng } = e.latlng;
            setPosition([lat, lng]);
            if (onChange) onChange(lat, lng);
        }
    });

    return (
        <Marker position={position} icon={markerIcon}>
            <Popup>Selected Location: <br /> {position[0].toFixed(5)}, {position[1].toFixed(5)}</Popup>
        </Marker>
    );
};

export const MapSelector: React.FC<MapSelectorProps> = ({
    latitude = 20.5937,
    longitude = 78.9629,
    interactive = true,
    onChange,
    markers = []
}) => {
    const [position, setPosition] = useState<[number, number]>([latitude, longitude]);

    useEffect(() => {
        setPosition([latitude, longitude]);
    }, [latitude, longitude]);

    // Center coordinate resolver
    const center: [number, number] = markers.length > 0 && markers[0].latitude
        ? [markers[0].latitude, markers[0].longitude]
        : position;

    return (
        <div style={{ height: '350px', width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
            <MapContainer
                center={center}
                zoom={center[0] === 20.5937 && center[1] === 78.9629 ? 5 : 13}
                scrollWheelZoom={false}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {interactive ? (
                    <LocationMarker position={position} setPosition={setPosition} onChange={onChange} />
                ) : markers.length > 0 ? (
                    markers.map(m => {
                        if (!m.latitude || !m.longitude) return null;
                        return (
                            <Marker key={m.id} position={[m.latitude, m.longitude]} icon={markerIcon}>
                                <Popup>
                                    <strong>#CIV-{m.id}: {m.title}</strong>
                                    <br />Category: {m.category}
                                    <br />Status: {m.status}
                                </ Popup>
                            </Marker>
                        );
                    })
                ) : (
                    <Marker position={position} icon={markerIcon}>
                        <Popup>Location: {position[0].toFixed(5)}, {position[1].toFixed(5)}</Popup>
                    </Marker>
                )}
            </MapContainer>
        </div>
    );
};
export default MapSelector;
