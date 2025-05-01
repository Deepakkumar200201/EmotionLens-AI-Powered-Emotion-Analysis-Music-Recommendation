import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import * as fs from "fs";
import { Emotion, MusicSuggestion } from "@shared/schema";
import { getBengaliMusicByEmotion, formatSpotifyTracks } from "./spotify";

// Initialize Gemini API with API key from environment variable
const API_KEY = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

// Expose the generative model for reuse across the application
export function getGenerativeModel() {
  return genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    safetySettings: [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
    ],
  });
}

// Function to convert image file to base64
function fileToGenerativePart(path: string) {
  const imageBuffer = fs.readFileSync(path);
  return {
    inlineData: {
      data: imageBuffer.toString("base64"),
      mimeType: getMimeType(path),
    },
  };
}

// Function to determine MIME type based on file extension
function getMimeType(filePath: string): string {
  const extension = filePath.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'gif':
      return 'image/gif';
    default:
      return 'application/octet-stream';
  }
}

// Sample music suggestions based on emotions (fallback if Spotify API fails)
const fallbackMusicRecommendations: Record<string, MusicSuggestion[]> = {
  // Happy/Joyful category
  happy: [
    { id: "h1", title: "Happy", artist: "Pharrell Williams", coverUrl: "https://i.scdn.co/image/ab67616d0000b273f456d0514f4864989d918c94" },
    { id: "h2", title: "Walking on Sunshine", artist: "Katrina & The Waves", coverUrl: "https://i.scdn.co/image/ab67616d0000b2736fcf7fce663652e14bc0eadb" },
    { id: "h3", title: "Good as Hell", artist: "Lizzo", coverUrl: "https://i.scdn.co/image/ab67616d0000b27389fd49f32c6a2277dd529109" },
    { id: "h4", title: "Don't Stop Me Now", artist: "Queen", coverUrl: "https://i.scdn.co/image/ab67616d0000b273b8f4d0a915563e34bfe07fc5" },
    { id: "h5", title: "Electric Feel", artist: "MGMT", coverUrl: "https://i.scdn.co/image/ab67616d0000b273d2ba10638b33c701cc78943a" },
  ],
  
  // Sad/Melancholic category
  sad: [
    { id: "s1", title: "Someone Like You", artist: "Adele", coverUrl: "https://i.scdn.co/image/ab67616d0000b2736a75f532fb5658ffa1976089" },
    { id: "s2", title: "Fix You", artist: "Coldplay", coverUrl: "https://i.scdn.co/image/ab67616d0000b2734e0362c225863f6ae2432651" },
    { id: "s3", title: "Hurt", artist: "Johnny Cash", coverUrl: "https://i.scdn.co/image/ab67616d0000b273e0f4cd7f2e5c7ab8a9f32f39" },
    { id: "s4", title: "Everybody Hurts", artist: "R.E.M.", coverUrl: "https://i.scdn.co/image/ab67616d0000b273117c635b5ff2a78c0a566e96" },
    { id: "s5", title: "Say Something", artist: "A Great Big World, Christina Aguilera", coverUrl: "https://i.scdn.co/image/ab67616d0000b27311fd38dedce0e3fb2033f424" },
  ],
  
  // Angry/Intense category
  angry: [
    { id: "a1", title: "Killing In The Name", artist: "Rage Against The Machine", coverUrl: "https://i.scdn.co/image/ab67616d0000b273c8a11e48c91a982d086afc69" },
    { id: "a2", title: "Break Stuff", artist: "Limp Bizkit", coverUrl: "https://i.scdn.co/image/ab67616d0000b27382f5640dd6efdeec1cd3062b" },
    { id: "a3", title: "Sabotage", artist: "Beastie Boys", coverUrl: "https://i.scdn.co/image/ab67616d0000b273df3d2a3b4607443f1d7b5ef9" },
    { id: "a4", title: "Master of Puppets", artist: "Metallica", coverUrl: "https://i.scdn.co/image/ab67616d0000b2736f0688c796ba35ac5a8570f2" },
    { id: "a5", title: "Bulls On Parade", artist: "Rage Against The Machine", coverUrl: "https://i.scdn.co/image/ab67616d0000b273c8a11e48c91a982d086afc69" },
  ],
  
  // Neutral/Balanced category
  neutral: [
    { id: "n1", title: "Weightless", artist: "Marconi Union", coverUrl: "https://i.scdn.co/image/ab67616d0000b273b86dd49c5f79d2a9c2fef858" },
    { id: "n2", title: "Clocks", artist: "Coldplay", coverUrl: "https://i.scdn.co/image/ab67616d0000b273783ba85cdb7bfd8d19794dcb" },
    { id: "n3", title: "Dreams", artist: "Fleetwood Mac", coverUrl: "https://i.scdn.co/image/ab67616d0000b2737351ae2f69987ea5485528ae" },
    { id: "n4", title: "Slow Dancing In A Burning Room", artist: "John Mayer", coverUrl: "https://i.scdn.co/image/ab67616d0000b273ead87a146ac841b469b6eb8a" },
    { id: "n5", title: "Retrograde", artist: "James Blake", coverUrl: "https://i.scdn.co/image/ab67616d0000b273596ad0768018531ecf8d4609" },
  ],
  
  // Calm/Peaceful category
  calm: [
    { id: "c1", title: "River Flows In You", artist: "Yiruma", coverUrl: "https://i.scdn.co/image/ab67616d0000b273c232d70cb2c8a95943156734" },
    { id: "c2", title: "Gymnopedie No. 1", artist: "Erik Satie", coverUrl: "https://i.scdn.co/image/ab67616d0000b273e0e4a8c56d0aece13ee02cf6" },
    { id: "c3", title: "Clair de Lune", artist: "Claude Debussy", coverUrl: "https://i.scdn.co/image/ab67616d0000b273c036c3158b9f30bff7fe5533" },
    { id: "c4", title: "Experience", artist: "Ludovico Einaudi", coverUrl: "https://i.scdn.co/image/ab67616d0000b273a3a7f32efdcbfc5f9ae18da6" },
    { id: "c5", title: "Sleepless", artist: "Flume feat. Jezzabell Doran", coverUrl: "https://i.scdn.co/image/ab67616d0000b2730f7ad75fc5dfe272d02e1e62" },
  ],
  
  // Excited/Energetic category
  excited: [
    { id: "e1", title: "Can't Stop the Feeling!", artist: "Justin Timberlake", coverUrl: "https://i.scdn.co/image/ab67616d0000b273be36372e8e4e303939f068ad" },
    { id: "e2", title: "Uptown Funk", artist: "Mark Ronson ft. Bruno Mars", coverUrl: "https://i.scdn.co/image/ab67616d0000b273e4a3c9507c26a3fb8188dbea" },
    { id: "e3", title: "I Gotta Feeling", artist: "Black Eyed Peas", coverUrl: "https://i.scdn.co/image/ab67616d0000b27379b495ea3ce368b13f13a350" },
    { id: "e4", title: "Levels", artist: "Avicii", coverUrl: "https://i.scdn.co/image/ab67616d0000b273208ca4c8ecca1c14d132a6c8" },
    { id: "e5", title: "High Hopes", artist: "Panic! At The Disco", coverUrl: "https://i.scdn.co/image/ab67616d0000b273a5a0567c3feefa86b286aa62" },
  ],
  
  // Surprised category
  surprised: [
    { id: "su1", title: "Wow.", artist: "Post Malone", coverUrl: "https://i.scdn.co/image/ab67616d0000b2733e46a86e0cf4e90d6dfc63d0" },
    { id: "su2", title: "Bang!", artist: "AJR", coverUrl: "https://i.scdn.co/image/ab67616d0000b2733a63d733f143e0809955e914" },
    { id: "su3", title: "Supermassive Black Hole", artist: "Muse", coverUrl: "https://i.scdn.co/image/ab67616d0000b273d503f73ee76305fae62a37d0" },
    { id: "su4", title: "Take On Me", artist: "a-ha", coverUrl: "https://i.scdn.co/image/ab67616d0000b273e23a231dfa9aa66b2c6c5d9e" },
    { id: "su5", title: "Africa", artist: "TOTO", coverUrl: "https://i.scdn.co/image/ab67616d0000b273b3e54efad1d17265ab7fea44" },
  ],
  
  // Anxious/Fearful category
  anxious: [
    { id: "an1", title: "Breathe Me", artist: "Sia", coverUrl: "https://i.scdn.co/image/ab67616d0000b2737b9e5a9d697bcb8bf86a83b4" },
    { id: "an2", title: "Where Is My Mind?", artist: "Pixies", coverUrl: "https://i.scdn.co/image/ab67616d0000b273999f9ff2cee7680ca61693fc" },
    { id: "an3", title: "Comfortably Numb", artist: "Pink Floyd", coverUrl: "https://i.scdn.co/image/ab67616d0000b273835a7cf5e819eed4fe140af3" },
    { id: "an4", title: "Exit Music (For a Film)", artist: "Radiohead", coverUrl: "https://i.scdn.co/image/ab67616d0000b2738940ac99f49e44f7e1f2c38f" },
    { id: "an5", title: "To Build a Home", artist: "The Cinematic Orchestra", coverUrl: "https://i.scdn.co/image/ab67616d0000b2732092495770eb668ac5d9e1a9" },
  ],
  
  // Thoughtful/Contemplative category
  thoughtful: [
    { id: "t1", title: "Holocene", artist: "Bon Iver", coverUrl: "https://i.scdn.co/image/ab67616d0000b273d54358b1c6cb710c11ebbfa0" },
    { id: "t2", title: "Midnight", artist: "Coldplay", coverUrl: "https://i.scdn.co/image/ab67616d0000b273f864bcdcc245f06400d446d7" },
    { id: "t3", title: "Skinny Love", artist: "Bon Iver", coverUrl: "https://i.scdn.co/image/ab67616d0000b2733559be442bdd1bcf5fbd132f" },
    { id: "t4", title: "Youth", artist: "Daughter", coverUrl: "https://i.scdn.co/image/ab67616d0000b2738b52b87064fded45124e2044" },
    { id: "t5", title: "Re:stacks", artist: "Bon Iver", coverUrl: "https://i.scdn.co/image/ab67616d0000b2733559be442bdd1bcf5fbd132f" },
  ],
  
  // Confused category
  confused: [
    { id: "co1", title: "Paranoid Android", artist: "Radiohead", coverUrl: "https://i.scdn.co/image/ab67616d0000b2738940ac99f49e44f7e1f2c38f" },
    { id: "co2", title: "Bohemian Rhapsody", artist: "Queen", coverUrl: "https://i.scdn.co/image/ab67616d0000b273e8b066f70c206551210d902b" },
    { id: "co3", title: "Brain Damage", artist: "Pink Floyd", coverUrl: "https://i.scdn.co/image/ab67616d0000b273835a7cf5e819eed4fe140af3" },
    { id: "co4", title: "Every Day Is Exactly the Same", artist: "Nine Inch Nails", coverUrl: "https://i.scdn.co/image/ab67616d0000b2735aee1d0c5805afa33a9ec321" },
    { id: "co5", title: "Strawberry Fields Forever", artist: "The Beatles", coverUrl: "https://i.scdn.co/image/ab67616d0000b273907619888292ee781d679bf0" },
  ],
  
  // Content/Satisfied category
  content: [
    { id: "ct1", title: "Three Little Birds", artist: "Bob Marley & The Wailers", coverUrl: "https://i.scdn.co/image/ab67616d0000b273d752956b8a82ffa07baa835e" },
    { id: "ct2", title: "Sunday Morning", artist: "Maroon 5", coverUrl: "https://i.scdn.co/image/ab67616d0000b2735eec21aa0bbd57b152c8e3b7" },
    { id: "ct3", title: "Banana Pancakes", artist: "Jack Johnson", coverUrl: "https://i.scdn.co/image/ab67616d0000b2738d5e5f956c4f07fa7376d09e" },
    { id: "ct4", title: "Easy", artist: "Commodores", coverUrl: "https://i.scdn.co/image/ab67616d0000b273b82b3b2b8b8b5c1301eb9fef" },
    { id: "ct5", title: "Lovely Day", artist: "Bill Withers", coverUrl: "https://i.scdn.co/image/ab67616d0000b273d254ce2453a8a9627eec8a24" },
  ],
};

