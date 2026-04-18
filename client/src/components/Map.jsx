import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import { getStoryDetails, getStoriesInBbox } from '../services/api';
import StoryPopup from './StoryPopup';
import StoryModal from './StoryModal';
import { Locate, Search as SearchIcon } from 'lucide-react';
import toast from 'react-hot-toast';

// Component to handle bbox fetching within React Leaflet
function MapEvents({ fetchStories, dropMode, onMapClick }) {
  const map = useMapEvents({
    moveend: () => fetchStories(map),
    click: (e) => onMapClick(e, map)
  });

  useEffect(() => {
    const container = map.getContainer();
    if (dropMode) container.classList.add('cursor-crosshair');
    else container.classList.remove('cursor-crosshair');
  }, [dropMode, map]);

  return null;
}


function MapTools({ theme }) {
  const map = useMap();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const locateMe = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }
    toast.loading('Locating you...', { id: 'locate' });
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        // Fly map smoothly to the user
        map.flyTo([latitude, longitude], 14, { duration: 1.5 });
        toast.success('Found you!', { id: 'locate' });
      },
      () => {
        toast.error('Unable to retrieve your location', { id: 'locate' });
      }
    );
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`);
      if (res.data && res.data.length > 0) {
        const { lat, lon } = res.data[0];
        // Fly map smoothly to the search destination
        map.flyTo([lat, lon], 13, { duration: 1.5 });
      } else {
        toast.error('Location not found');
      }
    } catch (err) {
      toast.error('Error searching location');
    }
    setLoading(false);
  };

  return (
    <div style={{
      position: 'absolute', top: '80px', right: '20px', zIndex: 1000,
      display: 'flex', flexDirection: 'column', gap: '12px'
    }}>
      <form onSubmit={handleSearch} style={{ display: 'flex', background: theme === 'dark' ? 'rgba(27,27,27,0.9)' : 'rgba(237,224,212,0.9)', borderRadius: '8px', padding: '4px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', backdropFilter: 'blur(8px)' }}>
        <input
          placeholder="Search city or place..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          style={{ border: 'none', outline: 'none', padding: '8px 12px', borderRadius: '4px', background: 'transparent', color: theme === 'dark' ? 'var(--color-accent)' : 'var(--color-bg)', fontSize: '14px', width: '200px' }}
        />
        <button type="submit" disabled={loading} style={{ background: 'var(--color-primary)', color: 'var(--color-accent)', border: 'none', borderRadius: '4px', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <SearchIcon size={16} />
        </button>
      </form>

      <button onClick={locateMe} title="Locate Me" style={{
        background: theme === 'dark' ? 'rgba(27,27,27,0.9)' : 'rgba(237,224,212,0.9)', color: theme === 'dark' ? 'var(--color-accent)' : 'var(--color-bg)', border: 'none', padding: '12px', borderRadius: '50%',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)', cursor: 'pointer', alignSelf: 'flex-end', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <Locate size={20} />
      </button>
    </div>
  );
}

export default function MapView({ session, theme }) {
  const [stories, setStories] = useState([]);
  const [dropMode, setDropMode] = useState(false);
  const [newPinLoc, setNewPinLoc] = useState(null); // { lng, lat }
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorParentId, setEditorParentId] = useState(null);
  const [activeStory, setActiveStory] = useState(null);

  useEffect(() => {
    const handleDropMode = () => setDropMode(true);
    window.addEventListener('enter-drop-mode', handleDropMode);
    return () => window.removeEventListener('enter-drop-mode', handleDropMode);
  }, []);

  useEffect(() => {

    const params = new URLSearchParams(window.location.search);
    const sharedStoryId = params.get('story');

    if (sharedStoryId) {
      getStoryDetails(sharedStoryId)
        .then(data => {
          if (data && data.story) {
            setActiveStory(data.story);
          }
        })
        .catch(err => console.error(err));
    }
  }, []);

  const fetchStories = useCallback(async (mapInstance) => {
    try {
      const bounds = mapInstance.getBounds();
      const bbox = `${bounds.getWest()},${bounds.getSouth()},${bounds.getEast()},${bounds.getNorth()}`;
      const data = await getStoriesInBbox(bbox);
      setStories(data.stories);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const handleMapClick = (e, mapInstance) => {
    if (dropMode) {
      setNewPinLoc({ lng: e.latlng.lng, lat: e.latlng.lat });
      setDropMode(false);
      setTimeout(() => setIsEditorOpen(true), 800);
    } else {
      setActiveStory(null);
    }
  };

  const getMarkerSizeClass = (count) => {
    const c = parseInt(count, 10);
    if (c === 0 || isNaN(c)) return 'size-sm';
    if (c <= 20) return 'size-md';
    return 'size-lg';
  };

  const createCustomIcon = (story) => {
    const sizeMap = { 'size-sm': 20, 'size-md': 28, 'size-lg': 38 };
    const size = sizeMap[getMarkerSizeClass(story.reaction_count)];
    return L.divIcon({
      html: `<div class="map-marker ${story.category} ${getMarkerSizeClass(story.reaction_count || 0)}" style="width:100%;height:100%"></div>`,
      className: 'custom-div-icon',
      iconSize: [size, size],
      iconAnchor: [size / 2, size]
    });
  };

  const pulseIcon = useMemo(() => L.divIcon({
    html: '<div class="pulse-ring"></div>',
    className: 'custom-div-icon',
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  }), []);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>

      {/* Overlay Banner */}
      <div style={{
        position: 'absolute', top: '80px', left: '50%', transform: 'translateX(-50%)', zIndex: 1000,
        background: theme === 'dark' ? 'rgba(27,27,27,0.7)' : 'rgba(237,224,212,0.8)',
        color: theme === 'dark' ? 'var(--color-accent)' : 'var(--color-bg)',
        padding: '12px 24px', borderRadius: '30px', backdropFilter: 'blur(8px)',
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)', textAlign: 'center', pointerEvents: 'none',
        display: 'flex', flexDirection: 'column', gap: '2px'
      }}>
        <div style={{ fontWeight: 600, fontSize: '15px' }}>Explore stories around you ✨</div>
        <div style={{ fontSize: '13px', opacity: 0.8 }}>Tap on the orange markers to read them</div>
      </div>

      <MapContainer
        center={[18.9220, 72.8347]}
        zoom={12}
        style={{ width: '100%', height: '100%', zIndex: 1 }}
        zoomControl={false}
        whenReady={(e) => {
          fetchStories(e.target);
          const params = new URLSearchParams(window.location.search);
          const sharedStoryId = params.get('story');
          if (sharedStoryId) {
            getStoryDetails(sharedStoryId).then(data => {
              if (data && data.story) {
                e.target.flyTo([data.story.lat, data.story.lng], 14, { duration: 1.5 });
              }
            });
          }
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
          url={theme === 'light' ? "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" : "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"}
        />

        <MapEvents fetchStories={fetchStories} dropMode={dropMode} onMapClick={handleMapClick} />
        <MapTools theme={theme} />

        {stories.map(story => (
          <Marker
            key={story.id}
            position={[story.lat, story.lng]}
            icon={createCustomIcon(story)}
            eventHandlers={{
              click: (e) => {
                L.DomEvent.stopPropagation(e);
                if (!dropMode) setActiveStory(story);
              }
            }}
          />
        ))}

        {newPinLoc && (
          <Marker position={[newPinLoc.lat, newPinLoc.lng]} icon={pulseIcon} />
        )}
      </MapContainer>

      {activeStory && (
        <StoryPopup
          story={activeStory}
          onClose={() => setActiveStory(null)}
          session={session}
          onReply={() => {
            setActiveStory(null);
            setNewPinLoc({ lng: activeStory.lng, lat: activeStory.lat });
            setEditorParentId(activeStory.id);
            setIsEditorOpen(true);
          }}
        />
      )}

      {isEditorOpen && (
        <StoryModal
          location={newPinLoc}
          session={session}
          parentId={editorParentId}
          onClose={(didSubmit) => {
            setIsEditorOpen(false);
            setNewPinLoc(null);
            setEditorParentId(null);
            if (didSubmit) {
              window.dispatchEvent(new Event('resize'));
            }
          }}
        />
      )}
    </div>
  );
}
