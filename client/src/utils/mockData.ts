import type { Property } from "@/types/Property";
import type { Booking } from '@/types/Booking';
import type { Host, HostStats, EarningsData } from '@/types/Host';

export const mockProperties: Property[] = [
    {
        _id: "1",
        title: "Modern Downtown Loft with City Views",
        description:
            "Experience luxury living in this stunning downtown loft featuring floor-to-ceiling windows, modern furnishings, and breathtaking city views. Perfect for business travelers or couples seeking a sophisticated urban retreat.",
        price: 120,
        location: {
            city: "New York",
            country: "USA",
            address: "123 Main St, Manhattan, NY 10001",
            coordinates: { lat: 40.7589, lng: -73.9851 },
        },
        images: [
            "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
            "https://images.unsplash.com/photo-1486304873000-235643847519?w=800",
            "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
            "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
            "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800",
        ],
        amenities: [
            "WiFi",
            "Kitchen",
            "Air conditioning",
            "Heating",
            "Washer",
            "Dryer",
            "Balcony",
        ],
        bedrooms: 2,
        bathrooms: 1,
        maxGuests: 4,
        propertyType: "loft",
        host: {
            _id: "host1",
            firstName: "John",
            lastName: "Doe",
            email: "john@example.com",
            avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
        },
        rating: 4.8,
        reviewCount: 24,
        createdAt: "2024-01-01",
        updatedAt: "2024-01-01",
    },
    {
        _id: "2",
        title: "Cozy Beachfront Villa",
        description:
            "Wake up to ocean waves in this charming beachfront villa. Features a private deck, full kitchen, and direct beach access. Perfect for families or groups looking for a relaxing getaway.",
        price: 200,
        location: {
            city: "Miami",
            country: "USA",
            address: "456 Ocean Drive, Miami Beach, FL 33139",
        },
        images: [
            "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800",
            "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800",
            "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800",
        ],
        amenities: [
            "WiFi",
            "Kitchen",
            "Pool",
            "Parking",
            "Air conditioning",
            "Garden",
            "Balcony",
        ],
        bedrooms: 3,
        bathrooms: 2,
        maxGuests: 6,
        propertyType: "villa",
        host: {
            _id: "host2",
            firstName: "Sarah",
            lastName: "Johnson",
            email: "sarah@example.com",
            avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150",
        },
        rating: 4.9,
        reviewCount: 18,
        createdAt: "2024-01-01",
        updatedAt: "2024-01-01",
    },
];

export const mockBookings: Booking[] = [
  {
    _id: 'booking1',
    property: {
      _id: '1',
      title: 'Modern Downtown Loft with City Views',
      images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'],
      location: { city: 'New York', country: 'USA', address: '123 Main St' },
      price: 120,
      host: {
        _id: 'host1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com'
      }
    } as Property,
    guest: 'user1',
    host: 'host1',
    checkIn: '2024-07-15',
    checkOut: '2024-07-18',
    guests: 2,
    totalPrice: 408, // 3 nights * 120 + fees
    status: 'confirmed',
    createdAt: '2024-06-01',
    updatedAt: '2024-06-01',
    specialRequests: 'Late check-in around 9 PM',
    reviewed: null // No review yet
  },
  {
    _id: 'booking2',
    property: {
      _id: '2',
      title: 'Cozy Beachfront Villa',
      images: ['https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800'],
      location: { city: 'Miami', country: 'USA', address: '456 Ocean Drive' },
      price: 200,
      host: {
        _id: 'host2',
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah@example.com'
      }
    } as Property,
    guest: 'user1',
    host: 'host2',
    checkIn: '2024-05-10',
    checkOut: '2024-05-15',
    guests: 4,
    totalPrice: 1200,
    status: 'completed',
    createdAt: '2024-04-15',
    updatedAt: '2024-05-15',
    reviewed: null // No review yet
  },
  {
    _id: 'booking3',
    property: {
      _id: '1',
      title: 'Modern Downtown Loft with City Views',
      images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'],
      location: { city: 'New York', country: 'USA', address: '123 Main St' },
      price: 120,
      host: {
        _id: 'host1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com'
      }
    } as Property,
    guest: 'user1',
    host: 'host1',
    checkIn: '2024-03-01',
    checkOut: '2024-03-05',
    guests: 2,
    totalPrice: 544,
    status: 'cancelled',
    createdAt: '2024-02-10',
    updatedAt: '2024-02-25',
    reviewed: null ,// No review yet
    cancellationReason: 'Change of travel plans'
    
  },
  {
    _id: 'booking4',
    property: {
      _id: '2',
      title: 'Cozy Beachfront Villa',
      images: ['https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800'],
      location: { city: 'Miami', country: 'USA', address: '456 Ocean Drive' },
      price: 200,
      host: {
        _id: 'host2',
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah@example.com'
      }
    } as Property,
    guest: 'user1',
    host: 'host2',
    checkIn: '2024-08-20',
    checkOut: '2024-08-25',
    guests: 6,
    totalPrice: 1200,
    status: 'pending',
    createdAt: '2024-06-10',
    updatedAt: '2024-06-10',
    reviewed: null // No review yet
  }
];

