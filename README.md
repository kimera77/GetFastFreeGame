# 🎮 Get Fast Free Games

### Your AI-powered daily source for free video games! 🚀

This project automatically finds and displays limited-time free games from major platforms like Steam, Epic Games Store, GOG, and Amazon Prime Gaming.

---

## ✨ A "Vibe Coding" Project

This project is a pure example of **"vibe coding"**, built in real-time through a fluid, conversational collaboration between a human developer and a generative AI coding partner.

> **What's Vibe Coding?** It's about building based on intuition, ideas, and a continuous feedback loop. Instead of a rigid plan, we started with a simple idea: *"let's build a site that finds free games"*, and evolved it step-by-step, fixing bugs and adding features through dialogue.

This entire application, from the AI backend to the responsive UI, was crafted by:
- A human providing the **vision**, the **"vibe"**, and high-level direction.
- An AI partner translating those ideas into **code**, suggesting architectures, and refactoring on the fly.

It's a testament to a new way of building software: **collaborative, iterative, and incredibly fast.**

---

## 🛠️ Core Technologies

| Tech | Description |
| :--- | :--- |
| **Next.js** | Powers the frontend and server-side logic with the App Router. |
| **Genkit (Gemini)** | The AI "brain" that uses Google Search to find and validate game deals. |
| **Tailwind CSS** | For modern, utility-first styling. |
| **ShadCN UI** | Provides the beautiful, accessible, and ready-to-use UI components. |

---

## 🌟 Key Features

- **🧠 AI-Powered Data Fetching**: A Genkit flow uses a Google AI model with search grounding to find, validate, and format free game listings in real-time.
- **⚡ Next.js Caching**: Uses `unstable_cache` with time-based revalidation to ensure data is fresh without constantly hitting the AI backend, saving on costs and improving speed.
- **🌐 Multi-Language Support**: The UI is translated into English, Spanish, German, French, Portuguese, and Italian.
- **🎬 Embedded Gameplay Videos**: Users can watch gameplay trailers directly on the site.
- **🐛 Debug Panel**: An expandable section shows the raw AI output, data source (Cache vs. API), and a button to manually clear the cache for testing.
- **📱 Fully Responsive Design**: Looks and works great on all devices, from mobile phones to desktops.

## 🚀 How to Run Locally

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   - You will need a Google AI API key for Genkit to work.
   - Create a file named `.env.local` in the root of the project.
   - Add your API key to the file:
     ```
     GEMINI_API_KEY=your_google_ai_api_key_here
     ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result!