// Get music recommendations based on top emotion
export async function getMusicForEmotion(emotion: string): Promise<MusicSuggestion[]> {
  try {
    console.log(`Getting music recommendations for emotion: ${emotion}`);
    
    // Normalize the emotion to handle variations
    const normalizedEmotion = mapToBasicEmotion(emotion);
    console.log(`Mapped to basic emotion category: ${normalizedEmotion}`);
    
    // Try to get Bengali music recommendations from Spotify
    const spotifyTracks = await getBengaliMusicByEmotion(normalizedEmotion);
    
    if (spotifyTracks.length > 0) {
      // Format and return the Spotify tracks
      return formatSpotifyTracks(spotifyTracks);
    }
    
    // Fallback to static recommendations if Spotify fails
    return getFallbackMusicForEmotion(normalizedEmotion);
  } catch (error) {
    console.error("Error getting music recommendations from Spotify:", error);
    return getFallbackMusicForEmotion(emotion);
  }
}

// Map complex emotions to basic categories for better matching
function mapToBasicEmotion(emotion: string): string {
  const normalized = emotion.toLowerCase();
  
  // Happy category
  if (normalized.includes('joy') || 
      normalized.includes('happy') || 
      normalized.includes('excited') || 
      normalized.includes('content') ||
      normalized.includes('proud') ||
      normalized.includes('confident') ||
      normalized.includes('enthusiastic') ||
      normalized.includes('amused')) {
    return 'happy';
  }
  
  // Sad category
  if (normalized.includes('sad') || 
      normalized.includes('sorrow') || 
      normalized.includes('depressed') || 
      normalized.includes('melancholy') ||
      normalized.includes('disappointed') ||
      normalized.includes('regretful') ||
      normalized.includes('lonely')) {
    return 'sad';
  }
  
  // Angry category
  if (normalized.includes('angry') || 
      normalized.includes('rage') || 
      normalized.includes('annoyed') || 
      normalized.includes('irritated') ||
      normalized.includes('frustrated') ||
      normalized.includes('contempt') ||
      normalized.includes('disgusted')) {
    return 'angry';
  }
  
  // Calm category
  if (normalized.includes('calm') || 
      normalized.includes('peace') || 
      normalized.includes('relaxed') || 
      normalized.includes('serene') ||
      normalized.includes('tranquil') ||
      normalized.includes('thoughtful') ||
      normalized.includes('contemplative')) {
    return 'calm';
  }
  
  // Excited category
  if (normalized.includes('excited') || 
      normalized.includes('thrill') || 
      normalized.includes('energetic') || 
      normalized.includes('surprised') ||
      normalized.includes('amazed') ||
      normalized.includes('eager')) {
    return 'excited';
  }
  
  // Anxious/Fear category (map to calm music as counter)
  if (normalized.includes('anxious') || 
      normalized.includes('nervous') || 
      normalized.includes('afraid') || 
      normalized.includes('fearful') ||
      normalized.includes('stressed') ||
      normalized.includes('worried')) {
    return 'calm'; // Counter with calming music
  }
  
  // If no match or neutral, return neutral
  return 'neutral';
}

