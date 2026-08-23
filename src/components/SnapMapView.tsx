import React, { useState, useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import {
  MapPin,
  ShieldCheck,
  Star,
  MessageSquare,
  ShoppingBag,
  Wrench,
  User,
  Crosshair,
  ArrowLeft,
  X,
  SlidersHorizontal,
  Navigation,
  Layers,
  Plus,
  Minus,
  Maximize2,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { Provider, ProductItem, UserSession } from '../types';
import { calculateDistanceKm, formatDistance, DEFAULT_COLOMBIA_COORDS } from '../utils/geoUtils';
import { getEmailAvatarUrl } from '../utils/userUtils';

interface SnapMapViewProps {
  currentCity: string;
  providers: Provider[];
  products: ProductItem[];
  userSession: UserSession;
  onSelectProvider: (provider: Provider) => void;
  onContactWhatsApp: (provider: Provider) => void;
  onBack?: () => void;
}

type MapStyleType = 'google_streets' | 'google_hybrid' | 'google_terrain' | 'carto_voyager';

interface MapLayerConfig {
  name: string;
  url: string;
  subdomains: string[];
  maxZoom: number;
  attribution: string;
  icon: string;
}

const MAP_LAYERS: Record<MapStyleType, MapLayerConfig> = {
  google_streets: {
    name: 'Google Calles',
    url: 'https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
    subdomains: ['0', '1', '2', '3'],
    maxZoom: 20,
    attribution: '&copy; Google Maps',
    icon: '🗺️'
  },
  google_hybrid: {
    name: 'Google Satélite',
    url: 'https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
    subdomains: ['0', '1', '2', '3'],
    maxZoom: 20,
    attribution: '&copy; Google Maps Satélite',
    icon: '🛰️'
  },
  google_terrain: {
    name: 'Google Terreno',
    url: 'https://mt{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}',
    subdomains: ['0', '1', '2', '3'],
    maxZoom: 20,
    attribution: '&copy; Google Maps Terreno',
    icon: '🏔️'
  },
  carto_voyager: {
    name: 'Moderno Claro',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    subdomains: ['a', 'b', 'c', 'd'],
    maxZoom: 20,
    attribution: '&copy; CARTO &copy; OSM',
    icon: '🏙️'
  }
};

export const SnapMapView: React.FC<SnapMapViewProps> = ({
  currentCity,
  providers,
  userSession,
  onSelectProvider,
  onContactWhatsApp,
  onBack,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'services' | 'products'>('all');
  const [selectedEntity, setSelectedEntity] = useState<Provider | null>(null);
  const [rangeKm, setRangeKm] = useState(15);
  const [showRangePanel, setShowRangePanel] = useState(false);
  const [showLayerPanel, setShowLayerPanel] = useState(false);
  const [mapStyle, setMapStyle] = useState<MapStyleType>('google_streets');
  const [isLocating, setIsLocating] = useState(false);

  const cityCenter = DEFAULT_COLOMBIA_COORDS[currentCity] || DEFAULT_COLOMBIA_COORDS['Pereira'] || { lat: 4.81333, lng: -75.69611 };
  const userCoords = userSession.fixedLocation?.coordinates || cityCenter;

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const circleLayerRef = useRef<L.Circle | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);

  // All providers with distance calculated
  const providersWithDistance = useMemo(() => {
    return providers.map((p) => ({
      ...p,
      distanceKm: calculateDistanceKm(userCoords, p.coordinates || cityCenter),
    }));
  }, [providers, userCoords, cityCenter]);

  // Filtered by offerType and range radius
  const visibleProviders = useMemo(() => {
    return providersWithDistance.filter((p) => {
      if (filterType === 'services' && p.offerType !== 'services' && p.offerType !== 'both') return false;
      if (filterType === 'products' && p.offerType !== 'products' && p.offerType !== 'both') return false;
      if (p.distanceKm > rangeKm) return false;
      return true;
    });
  }, [providersWithDistance, filterType, rangeKm]);

  // Initialize Leaflet Map instance
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const initialCenter: [number, number] = [userCoords.lat, userCoords.lng];

    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: 13,
      zoomControl: false,
      attributionControl: true,
      preferCanvas: true,
      fadeAnimation: true,
      markerZoomAnimation: true,
    });

    const activeConfig = MAP_LAYERS[mapStyle];
    const tileLayer = L.tileLayer(activeConfig.url, {
      subdomains: activeConfig.subdomains,
      maxZoom: activeConfig.maxZoom,
      attribution: activeConfig.attribution,
      keepBuffer: 4,
      updateWhenIdle: false,
      updateWhenZooming: true,
    }).addTo(map);

    tileLayerRef.current = tileLayer;

    // Layer group for provider markers
    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;

    // Range circle
    const circle = L.circle(initialCenter, {
      radius: rangeKm * 1000,
      color: '#0052ff',
      weight: 1.8,
      opacity: 0.7,
      fillColor: '#0052ff',
      fillOpacity: 0.06,
      dashArray: '5, 8',
    }).addTo(map);
    circleLayerRef.current = circle;

    // User marker with Google/Gmail Profile Picture
    const userAvatar = userSession.avatarUrl || getEmailAvatarUrl(userSession.email, userSession.name);
    const userIconHtml = `
      <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 48px; height: 48px; transform: translate(-50%, -50%);">
        <div style="position: absolute; width: 48px; height: 48px; border-radius: 9999px; background-color: rgba(0, 82, 255, 0.25); border: 2px solid rgba(0, 82, 255, 0.6);" class="pulse-radar"></div>
        <div style="position: relative; width: 34px; height: 34px; border-radius: 9999px; overflow: hidden; background-color: #0052ff; border: 2.5px solid #ffffff; box-shadow: 0 4px 14px rgba(0,82,255,0.45); display: flex; align-items: center; justify-content: center; color: white;">
          <img src="${userAvatar}" alt="${userSession.name || 'Tú'}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(userSession.name || 'Tú')}&background=0052ff&color=fff&size=128&bold=true';" />
        </div>
        <div style="position: absolute; bottom: -8px; background: white; border: 1.5px solid #0052ff; color: #0052ff; font-size: 9.5px; font-weight: 900; padding: 1px 6px; border-radius: 9999px; box-shadow: 0 2px 6px rgba(0,0,0,0.15); white-space: nowrap;">
          Tú (GPS)
        </div>
      </div>
    `;

    const userIcon = L.divIcon({
      html: userIconHtml,
      className: 'custom-leaflet-marker',
      iconSize: [0, 0],
      iconAnchor: [0, 0],
    });

    const userMarker = L.marker(initialCenter, { icon: userIcon, zIndexOffset: 1000 }).addTo(map);
    userMarkerRef.current = userMarker;

    mapInstanceRef.current = map;

    // Invalidate size immediately and after layout rendering
    const timer1 = setTimeout(() => map.invalidateSize(), 150);
    const timer2 = setTimeout(() => map.invalidateSize(), 400);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      map.remove();
      mapInstanceRef.current = null;
      tileLayerRef.current = null;
      markersLayerRef.current = null;
      circleLayerRef.current = null;
      userMarkerRef.current = null;
    };
  }, []);

  // Update map style when layer is switched
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const activeConfig = MAP_LAYERS[mapStyle];
    const newTileLayer = L.tileLayer(activeConfig.url, {
      subdomains: activeConfig.subdomains,
      maxZoom: activeConfig.maxZoom,
      attribution: activeConfig.attribution,
      keepBuffer: 4,
      updateWhenIdle: false,
    }).addTo(map);

    tileLayerRef.current = newTileLayer;
  }, [mapStyle]);

  // Update User Center & Radius Circle
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const centerLatLng: [number, number] = [userCoords.lat, userCoords.lng];

    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng(centerLatLng);
      const userAvatar = userSession.avatarUrl || getEmailAvatarUrl(userSession.email, userSession.name);
      const updatedUserIcon = L.divIcon({
        html: `
          <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 48px; height: 48px; transform: translate(-50%, -50%);">
            <div style="position: absolute; width: 48px; height: 48px; border-radius: 9999px; background-color: rgba(0, 82, 255, 0.25); border: 2px solid rgba(0, 82, 255, 0.6);" class="pulse-radar"></div>
            <div style="position: relative; width: 34px; height: 34px; border-radius: 9999px; overflow: hidden; background-color: #0052ff; border: 2.5px solid #ffffff; box-shadow: 0 4px 14px rgba(0,82,255,0.45); display: flex; align-items: center; justify-content: center; color: white;">
              <img src="${userAvatar}" alt="${userSession.name || 'Tú'}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(userSession.name || 'Tú')}&background=0052ff&color=fff&size=128&bold=true';" />
            </div>
            <div style="position: absolute; bottom: -8px; background: white; border: 1.5px solid #0052ff; color: #0052ff; font-size: 9.5px; font-weight: 900; padding: 1px 6px; border-radius: 9999px; box-shadow: 0 2px 6px rgba(0,0,0,0.15); white-space: nowrap;">
              Tú (GPS)
            </div>
          </div>
        `,
        className: 'custom-leaflet-marker',
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      });
      userMarkerRef.current.setIcon(updatedUserIcon);
    }

    if (circleLayerRef.current) {
      circleLayerRef.current.setLatLng(centerLatLng);
      circleLayerRef.current.setRadius(rangeKm * 1000);
    }
  }, [userCoords, rangeKm, userSession.avatarUrl, userSession.name, userSession.email]);

  // Center on city changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    map.flyTo([userCoords.lat, userCoords.lng], 13, { duration: 0.9 });
  }, [currentCity]);

  // Update Provider Markers dynamically
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    visibleProviders.forEach((prov) => {
      const isSelected = selectedEntity?.id === prov.id;
      const coords: [number, number] = [prov.coordinates.lat, prov.coordinates.lng];

      const typeBadgeColor =
        prov.offerType === 'products'
          ? '#10b981'
          : prov.offerType === 'services'
          ? '#0052ff'
          : '#f59e0b';

      const typeIconSvg =
        prov.offerType === 'products'
          ? `<svg style="width:10px;height:10px;color:white;" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>`
          : prov.offerType === 'services'
          ? `<svg style="width:10px;height:10px;color:white;" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg>`
          : `<svg style="width:10px;height:10px;color:white;" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>`;

      const markerHtml = `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%); cursor: pointer; transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);">
          <!-- Pin Pinpoint Card -->
          <div style="
            position: relative;
            display: flex;
            align-items: center;
            gap: 6px;
            background: ${isSelected ? '#0052ff' : '#ffffff'};
            color: ${isSelected ? '#ffffff' : '#0f172a'};
            padding: 3px 8px 3px 3px;
            border-radius: 9999px;
            box-shadow: 0 6px 18px rgba(0,0,0,${isSelected ? '0.35' : '0.18'});
            border: 2px solid ${isSelected ? '#ffffff' : '#e2e8f0'};
            transform: ${isSelected ? 'scale(1.18)' : 'scale(1.0)'};
            transition: all 0.2s ease;
          ">
            <!-- Avatar -->
            <div style="position: relative; width: 32px; height: 32px; border-radius: 9999px; overflow: hidden; flex-shrink: 0; background: #e2e8f0;">
              <img src="${prov.avatarUrl}" alt="${prov.name}" style="width: 100%; height: 100%; object-fit: cover;" />
            </div>

            <!-- Type badge corner -->
            <div style="position: absolute; top: -3px; left: 22px; width: 15px; height: 15px; border-radius: 9999px; background: ${typeBadgeColor}; border: 1.5px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 1px 4px rgba(0,0,0,0.2);">
              ${typeIconSvg}
            </div>

            <!-- Name and Distance -->
            <div style="display: flex; flex-direction: column; line-height: 1.1; padding-right: 2px;">
              <span style="font-size: 10.5px; font-weight: 800; max-width: 90px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                ${prov.name.split(' ')[0]}
              </span>
              <span style="font-size: 9px; font-weight: 700; color: ${isSelected ? '#a7f3d0' : '#059669'};">
                ${formatDistance(prov.distanceKm)}
              </span>
            </div>
          </div>

          <!-- Bottom Pin Pointer Triangle -->
          <div style="
            width: 0;
            height: 0;
            border-left: 6px solid transparent;
            border-right: 6px solid transparent;
            border-top: 7px solid ${isSelected ? '#0052ff' : '#ffffff'};
            margin-top: -1px;
            filter: drop-shadow(0 2px 2px rgba(0,0,0,0.15));
          "></div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: markerHtml,
        className: 'custom-leaflet-marker',
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      });

      const marker = L.marker(coords, {
        icon: customIcon,
        zIndexOffset: isSelected ? 500 : 10,
      });

      marker.on('click', () => {
        setSelectedEntity(prov);
        map.flyTo(coords, Math.max(map.getZoom(), 15), { duration: 0.7 });
      });

      markersGroup.addLayer(marker);
    });
  }, [visibleProviders, selectedEntity]);

  // Center on current user / city with GPS animation
  const handleCenterOnUser = () => {
    const map = mapInstanceRef.current;
    if (!map) return;

    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          map.flyTo([latitude, longitude], 15, { duration: 0.8 });
          setIsLocating(false);
        },
        () => {
          // Fallback to registered userCoords
          map.flyTo([userCoords.lat, userCoords.lng], 14, { duration: 0.8 });
          setIsLocating(false);
        },
        { timeout: 5000 }
      );
    } else {
      map.flyTo([userCoords.lat, userCoords.lng], 14, { duration: 0.8 });
      setIsLocating(false);
    }
  };

  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn(1, { animate: true });
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut(1, { animate: true });
  };

  const handleFitAll = () => {
    const map = mapInstanceRef.current;
    if (!map || visibleProviders.length === 0) return;

    const bounds = L.latLngBounds([
      [userCoords.lat, userCoords.lng],
      ...visibleProviders.map((p) => [p.coordinates.lat, p.coordinates.lng] as [number, number]),
    ]);
    map.fitBounds(bounds, { padding: [60, 60], maxZoom: 16, animate: true });
  };

  return (
    <div className="relative w-full h-[calc(100vh-125px)] md:h-[calc(100vh-70px)] bg-[#e5e3df] overflow-hidden flex flex-col select-none">
      {/* Real Map Canvas Container */}
      <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />

      {/* TOP FLOATING CONTROLS (Z-Index 1000 to overlay Leaflet panes) */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex items-start justify-between gap-2 pointer-events-none">
        {/* Left Filter & Nav Pills */}
        <div className="flex items-center gap-2 flex-wrap pointer-events-auto">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 bg-white/95 hover:bg-white backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-lg text-slate-700 hover:text-slate-900 flex items-center gap-1.5 text-xs font-bold transition-all active:scale-95 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-[#0052ff]" />
              <span className="hidden sm:inline">Volver</span>
            </button>
          )}

          {/* Type filters */}
          <div className="bg-white/95 backdrop-blur-md p-1 rounded-2xl border border-slate-200/90 shadow-lg flex items-center gap-0.5 text-xs">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                filterType === 'all'
                  ? 'bg-[#0052ff] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Todos ({providers.length})
            </button>
            <button
              onClick={() => setFilterType('services')}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1 transition-all cursor-pointer ${
                filterType === 'services'
                  ? 'bg-[#0052ff] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Wrench className="w-3.5 h-3.5" /> Servicios
            </button>
            <button
              onClick={() => setFilterType('products')}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1 transition-all cursor-pointer ${
                filterType === 'products'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" /> Productos
            </button>
          </div>
        </div>

        {/* Right Tools: Style Switcher, Radius Slider, GPS */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          {/* Map Layer Switcher Button */}
          <div className="relative">
            <button
              onClick={() => {
                setShowLayerPanel(!showLayerPanel);
                setShowRangePanel(false);
              }}
              className={`p-2.5 backdrop-blur-md rounded-2xl border shadow-lg transition-all active:scale-95 flex items-center gap-1 text-xs font-bold cursor-pointer ${
                showLayerPanel
                  ? 'bg-[#0052ff] text-white border-[#0052ff]'
                  : 'bg-white/95 text-slate-700 hover:text-slate-900 hover:bg-white border-slate-200/90'
              }`}
              title="Cambiar vista del mapa"
            >
              <Layers className="w-4 h-4 text-[#0052ff]" />
              <span className="hidden md:inline">{MAP_LAYERS[mapStyle].icon}</span>
            </button>

            {/* Map Layer Switcher Dropdown */}
            {showLayerPanel && (
              <div className="absolute right-0 top-12 bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl p-2 shadow-2xl w-48 space-y-1 z-[1100] animate-in fade-in zoom-in-95 duration-150">
                <div className="px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Capa de Mapa
                </div>
                {(Object.keys(MAP_LAYERS) as MapStyleType[]).map((key) => {
                  const layer = MAP_LAYERS[key];
                  const isActive = mapStyle === key;
                  return (
                    <button
                      key={key}
                      onClick={() => {
                        setMapStyle(key);
                        setShowLayerPanel(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#0052ff] text-white shadow-sm'
                          : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{layer.icon}</span>
                        <span>{layer.name}</span>
                      </div>
                      {isActive && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Range Slider Button */}
          <button
            onClick={() => {
              setShowRangePanel(!showRangePanel);
              setShowLayerPanel(false);
            }}
            className={`p-2.5 backdrop-blur-md rounded-2xl border shadow-lg transition-all active:scale-95 flex items-center gap-1 text-xs font-bold cursor-pointer ${
              showRangePanel
                ? 'bg-[#0052ff] text-white border-[#0052ff]'
                : 'bg-white/95 text-slate-700 hover:text-slate-900 hover:bg-white border-slate-200/90'
            }`}
            title="Rango de distancia"
          >
            <SlidersHorizontal className="w-4 h-4 text-[#0052ff]" />
            <span className="hidden sm:inline">{rangeKm} km</span>
          </button>

          {/* Center GPS button */}
          <button
            onClick={handleCenterOnUser}
            disabled={isLocating}
            className="p-2.5 bg-white/95 hover:bg-white backdrop-blur-md text-[#0052ff] rounded-2xl border border-slate-200/90 shadow-lg active:scale-95 transition-all cursor-pointer"
            title="Mi Ubicación GPS"
          >
            <Crosshair className={`w-4 h-4 ${isLocating ? 'animate-spin text-emerald-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* FLOATING RANGE SLIDER PANEL (Z-Index 1050) */}
      {showRangePanel && (
        <div className="absolute top-16 right-3 z-[1050] bg-white/95 backdrop-blur-md border border-slate-200 rounded-3xl p-4 shadow-2xl w-64 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#0052ff]" />
              Radio de Cobertura
            </h4>
            <button
              onClick={() => setShowRangePanel(false)}
              className="p-1 text-slate-400 hover:text-slate-800 rounded-full hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mb-2.5">
            <input
              type="range"
              min={1}
              max={50}
              value={rangeKm}
              onChange={(e) => setRangeKm(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-[#0052ff] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#0052ff] [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xl font-extrabold text-[#0052ff]">{rangeKm} km</span>
            <span className="text-[11px] text-slate-500 font-semibold bg-slate-100 px-2.5 py-1 rounded-lg">
              {visibleProviders.length} en rango
            </span>
          </div>

          <div className="flex gap-1.5 mt-3">
            {[5, 10, 20, 50].map((km) => (
              <button
                key={km}
                onClick={() => setRangeKm(km)}
                className={`flex-1 text-[10px] font-bold py-1.5 rounded-xl border transition-all cursor-pointer ${
                  rangeKm === km
                    ? 'bg-[#0052ff] text-white border-[#0052ff] shadow-sm'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-[#0052ff] hover:text-[#0052ff]'
                }`}
              >
                {km} km
              </button>
            ))}
          </div>
        </div>
      )}

      {/* RIGHT SIDE FLOATING MAP CONTROLS (+ / - / Fit Bounds) (Z-Index 1000) */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 z-[1000] flex flex-col gap-2">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-lg p-1 flex flex-col gap-1">
          <button
            onClick={handleZoomIn}
            className="p-2.5 hover:bg-slate-100 text-slate-700 hover:text-slate-900 rounded-xl transition-all active:scale-95 cursor-pointer"
            title="Acercar mapa"
          >
            <Plus className="w-4 h-4 text-slate-800" />
          </button>
          <div className="w-full h-px bg-slate-200" />
          <button
            onClick={handleZoomOut}
            className="p-2.5 hover:bg-slate-100 text-slate-700 hover:text-slate-900 rounded-xl transition-all active:scale-95 cursor-pointer"
            title="Alejar mapa"
          >
            <Minus className="w-4 h-4 text-slate-800" />
          </button>
        </div>

        <button
          onClick={handleFitAll}
          className="p-2.5 bg-white/95 hover:bg-white backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-lg text-slate-700 hover:text-[#0052ff] active:scale-95 transition-all cursor-pointer"
          title="Ver todos los proveedores"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* BOTTOM LEFT INFO BADGE */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl px-3.5 py-2 shadow-lg flex items-center gap-2 pointer-events-auto">
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <MapPin className="w-3.5 h-3.5 text-[#0052ff]" />
        <span className="text-xs font-bold text-slate-900">{visibleProviders.length}</span>
        <span className="text-xs text-slate-500">en</span>
        <span className="text-xs font-bold text-[#0052ff]">{currentCity}</span>
        <span className="text-[11px] text-slate-400">({rangeKm} km)</span>
      </div>

      {/* SELECTED PROVIDER FLOATING PREVIEW CARD (Z-Index 1050) */}
      {selectedEntity && (
        <div className="absolute bottom-3 left-3 right-3 z-[1050] max-w-md mx-auto bg-white border border-slate-200/90 rounded-3xl p-4 shadow-2xl animate-in slide-in-from-bottom-5 duration-200">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative shrink-0">
                <img
                  src={selectedEntity.avatarUrl}
                  alt={selectedEntity.name}
                  className="w-12 h-12 rounded-2xl object-cover ring-2 ring-[#0052ff]/30 shadow"
                />
                {selectedEntity.verified && (
                  <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-0.5 rounded-full ring-2 ring-white">
                    <ShieldCheck className="w-3 h-3" />
                  </div>
                )}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-slate-900 text-sm truncate">{selectedEntity.name}</h3>
                  {selectedEntity.isFeatured && (
                    <span className="px-1.5 py-0.5 bg-amber-50 border border-amber-200 text-amber-700 text-[9px] font-extrabold rounded-md flex items-center gap-0.5">
                      <Sparkles className="w-2.5 h-2.5" /> PRO
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 truncate font-medium">{selectedEntity.businessName}</p>

                <div className="flex items-center gap-2 mt-1 text-[11px]">
                  <span className="font-bold text-amber-500 flex items-center gap-0.5">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    {selectedEntity.rating.toFixed(1)}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-[#0052ff] font-bold flex items-center gap-0.5">
                    <Navigation className="w-3 h-3" />
                    {formatDistance(calculateDistanceKm(userCoords, selectedEntity.coordinates))}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-500 capitalize">{selectedEntity.category}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedEntity(null)}
              className="p-1.5 text-slate-400 hover:text-slate-800 rounded-full bg-slate-100 hover:bg-slate-200 shrink-0 transition-colors cursor-pointer"
              title="Cerrar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Modality and Address */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600 my-2 bg-slate-50 p-2 rounded-xl border border-slate-100">
            {selectedEntity.serviceModality === 'home_delivery' ? (
              <span className="text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-lg shrink-0">
                🛵 Solo a Domicilio
              </span>
            ) : selectedEntity.serviceModality === 'mobile_street' ? (
              <span className="text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-lg shrink-0">
                🚐 Puesto Ambulante Móvil
              </span>
            ) : (
              <span className="text-[10px] font-bold bg-blue-50 text-[#0052ff] border border-blue-200 px-2 py-0.5 rounded-lg shrink-0">
                🏢 Local Físico
              </span>
            )}
            <span className="text-[11px] truncate text-slate-600">{selectedEntity.address}</span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
            <button
              onClick={() => onSelectProvider(selectedEntity)}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold py-2.5 px-3 rounded-2xl transition-all cursor-pointer"
            >
              Ver Perfil Completo
            </button>

            <button
              onClick={() => onContactWhatsApp(selectedEntity)}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2.5 px-3 rounded-2xl flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all active:scale-98 cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>

            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${selectedEntity.coordinates.lat},${selectedEntity.coordinates.lng}`}
              target="_blank"
              rel="noreferrer"
              className="p-2.5 bg-slate-100 hover:bg-slate-200 text-[#0052ff] rounded-2xl transition-all cursor-pointer"
              title="Cómo llegar con Google Maps"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

