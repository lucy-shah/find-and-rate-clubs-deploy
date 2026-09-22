import axios from "axios";
// Configure API base URL
const API_BASE_URL = "http://localhost:8000";
import type { Club } from "../Classes/Club";
// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interfaces matching backend

export interface Rating {
  rating_id: number;
  club_id: number;
  user_id: number;
  rating_score: number;
  review_text: string | null;
  created_at: string;
  updated_at: string;
}

export interface User {
  user_id: number;
  email: string;
  username: string;
  is_northeastern_student: boolean;
}

// Club API calls
export const clubAPI = {
  getAllClubs: async (): Promise<Club[]> => {
    const response = await api.get("/api/clubs/");
    return response.data;
  },

  searchClubs: async (query: string): Promise<Club[]> => {
    const response = await api.get("/api/clubs/search", {
      params: { q: query },
    });
    return response.data;
  },

  getClubById: async (clubId: number): Promise<Club> => {
    const response = await api.get(`/api/clubs/${clubId}`);
    return response.data;
  },
};

// Rating API calls
export const ratingAPI = {
  createRating: async (
    clubId: number,
    userId: number,
    score: number,
    review: string | null = null
  ): Promise<Rating> => {
    const response = await api.post("/api/ratings/", {
      club_id: clubId,
      user_id: userId,
      rating_score: score,
      review_text: review,
    });
    return response.data;
  },

  getClubRatings: async (clubId: number): Promise<Rating[]> => {
    const response = await api.get(`/api/ratings/club/${clubId}`);
    return response.data;
  },

  getRatingById: async (ratingId: number): Promise<Rating> => {
    const response = await api.get(`/api/ratings/${ratingId}`);
    return response.data;
  },
};

// Authentication API calls
export const authAPI = {
  register: async (
    email: string,
    username: string,
    password: string,
    isNortheasternStudent: boolean = false
  ): Promise<User> => {
    const response = await api.post("/api/auth/register", {
      email,
      username,
      password,
      is_northeastern_student: isNortheasternStudent,
    });
    return response.data;
  },

  login: async (username: string, password: string): Promise<any> => {
    const response = await api.post("/api/auth/login", null, {
      params: { username, password },
    });
    return response.data;
  },

  getUser: async (userId: number): Promise<User> => {
    const response = await api.get(`/api/auth/user/${userId}`);
    return response.data;
  },
};

export default api;
