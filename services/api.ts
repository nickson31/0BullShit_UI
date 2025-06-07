interface ChatRequest {
  project_id: string;
  message: string;
}

interface ChatResponse {
  type: string;
  content: string;
  message?: string;
}

interface ProjectData {
  id: string;
  user_id: string;
  project_name: string;
  project_description: string;
  kpi_data: Record<string, any>;
  status: string;
}

interface ProjectResponse {
  project: ProjectData;
  chat_history: Array<{
    role: "user" | "assistant";
    content: string;
    timestamp: string;
  }>;
  saved_investors_count: number;
  user_plan: string;
}

interface Investor {
  id: string;
  Company_Name: string;
  Company_Description: string;
  Investing_Stage: string;
  Company_Location: string;
  Investment_Categories: string[];
  Company_Email: string;
  Company_Phone: string;
  Company_Linkedin: string;
  Company_Website: string;
  Score?: string;
}

interface SavedInvestorsResponse {
  saved_investors: Investor[];
}

export const api = {
  async chat(request: ChatRequest): Promise<ChatResponse> {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error("Failed to send message");
    }

    return response.json();
  },

  async getProject(projectId: string): Promise<ProjectResponse> {
    const response = await fetch(`/api/projects/${projectId}`);

    if (!response.ok) {
      throw new Error("Failed to fetch project");
    }

    return response.json();
  },

  async updateProjectStatus(projectId: string, status: string): Promise<void> {
    const response = await fetch(`/api/projects/${projectId}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });

    if (!response.ok) {
      throw new Error("Failed to update project status");
    }
  },

  async updateProjectKPI(projectId: string, kpiData: Record<string, any>): Promise<void> {
    const response = await fetch(`/api/projects/${projectId}/kpi`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kpi_data: kpiData })
    });

    if (!response.ok) {
      throw new Error("Failed to update KPI data");
    }
  },

  async getSavedInvestors(projectId: string): Promise<SavedInvestorsResponse> {
    const response = await fetch(`/api/projects/${projectId}/saved-investors`);

    if (!response.ok) {
      throw new Error("Failed to fetch saved investors");
    }

    return response.json();
  },

  async findInvestors(query: string): Promise<Investor[]> {
    const response = await fetch("/api/find_investors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query })
    });

    if (!response.ok) {
      throw new Error("Failed to search investors");
    }

    return response.json();
  }
}; 