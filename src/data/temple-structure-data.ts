import {
  Temple,
  ChildTemple,
  Sacred,
  Zone,
  HallRoom,
  Counter

} from '@/types/temple-structure';

// Import images
import mainTempleImg from '@/assets/images/main_temple.png';
import deitySharadambaImg from '@/assets/images/deity_sharadamba.png';
import childTempleShivaImg from '@/assets/images/child_temple_shiva.png';
import templeInternalHallImg from '@/assets/images/temple_internal_hall.png';
import sevaCounterImg from '@/assets/images/seva_counter.png';
import childTempleVidyashankaraImg from '@/assets/images/child_temple_vidyashankara.png';
import childTempleGanapatiImg from '@/assets/images/child_temple_ganapati.png';
import childTempleMalahanikareshwaraImg from '@/assets/images/child_temple_malahanikareshwara.png';
import sacredSamadhiShrineImg from '@/assets/images/sacred_samadhi_shrine.png';
import zonePradakshinaImg from '@/assets/images/zone_pradakshina.png';
import zoneQueueComplexImg from '@/assets/images/zone_queue_complex.png';
import zoneAdminBlockImg from '@/assets/images/zone_admin_block.png';
import hallBhojanaShalaImg from '@/assets/images/hall_bhojana_shala.png';
import roomPujaPrivateImg from '@/assets/images/room_puja_private.png';
import roomOfficeInteriorImg from '@/assets/images/room_office_interior.png';
import roomStoreTempleImg from '@/assets/images/room_store_temple.png';

