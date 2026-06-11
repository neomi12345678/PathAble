import type { SavedProfession, UserProgress } from "@/types";
import { DEMO_USER_ID } from "./constants";

export const mockSavedProfessions: SavedProfession[] = [
  {
    id: "saved-001",
    user_id: DEMO_USER_ID,
    profession_id: "prof-001",
    created_at: "2025-02-12T10:00:00Z",
  },
  {
    id: "saved-002",
    user_id: DEMO_USER_ID,
    profession_id: "prof-004",
    created_at: "2025-02-14T10:00:00Z",
  },
  {
    id: "saved-003",
    user_id: DEMO_USER_ID,
    profession_id: "prof-013",
    created_at: "2025-02-18T10:00:00Z",
  },
];

export const mockUserProgress: UserProgress[] = [
  {
    id: "prog-001",
    user_id: DEMO_USER_ID,
    module_id: "learn-001",
    module_type: "learning",
    progress: 100,
    completed: true,
    updated_at: "2025-02-15T09:00:00Z",
  },
  {
    id: "prog-002",
    user_id: DEMO_USER_ID,
    module_id: "learn-004",
    module_type: "learning",
    progress: 60,
    completed: false,
    updated_at: "2025-02-20T11:00:00Z",
  },
  {
    id: "prog-003",
    user_id: DEMO_USER_ID,
    module_id: "skill-001",
    module_type: "skill",
    progress: 100,
    completed: true,
    updated_at: "2025-02-16T14:00:00Z",
  },
  {
    id: "prog-004",
    user_id: DEMO_USER_ID,
    module_id: "skill-002",
    module_type: "skill",
    progress: 40,
    completed: false,
    updated_at: "2025-02-22T16:00:00Z",
  },
];
