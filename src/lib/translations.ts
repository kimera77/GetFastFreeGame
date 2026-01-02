
export type Language = 'en' | 'es' | 'de' | 'fr' | 'pt' | 'it';

type Translation = {
  headerSubtitle: string;
  description: string;
  getGame: string;
  gameplayPreview: string;
  close: string;
};

export const translations: Record<Language, Translation> = {
  en: {
    headerSubtitle: 'DAILY GAME DROP',
    description:
      'Stay up-to-date with all the limited-time, fully redeemable free games available on major video game platforms.',
    getGame: 'Get Game',
    gameplayPreview: 'Gameplay Preview',
    close: 'Close',
  },
  es: {
    headerSubtitle: 'JUEGOS GRATIS CADA DÍA',
    description:
      'Mantente al día de todos los juegos gratuitos por tiempo limitado que puedes canjear en las principales plataformas de videojuegos.',
    getGame: 'Obtener Juego',
    gameplayPreview: 'Ver Gameplay',
    close: 'Cerrar',
  },
  de: {
    headerSubtitle: 'TÄGLICHE SPIELE-DROPS',
    description:
      'Bleiben Sie über alle zeitlich begrenzten, vollständig einlösbaren kostenlosen Spiele auf dem Laufenden, die auf den wichtigsten Videospielplattformen verfügbar sind.',
    getGame: 'Spiel holen',
    gameplayPreview: 'Gameplay-Vorschau',
    close: 'Schließen',
  },
  fr: {
    headerSubtitle: 'JEUX GRATUITS DU JOUR',
    description:
      'Restez à jour avec tous les jeux gratuits à durée limitée, entièrement récupérables, disponibles sur les principales plateformes de jeux vidéo.',
    getGame: 'Obtenir le jeu',
    gameplayPreview: 'Aperçu du gameplay',
    close: 'Fermer',
  },
  pt: {
    headerSubtitle: 'JOGOS GRÁTIS DIÁRIOS',
    description:
      'Mantenha-se atualizado com todos os jogos gratuitos por tempo limitado e totalmente resgatáveis disponíveis nas principais plataformas de videojogos.',
    getGame: 'Obter Jogo',
    gameplayPreview: 'Visualizar Gameplay',
    close: 'Fechar',
  },
  it: {
    headerSubtitle: 'GIOCHI GRATIS DEL GIORNO',
    description:
      'Rimani aggiornato su tutti i giochi gratuiti a tempo limitato e completamente riscattabili disponibili sulle principali piattaforme di videogiochi.',
    getGame: 'Ottieni Gioco',
    gameplayPreview: 'Anteprima di Gioco',
    close: 'Chiudi',
  },
};

// =================================================================
// ESTE ES EL PROMPT QUE SE ENVÍA A GEMINI
// =================================================================
export const freeGamesPrompt = `Give me the list of free or claimable games available right now. I need the response to be ONLY a raw JSON object, without any additional text, explanations, or markdown formatting like \`\`\`json.
The JSON object must have keys for the following platforms: 'Epic Games Store', 'Amazon Prime Gaming', 'GOG', and 'Steam'.
The value for each platform key must be an array of game objects.
Each game object must have these exact properties:
- 'name': The full and exact title of the game (string).
- 'game_link': The direct URL to the game's store or claim page (string).
- 'cover_image': A direct, publicly accessible HTTPS URL for the game's cover art. It should be high quality. For Steam games, you MUST use the Steam CDN format (e.g., cdn.akamai.steamstatic.com/steam/apps/APP_ID/header.jpg or capsule_616x353.jpg) if possible to ensure the image is embeddable. (string).
- 'original_price': The standard retail price before the discount (e.g., "$19.99"). This can be an empty string if not applicable or not found (string).

If a platform has no free games, its value must be an empty array [].
Your entire response must be just the JSON object, starting with { and ending with }.`;
// =================================================================

// Esta es la etiqueta (tag) que se usa para cachear la respuesta en Next.js
export const FREE_GAMES_CACHE_TAG = 'free-games-list';
