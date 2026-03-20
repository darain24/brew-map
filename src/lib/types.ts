/** Core type definitions for BrewMap cafe finder app */

export type Cafe = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address: string;
  tags: {
    wifi: boolean;
    outdoor: boolean;
    petFriendly: boolean;
    quiet: boolean;
    studyFriendly: boolean;
  };
  openingHours: string | null;
  phone: string | null;
  website: string | null;
};

export type SearchLocation = {
  lat: number;
  lng: number;
  label: string;
};

export type Review = {
  id: string;
  userId: string;
  cafeOsmId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  userEmail?: string;
  userFullName?: string;
};

export type Favorite = {
  id: string;
  userId: string;
  cafeOsmId: string;
  cafeName: string | null;
  cafeLat: number | null;
  cafeLng: number | null;
  createdAt: string;
};

export type Profile = {
  id: string;
  email: string | null;
  fullName: string | null;
  avatarUrl: string | null;
  role: string;
};
