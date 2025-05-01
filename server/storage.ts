import {
  users,
  type User,
  type InsertUser,
  analyses,
  type Analysis,
  type InsertAnalysis,
  userPreferences,
  type UserPreferences,
  type InsertUserPreferences,
  emotionalPatterns,
  type EmotionalPattern,
  type InsertEmotionalPattern,
  type Emotion
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;
  
  // Analysis methods
  getAnalysis(id: number): Promise<Analysis | undefined>;
  getAllAnalyses(): Promise<Analysis[]>;
  getAnalysesByUserId(userId: number): Promise<Analysis[]>;
  createAnalysis(analysis: InsertAnalysis): Promise<Analysis>;
  deleteAnalysis(id: number): Promise<boolean>;
  deleteAllAnalyses(): Promise<boolean>;
  
  // User Preferences methods
  getUserPreferences(userId: number): Promise<UserPreferences | undefined>;
  createUserPreferences(preferences: InsertUserPreferences): Promise<UserPreferences>;
  updateUserPreferences(userId: number, preferences: Partial<UserPreferences>): Promise<UserPreferences | undefined>;
  
  // Emotional Pattern methods
  getEmotionalPattern(id: number): Promise<EmotionalPattern | undefined>;
  getEmotionalPatternsByUserId(userId: number): Promise<EmotionalPattern[]>;
  createEmotionalPattern(pattern: InsertEmotionalPattern): Promise<EmotionalPattern>;
  updateEmotionalPattern(id: number, pattern: Partial<EmotionalPattern>): Promise<EmotionalPattern | undefined>;
  deleteEmotionalPattern(id: number): Promise<boolean>;
  
  // Pattern Analysis methods
  generateEmotionalPatterns(userId: number, period: string): Promise<EmotionalPattern>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private analyses: Map<number, Analysis>;
  private userPreferences: Map<number, UserPreferences>;
  private emotionalPatterns: Map<number, EmotionalPattern>;
  private userId: number;
  private analysisId: number;
  private preferencesId: number;
  private patternId: number;
  
  constructor() {
    this.users = new Map();
    this.analyses = new Map();
    this.userPreferences = new Map();
    this.emotionalPatterns = new Map();
    this.userId = 1;
    this.analysisId = 1;
    this.preferencesId = 1;
    this.patternId = 1;
    
    // Create a default user for testing
    this.createDefaultUser();
  }
  
  private async createDefaultUser() {
    // Add a default user if none exists
    if (this.users.size === 0) {
      const defaultUser: InsertUser = {
        username: "testuser",
        password: "password", // In a real app, this would be hashed
        firstName: "Test",
        lastName: "User",
        email: "test@example.com",
        profilePicture: null,
        createdAt: new Date(),
        lastLogin: new Date(),
        isActive: true
      };
      
      await this.createUser(defaultUser);
    }
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const createdAt = new Date().toISOString();
    const lastLogin = new Date().toISOString();
    const isActive = true;
    
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt, 
      lastLogin, 
      isActive,
      firstName: insertUser.firstName || null,
      lastName: insertUser.lastName || null,
      email: insertUser.email || null,
      profilePicture: insertUser.profilePicture || null
    };
    
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    
    if (!user) {
      return undefined;
    }
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    
    return updatedUser;
  }
  
  // Analysis methods
  async getAnalysis(id: number): Promise<Analysis | undefined> {
    return this.analyses.get(id);
  }
  
  async getAllAnalyses(): Promise<Analysis[]> {
    // Return all analyses sorted by creation date (newest first)
    return Array.from(this.analyses.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
  
  async getAnalysesByUserId(userId: number): Promise<Analysis[]> {
    // Return all analyses for a specific user sorted by creation date (newest first)
    return Array.from(this.analyses.values())
      .filter(analysis => analysis.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  async createAnalysis(insertAnalysis: InsertAnalysis): Promise<Analysis> {
    const id = this.analysisId++;
    const createdAt = new Date().toISOString();
    
    const analysis: Analysis = {
      ...insertAnalysis,
      id,
      createdAt,
    };
    
    this.analyses.set(id, analysis);
    return analysis;
  }
  
  async deleteAnalysis(id: number): Promise<boolean> {
    if (!this.analyses.has(id)) {
      return false;
    }
    
    return this.analyses.delete(id);
  }
  
  async deleteAllAnalyses(): Promise<boolean> {
    this.analyses.clear();
    return true;
  }
  
  // User Preferences methods
  async getUserPreferences(userId: number): Promise<UserPreferences | undefined> {
    return Array.from(this.userPreferences.values()).find(
      (prefs) => prefs.userId === userId
    );
  }
  
  async createUserPreferences(preferences: InsertUserPreferences): Promise<UserPreferences> {
    const id = this.preferencesId++;
    const createdAt = new Date().toISOString();
    const updatedAt = new Date().toISOString();
    
    const userPreference: UserPreferences = {
      ...preferences,
      id,
      createdAt,
      updatedAt
    };
    
    this.userPreferences.set(id, userPreference);
    return userPreference;
  }
  
  async updateUserPreferences(userId: number, preferencesData: Partial<UserPreferences>): Promise<UserPreferences | undefined> {
    const preferences = Array.from(this.userPreferences.values()).find(
      (prefs) => prefs.userId === userId
    );
    
    if (!preferences) {
      return undefined;
    }
    
    const updatedPreferences: UserPreferences = {
      ...preferences,
      ...preferencesData,
      updatedAt: new Date().toISOString()
    };
    
    this.userPreferences.set(preferences.id, updatedPreferences);
    return updatedPreferences;
  }
  
  // Emotional Pattern methods
  async getEmotionalPattern(id: number): Promise<EmotionalPattern | undefined> {
    return this.emotionalPatterns.get(id);
  }
  
  async getEmotionalPatternsByUserId(userId: number): Promise<EmotionalPattern[]> {
    return Array.from(this.emotionalPatterns.values())
      .filter(pattern => pattern.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  async createEmotionalPattern(pattern: InsertEmotionalPattern): Promise<EmotionalPattern> {
    const id = this.patternId++;
    const createdAt = new Date().toISOString();
    
    const emotionalPattern: EmotionalPattern = {
      ...pattern,
      id,
      createdAt
    };
    
    this.emotionalPatterns.set(id, emotionalPattern);
    return emotionalPattern;
  }
  
  async updateEmotionalPattern(id: number, patternData: Partial<EmotionalPattern>): Promise<EmotionalPattern | undefined> {
    const pattern = this.emotionalPatterns.get(id);
    
    if (!pattern) {
      return undefined;
    }
    
    const updatedPattern: EmotionalPattern = {
      ...pattern,
      ...patternData
    };
    
    this.emotionalPatterns.set(id, updatedPattern);
    return updatedPattern;
  }
  
  async deleteEmotionalPattern(id: number): Promise<boolean> {
    if (!this.emotionalPatterns.has(id)) {
      return false;
    }
    
    return this.emotionalPatterns.delete(id);
  }
  
  // Pattern Analysis methods
  async generateEmotionalPatterns(userId: number, period: string): Promise<EmotionalPattern> {
    // Get all analyses for this user
    const userAnalyses = await this.getAnalysesByUserId(userId);
    
    if (userAnalyses.length === 0) {
      throw new Error("No analyses found for this user");
    }
    
    // Determine date range based on period
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case 'daily':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 1);
        break;
      case 'weekly':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case 'monthly':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
        break;
      default:
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 30); // Default to last 30 days
    }
    
    // Filter analyses within the time range
    const filteredAnalyses = userAnalyses.filter(
      analysis => new Date(analysis.createdAt) >= startDate && new Date(analysis.createdAt) <= now
    );
    
    if (filteredAnalyses.length === 0) {
      throw new Error(`No analyses found for period: ${period}`);
    }
    
    // Compute dominant emotions
    const emotionScores: Record<string, number[]> = {};
    
    // Collect all emotion scores
    filteredAnalyses.forEach(analysis => {
      analysis.emotions.forEach(emotion => {
        if (!emotionScores[emotion.name]) {
          emotionScores[emotion.name] = [];
        }
        emotionScores[emotion.name].push(emotion.score);
      });
    });
    
    // Calculate average scores for each emotion
    const averageScores: Record<string, number> = {};
    const dominantEmotions: Emotion[] = [];
    
    Object.entries(emotionScores).forEach(([name, scores]) => {
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      averageScores[name] = avg;
      dominantEmotions.push({ name, score: avg });
    });
    
    // Sort dominant emotions by score (highest first)
    dominantEmotions.sort((a, b) => b.score - a.score);
    
    // Calculate emotional stability (variance/standard deviation of emotion scores)
    // Lower variance means more stability
    let totalVariance = 0;
    
    Object.values(emotionScores).forEach(scores => {
      if (scores.length > 1) {
        const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
        const variance = scores.reduce((sum, score) => sum + Math.pow(score - avg, 2), 0) / scores.length;
        totalVariance += variance;
      }
    });
    
    const emotionalStability = Math.max(1, Math.min(10, 10 - Math.sqrt(totalVariance) * 2));
    
    // Count significant mood swings
    let moodSwings = 0;
    
    // For simplicity, count how many times the dominant emotion changed across analyses
    let prevDominantEmotion = null;
    filteredAnalyses.forEach(analysis => {
      const sortedEmotions = [...analysis.emotions].sort((a, b) => b.score - a.score);
      const currentDominant = sortedEmotions[0]?.name;
      
      if (prevDominantEmotion && currentDominant !== prevDominantEmotion) {
        moodSwings++;
      }
      
      prevDominantEmotion = currentDominant;
    });
    
    // Generate insights based on patterns
    let insights = '';
    const topEmotions = dominantEmotions.slice(0, 3);
    
    if (topEmotions.length > 0) {
      insights += `Your dominant emotions during this period were ${topEmotions.map(e => e.name).join(', ')}. `;
    }
    
    if (emotionalStability >= 7) {
      insights += 'Your emotional state has been relatively stable. ';
    } else if (emotionalStability <= 3) {
      insights += 'Your emotional state has shown significant variation. ';
    }
    
    if (moodSwings >= 3) {
      insights += 'You experienced several mood shifts during this period. ';
    }
    
    // Generate recommendations
    let recommendations = '';
    
    if (dominantEmotions[0]?.name === 'Happy' || dominantEmotions[0]?.name === 'Joy') {
      recommendations = 'Continue engaging in activities that bring you joy and satisfaction.';
    } else if (dominantEmotions[0]?.name === 'Sad' || dominantEmotions[0]?.name === 'Depressed') {
      recommendations = 'Consider speaking with someone you trust about your feelings, or engage in activities that have improved your mood in the past.';
    } else if (dominantEmotions[0]?.name === 'Angry' || dominantEmotions[0]?.name === 'Frustrated') {
      recommendations = 'Try relaxation techniques such as deep breathing or meditation to help manage feelings of frustration.';
    } else if (dominantEmotions[0]?.name === 'Anxious' || dominantEmotions[0]?.name === 'Stressed') {
      recommendations = 'Practice mindfulness and self-care routines to help reduce anxiety and stress.';
    } else {
      recommendations = 'Continue tracking your emotions to identify patterns and triggers.';
    }
    
    // Create the emotional pattern
    const pattern: InsertEmotionalPattern = {
      userId,
      period,
      startDate: startDate.toISOString(),
      endDate: now.toISOString(),
      dominantEmotions: dominantEmotions.slice(0, 5), // Top 5 emotions
      emotionTrends: emotionScores,
      emotionalStability: Math.round(emotionalStability),
      moodSwings,
      triggers: [], // Would need more data to determine triggers
      insights,
      recommendations
    };
    
    return this.createEmotionalPattern(pattern);
  }
}

export const storage = new MemStorage();