export const dummyTemples: Temple[] = [
  {
    id: 'temple-1',
    name: 'Sri Sharadamba Temple',
    location: 'Sringeri, Karnataka',
    description: 'The Sri Sharadamba Temple is the foremost spiritual destination in Sringeri, housing the sacred golden idol of Goddess Sharadamba seated on the Sri Chakra Peetha. This ancient temple stands as a beacon of Advaita philosophy and Vedic learning, attracting thousands of devotees and scholars from around the world. The temple\'s sanctum sanctorum radiates divine energy, offering solace and wisdom to all who seek the blessings of the Goddess of knowledge and arts.',
    status: 'active',
    isPrimary: true,
    image: deitySharadambaImg,
    createdAt: '2020-01-01',
    deity: 'Goddess Sharadamba (Saraswati)',
    contactPhone: '+91-8265-250001',
    contactEmail: 'info@sringeri.org',
    contactAddress: 'Sringeri, Chikkamagaluru District, Karnataka 577139',
    gpsCoordinates: { latitude: 13.4189, longitude: 75.2550 },
    geoFencingRadius: 500,
    operationalStatus: 'open',
    darshanTimings: {
      open: '06:00',
      close: '20:00',
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    },
    specialDays: [
      { date: '2024-01-26', reason: 'Republic Day', status: 'open' },
      { date: '2024-08-15', reason: 'Independence Day', status: 'open' },
      { date: '2024-10-02', reason: 'Navaratri Festival - Extended Hours', status: 'open' },
    ],
    administrationContacts: [
      { name: 'Sri Vidyashankara Swamiji', role: 'Administrator', phone: '+91-8265-250001', email: 'admin@sringeri.org' },
    ],
    statusHistory: [
      { date: '2020-01-01', status: 'active', changedBy: 'System' },
    ],
    facilities: [
      'Parking (500+ vehicles)',
      'Prasad Counter',
      'Vedic Library',
      'Annadanam Hall (Daily Free Meals)',
      'Queue Complex',
      'Modern Restrooms',
      'Information & Help Desk',
      'First Aid Center',
      'Special Darshan Booking Counter',
      'Photography Restricted Zones'
    ],
    dressCode: 'Traditional attire strongly preferred. Men: Dhoti/Kurta or formal shirt-pant. Women: Saree/Salwar Kameez/Traditional dress. Footwear must be removed before entering the temple premises. Shorts, sleeveless tops, and revealing clothing are not permitted. Please dress modestly to respect the sacred atmosphere.',
    templeHistory: `The Sri Sharadamba Temple in Sringeri holds a glorious history spanning over 1200 years, standing as a testament to India's rich spiritual and cultural heritage. This sacred shrine represents the pinnacle of devotion to Goddess Sharadamba, the embodiment of knowledge, arts, and divine wisdom.

**Foundation by Adi Shankaracharya**

Founded by Jagadguru Adi Shankaracharya in the 8th century CE (circa 788 AD), this temple marks one of the four cardinal directions of his spiritual conquest across the Indian subcontinent. According to ancient texts and oral traditions, when Adi Shankaracharya arrived at Sringeri, he was deeply moved by the serene beauty of the Tunga river valley and the spiritual vibrations of the land. It was here that he witnessed a remarkable sight - a cobra providing shade to a pregnant frog, symbolizing the transcendence of natural enmity in the presence of dharma. Recognizing this as a divine sign, he established the Sringeri Sharada Peetham, one of the four Amnaya Peethas.

Initially, Adi Shankaracharya consecrated a sandalwood idol of Goddess Sharadamba in a seated posture, representing the eternal quest for knowledge and wisdom. The temple quickly became a beacon for scholars, philosophers, and spiritual seekers from across the land. The presence of the Peetham transformed Sringeri into a major center of Vedic learning and Advaita Vedanta philosophy.

**The Golden Era and Temple Evolution**

The temple witnessed significant transformation in 1916 when Jagadguru Sri Sachidananda Shivabhinava Nrisimha Bharati Mahaswamiji consecrated the current magnificent golden idol of Goddess Sharadamba. This historic Maha Kumbhabhisheka ceremony was attended by thousands of devotees and marked a new chapter in the temple's illustrious history. The golden idol, depicting the Goddess seated on the Sri Chakra Peetha in the Sarvajna (all-knowing) posture, radiates divine splendor and has since become one of the most revered images in South India.

The architectural evolution of the temple complex spans several centuries. During the Vijayanagara Empire (14th-16th centuries), the temple received royal patronage and underwent major expansions. The rulers of Vijayanagara, being ardent devotees of Goddess Sharadamba, contributed generously to the temple's development, adding magnificent gopurams, mandapams, and auxiliary structures. The temple's Dravidian architectural style, with influences from Kerala temple architecture, reflects this rich historical patronage.

**Spiritual Significance and Lineage**

The Sringeri Sharada Peetham has maintained an unbroken lineage of 36 Jagadgurus from Adi Shankaracharya to the present day, making it one of the most important spiritual institutions in Hinduism. Each Jagadguru has contributed to preserving and propagating Advaita Vedanta philosophy while maintaining the temple's spiritual sanctity. The Peetham's library houses thousands of rare Sanskrit manuscripts, palm leaf inscriptions, and ancient texts that chronicle India's philosophical heritage.

The temple is not merely a place of worship but serves as a living university of Vedic knowledge. Scholars have studied here for centuries, contributing to commentaries on the Vedas, Upanishads, and other sacred texts. The tradition of daily Vedic chanting, elaborate rituals, and philosophical discourses continues unabated, maintaining the spiritual atmosphere that Adi Shankaracharya established twelve centuries ago.

**Modern Era and Continued Relevance**

In the 20th and 21st centuries, the temple has successfully balanced tradition with modernity. While carefully preserving its ancient rituals and architectural heritage, it has also embraced contemporary amenities for devotees. The temple complex now features modern facilities including a well-organized queue system, digital darshan booking, anna danam (free food) halls that serve thousands daily, and comprehensive visitor services.

The temple's annual Sharada Navaratri festival attracts hundreds of thousands of devotees from across the world. Special pujas, cultural programs, and spiritual discourses during this period create an atmosphere of intense devotion and celebration. The sight of the illuminated temple during festivals, with traditional music and Vedic chanting echoing through the valley, creates an unforgettable spiritual experience.

**Architectural Marvel and Sacred Spaces**

The temple complex encompasses several sacred structures, each with its own significance. The main sanctum sanctorum, where the golden idol of Goddess Sharadamba resides, is built according to ancient Agama Shastra specifications. The Sri Chakra Peetha on which the Goddess is seated is itself a powerful yantra, representing the cosmic principles of creation and dissolution.

The temple's prakara (circumambulatory path) allows devotees to perform pradakshina, moving clockwise around the sanctum as a mark of reverence. The intricately carved pillars, depicting scenes from Hindu mythology and the life of Adi Shankaracharya, serve as visual scriptures for devotees. The temple's roof architecture, with its characteristic Kerala-style sloping design, ensures rainwater drainage while maintaining the aesthetic grace typical of South Indian temple architecture.

**Legacy and Global Impact**

Today, the Sri Sharadamba Temple stands not just as a regional shrine but as a global symbol of India's spiritual heritage. Devotees and scholars from across continents visit Sringeri to seek the Goddess's blessings and to experience the living tradition of Vedic culture. The temple administration, under the guidance of the current Jagadguru, continues to support educational institutions, Sanskrit colleges, and charitable activities, extending the temple's influence far beyond its physical boundaries.

The conversion of the original sandalwood idol to the current golden form symbolizes the temple's journey from ancient times to the modern era - maintaining its spiritual essence while adapting to serve contemporary devotees. The temple remains a powerful reminder that true knowledge, represented by Goddess Sharadamba, transcends time and continues to illuminate the path for seeking souls across generations.`,
    customFields: {
      'Architectural Style': 'Dravidian with Kerala influences',
      'Temple Age': 'Over 1200 years',
      'Main Festival': 'Sharada Navaratri (September-October)',
      'Presiding Deity Form': 'Seated on Sri Chakra Peetha',
      'Special Poojas': 'Chandramoulishwara Pooja, Sahasranama Archana',
      'Pilgrimage Significance': 'One of 18 Maha Shakti Peethas',
      'Best Time to Visit': 'September to March',
      'Nearest Airport': 'Mangalore (100 km)',
      'Nearest Railway': 'Kadur Junction (85 km)',
    }
  },
];

