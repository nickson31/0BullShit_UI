export interface Employee {
  id: string
  fullName: string
  email: string | null
  headline: string | null
  about: string | null
  current_company_name: string | null
  current_company_website: string | null
  current_company_industry: string | null
  current_company_size: string | null
  current_company_founded_in: string | null
  current_job_title: string | null
  current_job_duration_years: string | null
  decision_score: number | null

  // Education
  education_0_degree: string | null
  education_0_institution: string | null
  education_1_degree: string | null
  education_1_institution: string | null

  // Experience
  experience_0_company: string | null
  experience_0_title: string | null
  experience_0_duration_years: string | null
  experience_0_location: string | null
  experience_1_company: string | null
  experience_1_title: string | null
  experience_1_duration_years: string | null
  experience_1_location: string | null
  experience_2_company: string | null
  experience_2_title: string | null
  experience_2_duration_years: string | null
  experience_2_location: string | null
}

// Remove Database type since we're not using Supabase directly