export const mockHostData: Host & { stats: HostStats; earnings: EarningsData[] } = {
  _id: 'host1',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phone: '+1 (555) 123-4567',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
  bio: 'Experienced host with a passion for hospitality. I love meeting new people and sharing the beauty of my city with travelers from around the world.',
  isVerified: true,
  joinedDate: '2020-03-15',
  rating: 4.8,
  reviewCount: 127,
  responseRate: 98,
  responseTime: 'within an hour',
  languages: ['English', 'Spanish', 'French'],
  propertyCount: 3,
  totalEarnings: 45680,
  completedBookings: 89,
  createdAt: '2020-03-15',
  updatedAt: '2024-06-13',
  stats: {
    totalProperties: 3,
    activeProperties: 3,
    totalBookings: 89,
    pendingBookings: 5,
    totalEarnings: 45680,
    monthlyEarnings: 3240,
    occupancyRate: 78,
    averageRating: 4.8
  },
  earnings: [
    { month: 'Jan', earnings: 2800, bookings: 8 },
    { month: 'Feb', earnings: 3200, bookings: 9 },
    { month: 'Mar', earnings: 2900, bookings: 7 },
    { month: 'Apr', earnings: 3800, bookings: 11 },
    { month: 'May', earnings: 4200, bookings: 12 },
    { month: 'Jun', earnings: 3240, bookings: 9 }
  ]
};

export const mockHostProperties: Property[] = [
  {
    ...mockProperties[0],
    host: {
      _id: 'host1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'
    }
  },
  {
    ...mockProperties[1],
    _id: '3',
    title: 'Luxury Penthouse Suite',
    price: 350,
    location: {
      city: 'Los Angeles',
      country: 'USA',
      address: '789 Sunset Blvd, Hollywood, CA 90028'
    },
    images: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800'
    ],
    propertyType: 'apartment',
    bedrooms: 3,
    bathrooms: 2,
    maxGuests: 6,
    host: {
      _id: 'host1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'
    }
  },
  {
    ...mockProperties[0],
    _id: '4',
    title: 'Cozy Mountain Cabin',
    price: 180,
    location: {
      city: 'Aspen',
      country: 'USA',
      address: '456 Mountain View Dr, Aspen, CO 81611'
    },
    images: [
      'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800'
    ],
    propertyType: 'house',
    bedrooms: 2,
    bathrooms: 1,
    maxGuests: 4,
    rating: 4.9,
    reviewCount: 34,
    host: {
      _id: 'host1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'
    }
  }
];

export const mockHostBookings: Booking[] = [
  ...mockBookings.map(booking => ({
    ...booking,
    host: 'host1'
  })),
  {
    _id: 'booking5',
    property: mockHostProperties[1],
    guest: 'user2',
    host: 'host1',
    checkIn: '2024-07-01',
    checkOut: '2024-07-05',
    guests: 2,
    totalPrice: 1600,
    status: 'pending',
    createdAt: '2024-06-10',
    updatedAt: '2024-06-10',
    reviewed: null, // No review yet
  }
];

// Update your useProperties hook to use mock data temporarily
export const useMockProperties = () => {
    return {
        properties: mockProperties,
        loading: false,
        error: null,
    };
};

export const useMockProperty = (id: string) => {
    const property = mockProperties.find((p) => p._id === id) || null;
    return {
        property,
        loading: false,
        error: property ? null : "Property not found",
    };
};