export const dummyChildTemples: ChildTemple[] = [
  {
    id: 'child-1',
    name: 'Sri Vidyashankara Temple',
    parentTempleId: 'temple-1',
    description: 'Historic temple with unique architectural features, built in memory of Sri Vidyashankara',
    status: 'active',
    image: childTempleVidyashankaraImg,
    createdAt: '2020-01-15',
    operationalSettings: { independent: false, followParent: true },
    distanceFromMain: 0.5,
  },
  {
    id: 'child-2',
    name: 'Sri Torana Ganapati Temple',
    parentTempleId: 'temple-1',
    description: 'Temple dedicated to Lord Ganapati at the entrance',
    status: 'active',
    image: childTempleGanapatiImg,
    createdAt: '2020-01-15',
  },
  {
    id: 'child-3',
    name: 'Sri Malahanikareshwara Temple',
    parentTempleId: 'temple-1',
    description: 'Ancient Shiva temple on the banks of Tunga river',
    status: 'active',
    image: childTempleMalahanikareshwaraImg,
    createdAt: '2020-02-01',
  },
];

export const dummySacreds: Sacred[] = [
  {
    id: 'sacred-1',
    name: 'Sri Sharadamba',
    sacredType: 'deity',
    associatedTempleId: 'temple-1',
    associatedTempleType: 'temple',
    description: 'The presiding deity - Goddess of Learning and Wisdom',
    status: 'active',
    image: deitySharadambaImg,
    createdAt: '2020-01-01',
    installationDate: '2020-01-01',
    festivals: [
      { name: 'Navaratri', date: '2024-10-03', description: 'Nine-day festival' },
      { name: 'Sharadamba Jayanti', date: '2024-05-15', description: 'Birth anniversary' },
    ],
    abhishekamSchedule: [
      { day: 'Monday', time: '06:00', type: 'Milk Abhishekam' },
      { day: 'Friday', time: '18:00', type: 'Panchamrita Abhishekam' },
    ],
    darshanPriority: 'vip',
  },
  {
    id: 'sacred-2',
    name: 'Jagadguru Samadhi – Sri Abhinava Vidyatheertha',
    sacredType: 'samadhi',
    associatedTempleId: 'temple-1',
    associatedTempleType: 'temple',
    description: 'Samadhi of Jagadguru Sri Abhinava Vidyatheertha Mahaswamiji',
    status: 'active',
    jagadguruName: 'Sri Abhinava Vidyatheertha',
    peetha: 'Sringeri Sharada Peetham',
    samadhiYear: 1989,
    image: sacredSamadhiShrineImg,
    createdAt: '2020-01-01',
  },
  {
    id: 'sacred-3',
    name: 'Jagadguru Samadhi – Sri Bharati Tirtha',
    sacredType: 'samadhi',
    associatedTempleId: 'temple-1',
    associatedTempleType: 'temple',
    description: 'Samadhi of Jagadguru Sri Bharati Tirtha Mahaswamiji',
    status: 'active',
    jagadguruName: 'Sri Bharati Tirtha',
    peetha: 'Sringeri Sharada Peetham',
    samadhiYear: 2024,
    image: sacredSamadhiShrineImg,
    createdAt: '2020-01-01',
  },
];

