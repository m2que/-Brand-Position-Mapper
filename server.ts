import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize GoogleGenAI client with GEMINI_API_KEY from environment
const getAiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not configured.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// API Endpoint for Brand Mapping
app.post("/api/brand-map", async (req, res) => {
  try {
    const { brandName, scope } = req.body;

    if (!brandName || typeof brandName !== 'string' || !brandName.trim()) {
      res.status(400).json({ error: "Brand name is required." });
      return;
    }

    const ai = getAiClient();

    const prompt = `
    You are a world-class market research analyst. Your task is to create a brand perception map for the brand "${brandName}" with the scope "${scope || 'Global'}".

    OBJECTIVE: Return the "Top 10%" most authoritative insights using a "Positive Selection" strategy.

    CRITICAL RULE: QUALITY > SPECIFICITY
    It is better to provide high-quality "Industry Average" data than low-quality "Brand Specific" data.

    STEP 1: CONTEXTUAL EXPANSION
    If "${brandName}" is a specific brand, identify its broader industry.
    SEARCH STRATEGY: Search for the specific brand first.
    DECISION POINT: If the only sources for the brand are user-generated or low quality, DISCARD THEM and use data from the BROADER INDUSTRY instead.

    STEP 2: SOURCE SELECTION & CATEGORIZATION
    You MUST use the Google Search tool.
    You MUST populate the 'references' object in the JSON output.
    You MUST categorize every source into one of the 6 allowed categories.

    FILTERING RULES:
    - CHECK RELEVANCE: Do NOT include system artifacts like "Current time", "Weather", "Google Maps", or generic search pages. Only include actual content pages used for the analysis.
    - STRICT LIMIT: Include a MAXIMUM of 3 references per category.
    - VERIFICATION: Copy the URL exactly as provided by search results. Do not invent URLs.

    THE 6 ALLOWED CATEGORIES:
    1. official_brand: Official Company/Brand Websites (About Us, Annual Reports, Brand Reports, News, Press releases).
    2. government: Official Government sites (.gov, Census, UN, WHO).
    3. industry_databases: Major Market Databases (Statista, McKinsey, Gartner, Deloitte).
    4. news_media: Tier-1 News (Reuters, Bloomberg, NYT, FT).
    5. academic_research: Academic papers (.edu, Google Scholar).
    6. marketing_reports: Reputable industry/trade association reports.

    STEP 3: OUTPUT
    Respond with ONLY a valid JSON object wrapped in a markdown code block (\`\`\`json ... \`\`\`). Do not include any other text before or after the code block.
    Structure:
    {
      "scope": "${scope || 'Global'}",
      "xAxisLabel": "string (e.g. Price: Low to High)",
      "yAxisLabel": "string (e.g. Innovation: Traditional to Modern)",
      "brands": [
        {
          "name": "string (Brand name)",
          "x": number (-10 to 10),
          "y": number (-10 to 10),
          "isTarget": boolean (true for "${brandName}", false for competitors)
        }
      ],
      "references": {
        "official_brand": [{ "title": "string", "url": "string" }],
        "government": [{ "title": "string", "url": "string" }],
        "industry_databases": [{ "title": "string", "url": "string" }],
        "news_media": [{ "title": "string", "url": "string" }],
        "academic_research": [{ "title": "string", "url": "string" }],
        "marketing_reports": [{ "title": "string", "url": "string" }]
      }
    }

    - **xAxisLabel** & **yAxisLabel**: Identify the two most critical perceptual dimensions.
    - **brands**: Identify "${brandName}" and 4-5 key competitors. Assign scores (-10 to 10).
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    let jsonText = (response.text || "").trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.slice(7);
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.slice(3);
    }
    if (jsonText.endsWith('```')) {
      jsonText = jsonText.slice(0, -3);
    }

    const parsedData = JSON.parse(jsonText.trim());
    res.json(parsedData);
  } catch (error: any) {
    console.error("Error in /api/brand-map:", error);
    res.status(500).json({
      error: error.message || "Failed to generate brand position map. Please check your API key configuration and try again."
    });
  }
});

// Vite middleware for development or static serving for production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('(.*)', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