// Fallback function for static music recommendations
function getFallbackMusicForEmotion(emotion: string): MusicSuggestion[] {
  // Use our existing basic emotion categories
  const normalizedEmotion = emotion.toLowerCase();
  
  console.log(`Getting fallback music for emotion: ${normalizedEmotion}`);
  
  // Check for direct matches with our available categories first
  if (fallbackMusicRecommendations[normalizedEmotion]) {
    console.log(`Found direct match for: ${normalizedEmotion}`);
    return fallbackMusicRecommendations[normalizedEmotion];
  }
  
  // More precise emotion-to-music matching with logging
  if (normalizedEmotion.includes('joy') || normalizedEmotion.includes('happy') || normalizedEmotion.includes('delight')) {
    console.log(`Mapped ${normalizedEmotion} to happy`);
    return fallbackMusicRecommendations.happy;
  }
  
  if (normalizedEmotion.includes('sad') || normalizedEmotion.includes('depress') || normalizedEmotion.includes('melanchol')) {
    console.log(`Mapped ${normalizedEmotion} to sad`);
    return fallbackMusicRecommendations.sad;
  }
  
  if (normalizedEmotion.includes('angry') || normalizedEmotion.includes('rage') || normalizedEmotion.includes('furious') || normalizedEmotion.includes('upset')) {
    console.log(`Mapped ${normalizedEmotion} to angry`);
    return fallbackMusicRecommendations.angry;
  }
  
  if (normalizedEmotion.includes('calm') || normalizedEmotion.includes('relax') || normalizedEmotion.includes('peace') || normalizedEmotion.includes('tranquil')) {
    console.log(`Mapped ${normalizedEmotion} to calm`);
    return fallbackMusicRecommendations.calm;
  }
  
  if (normalizedEmotion.includes('excite') || normalizedEmotion.includes('energetic') || normalizedEmotion.includes('thrill') || normalizedEmotion.includes('ecstat')) {
    console.log(`Mapped ${normalizedEmotion} to excited`);
    return fallbackMusicRecommendations.excited;
  }
  
  if (normalizedEmotion.includes('content') || normalizedEmotion.includes('satisf') || normalizedEmotion.includes('pleas') || normalizedEmotion.includes('comfort')) {
    console.log(`Mapped ${normalizedEmotion} to content`);
    return fallbackMusicRecommendations.content;
  }
  
  if (normalizedEmotion.includes('surpris') || normalizedEmotion.includes('astonish') || normalizedEmotion.includes('amaz') || normalizedEmotion.includes('shock')) {
    console.log(`Mapped ${normalizedEmotion} to surprised`);
    return fallbackMusicRecommendations.surprised;
  }
  
  if (normalizedEmotion.includes('anx') || normalizedEmotion.includes('fear') || normalizedEmotion.includes('worr') || normalizedEmotion.includes('nervous')) {
    console.log(`Mapped ${normalizedEmotion} to anxious`);
    return fallbackMusicRecommendations.anxious;
  }
  
  if (normalizedEmotion.includes('think') || normalizedEmotion.includes('thoughtful') || normalizedEmotion.includes('contemplat') || normalizedEmotion.includes('ponder')) {
    console.log(`Mapped ${normalizedEmotion} to thoughtful`);
    return fallbackMusicRecommendations.thoughtful;
  }
  
  if (normalizedEmotion.includes('confus') || normalizedEmotion.includes('puzzl') || normalizedEmotion.includes('perplex') || normalizedEmotion.includes('bewild')) {
    console.log(`Mapped ${normalizedEmotion} to confused`);
    return fallbackMusicRecommendations.confused;
  }
  
  // If no match or neutral, return neutral
  console.log(`No emotion mapping found for: ${normalizedEmotion}, defaulting to neutral`);
  return fallbackMusicRecommendations.neutral;
}