export const dummyZones: Zone[] = [
  {
    id: 'zone-1',
    name: 'Main Pradakshina Path',
    zoneType: 'pradakshina',
    associatedTempleId: 'temple-1',
    associatedTempleType: 'temple',
    description: 'The main circumambulation path around the temple',
    status: 'active',
    image: zonePradakshinaImg,
    createdAt: '2020-01-05',
    capacity: 500,
    queueLengthLimit: 200,
    pradakshinaSequence: 1,
    accessRestrictions: ['general', 'vip'],
    peakHourCapacity: [
      { timeRange: '09:00-12:00', capacity: 800 },
      { timeRange: '18:00-20:00', capacity: 600 },
    ],
    maintenanceSchedule: [
      { day: 'Monday', time: '05:00', type: 'Cleaning', duration: 60 },
    ],
  },
  {
    id: 'zone-2',
    name: 'Mukha Mantapa',
    zoneType: 'mantapa',
    associatedTempleId: 'temple-1',
    associatedTempleType: 'temple',
    description: 'The front hall for devotee gathering',
    status: 'active',
    image: templeInternalHallImg,
    createdAt: '2020-01-05',
    capacity: 300,
    queueLengthLimit: 150,
    accessRestrictions: ['general'],
  },
  {
    id: 'zone-3',
    name: 'Darshan Queue Area',
    zoneType: 'queue',
    associatedTempleId: 'temple-1',
    associatedTempleType: 'temple',
    description: 'Queue area for regular darshan',
    status: 'active',
    image: zoneQueueComplexImg,
    createdAt: '2020-01-05',
    capacity: 200,
    queueLengthLimit: 100,
    accessRestrictions: ['general'],
  },
  {
    id: 'zone-4',
    name: 'Administrative Block',
    zoneType: 'staff_only',
    associatedTempleId: 'temple-1',
    associatedTempleType: 'temple',
    description: 'Staff and administrative offices',
    status: 'active',
    image: zoneAdminBlockImg,
    createdAt: '2020-01-10',
  },
  {
    id: 'zone-5',
    name: 'Vidyashankara Pradakshina',
    zoneType: 'pradakshina',
    associatedTempleId: 'child-1',
    associatedTempleType: 'child_temple',
    description: 'Circumambulation path around Vidyashankara Temple',
    status: 'active',
    image: zonePradakshinaImg,
    createdAt: '2020-01-20',
  },
];

export const dummyHallRooms: HallRoom[] = [
  {
    id: 'hall-1',
    name: 'Bhojana Shala',
    type: 'hall',
    zoneId: 'zone-2',
    capacity: 500,
    description: 'Dining hall for prasad distribution',
    status: 'active',
    image: hallBhojanaShalaImg,
    createdAt: '2020-02-01',
    roomType: 'other',
    isBookable: false,
    hasAC: false,
    maintenanceStatus: 'available',
  },
  {
    id: 'hall-2',
    name: 'Seva Counter Hall',
    type: 'hall',
    zoneId: 'zone-3',
    capacity: 100,
    description: 'Hall housing seva booking counters',
    status: 'active',
    image: templeInternalHallImg,
    createdAt: '2020-02-01',
    roomType: 'other',
    isBookable: false,
    hasAC: true,
    maintenanceStatus: 'available',
  },
  {
    id: 'room-1',
    name: 'Puja Room A',
    type: 'room',
    zoneId: 'zone-2',
    capacity: 20,
    description: 'Private puja room for special sevas',
    status: 'active',
    image: roomPujaPrivateImg,
    createdAt: '2020-02-05',
    roomType: 'prayer_room',
    isBookable: true,
    bookingRates: { hourly: 500, daily: 5000, special: 10000 },
    hasAC: true,
    maintenanceStatus: 'available',
  },
  {
    id: 'room-2',
    name: 'Manager Office',
    type: 'room',
    zoneId: 'zone-4',
    capacity: 10,
    description: 'Temple manager office',
    status: 'active',
    image: roomOfficeInteriorImg,
    createdAt: '2020-02-10',
  },
  {
    id: 'room-3',
    name: 'Store Room',
    type: 'room',
    zoneId: 'zone-4',
    capacity: 5,
    description: 'Storage for puja materials',
    status: 'active',
    image: roomStoreTempleImg,
    createdAt: '2020-02-10',
  },
];

