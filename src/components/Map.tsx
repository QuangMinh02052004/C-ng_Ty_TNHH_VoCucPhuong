'use client';

import { useCallback, useMemo } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

interface MapProps {
    center?: { lat: number; lng: number };
    markers?: Array<{ position: { lat: number; lng: number }; title?: string }>;
}

const Map = ({ center = { lat: 10.8231, lng: 106.6297 }, markers = [] }: MapProps) => {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    });

    const containerStyle = {
        width: '100%',
        height: '100%',
    };

    const options = useMemo(
        () => ({
            disableDefaultUI: false,
            clickableIcons: true,
            scrollwheel: true,
        }),
        []
    );

    const onLoad = useCallback((map: google.maps.Map) => {
        const bounds = new google.maps.LatLngBounds();
        markers.forEach(({ position }) => bounds.extend(position));
        if (markers.length > 1) {
            map.fitBounds(bounds);
        }
    }, [markers]);

    if (!isLoaded) return (
        <div className="aspect-video bg-white rounded-lg flex items-center justify-center shadow-md border border-gray-200 mx-auto max-w-4xl">
            <p className="text-gray-500">
                Loading Google Maps...
                <br />
                <span className="text-sm">
                    {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? 'API Key is set' : 'API Key is missing'}
                </span>
            </p>
        </div>
    );

    return (
        <div className="aspect-video bg-white rounded-lg overflow-hidden shadow-md border border-gray-200 mx-auto max-w-4xl">
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={center}
                zoom={12}
                options={{
                    ...options,
                    zoomControl: true,
                    streetViewControl: false,
                    mapTypeControl: false,
                    fullscreenControl: true,
                }}
                onLoad={onLoad}
            >
                {markers.map((marker, index) => (
                    <Marker
                        key={index}
                        position={marker.position}
                        title={marker.title}
                    />
                ))}
            </GoogleMap>
        </div>
    );
};

export default Map;