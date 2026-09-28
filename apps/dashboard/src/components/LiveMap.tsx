import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { getSocket } from '../lib/socket';

const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  label: string;
  type: string;
}

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
  }, [center, map]);
  return null;
}

export default function LiveMap({
  markers = [],
  height = '400px',
}: {
  markers?: MapMarker[];
  height?: string;
}) {
  const [liveMarkers, setLiveMarkers] = useState<MapMarker[]>(markers);
  const center: [number, number] = [13.0827, 80.2707];

  useEffect(() => {
    setLiveMarkers(markers);
  }, [markers]);

  useEffect(() => {
    const socket = getSocket();
    socket.on('emergency:new', (e: { id: string; lat: number; lng: number; type: string }) => {
      setLiveMarkers((prev) => [...prev, { id: e.id, lat: e.lat, lng: e.lng, label: `Emergency: ${e.type}`, type: 'emergency' }]);
    });
    socket.on('hazard:new', (h: { id: string; lat: number; lng: number; type: string }) => {
      setLiveMarkers((prev) => [...prev, { id: h.id, lat: h.lat, lng: h.lng, label: `Hazard: ${h.type}`, type: 'hazard' }]);
    });
    socket.on('ambulance:location', (a: { id: string; lat: number; lng: number; name: string }) => {
      setLiveMarkers((prev) => {
        const filtered = prev.filter((m) => m.id !== a.id);
        return [...filtered, { id: a.id, lat: a.lat, lng: a.lng, label: a.name, type: 'ambulance' }];
      });
    });
    return () => {
      socket.off('emergency:new');
      socket.off('hazard:new');
      socket.off('ambulance:location');
    };
  }, []);

  return (
    <div style={{ height }} className="rounded-lg overflow-hidden border border-slate-700">
      <MapContainer center={center} zoom={12} style={{ height: '100%', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
        <MapUpdater center={center} />
        {liveMarkers.map((m) => (
          <Marker key={m.id} position={[m.lat, m.lng]} icon={defaultIcon}>
            <Popup>{m.label}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
