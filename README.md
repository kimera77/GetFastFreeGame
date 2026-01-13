# 🎮 Get Fast Free Games

I created this project so that people would have a website where they could see a summary of the offers that come out on platforms to claim free games.

---

## 🌟 Key Features

- **🧠 AI-Powered Data Fetching**: A Genkit flow uses a Google AI model gemini 3.0 flash with search grounding to find, validate, and format free game listings in real-time.
- **⚡ Next.js Caching**: Uses `unstable_cache` with time-based revalidation to ensure data is fresh without constantly hitting the AI backend, saving on costs and improving speed.
- **🌐 Multi-Language Support**: The UI is translated into English, Spanish, German, French, Portuguese, and Italian.
- **🐛 Debug Panel**: An expandable section shows the raw AI output, data source (Cache vs. API), and a button to manually clear the cache for testing.
- **📱 Fully Responsive Design**: Looks and works great on all devices, from mobile phones to desktops.
- **🎬 Embedded Gameplay Videos**: Users can watch gameplay trailers directly on the site.

---

## 🛠️ Core Technologies

| Tech | Description |
| :--- | :--- |
| **Next.js** | Powers the frontend and server-side logic with the App Router. |
| **Genkit (Gemini)** | The AI "brain" that uses Google Search to find and validate game deals. |
| **Tailwind CSS** | For modern, utility-first styling. |
| **ShadCN UI** | Provides the beautiful, accessible, and ready-to-use UI components. |

