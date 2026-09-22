export interface Club {
  id: number;
  club_id: number | null;
  name: string | null;
  campus: string | null;
  org_type: string | null;
  categories: string[];
  mission: string | null;
  logo_url: string | null;
  profile_url: string | null;
  created_at: string;
  // Legacy fields kept for compatibility with ratings/filters
  number_of_ratings: number;
  average_rating: number;
}

export const defaultClubs: Club[] = [];