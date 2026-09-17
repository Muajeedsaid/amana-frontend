'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import {
  getMyBookings,
  updateBookingStatus,
  MyBooking,
} from '@/lib/api/bookings';

import { createReview } from '@/lib/api/reviews';

import {
  getMyArtisanProfile,
  updateMyArtisanProfile,
  uploadPhoto,
  ArtisanProfileDetail,
} from '@/lib/api/profiles';

/* =========================================================
   ICONS
========================================================= */

function Icon({
  name,
  size = 20,
}: {
  name:
    | 'home'
    | 'briefcase'
    | 'message'
    | 'user'
    | 'image'
    | 'star'
    | 'settings'
    | 'logout'
    | 'chevron'
    | 'menu'
    | 'close'
    | 'plus'
    | 'check'
    | 'clock'
    | 'location'
    | 'external'
    | 'edit'
    | 'trash'
    | 'upload'
    | 'eye'
    | 'bell'
    | 'shield'
    | 'help'
    | 'save'
    | 'arrow'
    | 'camera'
    | 'store'
    | 'phone';
  size?: number;
}) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  switch (name) {
    case 'home':
      return (
        <svg {...common}>
          <path d="M3 10.5 12 3l9 7.5" />
          <path d="M5.5 9.5V21h13V9.5" />
          <path d="M9.5 21v-6h5v6" />
        </svg>
      );

    case 'briefcase':
      return (
        <svg {...common}>
          <rect x="3" y="7" width="18" height="13" rx="2" />
          <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          <path d="M3 12h18" />
        </svg>
      );

    case 'message':
      return (
        <svg {...common}>
          <path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5H7l-4 2v-5.5A7.5 7.5 0 1 1 20 11.5Z" />
        </svg>
      );

    case 'user':
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21a8 8 0 0 1 16 0" />
        </svg>
      );

    case 'image':
      return (
        <svg {...common}>
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <circle cx="8.5" cy="9" r="1.5" />
          <path d="m21 15-4.5-4.5L8 19" />
        </svg>
      );

    case 'camera':
      return (
        <svg {...common}>
          <path d="M4 8h3l1.5-2.5h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z" />
          <circle cx="12" cy="13" r="3.5" />
        </svg>
      );

    case 'store':
      return (
        <svg {...common}>
          <path d="M4 9h16v10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9Z" />
          <path d="M3.5 9 5 4h14l1.5 5" />
          <path d="M9 20v-5h6v5" />
        </svg>
      );

    case 'phone':
      return (
        <svg {...common}>
          <path d="M6.5 3h3l1.5 4-2 1.5a12 12 0 0 0 6.5 6.5L17 13l4 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4 7.2 2 2 0 0 1 6 5V3Z" />
        </svg>
      );

    case 'star':
      return (
        <svg {...common}>
          <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z" />
        </svg>
      );

    case 'settings':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.8 1.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V20h-2.6v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1-1.8-1.8.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H6v-2.6h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1L9 6.6l.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.5V5h2.6v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.8 1.8-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.5 1h.1v2.6h-.1a1.7 1.7 0 0 0-1.1 1.4Z" />
        </svg>
      );

    case 'logout':
      return (
        <svg {...common}>
          <path d="M10 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h5" />
          <path d="M14 8l4 4-4 4" />
          <path d="M18 12H9" />
        </svg>
      );

    case 'chevron':
      return (
        <svg {...common}>
          <path d="m9 18 6-6-6-6" />
        </svg>
      );

    case 'menu':
      return (
        <svg {...common}>
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      );

    case 'close':
      return (
        <svg {...common}>
          <path d="m6 6 12 12M18 6 6 18" />
        </svg>
      );

    case 'plus':
      return (
        <svg {...common}>
          <path d="M12 5v14M5 12h14" />
        </svg>
      );

    case 'check':
      return (
        <svg {...common}>
          <path d="m5 12 4 4L19 6" />
        </svg>
      );

    case 'clock':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      );

    case 'location':
      return (
        <svg {...common}>
          <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
          <circle cx="12" cy="10" r="2.5" />
        </svg>
      );

    case 'external':
      return (
        <svg {...common}>
          <path d="M14 4h6v6" />
          <path d="M20 4 10 14" />
          <path d="M18 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5" />
        </svg>
      );

    case 'edit':
      return (
        <svg {...common}>
          <path d="m4 20 4.5-1 10-10a2.1 2.1 0 0 0-3-3l-10 10L4 20Z" />
          <path d="m14.5 7.5 2 2" />
        </svg>
      );

    case 'trash':
      return (
        <svg {...common}>
          <path d="M4 7h16" />
          <path d="M10 11v5M14 11v5" />
          <path d="M6 7l1 14h10l1-14" />
          <path d="M9 7V4h6v3" />
        </svg>
      );

    case 'upload':
      return (
        <svg {...common}>
          <path d="M12 16V4" />
          <path d="m7 9 5-5 5 5" />
          <path d="M5 20h14" />
        </svg>
      );

    case 'eye':
      return (
        <svg {...common}>
          <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
          <circle cx="12" cy="12" r="2.5" />
        </svg>
      );

    case 'bell':
      return (
        <svg {...common}>
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
          <path d="M10 21h4" />
        </svg>
      );

    case 'shield':
      return (
        <svg {...common}>
          <path d="M12 3 20 6v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3Z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      );

    case 'help':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M9.5 9a2.5 2.5 0 1 1 4.2 1.8c-1 .8-1.7 1.2-1.7 2.7" />
          <path d="M12 17h.01" />
        </svg>
      );

    case 'save':
      return (
        <svg {...common}>
          <path d="M5 3h11l3 3v15H5z" />
          <path d="M8 3v6h8V3" />
          <path d="M8 21v-7h8v7" />
        </svg>
      );

    case 'arrow':
      return (
        <svg {...common}>
          <path d="M5 12h14" />
          <path d="m13 6 6 6-6 6" />
        </svg>
      );

    default:
      return null;
  }
}

/* =========================================================
   TYPES
========================================================= */

type Section =
  | 'overview'
  | 'jobs'
  | 'messages'
  | 'profile'
  | 'portfolio'
  | 'reviews'
  | 'settings';

type OfferType = 'services' | 'products' | 'both';

type CustomOffering = {
  name: string;
  category: string;
  description: string;
  status: 'pending' | 'approved';
};

type SettingsState = {
  emailNotifications: boolean;
  bookingNotifications: boolean;
  messageNotifications: boolean;
  profileVisible: boolean;
};

/** A photo that is still being prepared or uploaded. */
type PendingPhoto = {
  key: string;
  previewUrl: string;
  status: 'preparing' | 'uploading' | 'error';
  error?: string;
};

/* =========================================================
   CATALOGUES
========================================================= */

const SERVICE_CATALOG: {
  id: string;
  label: string;
  group: string;
}[] = [
  { id: 'plumber', label: 'Plumbing', group: 'Home & building' },
  { id: 'electrician', label: 'Electrical', group: 'Home & building' },
  { id: 'solar', label: 'Solar & inverters', group: 'Home & building' },
  { id: 'carpenter', label: 'Carpentry', group: 'Home & building' },
  { id: 'mason', label: 'Masonry', group: 'Home & building' },
  { id: 'painter', label: 'Painting', group: 'Home & building' },
  { id: 'welder', label: 'Welding', group: 'Home & building' },
  { id: 'ac-technician', label: 'AC & refrigeration', group: 'Home & building' },
  { id: 'cleaner', label: 'Cleaning', group: 'Home & building' },
  { id: 'phone-repair', label: 'Phone repair', group: 'Technology' },
  { id: 'computer-repair', label: 'Computer repair', group: 'Technology' },
  { id: 'cctv', label: 'CCTV & security', group: 'Technology' },
  { id: 'generator-repair', label: 'Generator repair', group: 'Technology' },
  { id: 'tailor', label: 'Tailoring', group: 'Personal' },
  { id: 'barber', label: 'Barbing & grooming', group: 'Personal' },
  { id: 'mechanic', label: 'Auto repair', group: 'Vehicles' },
  { id: 'panel-beater', label: 'Panel beating', group: 'Vehicles' },
];

const PRODUCT_CATALOG: {
  id: string;
  label: string;
  group: string;
}[] = [
  { id: 'phones', label: 'Phones', group: 'Technology' },
  { id: 'phone-accessories', label: 'Phone accessories', group: 'Technology' },
  { id: 'computers', label: 'Computers & laptops', group: 'Technology' },
  { id: 'computer-accessories', label: 'Computer accessories', group: 'Technology' },
  { id: 'electronics', label: 'Electronics', group: 'Technology' },
  { id: 'shoes', label: 'Shoes', group: 'Fashion' },
  { id: 'clothing', label: 'Clothing & fabric', group: 'Fashion' },
  { id: 'bags', label: 'Bags', group: 'Fashion' },
  { id: 'furniture', label: 'Furniture', group: 'Home' },
  { id: 'building-materials', label: 'Building materials', group: 'Home' },
  { id: 'solar-equipment', label: 'Solar equipment', group: 'Home' },
  { id: 'spare-parts', label: 'Vehicle spare parts', group: 'Vehicles' },
];

const ALL_GROUPS = Array.from(
  new Set([
    ...SERVICE_CATALOG.map((c) => c.group),
    ...PRODUCT_CATALOG.map((c) => c.group),
  ])
);

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const MAX_PHOTOS = 12;
const MAX_FILE_MB = 12;

function labelFor(id: string) {
  return (
    SERVICE_CATALOG.find((c) => c.id === id)?.label ||
    PRODUCT_CATALOG.find((c) => c.id === id)?.label ||
    id
  );
}

/* =========================================================
   IMAGE PREPARATION

   A phone camera produces 4-8MB files. On a 3G connection that is
   the difference between an upload that finishes and one the artisan
   abandons. We downscale to 1600px and re-encode as JPEG, which
   usually lands around 250-400KB.

   If the browser cannot decode the file (iPhone HEIC), we send the
   original untouched and let the server convert it.
========================================================= */

async function prepareImage(
  file: File,
  maxEdge = 1600,
  quality = 0.82
): Promise<File> {
  if (typeof createImageBitmap !== 'function') return file;

  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) return file;

  const scale = Math.min(
    1,
    maxEdge / Math.max(bitmap.width, bitmap.height)
  );

  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d');
  if (!context) return file;

  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close?.();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/jpeg', quality)
  );

  if (!blob) return file;

  const base = file.name.replace(/\.[^.]+$/, '') || 'photo';

  return new File([blob], `${base}.jpg`, {
    type: 'image/jpeg',
    lastModified: Date.now(),
  });
}

function validateImage(file: File): string | null {
  const looksLikeImage =
    file.type.startsWith('image/') ||
    /\.(heic|heif)$/i.test(file.name);

  if (!looksLikeImage) {
    return `${file.name} is not a photo.`;
  }

  if (file.size > MAX_FILE_MB * 1024 * 1024) {
    return `${file.name} is larger than ${MAX_FILE_MB}MB.`;
  }

  return null;
}