// Main function to analyze an image
export async function analyzeImage(imagePath: string) {
  try {
    // Configure the model
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ],
    });

    // Create prompt for emotion analysis
    const prompt = `
      You are an expert emotional analyst that specializes in analyzing facial expressions and body language.
      Carefully analyze the emotional state of the person in this photo.
      Be very deliberate in your analysis - avoid defaulting to "Neutral" unless there is truly no emotional expression.
      Look for subtle facial expressions, micro-expressions, eye movements, posture, and other visual cues.
      
      Even if the emotion is subtle, identify it and assign it a proper weight.
      
      Return a detailed JSON object with the following structure:

      {
        "label": "Brief descriptive label for this emotional state. Be specific and avoid generic labels.",
        "emotions": [
          { "name": "Primary emotion name", "score": 0.6 },
          { "name": "Secondary emotion name", "score": 0.25 },
          { "name": "Tertiary emotion name", "score": 0.15 }
        ],
        "description": "A detailed paragraph describing the emotional state, what facial features indicate this emotion, and what it might suggest about the person's mental state",
        "recommendedActivities": "Detailed suggestions of activities that would complement or enhance this emotional state"
      }

      The emotion scores must sum to 1.0 exactly.
      
      IMPORTANT: Always detect at least 3 different emotions with varying scores, even if some are subtle.
      
      Primary emotions to consider:
      - Happy/Joy (smile, raised cheeks, crinkled eyes)
      - Sad (downturned mouth, droopy eyelids, furrowed brows)
      - Angry (furrowed brows, tightened lips, intense gaze)
      - Surprised (raised eyebrows, widened eyes, open mouth)
      - Fearful (widened eyes, raised eyebrows, tense face)
      - Disgusted (wrinkled nose, raised upper lip)
      - Contempt (one-sided mouth raise, smirk)
      
      Secondary emotions to consider:
      - Calm (relaxed facial muscles, neutral mouth)
      - Confused (furrowed brow, tilted head, squinted eyes)
      - Content (slight smile, relaxed face)
      - Excited (bright eyes, animated expression)
      - Bored (vacant expression, droopy eyelids)
      - Anxious (tense facial muscles, darting eyes)
      - Proud (upright posture, slight smile, raised chin)
      - Embarrassed (blushing, averted gaze)
      - Thoughtful (distant gaze, slightly furrowed brow)
      
      Focus on the emotional expressions visible in the image and analyze them thoroughly.
      Don't include any explanations outside the JSON, just return the valid JSON object.
    `;

    // Prepare the image
    const imagePart = fileToGenerativePart(imagePath);

    // Generate analysis
    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();

    // Extract the JSON object from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      throw new Error("Failed to extract JSON from Gemini response");
    }
    
    const jsonString = jsonMatch[0];
    const analysisData = JSON.parse(jsonString);
    
    // Add music suggestions based on the top emotion
    const topEmotion = analysisData.emotions[0]?.name || "Neutral";
    const musicSuggestions = await getMusicForEmotion(topEmotion);
    
    return {
      ...analysisData,
      musicSuggestions,
    };
  } catch (error) {
    console.error("Error analyzing image with Gemini:", error);
    
    // For failure cases, return a default analysis
    return {
      label: "Analysis failed",
      emotions: [
        { name: "Neutral", score: 1.0 }
      ],
      description: "We couldn't analyze the image properly. Please try another photo with a clearer facial expression.",
      recommendedActivities: "Try uploading another photo with good lighting and a clear view of your face.",
      musicSuggestions: getFallbackMusicForEmotion("Neutral"),
    };
  }
}
