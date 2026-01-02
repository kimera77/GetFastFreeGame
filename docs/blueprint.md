# **App Name**: Daily Game Drop

## Core Features:

- Free Game Listings: Display an updated list of free video games available for a limited time across different platforms (Epic Games Store, Amazon Prime Gaming, GOG, Steam) sourced by an AI tool.
- AI-Powered Game Data Retrieval: Utilize a Genkit flow with Google Gemini to fetch game data, conforming strictly to a predefined PlatformGamesSchema with high-quality, direct image URLs. Uses the LLM as a tool to retrieve the game data, and cache the output using unstable_cache for improved performance.
- Gameplay Preview Modal: Enable users to preview gameplays via a modal with embedded YouTube videos based on game title searches.
- Direct Download Links: Provide direct links to game download pages on respective platforms, ensuring easy access for users.
- Platform Identification: Visually represent each game's platform using corresponding logo icons for quick recognition.
- Error Handling and Loading States: Implement robust error handling for API calls and provide informative loading states for a seamless user experience.

## Style Guidelines:

- Background color: Very light gray, almost white (#FAF9F5) to provide a clean and unobtrusive backdrop.
- Foreground color: Soft black (#0A0A0A) for readable text and a modern look.
- Primary color: Deep indigo (#6643B5) to convey sophistication and trustworthiness.
- Primary foreground color: Pure white (#FFFFFF) for high contrast against the primary color.
- Accent color: Bright purple (#D362C7) to highlight key actions and elements.
- Headline font: 'Space Grotesk' (sans-serif) for a modern, techy feel.
- Body font: 'Inter' (sans-serif) for readability and a clean aesthetic.
- Use platform-specific logo icons (e.g., Epic Games, Steam) for easy game source identification.
- Employ a modern layout with rounded corners, subtle shadows, and responsive design to ensure optimal viewing on all devices.
- Incorporate subtle hover effects on cards to enhance interactivity.