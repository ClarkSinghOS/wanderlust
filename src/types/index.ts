export interface Trip {
  id: string;
  user_id: string;
  country: string | null;
  city: string | null;
  date_visited: string | null;
  stamp_image_url: string | null;
  extracted_data: Record<string, unknown> | null;
  created_at: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

export interface TripStats {
  trip_count: number;
  countries_visited: string[];
  unique_country_count: number;
  date_range: {
    earliest: string | null;
    latest: string | null;
  };
}

export interface StampExtraction {
  country: string | null;
  city: string | null;
  date: string | null;
  type: 'entry' | 'exit' | 'unknown';
  confidence: number;
  raw_text: string;
}
