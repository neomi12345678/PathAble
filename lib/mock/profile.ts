import type { Profile } from "@/types";
import { DEMO_USER_ID } from "./constants";

export const mockProfile: Profile = {
  id: DEMO_USER_ID,
  email: "danny.cohen@gmail.com",
  first_name: "דני",
  last_name: "כהן",
  phone: "050-1234567",
  age: 28,
  city: "תל אביב",
  sector: "חילוני",
  disability_type: "ADHD",
  role: "user",
  created_at: "2025-01-15T10:00:00Z",
};
