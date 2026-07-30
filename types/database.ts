export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          first_name: string | null;
          last_name: string | null;
          phone: string | null;
          age: number | null;
          city: string | null;
          sector: string | null;
          disability_type: string | null;
          autism_level: string | null;
          role: string;
          avatar: string | null;
          onboarding_complete: boolean;
          bio: string | null;
          interests: string[] | null;
          skills: string[] | null;
          created_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          first_name?: string | null;
          last_name?: string | null;
          phone?: string | null;
          age?: number | null;
          city?: string | null;
          sector?: string | null;
          disability_type?: string | null;
          autism_level?: string | null;
          role?: string;
          avatar?: string | null;
          onboarding_complete?: boolean;
          bio?: string | null;
          interests?: string[] | null;
          skills?: string[] | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          first_name?: string | null;
          last_name?: string | null;
          phone?: string | null;
          age?: number | null;
          city?: string | null;
          sector?: string | null;
          disability_type?: string | null;
          autism_level?: string | null;
          role?: string;
          avatar?: string | null;
          onboarding_complete?: boolean;
          bio?: string | null;
          interests?: string[] | null;
          skills?: string[] | null;
          created_at?: string;
        };
        Relationships: [];
      };
      questions: {
        Row: {
          slug: string;
          title: string;
          category: string;
          weight: number;
          active: boolean;
        };
        Insert: {
          slug: string;
          title: string;
          category: string;
          weight: number;
          active?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["questions"]["Row"]>;
      };
      professions: {
        Row: {
          slug: string;
          name: string;
          description: string;
          salary_range: string;
          education: string;
          skills: string[];
          work_environment: string;
          social_interaction_level: string;
          disability_fit: string[];
          video_url: string | null;
          active: boolean;
        };
        Insert: Database["public"]["Tables"]["professions"]["Row"];
        Update: Partial<Database["public"]["Tables"]["professions"]["Row"]>;
      };
      jobs: {
        Row: {
          slug: string;
          title: string;
          company: string;
          city: string;
          description: string;
          salary: string;
          apply_url: string;
          work_from_home: boolean;
          accessibility: boolean;
          scope: string;
          social_interaction_level: string;
          support_features: string[];
          autism_match_reason: string;
          disability_fit: string[];
          profession_id: string | null;
          active: boolean;
          created_at: string;
        };
        Insert: {
          slug: string;
          title: string;
          company: string;
          city: string;
          description: string;
          salary: string;
          apply_url: string;
          work_from_home?: boolean;
          accessibility?: boolean;
          scope: string;
          social_interaction_level?: string;
          support_features?: string[];
          autism_match_reason?: string;
          disability_fit?: string[];
          profession_id?: string | null;
          active?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["jobs"]["Row"]>;
      };
      learning_modules: {
        Row: {
          slug: string;
          title: string;
          category: string;
          description: string | null;
          video_url: string | null;
          order_index: number;
          content_json: Json | null;
        };
        Insert: Database["public"]["Tables"]["learning_modules"]["Row"];
        Update: Partial<Database["public"]["Tables"]["learning_modules"]["Row"]>;
      };
      skills_modules: {
        Row: {
          slug: string;
          title: string;
          description: string;
          difficulty: string;
          order_index: number;
          content_json: Json | null;
        };
        Insert: Database["public"]["Tables"]["skills_modules"]["Row"];
        Update: Partial<Database["public"]["Tables"]["skills_modules"]["Row"]>;
      };
      user_progress: {
        Row: {
          id: string;
          user_id: string;
          module_id: string;
          module_type: string;
          progress: number;
          completed: boolean;
          progress_meta: Json | null;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["user_progress"]["Row"]> & {
          user_id: string;
          module_id: string;
          module_type: string;
        };
        Update: Partial<Database["public"]["Tables"]["user_progress"]["Row"]>;
      };
      chat_sessions: {
        Row: {
          id: string;
          user_id: string;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["chat_sessions"]["Row"]> & {
          user_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["chat_sessions"]["Row"]>;
      };
      chat_messages: {
        Row: {
          id: string;
          session_id: string;
          role: string;
          message: string;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["chat_messages"]["Row"]> & {
          session_id: string;
          role: string;
          message: string;
        };
        Update: Partial<Database["public"]["Tables"]["chat_messages"]["Row"]>;
      };
      saved_professions: {
        Row: {
          id: string;
          user_id: string;
          profession_slug: string;
          created_at: string;
        };
        Insert: Partial<
          Database["public"]["Tables"]["saved_professions"]["Row"]
        > & {
          user_id: string;
          profession_slug: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["saved_professions"]["Row"]
        >;
      };
      assessment_results: {
        Row: {
          id: string;
          user_id: string;
          summary: string;
          strengths: string[];
          challenges: string[];
          recommendations: string[];
          created_at: string;
        };
        Insert: Partial<
          Database["public"]["Tables"]["assessment_results"]["Row"]
        > & {
          user_id: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["assessment_results"]["Row"]
        >;
      };
      achievement_badges: {
        Row: {
          slug: string;
          title: string;
          description: string;
          icon: string;
          category: string;
        };
        Insert: Database["public"]["Tables"]["achievement_badges"]["Row"];
        Update: Partial<
          Database["public"]["Tables"]["achievement_badges"]["Row"]
        >;
      };
      achievements: {
        Row: {
          id: string;
          user_id: string;
          badge_slug: string;
          earned_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["achievements"]["Row"]> & {
          user_id: string;
          badge_slug: string;
        };
        Update: Partial<Database["public"]["Tables"]["achievements"]["Row"]>;
      };
      rights_topics: {
        Row: {
          slug: string;
          title: string;
          content: string;
          order_index: number;
        };
        Insert: Database["public"]["Tables"]["rights_topics"]["Row"];
        Update: Partial<Database["public"]["Tables"]["rights_topics"]["Row"]>;
      };
      rights_faqs: {
        Row: {
          slug: string;
          question: string;
          answer: string;
          order_index: number;
        };
        Insert: Database["public"]["Tables"]["rights_faqs"]["Row"];
        Update: Partial<Database["public"]["Tables"]["rights_faqs"]["Row"]>;
      };
      rights_organizations: {
        Row: {
          slug: string;
          name: string;
          description: string;
          phone: string | null;
          url: string | null;
          order_index: number;
        };
        Insert: Database["public"]["Tables"]["rights_organizations"]["Row"];
        Update: Partial<
          Database["public"]["Tables"]["rights_organizations"]["Row"]
        >;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
