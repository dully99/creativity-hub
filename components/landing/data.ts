export const NAV_LINKS = ["Home", "About", "Services", "Movies", "Music", "Creators", "Help"];

export const CATEGORIES = [
  { label: "All Professionals", icon: "users" },
  { label: "Producers", icon: "clapperboard" },
  { label: "Directors", icon: "video" },
  { label: "Actors", icon: "drama" },
  { label: "Musicians", icon: "music" },
  { label: "Writers", icon: "pen" },
  { label: "Cinematographers", icon: "camera" },
  { label: "Editors", icon: "scissors" },
  { label: "Art & Design", icon: "palette" },
  { label: "More", icon: "more" },
] as const;

export const PROFESSIONALS = [
  { name: "Neema Kileo", role: "Film Producer", location: "Dar es Salaam" },
  { name: "James Mhando", role: "Director", location: "Arusha" },
  { name: "Asha Ramadhani", role: "Actor", location: "Dodoma" },
  { name: "Kelvin Mbassa", role: "Music Producer", location: "Dar es Salaam" },
  { name: "Zainabu Ally", role: "Script Writer", location: "Zanzibar" },
  { name: "Faraji Omary", role: "Cinematographer", location: "Mwanza" },
];

export const CONTENT_FILTERS = ["All", "Movies", "Series", "Music", "Documentaries", "Short Films", "Trailers"];

export const CONTENT = [
  { title: "The Journey Home", type: "Movie", genre: "Drama", year: 2024, studio: "Neema Films", duration: "1:42:00", color: "from-orange-500 to-amber-900", badge: "bg-blue-600" },
  { title: "Sauti Yetu", type: "Music", genre: "Afro Pop", year: 2024, studio: "Zawadi Music", duration: "4:28", color: "from-yellow-500 to-emerald-800", badge: "bg-green-600" },
  { title: "Mtaani - Season 1", type: "Series", genre: "Comedy", year: 2024, studio: "Swahili Studios", duration: "28:15", color: "from-slate-500 to-slate-900", badge: "bg-blue-600" },
  { title: "Tanzania: Our Heritage", type: "Documentary", genre: "Documentary", year: 2023, studio: "Tanzania Creatives", duration: "52:30", color: "from-sky-500 to-amber-800", badge: "bg-blue-600" },
  { title: "Ndoto Zinawezekana", type: "Short Film", genre: "Motivation", year: 2024, studio: "Kisima Productions", duration: "18:40", color: "from-teal-500 to-stone-900", badge: "bg-orange-500" },
  { title: "Raha ya Leo", type: "Music", genre: "Bongo Flava", year: 2024, studio: "THT Music", duration: "3:56", color: "from-red-600 to-zinc-900", badge: "bg-green-600" },
];

export const FOOTER_COLUMNS = [
  { title: "Quick Links", links: ["Home", "About", "Services", "Creators"] },
  { title: "Content", links: ["Movies", "Music", "Series", "Documentaries"] },
  { title: "Support", links: ["Help Center", "Contact Us", "FAQs", "Report Content"] },
];
