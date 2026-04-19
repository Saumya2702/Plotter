import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { getStoriesInBbox } from '../services/api';
import StoryPopup from './StoryPopup';
import StoryModal from './StoryModal';
import { Plus, Navigation, Map as MapIcon } from 'lucide-react';
import toast from 'react-hot-toast';

// Component to handle bbox fetching & events
function MapEvents({ fetchStories, dropMode, onMapClick, setLocationName }) {
  const map = useMapEvents({
    moveend: () => {
      fetchStories(map);
      updateLocationName();
    },
    click: (e) => onMapClick(e),
  });

  const updateLocationName = async () => {
    const center = map.getCenter();
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${center.lat}&lon=${center.lng}&zoom=10`);
      const data = await res.json();
      const addr = data?.address || {};
      const name = addr.city || addr.town || addr.state || 'Unknown Realm';
      setLocationName(name);
    } catch (err) {
      setLocationName('The Great Beyond');
    }
  };

  useEffect(() => {
    const handleFlyTo = (e) => {
      const { lat, lng } = e.detail;
      map.flyTo([lat, lng], 12, { duration: 2 });
    };
    window.addEventListener('map-fly-to', handleFlyTo);
    return () => window.removeEventListener('map-fly-to', handleFlyTo);
  }, [map]);

  useEffect(() => {
    const container = map.getContainer();
    if (dropMode) container.classList.add('cursor-crosshair');
    else container.classList.remove('cursor-crosshair');
  }, [dropMode, map]);

  return null;
}

export default function MapView({ session }) {
  const [stories, setStories] = useState([]);
  const [dropMode, setDropMode] = useState(false);
  const [newPinLoc, setNewPinLoc] = useState(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [activeStory, setActiveStory] = useState(null);
  const [locationName, setLocationName] = useState('India');
  const [loading, setLoading] = useState(true);

  const fetchStories = useCallback(async (mapInstance) => {
    setLoading(true);
    try {
      const bounds = mapInstance.getBounds();
      const bbox = `${bounds.getWest()},${bounds.getSouth()},${bounds.getEast()},${bounds.getNorth()}`;
      const data = await getStoriesInBbox(bbox);
      setStories(data.stories || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleMapClick = (e) => {
    if (dropMode) {
      setNewPinLoc({ lng: e.latlng.lng, lat: e.latlng.lat });
      setDropMode(false);
      setTimeout(() => setIsEditorOpen(true), 600);
    } else {
      setActiveStory(null);
    }
  };

  const createCustomIcon = (story) => {
    const reactions = parseInt(story.reaction_count || 0, 10);
    // Scale from 12px to 32px based on reactions
    const size = Math.min(Math.max(12 + (reactions * 2), 14), 36);
    
    return L.divIcon({
      html: `<div class="pin-marker pin-${story.category}" style="width:${size}px; height:${size}px;"></div>`,
      className: 'custom-div-icon',
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2]
    });
  };

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', background: '#0F0C1E' }}>
      
      {/* Top Location Badge */}
      <div className="animate-fade-in" style={{
        position: 'absolute', top: '90px', left: '50%', transform: 'translateX(-50%)', zIndex: 1000,
        display: 'flex', alignItems: 'center', gap: '8px', pointerEvents: 'none'
      }}>
        <div className="glass-panel" style={{
          padding: '8px 20px', borderRadius: '30px', display: 'flex', alignItems: 'center', gap: '10px'
        }}>
          <Navigation size={14} className="text-primary" style={{ color: 'var(--color-primary)' }} />
          <span style={{ fontSize: '13px', fontWeight: '700', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
            {locationName}
          </span>
        </div>
      </div>

      {/* Empty State / Loading */}
      {!loading && stories.length === 0 && (
        <div style={{
          position: 'absolute', bottom: '40px', left: '50%', transform: 'translateX(-50%)', zIndex: 1000,
          color: 'rgba(255,255,255,0.5)', fontSize: '14px', fontWeight: '500', pointerEvents: 'none'
        }}>
          No stories here yet — be the first to drop one
        </div>
      )}

      <MapContainer
        center={[20.5937, 78.9629]}
        zoom={5}
        minZoom={4}
        maxZoom={18}
        style={{ width: '100%', height: '100%', zIndex: 1 }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {/* Relocated Zoom Control */}
        {/* Wait, React Leaflet handles controls differently. I'll use a standard ZoomControl component if needed, or just L.control directly. But standard way is: */}
        {/* <ZoomControl position="bottomleft" /> */}
        {/* Actually, let's just use the native one via a small component */}
        <ZoomHelper position="bottomleft" />

        <MapEvents 
          fetchStories={fetchStories} 
          dropMode={dropMode} 
          onMapClick={handleMapClick}
          setLocationName={setLocationName}
        />

        {stories.map(story => (
          <Marker
            key={story.id}
            position={[story.lat, story.lng]}
            icon={createCustomIcon(story)}
            eventHandlers={{
              click: (e) => {
                L.DomEvent.stopPropagation(e);
                setActiveStory(story);
              }
            }}
          />
        ))}

        {newPinLoc && (
          <Marker 
            position={[newPinLoc.lat, newPinLoc.lng]} 
            icon={L.divIcon({
              html: '<div style="width:20px;height:20px;border-radius:50%;background:var(--color-primary);box-shadow:0 0 15px var(--color-primary);border:2px solid #fff"></div>',
              className: 'custom-div-icon',
              iconSize: [20, 20],
              iconAnchor: [10, 10]
            })} 
          />
        )}
      </MapContainer>

      {/* FAB: Drop a story */}
      <button
        onClick={() => {
          if (!session) return toast.error("Sign in to drop a story");
          setDropMode(!dropMode);
          if (!dropMode) toast.success("Select a spot on the map", { icon: '📍' });
        }}
        className="animate-fade-in"
        style={{
          position: 'absolute', bottom: '40px', right: '40px', zIndex: 1000,
          width: '64px', height: '64px', borderRadius: '50%', background: 'var(--color-primary)',
          color: '#fff', border: 'none', cursor: 'pointer', boxShadow: '0 8px 32px rgba(232, 117, 74, 0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s'
        }}
        onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1) rotate(90deg)'}
        onMouseOut={e => e.currentTarget.style.transform = 'scale(1) rotate(0deg)'}
      >
        <Plus size={32} />
      </button>

      {activeStory && (
        <StoryPopup
          story={activeStory}
          onClose={() => setActiveStory(null)}
          session={session}
        />
      )}

      {isEditorOpen && (
        <StoryModal
          location={newPinLoc}
          session={session}
          onClose={(didSubmit) => {
            setIsEditorOpen(false);
            setNewPinLoc(null);
            if (didSubmit) window.dispatchEvent(new Event('resize'));
          }}
        />
      )}
    </div>
  );
}

function ZoomHelper({ position }) {
  const map = useMap();
  useEffect(() => {
    const zoom = L.control.zoom({ position });
    zoom.addTo(map);
    return () => zoom.remove();
  }, [map, position]);
  return null;
}