/* =========================================================
   COMPONENT
========================================================= */

export default function DashboardPage() {
  const router = useRouter();

  const portfolioInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [user, setUser] = useState<{
    userId: string;
    role: string;
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<Section>('overview');

  const [bookings, setBookings] = useState<MyBooking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [actionError, setActionError] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [myProfile, setMyProfile] =
    useState<ArtisanProfileDetail | null>(null);

  const [profileLoading, setProfileLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [dirty, setDirty] = useState(false);

  /* ---- identity ---- */
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState('');

  const [fullName, setFullName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [city, setCity] = useState('Kano');
  const [area, setArea] = useState('');

  /* ---- what they offer ---- */
  const [offerType, setOfferType] = useState<OfferType>('services');
  const [serviceIds, setServiceIds] = useState<string[]>([]);
  const [productIds, setProductIds] = useState<string[]>([]);
  const [customOfferings, setCustomOfferings] = useState<CustomOffering[]>([]);

  /* ---- about ---- */
  const [bio, setBio] = useState('');
  const [yearsExperience, setYearsExperience] = useState(0);

  /* ---- hours ---- */
  const [workingDays, setWorkingDays] = useState<string[]>([
    'Mon',
    'Tue',
    'Wed',
    'Thu',
    'Fri',
    'Sat',
  ]);
  const [openFrom, setOpenFrom] = useState('08:00');
  const [openTo, setOpenTo] = useState('18:00');

  /* ---- socials ---- */
  const [facebook, setFacebook] = useState('');
  const [instagram, setInstagram] = useState('');
  const [tiktok, setTiktok] = useState('');

  /* ---- portfolio ---- */
  const [photos, setPhotos] = useState<string[]>([]);
  const [pending, setPending] = useState<PendingPhoto[]>([]);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');

  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState('');

  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewedIds, setReviewedIds] = useState<string[]>([]);

  const [settings, setSettings] = useState<SettingsState>({
    emailNotifications: true,
    bookingNotifications: true,
    messageNotifications: true,
    profileVisible: true,
  });

  const markDirty = () => setDirty(true);

  /* =========================================================
     AUTH
  ========================================================= */

  useEffect(() => {
    const token = localStorage.getItem('amana_token');

    if (!token) {
      router.push('/login');
      return;
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Session expired');
        return res.json();
      })
      .then((data) => {
        if (data.role === 'admin') {
          router.push('/admin');
          return;
        }
        if (data.role !== 'artisan') {
          router.push('/');
          return;
        }

        setUser(data);

        // Seed from the auth payload so the fields are never blank
        // on first visit.
        setFullName((current) => current || data.name || '');
        setPhone((current) => current || data.phone || '');

        setLoading(false);
      })
      .catch(() => {
        localStorage.removeItem('amana_token');
        router.push('/login');
      });
  }, [router]);

  /* =========================================================
     LOAD BOOKINGS
  ========================================================= */

  useEffect(() => {
    if (!user) return;

    const role = user.role === 'artisan' ? 'artisan' : 'customer';

    setBookingsLoading(true);

    getMyBookings(role)
      .then((data) => setBookings(data))
      .catch(() => setBookings([]))
      .finally(() => setBookingsLoading(false));
  }, [user]);

  /* =========================================================
     LOAD ARTISAN PROFILE
  ========================================================= */

  useEffect(() => {
    if (!user || user.role !== 'artisan') {
      setProfileLoading(false);
      return;
    }

    getMyArtisanProfile()
      .then((profile) => {
        const p = profile as ArtisanProfileDetail & Record<string, any>;

        setMyProfile(profile);

        setAvatarUrl(p.avatarUrl || '');
        setFullName(p.fullName || p.user?.name || '');
        setBusinessName(p.businessName || '');
        setPhone(p.phone || p.user?.phone || '');
        setWhatsapp(p.whatsapp || '');
        setCity(p.city || 'Kano');
        setArea(p.area || '');

        setOfferType((p.offerType as OfferType) || 'services');
        setServiceIds(p.serviceIds || []);
        setProductIds(p.productIds || []);
        setCustomOfferings(p.customOfferings || []);

        setBio(p.bio || '');
        setYearsExperience(p.yearsExperience || 0);

        setWorkingDays(
          p.workingDays?.length
            ? p.workingDays
            : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
        );
        setOpenFrom(p.openFrom || '08:00');
        setOpenTo(p.openTo || '18:00');

        setFacebook(p.socialMedia?.facebook || '');
        setInstagram(p.socialMedia?.instagram || '');
        setTiktok(p.socialMedia?.tiktok || '');

        setPhotos(p.portfolioPhotos || []);

        // Older accounts only have the free-text `skills` array.
        // Map anything that matches the catalogue so they don't
        // start from an empty selection.
        if (!p.serviceIds?.length && p.skills?.length) {
          const matched = SERVICE_CATALOG.filter((entry) =>
            p.skills.some(
              (skill: string) =>
                skill.trim().toLowerCase() === entry.label.toLowerCase()
            )
          ).map((entry) => entry.id);

          if (matched.length) setServiceIds(matched);
        }

        setDirty(false);
      })
      .catch(() => {})
      .finally(() => setProfileLoading(false));
  }, [user]);

  /* =========================================================
     WARN BEFORE LOSING WORK ON A FLAKY CONNECTION
  ========================================================= */

  useEffect(() => {
    if (!dirty) return;

    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty]);

  /* =========================================================
     DERIVED DATA
  ========================================================= */

  const isArtisan = user?.role === 'artisan';

  const showsServices = offerType !== 'products';
  const showsProducts = offerType !== 'services';

  const statusCounts = useMemo(() => {
    return bookings.reduce<Record<string, number>>((acc, booking) => {
      acc[booking.status] = (acc[booking.status] || 0) + 1;
      return acc;
    }, {});
  }, [bookings]);

  const checklist = useMemo(
    () => [
      { label: 'Profile photo', complete: Boolean(avatarUrl) },
      { label: 'Your name', complete: fullName.trim().length > 1 },
      { label: 'Phone number', complete: phone.trim().length >= 10 },
      {
        label:
          offerType === 'products'
            ? 'What you sell'
            : 'Services you provide',
        complete:
          serviceIds.length + productIds.length + customOfferings.length > 0,
      },
      { label: 'About your work', complete: bio.trim().length >= 30 },
      { label: 'Photos of your work', complete: photos.length > 0 },
    ],
    [
      avatarUrl,
      fullName,
      phone,
      offerType,
      serviceIds,
      productIds,
      customOfferings,
      bio,
      photos,
    ]
  );

  const profileCompletion = useMemo(() => {
    const done = checklist.filter((item) => item.complete).length;
    return Math.round((done / checklist.length) * 100);
  }, [checklist]);

  const newRequests = statusCounts.requested || 0;

  const activeJobs =
    (statusCounts.accepted || 0) + (statusCounts.in_progress || 0);

  const completedJobs = statusCounts.completed || 0;

  const displayName = businessName || fullName || 'Your profile';

  const initials =
    (fullName || businessName || 'A')
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || 'A';

  /* =========================================================
     NAVIGATION
  ========================================================= */

  function navigateTo(section: Section) {
    setActiveSection(section);
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleLogout() {
    localStorage.removeItem('amana_token');
    router.push('/login');
  }

  /* =========================================================
     AVAILABILITY
  ========================================================= */

  async function handleAvailabilityToggle() {
    if (!myProfile) return;

    const newValue = !myProfile.isAvailable;

    setAvailabilityLoading(true);
    setAvailabilityError('');

    try {
      const updated = await updateMyArtisanProfile({
        isAvailable: newValue,
      });

      setMyProfile(updated);
    } catch (err: any) {
      setAvailabilityError(err.message || 'Failed to update availability');
    } finally {
      setAvailabilityLoading(false);
    }
  }

  /* =========================================================
     BOOKING STATUS
  ========================================================= */

  async function handleStatusChange(bookingId: string, newStatus: string) {
    setActionError('');
    setUpdatingId(bookingId);

    try {
      await updateBookingStatus(bookingId, newStatus);

      setBookings((previous) =>
        previous.map((booking) =>
          booking._id === bookingId
            ? { ...booking, status: newStatus }
            : booking
        )
      );
    } catch (err: any) {
      setActionError(err.message || 'Failed to update booking');
    } finally {
      setUpdatingId(null);
    }
  }

  /* =========================================================
     PROFILE SAVE
  ========================================================= */

  async function handleProfileSave(event: React.FormEvent) {
    event.preventDefault();

    setProfileSaving(true);
    setProfileSaved(false);
    setProfileError('');

    // Keep the legacy `skills` array in sync so the existing public
    // profile and search keep working while the backend catches up.
    const skills = [
      ...serviceIds.map(labelFor),
      ...productIds.map(labelFor),
      ...customOfferings.map((offering) => offering.name),
    ];

    try {
      const updated = await updateMyArtisanProfile({
        avatarUrl,
        fullName,
        businessName,
        phone,
        whatsapp: whatsapp || phone,
        city,
        area,
        offerType,
        serviceIds,
        productIds,
        customOfferings,
        bio,
        yearsExperience,
        skills,
        workingDays,
        openFrom,
        openTo,
        socialMedia: { facebook, instagram, tiktok },
        portfolioPhotos: photos,
      } as Partial<ArtisanProfileDetail>);

      setMyProfile(updated);
      setDirty(false);
      setProfileSaved(true);

      setTimeout(() => setProfileSaved(false), 3000);
    } catch (err: any) {
      setProfileError(err.message || 'Failed to save your profile.');
    } finally {
      setProfileSaving(false);
    }
  }

  /* =========================================================
     AVATAR UPLOAD
  ========================================================= */

  async function handleAvatarSelected(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) return;

    const problem = validateImage(file);
    if (problem) {
      setAvatarError(problem);
      return;
    }

    setAvatarError('');
    setAvatarUploading(true);

    const preview = URL.createObjectURL(file);
    setAvatarUrl(preview);

    try {
      const prepared = await prepareImage(file, 800, 0.85);
      const url = await uploadPhoto(prepared);

      setAvatarUrl(url);
      markDirty();
    } catch (err: any) {
      setAvatarUrl('');
      setAvatarError(err.message || 'Could not upload that photo.');
    } finally {
      URL.revokeObjectURL(preview);
      setAvatarUploading(false);
    }
  }

  /* =========================================================
     PORTFOLIO UPLOAD

     Handles several files at once. Each file gets its own preview
     card so the artisan can see immediately that something happened.
  ========================================================= */

  async function handlePhotosSelected(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = ''; // lets the same file be picked again

    if (!files.length) return;

    setUploadError('');
    setUploadSuccess('');

    const room = MAX_PHOTOS - photos.length - pending.length;

    if (room <= 0) {
      setUploadError(`You already have ${MAX_PHOTOS} photos. Remove one first.`);
      return;
    }

    const accepted = files.slice(0, room);

    if (files.length > room) {
      setUploadError(
        `Only ${room} more photo${room === 1 ? '' : 's'} can be added.`
      );
    }

    const staged: PendingPhoto[] = accepted.map((file) => ({
      key: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      previewUrl: URL.createObjectURL(file),
      status: 'preparing',
    }));

    setPending((previous) => [...previous, ...staged]);

    let uploaded = 0;

    await Promise.all(
      accepted.map(async (file, index) => {
        const key = staged[index].key;

        const patch = (changes: Partial<PendingPhoto>) =>
          setPending((previous) =>
            previous.map((item) =>
              item.key === key ? { ...item, ...changes } : item
            )
          );

        const problem = validateImage(file);

        if (problem) {
          patch({ status: 'error', error: problem });
          return;
        }

        try {
          const prepared = await prepareImage(file);
          patch({ status: 'uploading' });

          const url = await uploadPhoto(prepared);

          setPhotos((previous) => [...previous, url]);
          setPending((previous) => previous.filter((item) => item.key !== key));
          URL.revokeObjectURL(staged[index].previewUrl);

          uploaded += 1;
          markDirty();
        } catch (err: any) {
          patch({
            status: 'error',
            error: err.message || 'Upload failed. Check your connection.',
          });
        }
      })
    );

    if (uploaded > 0) {
      setUploadSuccess(
        `${uploaded} photo${uploaded === 1 ? '' : 's'} added. Save your profile to publish.`
      );
      setTimeout(() => setUploadSuccess(''), 5000);
    }
  }

  function removePhoto(index: number) {
    setPhotos((previous) => previous.filter((_, i) => i !== index));
    markDirty();
  }

  function dismissPending(key: string) {
    setPending((previous) => previous.filter((item) => item.key !== key));
  }

  /* =========================================================
     OFFERINGS
  ========================================================= */

  function toggleService(id: string) {
    setServiceIds((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id]
    );
    markDirty();
  }

  function toggleProduct(id: string) {
    setProductIds((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id]
    );
    markDirty();
  }

  function addCustomOffering(offering: CustomOffering) {
    setCustomOfferings((previous) => [...previous, offering]);
    markDirty();
  }

  function removeCustomOffering(index: number) {
    setCustomOfferings((previous) => previous.filter((_, i) => i !== index));
    markDirty();
  }

  function toggleWorkingDay(day: string) {
    setWorkingDays((previous) =>
      previous.includes(day)
        ? previous.filter((item) => item !== day)
        : [...previous, day]
    );
    markDirty();
  }

  /* =========================================================
     REVIEWS
  ========================================================= */

  function openReviewForm(bookingId: string) {
    setReviewingId(bookingId);
    setReviewRating(5);
    setReviewComment('');
    setReviewError('');
  }

  async function handleReviewSubmit(
    event: React.FormEvent,
    bookingId: string
  ) {
    event.preventDefault();

    setReviewSubmitting(true);
    setReviewError('');

    try {
      await createReview({
        bookingId,
        rating: reviewRating,
        comment: reviewComment || undefined,
      });

      setReviewedIds((previous) => [...previous, bookingId]);
      setReviewingId(null);
    } catch (err: any) {
      setReviewError(err.message || 'Failed to submit review');
    } finally {
      setReviewSubmitting(false);
    }
  }

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F8F3E8] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 rounded-full border-2 border-[#0F4C45]/20 border-t-[#C85A3F] animate-spin" />

          <p className="text-sm text-[#0F4C45]/70">
            Loading your dashboard...
          </p>
        </div>
      </main>
    );
  }

  /* =========================================================
     NAV ITEMS
  ========================================================= */

  const navigation: {
    id: Section;
    label: string;
    icon: Parameters<typeof Icon>[0]['name'];
    badge?: number;
  }[] = [
    { id: 'overview', label: 'Dashboard', icon: 'home' },
    {
      id: 'jobs',
      label: 'Jobs',
      icon: 'briefcase',
      badge: newRequests || undefined,
    },
    { id: 'messages', label: 'Messages', icon: 'message' },
    { id: 'profile', label: 'My Profile', icon: 'user' },
    { id: 'portfolio', label: 'Portfolio', icon: 'image' },
    { id: 'reviews', label: 'Reviews', icon: 'star' },
    { id: 'settings', label: 'Settings', icon: 'settings' },
  ];

  /* =========================================================
     SIDEBAR
  ========================================================= */

  const Sidebar = () => (
    <>
      {sidebarOpen && (
        <button
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-[#083A35]/30 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`
          fixed z-50 left-0 top-0 bottom-0 w-[270px]
          bg-[#083A35] text-white
          flex flex-col
          transform transition-transform duration-300
          lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="h-20 px-6 flex items-center justify-between border-b border-white/10">
          <button
            onClick={() => navigateTo('overview')}
            className="flex items-center gap-3"
          >
            <div className="h-9 w-9 rounded-xl bg-[#C85A3F] flex items-center justify-center">
              <span className="font-display text-xl">A</span>
            </div>

            <span className="font-display text-2xl">Amana</span>
          </button>

          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white/60 hover:text-white"
          >
            <Icon name="close" size={21} />
          </button>
        </div>

        {/* USER MINI CARD */}

        <div className="px-5 py-5">
          <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-full overflow-hidden bg-[#D5A63A] text-[#083A35] flex items-center justify-center font-semibold shrink-0">
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  initials
                )}
              </div>

              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">
                  {fullName || 'Artisan Account'}
                </p>

                <p className="text-xs text-white/50 mt-0.5 truncate">
                  {businessName ||
                    (isArtisan ? 'Professional Artisan' : 'Customer')}
                </p>
              </div>
            </div>

            {isArtisan && myProfile && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/50">Profile strength</span>

                  <span className="text-[#D5A63A] font-semibold">
                    {profileCompletion}%
                  </span>
                </div>

                <div className="mt-2 h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-[#D5A63A] rounded-full transition-all duration-700"
                    style={{ width: `${profileCompletion}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <nav className="px-3 flex-1 overflow-y-auto">
          <p className="px-3 mb-3 text-[10px] uppercase tracking-[0.18em] text-white/35">
            Workspace
          </p>

          <div className="space-y-1">
            {navigation.map((item) => {
              const active = activeSection === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => navigateTo(item.id)}
                  className={`
                    w-full flex items-center gap-3
                    px-3 py-3 rounded-xl text-sm
                    transition-all duration-200
                    ${
                      active
                        ? 'bg-white text-[#083A35] shadow-lg'
                        : 'text-white/65 hover:text-white hover:bg-white/5'
                    }
                  `}
                >
                  <Icon name={item.icon} size={18} />

                  <span className="flex-1 text-left">{item.label}</span>

                  {item.badge ? (
                    <span className="min-w-5 h-5 px-1.5 rounded-full flex items-center justify-center text-[10px] font-bold bg-[#C85A3F] text-white">
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </nav>

        <div className="p-3 border-t border-white/10 space-y-1">
          <Link
            href="/help"
            className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-white/60 hover:text-white hover:bg-white/5 transition"
          >
            <Icon name="help" size={18} />
            Help &amp; Support
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-white/60 hover:text-white hover:bg-white/5 transition"
          >
            <Icon name="logout" size={18} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );

  /* =========================================================
     TOP BAR
  ========================================================= */

  const TopBar = () => (
    <header className="sticky top-0 z-30 h-20 bg-[#F8F3E8]/90 backdrop-blur-xl border-b border-[#0F4C45]/10">
      <div className="h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden h-10 w-10 rounded-xl border border-[#0F4C45]/10 bg-white flex items-center justify-center text-[#0F4C45]"
          >
            <Icon name="menu" size={20} />
          </button>

          <div>
            <p className="hidden sm:block text-[10px] uppercase tracking-[0.2em] text-[#C85A3F] font-semibold">
              Amana workspace
            </p>

            <h1 className="font-display text-xl sm:text-2xl text-[#083A35]">
              {activeSection === 'overview'
                ? 'Dashboard'
                : activeSection === 'jobs'
                ? 'Jobs'
                : activeSection === 'messages'
                ? 'Messages'
                : activeSection === 'profile'
                ? 'My Profile'
                : activeSection === 'portfolio'
                ? 'Portfolio'
                : activeSection === 'reviews'
                ? 'Reviews'
                : 'Settings'}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            className="h-10 w-10 rounded-xl border border-[#0F4C45]/10 bg-white text-[#0F4C45] flex items-center justify-center hover:border-[#0F4C45]/30 transition"
            title="Notifications"
          >
            <Icon name="bell" size={18} />
          </button>

          {isArtisan && myProfile && (
            <button
              onClick={() =>
                window.open(`/artisan/${myProfile._id}`, '_blank')
              }
              className="hidden sm:flex items-center gap-2 h-10 px-4 rounded-xl bg-[#0F4C45] text-white text-sm hover:bg-[#083A35] transition"
            >
              <Icon name="eye" size={16} />
              View profile
            </button>
          )}
        </div>
      </div>
    </header>
  );

  /* =========================================================
     SHARED: the one file input for portfolio photos.

     NOTE: there is deliberately no `capture` attribute. On Android
     and iOS, plain accept="image/*" opens the full sheet with
     Camera, Gallery and Files. Adding capture="environment" locks
     it to the camera and hides the gallery, which is what made the
     upload look broken to testers.
  ========================================================= */

  const PhotoInputs = (
    <>
      <input
        ref={portfolioInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handlePhotosSelected}
        className="sr-only"
        aria-hidden="true"
        tabIndex={-1}
      />

      <input
        ref={avatarInputRef}
        type="file"
        accept="image/*"
        onChange={handleAvatarSelected}
        className="sr-only"
        aria-hidden="true"
        tabIndex={-1}
      />
    </>
  );

  function openPhotoPicker() {
    portfolioInputRef.current?.click();
  }

  function openAvatarPicker() {
    avatarInputRef.current?.click();
  }

  /* =========================================================
     PHOTO GRID (shared by Profile and Portfolio sections)
  ========================================================= */

  function PhotoGrid() {
    const nothingYet = photos.length === 0 && pending.length === 0;

    if (nothingYet) return null;

    return (
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3 mt-6">
        {photos.map((url, index) => (
          <div
            key={`${url}-${index}`}
            className="group relative aspect-square rounded-2xl overflow-hidden bg-[#F8F3E8]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt={`Work sample ${index + 1}`}
              loading="lazy"
              className="w-full h-full object-cover"
            />

            <button
              type="button"
              onClick={() => removePhoto(index)}
              aria-label={`Remove photo ${index + 1}`}
              className="absolute top-2 right-2 h-9 w-9 rounded-xl bg-white/95 text-red-600 flex items-center justify-center shadow-sm"
            >
              <Icon name="trash" size={15} />
            </button>
          </div>
        ))}

        {pending.map((item) => (
          <div
            key={item.key}
            className="relative aspect-square rounded-2xl overflow-hidden bg-[#F8F3E8]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.previewUrl}
              alt=""
              className="w-full h-full object-cover opacity-45"
            />

            {item.status === 'error' ? (
              <div className="absolute inset-0 bg-red-600/85 text-white p-2 flex flex-col items-center justify-center text-center">
                <p className="text-[10px] leading-tight">{item.error}</p>

                <button
                  type="button"
                  onClick={() => dismissPending(item.key)}
                  className="mt-2 text-[10px] underline"
                >
                  Dismiss
                </button>
              </div>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#083A35]/45">
                <div className="h-7 w-7 rounded-full border-2 border-white/30 border-t-white animate-spin" />

                <span className="text-[10px] text-white font-medium">
                  {item.status === 'preparing'
                    ? 'Preparing'
                    : 'Uploading'}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  /* =========================================================
     THE BIG UPLOAD BUTTON
  ========================================================= */

  function UploadDropzone() {
    const full = photos.length + pending.length >= MAX_PHOTOS;

    return (
      <div className="mt-6">
        <button
          type="button"
          onClick={openPhotoPicker}
          disabled={full}
          className={`
            w-full rounded-2xl border-2 border-dashed
            px-6 py-10
            flex flex-col items-center justify-center gap-3
            transition
            ${
              full
                ? 'border-[#0F4C45]/10 bg-[#F8F3E8]/50 text-[#60736F] cursor-not-allowed'
                : 'border-[#0F4C45]/20 bg-[#F8F3E8]/50 hover:border-[#C85A3F]/60 hover:bg-[#F8F3E8]'
            }
          `}
        >
          <div className="h-14 w-14 rounded-2xl bg-white border border-[#0F4C45]/10 flex items-center justify-center text-[#C85A3F]">
            <Icon name="camera" size={26} />
          </div>

          <p className="text-base sm:text-lg font-semibold text-[#083A35]">
            {full ? `You have ${MAX_PHOTOS} photos` : 'Add photos of your work'}
          </p>

          <p className="text-sm text-[#60736F]">
            {full
              ? 'Remove one to add another.'
              : 'Tap to open your camera or gallery'}
          </p>
        </button>

        <p className="mt-3 text-xs text-[#60736F] text-center">
          JPG, PNG or HEIC &middot; up to {MAX_FILE_MB}MB each &middot;{' '}
          {photos.length} of {MAX_PHOTOS} added
        </p>

        {uploadError && (
          <p className="mt-3 text-sm text-red-600 text-center">
            {uploadError}
          </p>
        )}

        {uploadSuccess && (
          <p className="mt-3 text-sm text-[#0F4C45] font-medium text-center">
            {uploadSuccess}
          </p>
        )}
      </div>
    );
  }

  /* =========================================================
     OVERVIEW
  ========================================================= */

  function OverviewSection() {
    const nextStep = checklist.find((item) => !item.complete);

    return (
      <div className="space-y-6 animate-page">
        <section className="relative overflow-hidden rounded-3xl bg-[#0F4C45] text-white p-6 sm:p-8 lg:p-10">
          <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full border border-white/10" />
          <div className="absolute -right-8 -bottom-24 w-72 h-72 rounded-full border border-white/5" />

          <div className="relative max-w-2xl">
            <p className="text-[#D5A63A] text-xs uppercase tracking-[0.18em] font-semibold mb-3">
              Welcome to your workspace
            </p>

            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl leading-tight">
              Build your reputation.
              <br />
              Grow your work.
            </h2>

            <p className="mt-4 text-white/65 max-w-xl text-sm sm:text-base leading-7">
              Manage your customer requests, showcase your work, update your
              profile and keep track of your jobs from one place.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={() => navigateTo('jobs')}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#C85A3F] hover:bg-[#A94632] text-white text-sm font-semibold transition-all hover:-translate-y-0.5"
              >
                View jobs
                <Icon name="arrow" size={16} />
              </button>

              <button
                onClick={() => navigateTo('profile')}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-white/20 hover:bg-white/10 text-white text-sm font-semibold transition"
              >
                Edit profile
              </button>
            </div>
          </div>
        </section>

        {/* NEXT STEP NUDGE */}

        {isArtisan && nextStep && (
          <button
            onClick={() => navigateTo('profile')}
            className="w-full text-left bg-[#FFF3E8] border border-[#C85A3F]/25 rounded-2xl p-5 flex items-center gap-4 hover:border-[#C85A3F]/50 transition"
          >
            <div className="h-11 w-11 shrink-0 rounded-xl bg-white text-[#C85A3F] flex items-center justify-center">
              <Icon name="arrow" size={19} />
            </div>

            <div className="min-w-0">
              <p className="font-semibold text-[#083A35]">
                Next: add {nextStep.label.toLowerCase()}
              </p>

              <p className="text-sm text-[#60736F] mt-0.5">
                Customers are far more likely to contact a complete profile.
              </p>
            </div>
          </button>
        )}

        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard
            label="New requests"
            value={newRequests}
            icon="briefcase"
            action={() => navigateTo('jobs')}
          />

          <StatCard
            label="Active jobs"
            value={activeJobs}
            icon="clock"
            action={() => navigateTo('jobs')}
          />

          <StatCard
            label="Completed"
            value={completedJobs}
            icon="check"
            action={() => navigateTo('jobs')}
          />

          <StatCard
            label="Rating"
            value={
              myProfile && myProfile.ratingCount > 0
                ? myProfile.ratingAvg.toFixed(1)
                : '—'
            }
            icon="star"
            suffix={
              myProfile && myProfile.ratingCount > 0
                ? `/${myProfile.ratingCount}`
                : ''
            }
            action={() => navigateTo('reviews')}
          />
        </section>

        {isArtisan && myProfile && (
          <section className="grid lg:grid-cols-[1.4fr_0.6fr] gap-5">
            <div className="bg-white rounded-3xl border border-[#0F4C45]/10 p-6 sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-[#C85A3F] font-semibold">
                    Profile strength
                  </p>

                  <h3 className="font-display text-2xl text-[#083A35] mt-2">
                    Complete your profile
                  </h3>

                  <p className="text-sm text-[#60736F] mt-2 max-w-xl leading-6">
                    A complete profile gives customers more information before
                    they decide to contact you.
                  </p>
                </div>

                <div className="relative h-16 w-16 shrink-0">
                  <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
                    <circle
                      cx="18"
                      cy="18"
                      r="15"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      className="text-[#0F4C45]/10"
                    />

                    <circle
                      cx="18"
                      cy="18"
                      r="15"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeDasharray={`${profileCompletion}, 100`}
                      pathLength="100"
                      className="text-[#C85A3F]"
                    />
                  </svg>

                  <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-[#083A35]">
                    {profileCompletion}%
                  </span>
                </div>
              </div>

              <div className="mt-6 grid sm:grid-cols-2 gap-3">
                {checklist.map((item) => (
                  <CompletionItem
                    key={item.label}
                    complete={item.complete}
                    label={item.label}
                  />
                ))}
              </div>

              <button
                onClick={() => navigateTo('profile')}
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#C85A3F] hover:text-[#A94632]"
              >
                Improve your profile
                <Icon name="arrow" size={15} />
              </button>
            </div>

            <div className="bg-white rounded-3xl border border-[#0F4C45]/10 p-6 sm:p-7">
              <p className="text-xs uppercase tracking-[0.16em] text-[#C85A3F] font-semibold">
                Availability
              </p>

              <div className="mt-5 flex items-center gap-3">
                <span
                  className={`h-3 w-3 rounded-full ${
                    myProfile.isAvailable
                      ? 'bg-[#3E9B6F] animate-pulse'
                      : 'bg-[#9AA9A5]'
                  }`}
                />

                <span className="font-semibold text-[#083A35]">
                  {myProfile.isAvailable
                    ? 'Available for work'
                    : 'Currently unavailable'}
                </span>
              </div>

              <p className="text-sm text-[#60736F] leading-6 mt-4">
                Let customers know whether you are currently accepting new work.
              </p>

              <button
                onClick={handleAvailabilityToggle}
                disabled={availabilityLoading}
                className={`
                  mt-6 w-full py-3 rounded-xl text-sm font-semibold transition
                  ${
                    myProfile.isAvailable
                      ? 'bg-[#0F4C45] text-white hover:bg-[#083A35]'
                      : 'border border-[#0F4C45]/20 text-[#083A35] hover:border-[#0F4C45]'
                  }
                `}
              >
                {availabilityLoading
                  ? 'Updating...'
                  : myProfile.isAvailable
                  ? 'Mark unavailable'
                  : 'Mark available'}
              </button>

              {availabilityError && (
                <p className="mt-3 text-xs text-red-600">{availabilityError}</p>
              )}
            </div>
          </section>
        )}

        <section className="bg-white rounded-3xl border border-[#0F4C45]/10 overflow-hidden">
          <div className="px-6 py-5 border-b border-[#0F4C45]/10 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-[#C85A3F] font-semibold">
                Recent activity
              </p>

              <h3 className="font-display text-2xl text-[#083A35] mt-1">
                Recent jobs
              </h3>
            </div>

            <button
              onClick={() => navigateTo('jobs')}
              className="hidden sm:flex items-center gap-1 text-sm font-semibold text-[#C85A3F]"
            >
              View all
              <Icon name="chevron" size={15} />
            </button>
          </div>

          <div className="p-4 sm:p-6">
            {bookingsLoading ? (
              <LoadingBlock />
            ) : bookings.length === 0 ? (
              <EmptyState
                icon="briefcase"
                title={
                  isArtisan ? 'No job requests yet' : 'No bookings yet'
                }
                description={
                  isArtisan
                    ? 'When customers request your services, their requests will appear here.'
                    : 'Your requested services will appear here.'
                }
              />
            ) : (
              <div className="space-y-3">
                {bookings.slice(0, 4).map((booking) => (
                  <BookingCard
                    key={booking._id}
                    booking={booking}
                    isArtisan={isArtisan}
                    updatingId={updatingId}
                    onStatusChange={handleStatusChange}
                    onReview={openReviewForm}
                    reviewedIds={reviewedIds}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    );
  }

  /* =========================================================
     JOBS
  ========================================================= */

  function JobsSection() {
    return (
      <div className="space-y-6 animate-page">
        <SectionHeader
          eyebrow="Work management"
          title={isArtisan ? 'Manage your jobs' : 'Your bookings'}
          description={
            isArtisan
              ? 'Review customer requests, accept jobs and keep your work moving.'
              : 'Track the services you have requested.'
          }
        />

        {actionError && (
          <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
            {actionError}
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <MiniStat label="Requested" value={statusCounts.requested || 0} />
          <MiniStat label="Accepted" value={statusCounts.accepted || 0} />
          <MiniStat
            label="In progress"
            value={statusCounts.in_progress || 0}
          />
          <MiniStat label="Completed" value={statusCounts.completed || 0} />
        </div>

        <section className="bg-white rounded-3xl border border-[#0F4C45]/10 overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-[#0F4C45]/10">
            <h3 className="font-display text-2xl text-[#083A35]">
              {isArtisan ? 'Customer requests' : 'Booking history'}
            </h3>
          </div>

          <div className="p-4 sm:p-6">
            {bookingsLoading ? (
              <LoadingBlock />
            ) : bookings.length === 0 ? (
              <EmptyState
                icon="briefcase"
                title="Nothing here yet"
                description={
                  isArtisan
                    ? 'New customer requests will appear here.'
                    : 'Your booking activity will appear here.'
                }
              />
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <BookingCard
                    key={booking._id}
                    booking={booking}
                    isArtisan={isArtisan}
                    updatingId={updatingId}
                    onStatusChange={handleStatusChange}
                    onReview={openReviewForm}
                    reviewedIds={reviewedIds}
                    reviewingId={reviewingId}
                    reviewRating={reviewRating}
                    setReviewRating={setReviewRating}
                    reviewComment={reviewComment}
                    setReviewComment={setReviewComment}
                    reviewSubmitting={reviewSubmitting}
                    reviewError={reviewError}
                    onSubmitReview={handleReviewSubmit}
                    onCancelReview={() => setReviewingId(null)}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    );
  }

  /* =========================================================
     MESSAGES
  ========================================================= */

  function MessagesSection() {
    return (
      <div className="space-y-6 animate-page">
        <SectionHeader
          eyebrow="Communication"
          title="Messages"
          description="Communicate with customers about their work and bookings."
        />

        <section className="bg-white rounded-3xl border border-[#0F4C45]/10 min-h-[500px] flex items-center justify-center p-8">
          <EmptyState
            icon="message"
            title="No conversations yet"
            description="Customer conversations will appear here when messaging is connected to your account."
            actionLabel="Go to jobs"
            onAction={() => navigateTo('jobs')}
          />
        </section>
      </div>
    );
  }

  /* =========================================================
     PROFILE
  ========================================================= */

  function ProfileSection() {
    if (!isArtisan) {
      return (
        <div className="space-y-6 animate-page">
          <SectionHeader
            eyebrow="Your account"
            title="My Profile"
            description="Your customer profile settings."
          />

          <section className="bg-white rounded-3xl border border-[#0F4C45]/10 p-8">
            <EmptyState
              icon="user"
              title="Customer profile"
              description="Your customer profile tools can be managed here."
            />
          </section>
        </div>
      );
    }

    if (profileLoading) {
      return <LoadingBlock />;
    }

    return (
      <div className="space-y-6 animate-page">
        <SectionHeader
          eyebrow="Public identity"
          title="Edit your profile"
          description="This is what customers see when they find you on Amana."
        />

        <form onSubmit={handleProfileSave} className="space-y-6">
          {/* ---------- WHO YOU ARE ---------- */}

          <section className="bg-white rounded-3xl border border-[#0F4C45]/10 p-6 sm:p-8">
            <FormTitle
              title="Who you are"
              description="Your photo and name are the first things a customer sees. They decide whether to call you."
            />

            {/* PROFILE PHOTO */}

            <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-5">
              <button
                type="button"
                onClick={openAvatarPicker}
                className="relative h-28 w-28 shrink-0 rounded-3xl overflow-hidden bg-[#F8F3E8] border-2 border-[#0F4C45]/10 hover:border-[#C85A3F]/50 transition self-start"
                aria-label="Change your profile photo"
              >
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="h-full w-full flex flex-col items-center justify-center gap-1.5 text-[#0F4C45]/45">
                    <Icon name="camera" size={26} />
                    <span className="text-[11px] font-medium">Add photo</span>
                  </span>
                )}

                {avatarUploading && (
                  <span className="absolute inset-0 bg-[#083A35]/55 flex items-center justify-center">
                    <span className="h-7 w-7 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  </span>
                )}
              </button>

              <div>
                <button
                  type="button"
                  onClick={openAvatarPicker}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-[#0F4C45]/20 text-[#083A35] text-sm font-semibold hover:border-[#0F4C45]/45 transition"
                >
                  <Icon name="camera" size={17} />
                  {avatarUrl ? 'Change photo' : 'Add your photo'}
                </button>

                <p className="mt-2.5 text-sm text-[#60736F] leading-6 max-w-sm">
                  A clear photo of your face works best. Customers use it to
                  recognise you when you arrive.
                </p>

                {avatarError && (
                  <p className="mt-2 text-sm text-red-600">{avatarError}</p>
                )}
              </div>
            </div>

            {/* IDENTITY FIELDS */}

            <div className="mt-8 grid sm:grid-cols-2 gap-5">
              <div>
                <label className="form-label" htmlFor="field-fullname">
                  Full name
                </label>

                <input
                  id="field-fullname"
                  type="text"
                  autoComplete="name"
                  value={fullName}
                  onChange={(event) => {
                    setFullName(event.target.value);
                    markDirty();
                  }}
                  placeholder="Mujaheed Said"
                  className="form-input"
                />
              </div>

              <div>
                <label className="form-label" htmlFor="field-business">
                  Business name
                </label>

                <input
                  id="field-business"
                  type="text"
                  value={businessName}
                  onChange={(event) => {
                    setBusinessName(event.target.value);
                    markDirty();
                  }}
                  placeholder="Mujaheed Electrical Services"
                  className="form-input"
                />

                <p className="mt-2 text-xs text-[#60736F]">
                  Leave this blank if you work under your own name.
                </p>
              </div>

              <div>
                <label className="form-label" htmlFor="field-phone">
                  Phone number
                </label>

                <input
                  id="field-phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={phone}
                  onChange={(event) => {
                    setPhone(event.target.value);
                    markDirty();
                  }}
                  placeholder="0803 000 0000"
                  className="form-input"
                />
              </div>

              <div>
                <label className="form-label" htmlFor="field-whatsapp">
                  WhatsApp number
                </label>

                <input
                  id="field-whatsapp"
                  type="tel"
                  inputMode="tel"
                  value={whatsapp}
                  onChange={(event) => {
                    setWhatsapp(event.target.value);
                    markDirty();
                  }}
                  placeholder="Same as your phone number"
                  className="form-input"
                />

                <p className="mt-2 text-xs text-[#60736F]">
                  Most customers message before they call.
                </p>
              </div>

              <div>
                <label className="form-label" htmlFor="field-city">
                  City
                </label>

                <input
                  id="field-city"
                  type="text"
                  value={city}
                  onChange={(event) => {
                    setCity(event.target.value);
                    markDirty();
                  }}
                  className="form-input"
                />
              </div>

              <div>
                <label className="form-label" htmlFor="field-area">
                  Area
                </label>

                <input
                  id="field-area"
                  type="text"
                  value={area}
                  onChange={(event) => {
                    setArea(event.target.value);
                    markDirty();
                  }}
                  placeholder="Sabon Gari"
                  className="form-input"
                />

                <p className="mt-2 text-xs text-[#60736F]">
                  Where you are based, so nearby customers can find you.
                </p>
              </div>

              <div>
                <label className="form-label" htmlFor="field-years">
                  Years of experience
                </label>

                <input
                  id="field-years"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={70}
                  value={yearsExperience}
                  onChange={(event) => {
                    setYearsExperience(parseInt(event.target.value) || 0);
                    markDirty();
                  }}
                  className="form-input"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="form-label" htmlFor="field-bio">
                About your work
              </label>

              <textarea
                id="field-bio"
                value={bio}
                maxLength={600}
                onChange={(event) => {
                  setBio(event.target.value);
                  markDirty();
                }}
                rows={6}
                placeholder="I am an electrician with 6 years of experience. I do house wiring, solar installation and generator repair around Kano."
                className="form-input resize-y"
              />

              <div className="mt-2 flex justify-between text-xs text-[#60736F]">
                <span>Write plainly. Say what you do and who you do it for.</span>
                <span>{bio.length}/600</span>
              </div>
            </div>
          </section>

          {/* ---------- WHAT YOU OFFER ---------- */}

          <section className="bg-white rounded-3xl border border-[#0F4C45]/10 p-6 sm:p-8">
            <FormTitle
              title="What you offer"
              description="Amana is for anyone with a skill or a shop, not only tradespeople."
            />

            <div className="mt-6 grid sm:grid-cols-3 gap-3">
              {(
                [
                  {
                    id: 'services' as OfferType,
                    icon: 'briefcase' as const,
                    title: 'Services',
                    body: 'You do work for customers: repairs, installation, tailoring.',
                  },
                  {
                    id: 'products' as OfferType,
                    icon: 'store' as const,
                    title: 'Products',
                    body: 'You sell things: phones, shoes, spare parts, furniture.',
                  },
                  {
                    id: 'both' as OfferType,
                    icon: 'shield' as const,
                    title: 'Both',
                    body: 'You sell and you also repair or install.',
                  },
                ]
              ).map((option) => {
                const active = offerType === option.id;

                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => {
                      setOfferType(option.id);
                      markDirty();
                    }}
                    aria-pressed={active}
                    className={`
                      text-left rounded-2xl border p-5 transition
                      ${
                        active
                          ? 'bg-[#0F4C45] border-[#0F4C45] text-white'
                          : 'bg-white border-[#0F4C45]/12 hover:border-[#0F4C45]/40'
                      }
                    `}
                  >
                    <span
                      className={`
                        h-10 w-10 rounded-xl flex items-center justify-center
                        ${
                          active
                            ? 'bg-white/15 text-[#D5A63A]'
                            : 'bg-[#F8F3E8] text-[#C85A3F]'
                        }
                      `}
                    >
                      <Icon name={option.icon} size={19} />
                    </span>

                    <span
                      className={`block font-semibold mt-3 ${
                        active ? 'text-white' : 'text-[#083A35]'
                      }`}
                    >
                      {option.title}
                    </span>

                    <span
                      className={`block text-xs leading-5 mt-1 ${
                        active ? 'text-white/65' : 'text-[#60736F]'
                      }`}
                    >
                      {option.body}
                    </span>
                  </button>
                );
              })}
            </div>

            {showsServices && (
              <div className="mt-8">
                <p className="font-semibold text-[#083A35]">
                  Services you provide
                </p>

                <CatalogPicker
                  catalog={SERVICE_CATALOG}
                  selected={serviceIds}
                  onToggle={toggleService}
                />
              </div>
            )}

            {showsProducts && (
              <div className="mt-8">
                <p className="font-semibold text-[#083A35]">Things you sell</p>

                <CatalogPicker
                  catalog={PRODUCT_CATALOG}
                  selected={productIds}
                  onToggle={toggleProduct}
                />
              </div>
            )}

            <CustomOfferingForm
              existing={customOfferings}
              onAdd={addCustomOffering}
              onRemove={removeCustomOffering}
            />
          </section>

          {/* ---------- YOUR WORK ---------- */}

          <section className="bg-white rounded-3xl border border-[#0F4C45]/10 p-6 sm:p-8">
            <FormTitle
              title="Photos of your work"
              description="Photos do more than any description. Show finished jobs, your workshop or your stock."
            />

            <UploadDropzone />
            <PhotoGrid />
          </section>

          {/* ---------- WHEN YOU WORK ---------- */}

          <section className="bg-white rounded-3xl border border-[#0F4C45]/10 p-6 sm:p-8">
            <FormTitle
              title="When you work"
              description="Customers avoid calling outside your hours."
            />

            <div className="mt-6 flex flex-wrap gap-2">
              {WEEK_DAYS.map((day) => {
                const active = workingDays.includes(day);

                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleWorkingDay(day)}
                    aria-pressed={active}
                    className={`
                      min-h-11 px-5 rounded-full border text-sm transition
                      ${
                        active
                          ? 'bg-[#0F4C45] border-[#0F4C45] text-white'
                          : 'bg-white border-[#0F4C45]/15 text-[#083A35] hover:border-[#0F4C45]/40'
                      }
                    `}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 max-w-sm">
              <div>
                <label className="form-label" htmlFor="field-open-from">
                  Open from
                </label>

                <input
                  id="field-open-from"
                  type="time"
                  value={openFrom}
                  onChange={(event) => {
                    setOpenFrom(event.target.value);
                    markDirty();
                  }}
                  className="form-input"
                />
              </div>

              <div>
                <label className="form-label" htmlFor="field-open-to">
                  Close at
                </label>

                <input
                  id="field-open-to"
                  type="time"
                  value={openTo}
                  onChange={(event) => {
                    setOpenTo(event.target.value);
                    markDirty();
                  }}
                  className="form-input"
                />
              </div>
            </div>
          </section>

          {/* ---------- SOCIAL ---------- */}

          <section className="bg-white rounded-3xl border border-[#0F4C45]/10 p-6 sm:p-8">
            <FormTitle
              title="Social links"
              description="Optional. Shown on your public profile so customers can see more of your work."
            />

            <div className="mt-6 grid sm:grid-cols-3 gap-5">
              <div>
                <label className="form-label" htmlFor="field-facebook">
                  Facebook
                </label>

                <input
                  id="field-facebook"
                  type="text"
                  value={facebook}
                  onChange={(event) => {
                    setFacebook(event.target.value);
                    markDirty();
                  }}
                  placeholder="@username"
                  className="form-input"
                />
              </div>

              <div>
                <label className="form-label" htmlFor="field-instagram">
                  Instagram
                </label>

                <input
                  id="field-instagram"
                  type="text"
                  value={instagram}
                  onChange={(event) => {
                    setInstagram(event.target.value);
                    markDirty();
                  }}
                  placeholder="@username"
                  className="form-input"
                />
              </div>

              <div>
                <label className="form-label" htmlFor="field-tiktok">
                  TikTok
                </label>

                <input
                  id="field-tiktok"
                  type="text"
                  value={tiktok}
                  onChange={(event) => {
                    setTiktok(event.target.value);
                    markDirty();
                  }}
                  placeholder="@username"
                  className="form-input"
                />
              </div>
            </div>
          </section>

          {/* ---------- AVAILABILITY ---------- */}

          <section className="bg-white rounded-3xl border border-[#0F4C45]/10 p-6 sm:p-8">
            <FormTitle
              title="Work availability"
              description="Control whether customers can see you as available for new work."
            />

            <div className="mt-6 flex items-center justify-between gap-5 rounded-2xl bg-[#F8F3E8] p-5">
              <div>
                <p className="font-semibold text-[#083A35]">
                  Accepting new work
                </p>

                <p className="text-sm text-[#60736F] mt-1">
                  {myProfile?.isAvailable
                    ? 'Customers can see that you are available.'
                    : 'Customers will see that you are currently unavailable.'}
                </p>
              </div>

              <button
                type="button"
                onClick={handleAvailabilityToggle}
                disabled={availabilityLoading}
                aria-pressed={Boolean(myProfile?.isAvailable)}
                className={`
                  relative w-14 h-8 shrink-0 rounded-full transition
                  ${myProfile?.isAvailable ? 'bg-[#0F4C45]' : 'bg-[#B6C2BF]'}
                `}
              >
                <span
                  className={`
                    absolute top-1 h-6 w-6 rounded-full bg-white shadow-sm transition-transform
                    ${
                      myProfile?.isAvailable
                        ? 'translate-x-7'
                        : 'translate-x-1'
                    }
                  `}
                />
              </button>
            </div>
          </section>

          {/* ---------- SAVE BAR ---------- */}

          <div className="sticky bottom-24 lg:bottom-4 z-20">
            <div className="bg-white/95 backdrop-blur-xl border border-[#0F4C45]/10 shadow-2xl rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="text-sm">
                {profileError && (
                  <p className="text-red-600">{profileError}</p>
                )}

                {profileSaved && (
                  <p className="text-[#0F4C45] font-medium flex items-center gap-2">
                    <span className="h-5 w-5 rounded-full bg-[#0F4C45] text-white flex items-center justify-center">
                      <Icon name="check" size={12} />
                    </span>
                    Profile saved.
                  </p>
                )}

                {!profileError && !profileSaved && (
                  <p className="text-[#60736F]">
                    {dirty
                      ? 'You have unsaved changes.'
                      : 'Everything is saved.'}
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                {myProfile && (
                  <Link
                    href={`/artisan/${myProfile._id}`}
                    target="_blank"
                    className="hidden sm:inline-flex items-center gap-2 px-4 py-3 rounded-xl border border-[#0F4C45]/15 text-[#083A35] text-sm font-semibold hover:border-[#0F4C45]/40 transition"
                  >
                    <Icon name="eye" size={16} />
                    Preview
                  </Link>
                )}

                <button
                  type="submit"
                  disabled={profileSaving}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#C85A3F] hover:bg-[#A94632] disabled:opacity-60 text-white text-sm font-semibold transition"
                >
                  <Icon name="save" size={16} />
                  {profileSaving ? 'Saving...' : 'Save profile'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    );
  }

  /* =========================================================
     PORTFOLIO
  ========================================================= */

  function PortfolioSection() {
    return (
      <div className="space-y-6 animate-page">
        <SectionHeader
          eyebrow="Show your work"
          title="Portfolio"
          description="Your portfolio is where customers see the quality of your actual work."
        />

        <section className="bg-white rounded-3xl border border-[#0F4C45]/10 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-display text-2xl text-[#083A35]">
                Work samples
              </h3>

              <p className="text-sm text-[#60736F] mt-1">
                {photos.length} photo{photos.length !== 1 ? 's' : ''} in your
                portfolio
              </p>
            </div>

            <button
              type="button"
              onClick={openPhotoPicker}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#C85A3F] text-white text-sm font-semibold hover:bg-[#A94632] transition"
            >
              <Icon name="plus" size={17} />
              Add photos
            </button>
          </div>

          {photos.length === 0 && pending.length === 0 ? (
            <UploadDropzone />
          ) : (
            <>
              <PhotoGrid />
              <UploadDropzone />
            </>
          )}

          {(photos.length > 0 || pending.length > 0) && (
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={handleProfileSave}
                disabled={profileSaving || !dirty}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0F4C45] hover:bg-[#083A35] disabled:opacity-50 text-white text-sm font-semibold transition"
              >
                <Icon name="save" size={16} />
                {profileSaving
                  ? 'Saving...'
                  : dirty
                  ? 'Save portfolio'
                  : 'Portfolio saved'}
              </button>
            </div>
          )}
        </section>

        <div className="bg-[#F8F3E8] border border-[#0F4C45]/10 rounded-3xl p-6 flex gap-4">
          <div className="h-10 w-10 shrink-0 rounded-xl bg-white flex items-center justify-center text-[#0F4C45]">
            <Icon name="shield" size={19} />
          </div>

          <div>
            <h4 className="font-semibold text-[#083A35]">
              Make your portfolio useful
            </h4>

            <p className="text-sm text-[#60736F] mt-1 leading-6">
              Use clear photos of finished work, in good light, showing
              different kinds of jobs. Photos taken on your own phone work
              better than pictures from the internet.
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* =========================================================
     REVIEWS
  ========================================================= */

  function ReviewsSection() {
    const rating =
      myProfile && myProfile.ratingCount > 0
        ? myProfile.ratingAvg.toFixed(1)
        : '—';

    return (
      <div className="space-y-6 animate-page">
        <SectionHeader
          eyebrow="Customer feedback"
          title="Reviews"
          description="Your customer feedback helps people understand what it is like to work with you."
        />

        <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-[#0F4C45] text-white rounded-3xl p-6">
            <p className="text-white/50 text-xs uppercase tracking-wider">
              Average rating
            </p>

            <div className="flex items-end gap-2 mt-4">
              <span className="font-display text-5xl">{rating}</span>
              {rating !== '—' && <Icon name="star" size={23} />}
            </div>

            <p className="text-sm text-white/50 mt-2">
              {myProfile?.ratingCount || 0} review
              {(myProfile?.ratingCount || 0) !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="bg-white border border-[#0F4C45]/10 rounded-3xl p-6">
            <p className="text-[#60736F] text-xs uppercase tracking-wider">
              Reputation
            </p>

            <div className="mt-5 flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-[#F8F3E8] flex items-center justify-center text-[#C85A3F]">
                <Icon name="star" size={20} />
              </div>

              <div>
                <p className="font-semibold text-[#083A35]">
                  Keep delivering great work
                </p>

                <p className="text-xs text-[#60736F] mt-1">
                  Completed jobs can lead to customer reviews.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#0F4C45]/10 rounded-3xl p-6">
            <p className="text-[#60736F] text-xs uppercase tracking-wider">
              Completed work
            </p>

            <p className="font-display text-4xl text-[#083A35] mt-4">
              {completedJobs}
            </p>

            <p className="text-xs text-[#60736F] mt-2">
              Completed jobs recorded on Amana.
            </p>
          </div>
        </section>

        <section className="bg-white rounded-3xl border border-[#0F4C45]/10 p-6 sm:p-8">
          <h3 className="font-display text-2xl text-[#083A35]">
            Customer reviews
          </h3>

          <div className="mt-8">
            <EmptyState
              icon="star"
              title="Reviews will appear here"
              description="When customers leave reviews for your completed jobs, their feedback will be displayed in this section."
            />
          </div>
        </section>
      </div>
    );
  }

  /* =========================================================
     SETTINGS
  ========================================================= */

  function SettingsSection() {
    return (
      <div className="space-y-6 animate-page">
        <SectionHeader
          eyebrow="Account control"
          title="Settings"
          description="Manage notifications, visibility and your account preferences."
        />

        <section className="bg-white rounded-3xl border border-[#0F4C45]/10 overflow-hidden">
          <div className="p-6 sm:p-8 border-b border-[#0F4C45]/10">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-[#F8F3E8] text-[#0F4C45] flex items-center justify-center">
                <Icon name="bell" size={19} />
              </div>

              <div>
                <h3 className="font-display text-xl text-[#083A35]">
                  Notifications
                </h3>

                <p className="text-sm text-[#60736F] mt-1">
                  Choose which updates you want to receive.
                </p>
              </div>
            </div>

            <div className="mt-6 divide-y divide-[#0F4C45]/10">
              <SettingRow
                title="Booking notifications"
                description="Get notified when a customer requests or updates a job."
                enabled={settings.bookingNotifications}
                onChange={(value) =>
                  setSettings((previous) => ({
                    ...previous,
                    bookingNotifications: value,
                  }))
                }
              />

              <SettingRow
                title="Message notifications"
                description="Receive alerts when someone sends you a message."
                enabled={settings.messageNotifications}
                onChange={(value) =>
                  setSettings((previous) => ({
                    ...previous,
                    messageNotifications: value,
                  }))
                }
              />

              <SettingRow
                title="Email notifications"
                description="Receive important account updates by email."
                enabled={settings.emailNotifications}
                onChange={(value) =>
                  setSettings((previous) => ({
                    ...previous,
                    emailNotifications: value,
                  }))
                }
              />
            </div>
          </div>

          <div className="p-6 sm:p-8 border-b border-[#0F4C45]/10">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-[#F8F3E8] text-[#0F4C45] flex items-center justify-center">
                <Icon name="eye" size={19} />
              </div>

              <div>
                <h3 className="font-display text-xl text-[#083A35]">
                  Profile visibility
                </h3>

                <p className="text-sm text-[#60736F] mt-1">
                  Control whether customers can discover your profile.
                </p>
              </div>
            </div>

            <SettingRow
              title="Show my public profile"
              description="Allow customers to discover your artisan profile."
              enabled={settings.profileVisible}
              onChange={(value) =>
                setSettings((previous) => ({
                  ...previous,
                  profileVisible: value,
                }))
              }
            />
          </div>

          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-[#F8F3E8] text-[#0F4C45] flex items-center justify-center">
                <Icon name="shield" size={19} />
              </div>

              <div>
                <h3 className="font-display text-xl text-[#083A35]">Account</h3>

                <p className="text-sm text-[#60736F] mt-1">
                  Your account information and security.
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <div className="rounded-2xl bg-[#F8F3E8] p-4">
                <p className="text-xs text-[#60736F]">Account ID</p>

                <p className="text-sm text-[#083A35] font-medium mt-1 break-all">
                  {user?.userId}
                </p>
              </div>

              <div className="rounded-2xl bg-[#F8F3E8] p-4">
                <p className="text-xs text-[#60736F]">Account role</p>

                <p className="text-sm text-[#083A35] font-medium mt-1 capitalize">
                  {user?.role}
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="mt-6 inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-sm font-semibold transition"
            >
              <Icon name="logout" size={17} />
              Logout
            </button>
          </div>
        </section>
      </div>
    );
  }

  /* =========================================================
     SECTION RENDER
  ========================================================= */

  function renderSection() {
    switch (activeSection) {
      case 'overview':
        return OverviewSection();
      case 'jobs':
        return JobsSection();
      case 'messages':
        return MessagesSection();
      case 'profile':
        return ProfileSection();
      case 'portfolio':
        return PortfolioSection();
      case 'reviews':
        return ReviewsSection();
      case 'settings':
        return SettingsSection();
      default:
        return OverviewSection();
    }
  }

  /* =========================================================
     MAIN
  ========================================================= */

  return (
    <>
      <style jsx global>{`
        @keyframes pageEnter {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-page {
          animation: pageEnter 0.45s ease-out both;
        }

        .form-label {
          display: block;
          margin-bottom: 0.5rem;
          font-size: 0.875rem;
          font-weight: 600;
          color: #083a35;
        }

        .form-input {
          width: 100%;
          min-height: 3.25rem;
          border: 1px solid rgba(15, 76, 69, 0.14);
          background: #ffffff;
          border-radius: 0.85rem;
          padding: 0.8rem 0.9rem;
          /* 16px stops iOS Safari zooming in when the field is focused */
          font-size: 1rem;
          color: #083a35;
          outline: none;
          transition:
            border-color 0.2s ease,
            box-shadow 0.2s ease;
        }

        .form-input::placeholder {
          color: rgba(96, 115, 111, 0.65);
        }

        .form-input:focus {
          border-color: #c85a3f;
          box-shadow: 0 0 0 4px rgba(200, 90, 63, 0.08);
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-page {
            animation: none !important;
          }
          * {
            scroll-behavior: auto !important;
          }
        }
      `}</style>

      {PhotoInputs}

      <div className="min-h-screen bg-[#F8F3E8] text-[#083A35]">
        <Sidebar />

        <div className="lg:pl-[270px] min-h-screen">
          <TopBar />

          <main className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-28 lg:pb-8 max-w-[1500px] mx-auto">
            {renderSection()}
          </main>
        </div>

        {/* MOBILE BOTTOM NAV */}

        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 px-3 pb-3">
          <div className="bg-[#083A35]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-2 grid grid-cols-5 gap-1">
            {[
              { id: 'overview' as Section, label: 'Home', icon: 'home' as const },
              { id: 'jobs' as Section, label: 'Jobs', icon: 'briefcase' as const },
              {
                id: 'portfolio' as Section,
                label: 'Photos',
                icon: 'image' as const,
              },
              { id: 'profile' as Section, label: 'Profile', icon: 'user' as const },
              {
                id: 'settings' as Section,
                label: 'More',
                icon: 'settings' as const,
              },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => navigateTo(item.id)}
                className={`
                  min-w-0 rounded-xl py-2
                  flex flex-col items-center justify-center gap-1
                  text-[10px] transition
                  ${
                    activeSection === item.id
                      ? 'bg-white text-[#083A35]'
                      : 'text-white/55'
                  }
                `}
              >
                <Icon name={item.icon} size={17} />

                <span className="truncate max-w-full px-1">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

/* =========================================================
   CATALOG PICKER
========================================================= */

function CatalogPicker({
  catalog,
  selected,
  onToggle,
}: {
  catalog: { id: string; label: string; group: string }[];
  selected: string[];
  onToggle: (id: string) => void;
}) {
  const groups = useMemo(() => {
    const map = new Map<string, typeof catalog>();

    catalog.forEach((entry) => {
      map.set(entry.group, [...(map.get(entry.group) ?? []), entry]);
    });

    return Array.from(map.entries());
  }, [catalog]);

  return (
    <div className="mt-4 space-y-5">
      {groups.map(([group, entries]) => (
        <div key={group}>
          <p className="text-xs text-[#60736F] mb-2.5">{group}</p>

          <div className="flex flex-wrap gap-2">
            {entries.map((entry) => {
              const active = selected.includes(entry.id);

              return (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => onToggle(entry.id)}
                  aria-pressed={active}
                  className={`
                    min-h-11 px-4 rounded-full border text-sm transition
                    ${
                      active
                        ? 'bg-[#0F4C45] border-[#0F4C45] text-white'
                        : 'bg-white border-[#0F4C45]/15 text-[#083A35] hover:border-[#0F4C45]/40'
                    }
                  `}
                >
                  {entry.label}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

/* =========================================================
   CUSTOM OFFERING FORM

   Anything an artisan adds here saves to their own profile right
   away, and goes to an admin queue before it becomes a searchable
   category. That keeps the category list clean without blocking
   anyone from finishing their profile.
========================================================= */

function CustomOfferingForm({
  existing,
  onAdd,
  onRemove,
}: {
  existing: CustomOffering[];
  onAdd: (offering: CustomOffering) => void;
  onRemove: (index: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit() {
    if (name.trim().length < 3) {
      setError('Give it a name a customer would search for.');
      return;
    }

    if (!category) {
      setError('Choose the closest category.');
      return;
    }

    setBusy(true);
    setError('');

    try {
      const token = localStorage.getItem('amana_token');

      // Best effort: the profile save below keeps the entry either way,
      // so a missing endpoint does not block the artisan.
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/offerings/requests`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            name: name.trim(),
            category,
            description: description.trim(),
          }),
        }
      ).catch(() => null);

      onAdd({
        name: name.trim(),
        category,
        description: description.trim(),
        status: 'pending',
      });

      setName('');
      setCategory('');
      setDescription('');
      setOpen(false);
    } catch {
      setError('Could not send that. Try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-8 rounded-2xl border border-[#C85A3F]/25 bg-[#FFF3E8] p-5 sm:p-6">
      {existing.length > 0 && (
        <ul className="mb-5 space-y-2">
          {existing.map((offering, index) => (
            <li
              key={`${offering.name}-${index}`}
              className="flex items-center justify-between gap-3 bg-white rounded-xl px-4 py-3"
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#083A35] truncate">
                  {offering.name}
                </p>

                <p className="text-xs text-[#60736F] mt-0.5">
                  {offering.category} &middot;{' '}
                  {offering.status === 'pending'
                    ? 'waiting for review'
                    : 'live in search'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => onRemove(index)}
                aria-label={`Remove ${offering.name}`}
                className="h-9 w-9 shrink-0 rounded-lg text-red-600 hover:bg-red-50 flex items-center justify-center"
              >
                <Icon name="trash" size={15} />
              </button>
            </li>
          ))}
        </ul>
      )}

      {!open ? (
        <div>
          <p className="font-semibold text-[#083A35]">
            Can&apos;t find what you do?
          </p>

          <p className="text-sm text-[#60736F] mt-1 leading-6 max-w-xl">
            Add it yourself. It appears on your profile immediately, and we
            make it searchable once we have checked it.
          </p>

          <button
            type="button"
            onClick={() => setOpen(true)}
            className="mt-4 inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#C85A3F] hover:bg-[#A94632] text-white text-sm font-semibold transition"
          >
            <Icon name="plus" size={16} />
            Add your own
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          <div>
            <label className="form-label" htmlFor="custom-name">
              What do you call this work?
            </label>

            <input
              id="custom-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="CCTV installation"
              className="form-input"
            />
          </div>

          <div>
            <label className="form-label" htmlFor="custom-category">
              Closest category
            </label>

            <select
              id="custom-category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="form-input"
            >
              <option value="">Choose one</option>

              {ALL_GROUPS.map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label" htmlFor="custom-description">
              Describe it in one sentence
            </label>

            <textarea
              id="custom-description"
              rows={3}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="I install and maintain CCTV cameras for homes and shops."
              className="form-input resize-y"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={submit}
              disabled={busy}
              className="px-5 py-3 rounded-xl bg-[#0F4C45] hover:bg-[#083A35] disabled:opacity-60 text-white text-sm font-semibold transition"
            >
              {busy ? 'Adding...' : 'Add to my profile'}
            </button>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-5 py-3 rounded-xl border border-[#0F4C45]/15 text-[#083A35] text-sm font-semibold"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  label,
  value,
  icon,
  suffix,
  action,
}: {
  label: string;
  value: string | number;
  icon: Parameters<typeof Icon>[0]['name'];
  suffix?: string;
  action?: () => void;
}) {
  return (
    <button
      onClick={action}
      className="text-left bg-white border border-[#0F4C45]/10 rounded-2xl p-4 sm:p-5 hover:border-[#0F4C45]/20 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200"
    >
      <div className="flex items-center justify-between">
        <div className="h-9 w-9 rounded-xl bg-[#F8F3E8] text-[#0F4C45] flex items-center justify-center">
          <Icon name={icon} size={17} />
        </div>

        <Icon name="chevron" size={15} />
      </div>

      <p className="font-display text-3xl sm:text-4xl text-[#083A35] mt-5">
        {value}
        {suffix && (
          <span className="font-body text-sm text-[#60736F]">{suffix}</span>
        )}
      </p>

      <p className="text-xs sm:text-sm text-[#60736F] mt-1">{label}</p>
    </button>
  );
}

/* =========================================================
   MINI STAT
========================================================= */

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white border border-[#0F4C45]/10 rounded-2xl p-4">
      <p className="font-display text-2xl text-[#083A35]">{value}</p>
      <p className="text-xs text-[#60736F] mt-1">{label}</p>
    </div>
  );
}

/* =========================================================
   SECTION HEADER
========================================================= */

function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.18em] text-[#C85A3F] font-semibold">
        {eyebrow}
      </p>

      <h2 className="font-display text-3xl sm:text-4xl text-[#083A35] mt-2">
        {title}
      </h2>

      <p className="text-sm sm:text-base text-[#60736F] max-w-2xl mt-2 leading-7">
        {description}
      </p>
    </div>
  );
}

/* =========================================================
   FORM TITLE
========================================================= */

function FormTitle({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <h3 className="font-display text-2xl text-[#083A35]">{title}</h3>

      <p className="text-sm text-[#60736F] mt-1 max-w-2xl leading-6">
        {description}
      </p>
    </div>
  );
}

/* =========================================================
   COMPLETION ITEM
========================================================= */

function CompletionItem({
  complete,
  label,
}: {
  complete: boolean;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-[#F8F3E8] px-4 py-3">
      <span
        className={`
          h-6 w-6 rounded-full flex items-center justify-center shrink-0
          ${
            complete
              ? 'bg-[#0F4C45] text-white'
              : 'border border-[#0F4C45]/15 text-transparent'
          }
        `}
      >
        <Icon name="check" size={13} />
      </span>

      <span
        className={`text-sm ${
          complete ? 'text-[#083A35] font-medium' : 'text-[#60736F]'
        }`}
      >
        {label}
      </span>
    </div>
  );
}

/* =========================================================
   BOOKING CARD
========================================================= */

function BookingCard({
  booking,
  isArtisan,
  updatingId,
  onStatusChange,
  onReview,
  reviewedIds,
  reviewingId,
  reviewRating,
  setReviewRating,
  reviewComment,
  setReviewComment,
  reviewSubmitting,
  reviewError,
  onSubmitReview,
  onCancelReview,
}: {
  booking: MyBooking;
  isArtisan: boolean;
  updatingId: string | null;
  onStatusChange: (bookingId: string, status: string) => void;
  onReview: (bookingId: string) => void;
  reviewedIds: string[];
  reviewingId?: string | null;
  reviewRating?: number;
  setReviewRating?: (rating: number) => void;
  reviewComment?: string;
  setReviewComment?: (comment: string) => void;
  reviewSubmitting?: boolean;
  reviewError?: string;
  onSubmitReview?: (event: React.FormEvent, bookingId: string) => void;
  onCancelReview?: () => void;
}) {
  const statusLabel = booking.status.replace(/_/g, ' ');

  const statusStyles: Record<string, string> = {
    requested: 'bg-[#FFF3E8] text-[#A94632] border-[#C85A3F]/15',
    accepted: 'bg-[#EDF7F4] text-[#0F4C45] border-[#0F4C45]/10',
    in_progress: 'bg-[#EEF3F7] text-[#315A73] border-[#315A73]/10',
    completed: 'bg-[#EDF7F4] text-[#0F4C45] border-[#0F4C45]/10',
    cancelled: 'bg-red-50 text-red-600 border-red-100',
  };

  return (
    <div className="border border-[#0F4C45]/10 rounded-2xl p-4 sm:p-5 hover:border-[#0F4C45]/20 transition">
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`
                inline-flex items-center gap-1.5
                px-2.5 py-1 rounded-full border
                text-[11px] font-semibold capitalize
                ${
                  statusStyles[booking.status] ||
                  'bg-gray-50 text-gray-600 border-gray-100'
                }
              `}
            >
              {statusLabel}
            </span>

            <span className="text-xs text-[#60736F]">
              {new Date(booking.createdAt).toLocaleDateString()}
            </span>
          </div>

          <h4 className="font-semibold text-[#083A35] mt-3">Service request</h4>

          <p className="text-sm text-[#60736F] mt-1 leading-6">
            {booking.description}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 shrink-0">
          {isArtisan && booking.status === 'requested' && (
            <>
              <button
                onClick={() => onStatusChange(booking._id, 'accepted')}
                disabled={updatingId === booking._id}
                className="px-4 py-2.5 rounded-xl bg-[#C85A3F] hover:bg-[#A94632] disabled:opacity-60 text-white text-xs font-semibold transition"
              >
                {updatingId === booking._id ? 'Updating...' : 'Accept'}
              </button>

              <button
                onClick={() => onStatusChange(booking._id, 'cancelled')}
                disabled={updatingId === booking._id}
                className="px-4 py-2.5 rounded-xl border border-[#0F4C45]/15 text-[#083A35] hover:border-[#0F4C45]/30 text-xs font-semibold transition"
              >
                Decline
              </button>
            </>
          )}

          {isArtisan && booking.status === 'accepted' && (
            <button
              onClick={() => onStatusChange(booking._id, 'in_progress')}
              disabled={updatingId === booking._id}
              className="px-4 py-2.5 rounded-xl bg-[#C85A3F] hover:bg-[#A94632] disabled:opacity-60 text-white text-xs font-semibold transition"
            >
              {updatingId === booking._id ? 'Updating...' : 'Start job'}
            </button>
          )}

          {isArtisan && booking.status === 'in_progress' && (
            <button
              onClick={() => onStatusChange(booking._id, 'completed')}
              disabled={updatingId === booking._id}
              className="px-4 py-2.5 rounded-xl bg-[#0F4C45] hover:bg-[#083A35] disabled:opacity-60 text-white text-xs font-semibold transition"
            >
              {updatingId === booking._id ? 'Updating...' : 'Mark completed'}
            </button>
          )}
        </div>
      </div>

      {!isArtisan && booking.status === 'completed' && (
        <div className="mt-5 pt-5 border-t border-[#0F4C45]/10">
          {reviewedIds.includes(booking._id) ? (
            <p className="text-sm text-[#0F4C45] font-medium flex items-center gap-2">
              <span className="h-6 w-6 rounded-full bg-[#0F4C45] text-white flex items-center justify-center">
                <Icon name="check" size={13} />
              </span>
              Review submitted. Thank you.
            </p>
          ) : reviewingId === booking._id ? (
            <form
              onSubmit={(event) => onSubmitReview?.(event, booking._id)}
              className="space-y-4"
            >
              <div>
                <p className="text-sm font-semibold text-[#083A35]">
                  How was the job?
                </p>

                <div className="flex gap-1 mt-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setReviewRating?.(star)}
                      aria-label={`${star} star${star === 1 ? '' : 's'}`}
                      className={`h-11 w-11 rounded-lg flex items-center justify-center transition ${
                        star <= (reviewRating || 5)
                          ? 'bg-[#FFF3E8] text-[#C85A3F]'
                          : 'bg-[#F8F3E8] text-[#60736F]/30'
                      }`}
                    >
                      <Icon name="star" size={18} />
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                value={reviewComment || ''}
                onChange={(event) => setReviewComment?.(event.target.value)}
                placeholder="Tell us about your experience. Your comment is optional."
                rows={4}
                className="form-input"
              />

              {reviewError && (
                <p className="text-sm text-red-600">{reviewError}</p>
              )}

              <div className="flex flex-wrap gap-2">
                <button
                  type="submit"
                  disabled={reviewSubmitting}
                  className="px-4 py-2.5 rounded-xl bg-[#C85A3F] text-white text-xs font-semibold disabled:opacity-60"
                >
                  {reviewSubmitting ? 'Submitting...' : 'Submit review'}
                </button>

                <button
                  type="button"
                  onClick={onCancelReview}
                  className="px-4 py-2.5 rounded-xl border border-[#0F4C45]/15 text-[#083A35] text-xs font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => onReview(booking._id)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#C85A3F]/30 text-[#C85A3F] hover:bg-[#FFF3E8] text-xs font-semibold transition"
            >
              <Icon name="star" size={14} />
              Leave a review
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: {
  icon: Parameters<typeof Icon>[0]['name'];
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="text-center max-w-md mx-auto py-10">
      <div className="h-14 w-14 mx-auto rounded-2xl bg-[#F8F3E8] text-[#0F4C45] flex items-center justify-center">
        <Icon name={icon} size={24} />
      </div>

      <h3 className="font-display text-xl text-[#083A35] mt-5">{title}</h3>

      <p className="text-sm text-[#60736F] mt-2 leading-6">{description}</p>

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0F4C45] text-white text-xs font-semibold hover:bg-[#083A35] transition"
        >
          {actionLabel}
          <Icon name="arrow" size={14} />
        </button>
      )}
    </div>
  );
}

/* =========================================================
   LOADING
========================================================= */

function LoadingBlock() {
  return (
    <div className="py-12 flex flex-col items-center justify-center">
      <div className="h-9 w-9 rounded-full border-2 border-[#0F4C45]/15 border-t-[#C85A3F] animate-spin" />

      <p className="text-sm text-[#60736F] mt-4">Loading...</p>
    </div>
  );
}

/* =========================================================
   SETTING ROW
========================================================= */

function SettingRow({
  title,
  description,
  enabled,
  onChange,
}: {
  title: string;
  description: string;
  enabled: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-5 py-5">
      <div>
        <p className="text-sm font-semibold text-[#083A35]">{title}</p>

        <p className="text-xs text-[#60736F] mt-1 leading-5 max-w-xl">
          {description}
        </p>
      </div>

      <button
        type="button"
        onClick={() => onChange(!enabled)}
        aria-pressed={enabled}
        className={`
          relative w-12 h-7 shrink-0 rounded-full transition
          ${enabled ? 'bg-[#0F4C45]' : 'bg-[#B6C2BF]'}
        `}
      >
        <span
          className={`
            absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform
            ${enabled ? 'translate-x-6' : 'translate-x-1'}
          `}
        />
      </button>
    </div>
  );
}