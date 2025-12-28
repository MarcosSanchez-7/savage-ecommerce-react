
import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapPin, Navigation, Search, Loader2 } from "lucide-react";

// Fix icons using CDN to avoid build issues
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LocationPickerProps {
    onLocationSelect: (lat: number, lng: number) => void;
    initialLocation?: { lat: number; lng: number };
    onClose: () => void;
}

const LocationMarker: React.FC<{ onSelect: (lat: number, lng: number) => void }> = ({ onSelect }) => {
    const [position, setPosition] = useState<L.LatLng | null>(null);

    const map = useMapEvents({
        click(e) {
            setPosition(e.latlng);
            onSelect(e.latlng.lat, e.latlng.lng);
            map.flyTo(e.latlng, map.getZoom());
        },
        locationfound(e) {
            setPosition(e.latlng);
            onSelect(e.latlng.lat, e.latlng.lng);
            map.flyTo(e.latlng, 15);
        },
    });

    return position === null ? null : (
        <Marker position={position} />
    );
};

// Helper to fix map rendering issues inside modals/animations
const MapFixer = () => {
    const map = useMap();
    useEffect(() => {
        // Wait for the modal animation (duration-300) to complete
        const timer = setTimeout(() => {
            map.invalidateSize();
        }, 400);
        return () => clearTimeout(timer);
    }, [map]);
    return null;
};

// Helper to get map instance
const MapController: React.FC<{ setMap: (map: L.Map) => void }> = ({ setMap }) => {
    const map = useMap();
    useEffect(() => {
        setMap(map);
    }, [map, setMap]);
    return null;
};

const LocationPicker: React.FC<LocationPickerProps> = ({ onLocationSelect, initialLocation, onClose }) => {
    // Default to Buenos Aires/Asuncion region if no initial logic works
    const defaultCenter = initialLocation || { lat: -25.2637, lng: -57.5759 }; // Asuncion, Paraguay approx

    // Search State
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [mapInstance, setMapInstance] = useState<L.Map | null>(null);

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        setIsSearching(true);
        try {
            // Priority to Paraguay
            const query = searchQuery.toLowerCase().includes('paraguay') ? searchQuery : `${searchQuery}, Paraguay`;
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`);
            const data = await response.json();

            if (data && data.length > 0) {
                const { lat, lon } = data[0];
                const newPos = { lat: parseFloat(lat), lng: parseFloat(lon) };

                // Update map
                if (mapInstance) {
                    mapInstance.flyTo(newPos, 16);
                }

                // Trigger selection
                onLocationSelect(newPos.lat, newPos.lng);
            } else {
                alert("Ubicación no encontrada. Intenta ser más específico.");
            }
        } catch (error) {
            console.error("Error searching location:", error);
            alert("Error al buscar ubicación.");
        } finally {
            setIsSearching(false);
        }
    };

    const handleLocateMe = () => {
        if (mapInstance) {
            mapInstance.locate();
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-0 md:p-4">
            <div className="bg-[#0a0a0a] border-0 md:border border-gray-800 rounded-none md:rounded-xl w-full max-w-2xl h-full md:h-[80vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-300 shadow-2xl">

                {/* Header */}
                <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-[#0a0a0a] z-10 shrink-0">
                    <div>
                        <h3 className="text-white font-bold text-lg flex items-center gap-2">
                            <MapPin className="text-primary" size={20} />
                            Ubicación
                        </h3>
                        {/* <p className="text-gray-400 text-xs hidden md:block">Toca en el mapa para marcar tu dirección.</p> */}
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-white transition-colors text-sm font-bold uppercase"
                    >
                        Cancelar
                    </button>
                </div>

                {/* Search Bar - Integrated Block */}
                <div className="bg-[#0a0a0a] border-b border-gray-800 p-2 z-10 w-full flex justify-center shrink-0">
                    <div className="flex gap-2 w-full max-w-lg relative bg-gray-900 rounded-lg border border-gray-700 overflow-hidden">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            placeholder="Buscar ciudad o barrio..."
                            className="flex-1 bg-transparent border-none text-white text-sm p-3 focus:outline-none placeholder-gray-500"
                        />
                        <button
                            onClick={handleSearch}
                            disabled={isSearching}
                            className="bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white px-4 flex items-center justify-center transition-colors border-l border-gray-700"
                        >
                            {isSearching ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                        </button>
                    </div>
                </div>

                {/* Map Container */}
                <div className="flex-1 relative z-0 min-h-0">
                    <MapContainer
                        center={defaultCenter}
                        zoom={13}
                        style={{ height: "100%", width: "100%" }}
                        className="z-0"
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <LocationMarker onSelect={onLocationSelect} />
                        <MapFixer />
                        <MapController setMap={setMapInstance} />
                    </MapContainer>

                    {/* Floating Locate Button */}
                    <button
                        onClick={handleLocateMe}
                        className="absolute bottom-4 right-4 z-[400] bg-black text-white p-3 rounded-full shadow-lg border border-gray-700 hover:bg-gray-900 transition-all"
                    >
                        <Navigation size={20} />
                    </button>
                </div>

                {/* Footer/Actions */}
                <div className="p-4 border-t border-gray-800 bg-[#0a0a0a] flex justify-between items-center z-10 shrink-0 safe-pb-4">
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span className="hidden md:inline">Toca el mapa para marcar envíos fuera del GPS.</span>
                        <span className="md:hidden">Toca para marcar.</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="bg-primary hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg uppercase text-sm tracking-wider transition-colors shadow-lg"
                    >
                        CONFIRMAR
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LocationPicker;
