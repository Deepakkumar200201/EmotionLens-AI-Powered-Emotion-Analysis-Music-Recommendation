# EmotionLens: AI-Powered Emotion Analysis & Music Recommendation

![EmotionLens Logo](https://i.imgur.com/wWM9hMf.png)

EmotionLens is a comprehensive web application that uses Gemini AI to analyze facial expressions in photos and provide personalized emotional analysis, music recommendations, and mood-based suggestions. The platform offers users insights into their emotional patterns over time and creates custom Spotify playlists tailored to their emotional states.

## 🌟 Key Features

- **Advanced Emotion Detection**: Upload photos to get detailed emotional analysis with precise scoring for multiple detected emotions
- **Personalized Music Recommendations**: Receive Spotify-integrated music suggestions that match your emotional state
- **Bengali Music Focus**: Special emphasis on Bengali music recommendations to provide culturally relevant content
- **Emotional Pattern Tracking**: Track and visualize your emotional states over time
- **Custom Playlists**: Generate custom Spotify playlists based on your emotional patterns
- **AI-Powered Mood Suggestions**: Get personalized recommendations for activities and practices to enhance your mood

## 🚀 Technologies Used

### Front-End
- React (with TypeScript)
- TailwindCSS & ShadCN Components
- React Query for data fetching
- Wouter for client-side routing

### Back-End
- Express.js server with TypeScript
- Drizzle ORM with PostgreSQL 
- Session-based authentication

### AI & External APIs
- Google Gemini API for image analysis
- Spotify API for music recommendations

## 📋 Getting Started

### Prerequisites
1. Node.js and npm installed
2. PostgreSQL database
3. Gemini API key
4. Spotify Developer credentials

### Environment Variables
Create a `.env` file with the following:

```
DATABASE_URL=your_database_connection_string
GEMINI_API_KEY=your_gemini_api_key
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
```

### Installation Steps

1. Clone the repository
```bash
git clone https://github.com/yourusername/emotionlens.git
cd emotionlens
```

2. Install dependencies
```bash
npm install
```

3. Initialize the database
```bash
npm run db:push
```

4. Start the development server
```bash
npm run dev
```

## 💡 How It Works

1. **Upload a Photo**: The application uses Gemini AI to analyze facial expressions and emotional cues
2. **Emotional Analysis**: Receive a detailed breakdown of detected emotions with percentage scores
3. **Music Suggestions**: Get personalized music recommendations from Spotify based on your emotional state
4. **Track Progress**: View your emotional history and patterns over time
5. **Get Suggestions**: Receive AI-generated tips and activity recommendations to enhance your mood
6. **Create Playlists**: Generate custom Spotify playlists based on your emotional patterns

## 📱 Application Sections

- **Home**: Upload photos and view emotion analysis
- **Profile**: Track emotional patterns and view historical data
- **Music**: Browse personalized music recommendations
- **Settings**: Adjust application preferences

## 🧠 Emotion Detection Categories

The application detects a wide range of emotions, including:

- Primary emotions: Happy, Sad, Angry, Surprised, Fearful, Disgusted, Contempt
- Secondary emotions: Calm, Confused, Content, Excited, Bored, Anxious, Proud, Embarrassed, Thoughtful

## 🎵 Music Recommendation System

The music recommendation system works in three layers:

1. **Emotion Mapping**: Detected emotions are mapped to musical moods
2. **Bengali Music Focus**: The system first attempts to find Bengali music matching the emotional state
3. **Global Music Fallback**: If Bengali-specific music isn't available, it recommends global tracks
4. **Offline Recommendations**: Even without API access, the system provides carefully curated music suggestions

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- Google Gemini API for providing advanced image analysis capabilities
- Spotify API for music integration
- React and TailwindCSS community for excellent documentation