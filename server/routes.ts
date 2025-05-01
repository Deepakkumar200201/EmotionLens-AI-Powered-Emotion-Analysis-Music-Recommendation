import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import fs from "fs";
import { analyzeImage } from "./gemini";
import { insertAnalysisSchema } from "@shared/schema";

// Configure multer storage
const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      const uploadDir = path.join(import.meta.dirname, "../uploads");
      
      // Create uploads directory if it doesn't exist
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    
    cb(new Error("Only .jpg, .jpeg, and .png format allowed!"));
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes
  
  // Get analysis history
  app.get("/api/analysis/history", async (req: Request, res: Response) => {
    try {
      const analyses = await storage.getAllAnalyses();
      res.json(analyses);
    } catch (error) {
      console.error("Error fetching analysis history:", error);
      res.status(500).json({ message: "Failed to fetch analysis history" });
    }
  });
  
  // Get analysis by ID
  app.get("/api/analysis/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      const analysis = await storage.getAnalysis(id);
      
      if (!analysis) {
        return res.status(404).json({ message: "Analysis not found" });
      }
      
      res.json(analysis);
    } catch (error) {
      console.error("Error fetching analysis:", error);
      res.status(500).json({ message: "Failed to fetch analysis" });
    }
  });
  
  // Delete analysis by ID
  app.delete("/api/analysis/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      const success = await storage.deleteAnalysis(id);
      
      if (!success) {
        return res.status(404).json({ message: "Analysis not found" });
      }
      
      res.json({ message: "Analysis deleted successfully" });
    } catch (error) {
      console.error("Error deleting analysis:", error);
      res.status(500).json({ message: "Failed to delete analysis" });
    }
  });
  
  // Delete all analyses
  app.delete("/api/analysis", async (req: Request, res: Response) => {
    try {
      const success = await storage.deleteAllAnalyses();
      
      if (!success) {
        return res.status(500).json({ message: "Failed to delete analyses" });
      }
      
      res.json({ message: "All analyses deleted successfully" });
    } catch (error) {
      console.error("Error deleting all analyses:", error);
      res.status(500).json({ message: "Failed to delete analyses" });
    }
  });
  
  // Upload and analyze image
  app.post("/api/analysis", upload.single("image"), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No image file uploaded" });
      }
      
      // Get the file path
      const filePath = req.file.path;
      const fileName = req.file.filename;
      
      // Create a URL for the uploaded file
      const imageUrl = `/uploads/${fileName}`;
      
      // Use Gemini to analyze the image
      const analysisResult = await analyzeImage(filePath);
      
      if (!analysisResult) {
        return res.status(500).json({ message: "Failed to analyze image" });
      }
      
      // Validate the analysis data
      const analysisData = {
        label: analysisResult.label,
        imageUrl,
        emotions: analysisResult.emotions,
        description: analysisResult.description,
        recommendedActivities: analysisResult.recommendedActivities,
        musicSuggestions: analysisResult.musicSuggestions,
      };
      
      // Parse and validate the data
      const validatedData = insertAnalysisSchema.parse(analysisData);
      
      // Save the analysis
      const savedAnalysis = await storage.createAnalysis(validatedData);
      
      res.status(201).json(savedAnalysis);
    } catch (error) {
      console.error("Error analyzing image:", error);
      res.status(500).json({ message: "Failed to analyze image" });
    }
  });
  
  // User endpoints
  app.get("/api/user/:userId", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID format" });
      }
      
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // User Preferences endpoints
  app.get("/api/user/:userId/preferences", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID format" });
      }
      
      // Check if user exists
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Get preferences
      const preferences = await storage.getUserPreferences(userId);
      
      if (!preferences) {
        return res.status(404).json({ message: "Preferences not found for this user" });
      }
      
      res.json(preferences);
    } catch (error) {
      console.error("Error fetching user preferences:", error);
      res.status(500).json({ message: "Failed to fetch user preferences" });
    }
  });
  
  app.post("/api/user/:userId/preferences", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID format" });
      }
      
      // Check if user exists
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Check if preferences already exist
      const existingPreferences = await storage.getUserPreferences(userId);
      
      if (existingPreferences) {
        return res.status(409).json({ message: "Preferences already exist for this user. Use PATCH to update." });
      }
      
      // Create preferences
      const newPreferences = await storage.createUserPreferences({
        ...req.body,
        userId
      });
      
      res.status(201).json(newPreferences);
    } catch (error) {
      console.error("Error creating user preferences:", error);
      res.status(500).json({ message: "Failed to create user preferences" });
    }
  });
  
  app.patch("/api/user/:userId/preferences", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID format" });
      }
      
      // Check if user exists
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Update preferences
      const updatedPreferences = await storage.updateUserPreferences(userId, req.body);
      
      if (!updatedPreferences) {
        return res.status(404).json({ message: "Preferences not found for this user" });
      }
      
      res.json(updatedPreferences);
    } catch (error) {
      console.error("Error updating user preferences:", error);
      res.status(500).json({ message: "Failed to update user preferences" });
    }
  });
  
  // Emotional Pattern endpoints
  app.get("/api/user/:userId/emotional-patterns", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID format" });
      }
      
      // Check if user exists
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Get patterns
      const patterns = await storage.getEmotionalPatternsByUserId(userId);
      
      res.json(patterns);
    } catch (error) {
      console.error("Error fetching emotional patterns:", error);
      res.status(500).json({ message: "Failed to fetch emotional patterns" });
    }
  });
  
  app.get("/api/user/:userId/emotional-patterns/:id", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const patternId = parseInt(req.params.id);
      
      if (isNaN(userId) || isNaN(patternId)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      // Check if user exists
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Get pattern
      const pattern = await storage.getEmotionalPattern(patternId);
      
      if (!pattern) {
        return res.status(404).json({ message: "Emotional pattern not found" });
      }
      
      // Verify pattern belongs to user
      if (pattern.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(pattern);
    } catch (error) {
      console.error("Error fetching emotional pattern:", error);
      res.status(500).json({ message: "Failed to fetch emotional pattern" });
    }
  });
  
  app.post("/api/user/:userId/emotional-patterns/generate", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const { period } = req.body;
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID format" });
      }
      
      if (!period || !['daily', 'weekly', 'monthly'].includes(period)) {
        return res.status(400).json({ message: "Invalid or missing period. Must be 'daily', 'weekly', or 'monthly'." });
      }
      
      // Check if user exists
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Generate pattern
      const pattern = await storage.generateEmotionalPatterns(userId, period);
      
      res.status(201).json(pattern);
    } catch (error) {
      console.error("Error generating emotional pattern:", error);
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to generate emotional pattern" });
      }
    }
  });
  
  app.delete("/api/user/:userId/emotional-patterns/:id", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const patternId = parseInt(req.params.id);
      
      if (isNaN(userId) || isNaN(patternId)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      // Check if user exists
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Get pattern
      const pattern = await storage.getEmotionalPattern(patternId);
      
      if (!pattern) {
        return res.status(404).json({ message: "Emotional pattern not found" });
      }
      
      // Verify pattern belongs to user
      if (pattern.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // Delete pattern
      const success = await storage.deleteEmotionalPattern(patternId);
      
      if (!success) {
        return res.status(500).json({ message: "Failed to delete emotional pattern" });
      }
      
      res.json({ message: "Emotional pattern deleted successfully" });
    } catch (error) {
      console.error("Error deleting emotional pattern:", error);
      res.status(500).json({ message: "Failed to delete emotional pattern" });
    }
  });
  
  // AI mood improvement suggestions
  app.post("/api/user/:userId/mood-suggestions", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const { emotions, context } = req.body;
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID format" });
      }
      
      // Check if user exists
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Validate request body
      if (!emotions || !Array.isArray(emotions) || emotions.length === 0) {
        return res.status(400).json({ message: "Invalid emotions array" });
      }
      
      // Use Gemini to generate mood improvement suggestions
      const model = await import('./gemini.js').then(gemini => 
        gemini.getGenerativeModel()
      );
      
      // Construct a prompt for mood suggestions
      const prompt = `
        Based on the following emotional state, provide personalized mood improvement suggestions.
        
        Current emotions: ${emotions.map(e => `${e.name} (${Math.round(e.score * 100)}%)`).join(', ')}
        ${context ? `Additional context: ${context}` : ''}
        
        Provide a response in this JSON format:
        {
          "summary": "A brief summary of the emotional state",
          "suggestions": [
            {
              "title": "Suggestion title",
              "description": "Detailed explanation",
              "timeRequired": "Estimated time (e.g., '5 minutes', '1 hour')",
              "category": "Category (e.g., 'Physical', 'Mental', 'Social', 'Creative')"
            },
            // More suggestions...
          ],
          "quickTips": [
            "Short, actionable tip 1",
            "Short, actionable tip 2",
            // More quick tips...
          ],
          "longTermPractices": [
            {
              "title": "Practice title",
              "description": "Description of long-term practice",
              "benefits": "Expected benefits"
            },
            // More long-term practices...
          ]
        }
        
        Format rules:
        1. Provide 3-5 specific suggestions
        2. Suggestions should be practical and actionable
        3. Include a mix of immediate actions and longer-term practices
        4. Provide 3-5 quick tips that take under 5 minutes
        5. Include 2-3 long-term practices
        6. Be sensitive to the emotional state and provide appropriate suggestions
        7. Focus on evidence-based approaches for improving mood
      `;
      
      // Generate suggestions using Gemini
      try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        // Extract the JSON from the response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error("Failed to extract JSON from Gemini response");
        }
        
        const jsonString = jsonMatch[0];
        const suggestionsData = JSON.parse(jsonString);
        
        // Add timestamp and ID
        const moodSuggestions = {
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          emotions,
          ...suggestionsData
        };
        
        res.json(moodSuggestions);
      } catch (error) {
        console.error("Error generating mood suggestions:", error);
        
        // Fallback suggestions if AI generation fails
        const fallbackSuggestions = {
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          emotions,
          summary: "Based on your current emotional state",
          suggestions: [
            {
              title: "Take a mindful walk",
              description: "Go for a 10-minute walk while focusing on your surroundings. Notice the sights, sounds, and sensations.",
              timeRequired: "10 minutes",
              category: "Physical"
            },
            {
              title: "Practice deep breathing",
              description: "Breathe in deeply for 4 counts, hold for 7 counts, and exhale for 8 counts. Repeat 5 times.",
              timeRequired: "5 minutes",
              category: "Mental"
            },
            {
              title: "Listen to uplifting music",
              description: "Play songs that make you feel good and boost your mood.",
              timeRequired: "15 minutes",
              category: "Creative"
            }
          ],
          quickTips: [
            "Drink a glass of water",
            "Stretch your body for 2 minutes",
            "Call or message a friend",
            "Write down 3 things you're grateful for"
          ],
          longTermPractices: [
            {
              title: "Daily meditation practice",
              description: "Start with 5 minutes daily and gradually increase. Focus on your breath and present moment.",
              benefits: "Reduced stress, improved focus, and emotional balance"
            },
            {
              title: "Regular physical exercise",
              description: "Aim for 30 minutes of moderate exercise most days of the week.",
              benefits: "Improved mood, reduced anxiety, and better sleep"
            }
          ]
        };
        
        res.json(fallbackSuggestions);
      }
    } catch (error) {
      console.error("Error in mood suggestions endpoint:", error);
      res.status(500).json({ message: "Failed to generate mood improvement suggestions" });
    }
  });

  // Custom music playlist generation
  app.post("/api/user/:userId/custom-playlist", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const { emotions, limit } = req.body;
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID format" });
      }
      
      // Check if user exists
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Validate request body
      if (!emotions || !Array.isArray(emotions) || emotions.length === 0) {
        return res.status(400).json({ message: "Invalid emotions array" });
      }
      
      // Get user preferences to customize recommendations
      const preferences = await storage.getUserPreferences(userId);
      const musicPreferences = preferences?.musicPreferences || [];
      const trackLimit = limit || 10;
      
      // Combine all tracks from each emotion
      let allTracks: any[] = [];
      
      // Process each emotion and get music recommendations
      for (const emotion of emotions) {
        try {
          // Check if we have Bengali music preferences
          const hasBengaliPreference = musicPreferences.some(genre => 
            genre.toLowerCase().includes('bengali') || 
            genre.toLowerCase().includes('bangla')
          );
          
          let tracks;
          if (hasBengaliPreference) {
            // Try to get Bengali music first
            tracks = await import('./spotify.js').then(spotify => 
              spotify.getBengaliMusicByEmotion(emotion.name)
            );
          }
          
          // If no Bengali tracks or none found, get general recommendations
          if (!tracks || tracks.length === 0) {
            tracks = await import('./gemini.js').then(gemini => 
              gemini.getMusicForEmotion(emotion.name)
            );
          }
          
          // Add weight based on the emotion score
          if (tracks && tracks.length > 0) {
            tracks = tracks.map((track: any) => ({
              ...track,
              emotionScore: emotion.score,
              emotion: emotion.name
            }));
            
            allTracks = [...allTracks, ...tracks];
          }
        } catch (error) {
          console.error(`Error getting music for emotion ${emotion.name}:`, error);
        }
      }
      
      // Sort tracks by emotion score (highest first)
      allTracks.sort((a, b) => b.emotionScore - a.emotionScore);
      
      // Apply user preferences if available
      if (musicPreferences.length > 0) {
        // Boost scores for tracks that match user preferences
        allTracks = allTracks.map(track => {
          const matchesPreference = musicPreferences.some(genre => 
            track.title.toLowerCase().includes(genre.toLowerCase()) || 
            track.artist.toLowerCase().includes(genre.toLowerCase())
          );
          
          return {
            ...track,
            score: matchesPreference ? track.emotionScore * 1.5 : track.emotionScore
          };
        });
        
        // Re-sort after applying preferences
        allTracks.sort((a, b) => b.score - a.score);
      }
      
      // Take limited number of tracks
      const playlist = allTracks.slice(0, trackLimit);
      
      // Create a playlist object
      const customPlaylist = {
        id: Date.now().toString(),
        name: `Custom Playlist: ${emotions.map(e => e.name).join(', ')}`,
        description: `Playlist based on your ${emotions.map(e => e.name).join(', ')} emotions`,
        tracks: playlist,
        createdAt: new Date().toISOString()
      };
      
      res.json(customPlaylist);
    } catch (error) {
      console.error("Error generating custom playlist:", error);
      res.status(500).json({ message: "Failed to generate custom playlist" });
    }
  });

  // User-specific analysis endpoints
  app.get("/api/user/:userId/analyses", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID format" });
      }
      
      // Check if user exists
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Get analyses
      const analyses = await storage.getAnalysesByUserId(userId);
      
      res.json(analyses);
    } catch (error) {
      console.error("Error fetching user analyses:", error);
      res.status(500).json({ message: "Failed to fetch user analyses" });
    }
  });
  
  // Serve uploaded files
  app.use("/uploads", express.static(path.join(import.meta.dirname, "../uploads")));
  
  const httpServer = createServer(app);
  return httpServer;
}
