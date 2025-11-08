export interface Route {
    id: string;
    from: string;
    to: string;
    price: number;
    duration: string;
    departureTime: string[];
    availableSeats: number;
    busType: string;
    distance: number;
}

export interface Booking {
    id: string;
    routeId: string;
    customerName: string;
    phone: string;
    email: string;
    date: string;
    departureTime: string;
    seats: number;
    totalPrice: number;
    status: 'pending' | 'confirmed' | 'cancelled';
}

export interface Company {
    name: string;
    phone: string;
    email: string;
    address: string;
    founded: string;
    vision: string;
    mission: string;
}
