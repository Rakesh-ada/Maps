export interface Place {
    id: string;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    category: string;
}

export const kolkataPlaces: Place[] = [
    {
        id: '1',
        name: 'Victoria Memorial',
        address: 'Victoria Memorial Hall, 1, Queens Way, Kolkata',
        latitude: 22.5448,
        longitude: 88.3426,
        category: 'Attraction'
    },
    {
        id: '2',
        name: 'Howrah Bridge',
        address: 'Kolkata, West Bengal 700001',
        latitude: 22.5851,
        longitude: 88.3468,
        category: 'Attraction'
    },
    {
        id: '3',
        name: 'Park Street',
        address: 'Park Street, Kolkata',
        latitude: 22.5551,
        longitude: 88.3536,
        category: 'Shopping'
    },
    {
        id: '4',
        name: 'Science City',
        address: 'J.B.S Haldane Avenue, Kolkata',
        latitude: 22.5392,
        longitude: 88.3968,
        category: 'Attraction'
    },
    {
        id: '5',
        name: 'Dakshineswar Kali Temple',
        address: 'Dakshineswar, Kolkata',
        latitude: 22.6568,
        longitude: 88.3619,
        category: 'Attraction'
    },
    {
        id: '6',
        name: 'Eden Gardens',
        address: 'B.B.D. Bagh, Kolkata',
        latitude: 22.5646,
        longitude: 88.3433,
        category: 'Attraction'
    },
    {
        id: '7',
        name: 'Quest Mall',
        address: 'Syed Amir Ali Ave, Park Circus, Kolkata',
        latitude: 22.5391,
        longitude: 88.3656,
        category: 'Shopping'
    },
    {
        id: '8',
        name: 'Netaji Subhash Chandra Bose International Airport',
        address: 'Jessore Rd, Dum Dum, Kolkata',
        latitude: 22.6548,
        longitude: 88.4467,
        category: 'Transport'
    },
    {
        id: '9',
        name: 'Peter Cat',
        address: '18A, Park St, Kolkata',
        latitude: 22.5539,
        longitude: 88.3524,
        category: 'Restaurant'
    },
    {
        id: '10',
        name: 'Arsalan',
        address: 'Park Circus, Seven Point, Kolkata',
        latitude: 22.5403,
        longitude: 88.3644,
        category: 'Restaurant'
    }
];
