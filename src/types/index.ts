export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  firstLoginAt: Date;
  lastLoginAt: Date;
  reviewedByAdmin: boolean;
  settings: {
    locationDefaultOn: boolean;
  };
}

export interface FlowerRecord {
  id: string;
  userId: string;
  photoLocalKey: string;
  flowerName: string;
  flowerNameOriginal: string;
  candidates: Candidate[];
  confidence: number;
  capturedAt: Date;
  location: GeoLocation | null;
  isLocationRecorded: boolean;
}

export interface Candidate {
  name: string;
  confidence: number;
}

export interface GeoLocation {
  latitude: number;
  longitude: number;
}

export interface ApiUsage {
  userId: string;
  date: string;
  count: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  requiredCount: number;
  icon: string;
}

export interface WikipediaResult {
  title: string;
  extract: string;
  pageUrl: string;
  thumbnailUrl?: string;
}
