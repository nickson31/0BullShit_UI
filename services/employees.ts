const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://zerobs-back-final.onrender.com"

export const employeeService = {
  async getAll(): Promise<any[]> {
    try {
      console.log("Fetching all employees using search with empty query")

      // Use search endpoint with empty query to get all employees
      const response = await fetch(`${API_BASE_URL}/search/employees`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ query: "" }),
      })

      console.log("Response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Response error:", errorText)
        throw new Error(`Failed to fetch employees: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log("Employees data received:", data)
      return data
    } catch (error) {
      console.error("Error fetching all employees:", error)
      return []
    }
  },

  async getById(id: string): Promise<any | null> {
    try {
      // Since there's no specific endpoint for getting by ID, we'll search and filter
      const allEmployees = await this.getAll()
      return allEmployees.find((emp) => emp.id === id) || null
    } catch (error) {
      console.error(`Error fetching employee by ID ${id}:`, error)
      return null
    }
  },

  async search(query: string): Promise<any[]> {
    try {
      console.log("Searching employees with query:", query)

      const response = await fetch(`${API_BASE_URL}/search/employees`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ query }),
      })

      if (!response.ok) {
        throw new Error(`Failed to search employees: ${response.status}`)
      }

      const data = await response.json()
      console.log("Search results:", data)
      return data
    } catch (error) {
      console.error("Error searching employees:", error)
      return []
    }
  },

  async searchByCompany(companyName: string): Promise<any[]> {
    try {
      console.log("Searching employees by company:", companyName)

      // Use the search endpoint with company name as query
      const response = await fetch(`${API_BASE_URL}/search/employees`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ query: companyName }),
      })

      if (!response.ok) {
        throw new Error(`Failed to search employees by company: ${response.status}`)
      }

      const data = await response.json()
      console.log("Company search results:", data)
      return data
    } catch (error) {
      console.error(`Error searching employees by company ${companyName}:`, error)
      return []
    }
  },

  async getSavedEmployees(): Promise<any[]> {
    try {
      console.log("Fetching saved employees")

      const response = await fetch(`${API_BASE_URL}/saved/employees`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch saved employees: ${response.status}`)
      }

      const data = await response.json()
      console.log("Saved employees:", data)
      return data
    } catch (error) {
      console.error("Error fetching saved employees:", error)
      return []
    }
  },

  async saveEmployee(employeeId: string): Promise<void> {
    try {
      console.log("Saving employee:", employeeId)

      const response = await fetch(`${API_BASE_URL}/save/employee`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ employee_id: employeeId }),
      })

      if (!response.ok) {
        throw new Error(`Failed to save employee: ${response.status}`)
      }

      console.log("Employee saved successfully")
    } catch (error) {
      console.error(`Error saving employee ${employeeId}:`, error)
      throw error
    }
  },

  async updateSentiment(employeeId: string, sentiment: "like" | "dislike"): Promise<void> {
    try {
      console.log("Updating employee sentiment:", employeeId, sentiment)

      const response = await fetch(`${API_BASE_URL}/sentiment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          entity_id: employeeId,
          entity_type: "employee",
          sentiment,
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to update employee sentiment: ${response.status}`)
      }

      console.log("Employee sentiment updated successfully")
    } catch (error) {
      console.error(`Error updating employee sentiment ${employeeId}:`, error)
      throw error
    }
  },

  // Legacy method for compatibility - maps to sentiment
  async updateDecisionScore(id: string, score: number): Promise<void> {
    // Convert score to sentiment (scores > 5 = like, <= 5 = dislike)
    const sentiment = score > 5 ? "like" : "dislike"
    return this.updateSentiment(id, sentiment)
  },
}
