import PackageDetailsClient from './PackageDetailsClient';
import { API_BASE } from '../../../config';

export async function generateMetadata({ params }) {
    const { id } = await params;
    try {
        const res = await fetch(`${API_BASE}/destinations/${id}`);
        const data = await res.json();
        
        return {
            title: `Explore ${data.name}`,
            description: data.description?.slice(0, 160) || "Experience the majestic blend of heritage, nature, and adventure with Travaya.",
            openGraph: {
                title: `Explore ${data.name} | Travaya`,
                description: data.description?.slice(0, 160),
                images: [data.image],
            },
        };
    } catch (err) {
        return {
            title: "Tour Details | Travaya",
        };
    }
}

export default async function PackageDetails({ params }) {
    const { id } = await params;
    
    let initialDestination = null;
    let initialItinerary = null;

    try {
        const destRes = await fetch(`${API_BASE}/destinations/${id}`);
        if (destRes.ok) initialDestination = await destRes.json();

        const itinRes = await fetch(`${API_BASE}/destinations/${id}/itinerary`);
        if (itinRes.ok) initialItinerary = await itinRes.json();
    } catch (err) {
        console.error("Server-side fetch error:", err);
    }

    return (
        <PackageDetailsClient 
            initialDestination={initialDestination} 
            initialItinerary={initialItinerary} 
        />
    );
}
