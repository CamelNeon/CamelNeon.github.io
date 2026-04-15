export interface PageVersion {
  id: string;
  timestamp: number;
  code: string;
  prompt: string;
}

export async function updatePageCode(currentCode: string, userPrompt: string, modelId: string = "gemini-flash"): Promise<{ code: string; explanation: string; safetyCheck: boolean }> {
  try {
    const apiUrl = import.meta.env.VITE_API_URL;
    
    if (!apiUrl) {
      throw new Error("VITE_API_URL is not defined. Please check your environment variables and rebuild the app.");
    }

    const response = await fetch(`${apiUrl}/api/update-page`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ currentCode, userPrompt, modelId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to fetch from server");
    }

    const result = await response.json();
    return {
      code: result.code || currentCode,
      explanation: result.explanation || "No explanation provided.",
      safetyCheck: result.safetyCheck ?? true
    };
  } catch (error: any) {
    console.error("Error calling backend API:", error);
    
    return {
      code: currentCode,
      explanation: error.message || "Failed to process request. Please try again.",
      safetyCheck: false
    };
  }
}