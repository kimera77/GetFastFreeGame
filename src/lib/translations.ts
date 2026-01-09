
export type Language = 'en' | 'es' | 'de' | 'fr' | 'pt' | 'it';

type Disclaimer = {
  p1: string;
  email: string;
  p2: string;
};

type Translation = {
  headerSubtitle: string;
  description: string;
  getGame: string;
  close: string;
  aiDisclaimer: Disclaimer;
};

export const translations: Record<Language, Translation> = {
  en: {
    headerSubtitle: 'Get Fast Free Games',
    description:
      'Stay up-to-date with all the limited-time, fully redeemable free games available on major video game platforms.',
    getGame: 'Get Game',
    close: 'Close',
    aiDisclaimer: {
      p1: 'The AI model is under development and may produce incorrect results. We apologize for any inconvenience. If you want to help or provide suggestions, please contact ',
      email: 'jsrbtc7@gmail.com',
      p2: '.',
    },
  },
  es: {
    headerSubtitle: 'JUEGOS GRATIS RÁPIDO',
    description:
      'Mantente al día de todos los juegos gratuitos por tiempo limitado que puedes canjear en las principales plataformas de videojuegos.',
    getGame: 'Obtener Juego',
    close: 'Cerrar',
    aiDisclaimer: {
      p1: 'El modelo de IA está en desarrollo y puede dar resultados erróneos. Lamentamos las molestias. Si quieres aportar ayuda o sugerencias, contacta a ',
      email: 'jsrbtc7@gmail.com',
      p2: '.',
    },
  },
  de: {
    headerSubtitle: 'SCHNELLE KOSTENLOSE SPIELE',
    description:
      'Bleiben Sie über alle zeitlich begrenzten, vollständig einlösbaren kostenlosen Spiele auf dem Laufenden, die auf den wichtigsten Videospielplattformen verfügbar sind.',
    getGame: 'Spiel holen',
    close: 'Schließen',
    aiDisclaimer: {
      p1: 'Das KI-Modell befindet sich in der Entwicklung und kann fehlerhafte Ergebnisse liefern. Wir bitten um Entschuldigung für eventuelle Unannehmlichkeiten. Wenn Sie helfen oder Vorschläge machen möchten, kontaktieren Sie bitte ',
      email: 'jsrbtc7@gmail.com',
      p2: '.',
    },
  },
  fr: {
    headerSubtitle: 'JEUX GRATUITS RAPIDEMENT',
    description:
      'Restez à jour avec tous les jeux gratuits à durée limitée, entièrement récupérables, disponibles sur les principales plateformes de jeux vidéo.',
    getGame: 'Obtenir le jeu',
    close: 'Fermer',
    aiDisclaimer: {
      p1: 'Le modèle d\'IA est en cours de développement et peut produire des résultats incorrects. Nous nous excusons pour tout inconvénient. Si vous souhaitez aider ou faire des suggestions, veuillez contacter ',
      email: 'jsrbtc7@gmail.com',
      p2: '.',
    },
  },
  pt: {
    headerSubtitle: 'JOGOS GRÁTIS RÁPIDOS',
    description:
      'Mantenha-se atualizado com todos os jogos gratuitos por tempo limitad e totalmente resgatáveis disponíveis nas principais plataformas de videojogos.',
    getGame: 'Obter Jogo',
    close: 'Fechar',
    aiDisclaimer: {
      p1: 'O modelo de IA está em desenvolvimento e pode produzir resultados incorretos. Pedimos desculpa por qualquer inconveniente. Se quiser ajudar ou dar sugestões, por favor contacte ',
      email: 'jsrbtc7@gmail.com',
      p2: '.',
    },
  },
  it: {
    headerSubtitle: 'GIOCHI GRATIS VELOCI',
    description:
      'Rimani aggiornato su tutti i giochi gratuiti a tempo limitato e completamente riscattabili disponibili sulle principali piattaforme di videogiochi.',
    getGame: 'Ottieni Gioco',
    close: 'Chiudi',
    aiDisclaimer: {
      p1: 'Il modello di intelligenza artificiale è in fase di sviluppo e potrebbe produrre risultati errati. Ci scusiamo per eventuali inconvenienti. Se vuoi aiutare o fornire suggerimenti, contatta ',
      email: 'jsrbtc7@gmail.com',
      p2: '.',
    },
  },
};

export const FREE_GAMES_CACHE_TAG = 'free-games-list';