export const dummyCounters: Counter[] = [
  {
    id: 'counter-1',
    name: 'Seva Counter 1',
    counterType: 'seva',
    hallRoomId: 'hall-2',
    description: 'Main seva booking counter',
    status: 'active',
    image: sevaCounterImg,
    createdAt: '2020-03-01',
    servicePricing: { baseRate: 100, specialRate: 200, currency: 'INR' },
    queueLengthLimit: 50,
    paymentMethods: ['cash', 'card', 'upi'],
    analyticsEnabled: true,
    performanceMetrics: { transactions: 1250, revenue: 125000, avgWaitTime: 5 },
    shiftTimings: [
      { day: 'Monday', openTime: '06:00', closeTime: '20:00' },
      { day: 'Tuesday', openTime: '06:00', closeTime: '20:00' },
      { day: 'Wednesday', openTime: '06:00', closeTime: '20:00' },
      { day: 'Thursday', openTime: '06:00', closeTime: '20:00' },
      { day: 'Friday', openTime: '06:00', closeTime: '20:00' },
      { day: 'Saturday', openTime: '06:00', closeTime: '20:00' },
      { day: 'Sunday', openTime: '06:00', closeTime: '20:00' },
    ],
  },
  {
    id: 'counter-2',
    name: 'Seva Counter 2',
    counterType: 'seva',
    hallRoomId: 'hall-2',
    description: 'Secondary seva booking counter',
    status: 'active',
    image: sevaCounterImg,
    createdAt: '2020-03-01',
    servicePricing: { baseRate: 100, currency: 'INR' },
    queueLengthLimit: 50,
    paymentMethods: ['cash', 'card', 'upi'],
    shiftTimings: [
      { day: 'Monday', openTime: '06:00', closeTime: '20:00' },
      { day: 'Tuesday', openTime: '06:00', closeTime: '20:00' },
      { day: 'Wednesday', openTime: '06:00', closeTime: '20:00' },
      { day: 'Thursday', openTime: '06:00', closeTime: '20:00' },
      { day: 'Friday', openTime: '06:00', closeTime: '20:00' },
      { day: 'Saturday', openTime: '06:00', closeTime: '20:00' },
      { day: 'Sunday', openTime: '06:00', closeTime: '20:00' },
    ],
  },
  {
    id: 'counter-3',
    name: 'Donation Counter',
    counterType: 'donation',
    hallRoomId: 'hall-2',
    description: 'Counter for accepting donations',
    status: 'active',
    image: sevaCounterImg,
    createdAt: '2020-03-05',
    servicePricing: { baseRate: 0, currency: 'INR' },
    queueLengthLimit: 30,
    paymentMethods: ['cash', 'card', 'digital', 'upi'],
    shiftTimings: [
      { day: 'Monday', openTime: '06:00', closeTime: '20:00' },
      { day: 'Tuesday', openTime: '06:00', closeTime: '20:00' },
      { day: 'Wednesday', openTime: '06:00', closeTime: '20:00' },
      { day: 'Thursday', openTime: '06:00', closeTime: '20:00' },
      { day: 'Friday', openTime: '06:00', closeTime: '20:00' },
      { day: 'Saturday', openTime: '06:00', closeTime: '20:00' },
      { day: 'Sunday', openTime: '06:00', closeTime: '20:00' },
    ],
  },
  {
    id: 'counter-4',
    name: 'Information Desk',
    counterType: 'info',
    hallRoomId: 'hall-2',
    description: 'General information and assistance',
    status: 'active',
    image: sevaCounterImg,
    createdAt: '2020-03-05',
    servicePricing: { baseRate: 0, currency: 'INR' },
    queueLengthLimit: 20,
    paymentMethods: [],
    shiftTimings: [
      { day: 'Monday', openTime: '06:00', closeTime: '20:00' },
      { day: 'Tuesday', openTime: '06:00', closeTime: '20:00' },
      { day: 'Wednesday', openTime: '06:00', closeTime: '20:00' },
      { day: 'Thursday', openTime: '06:00', closeTime: '20:00' },
      { day: 'Friday', openTime: '06:00', closeTime: '20:00' },
      { day: 'Saturday', openTime: '06:00', closeTime: '20:00' },
      { day: 'Sunday', openTime: '06:00', closeTime: '20:00' },
    ],
  },
  {
    id: 'counter-5',
    name: 'Prasad Distribution',
    counterType: 'prasad',
    hallRoomId: 'hall-1',
    description: 'Prasad distribution counter',
    status: 'active',
    image: sevaCounterImg,
    createdAt: '2020-03-10',
    servicePricing: { baseRate: 50, currency: 'INR' },
    queueLengthLimit: 100,
    paymentMethods: ['cash', 'upi'],
    shiftTimings: [
      { day: 'Monday', openTime: '11:00', closeTime: '14:00' },
      { day: 'Tuesday', openTime: '11:00', closeTime: '14:00' },
      { day: 'Wednesday', openTime: '11:00', closeTime: '14:00' },
      { day: 'Thursday', openTime: '11:00', closeTime: '14:00' },
      { day: 'Friday', openTime: '11:00', closeTime: '14:00' },
      { day: 'Saturday', openTime: '11:00', closeTime: '14:00' },
      { day: 'Sunday', openTime: '11:00', closeTime: '14:00' },
    ],
  },
];
