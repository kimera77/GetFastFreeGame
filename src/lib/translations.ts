
export type Language = 'en' | 'es' | 'de' | 'fr' | 'pt' | 'it';

type Translation = {
  headerSubtitle: string;
  description: string;
  getGame: string;
  close: string;
  aiDisclaimer: string;
};

export const translations: Record<Language, Translation> = {
  en: {
    headerSubtitle: 'DAILY GAME DROP',
    description:
      'Stay up-to-date with all the limited-time, fully redeemable free games available on major video game platforms.',
    getGame: 'Get Game',
    close: 'Close',
    aiDisclaimer:
      'The AI model is under development and may produce incorrect results. We apologize for any inconvenience.',
  },
  es: {
    headerSubtitle: 'JUEGOS GRATIS CADA DÍA',
    description:
      'Mantente al día de todos los juegos gratuitos por tiempo limitado que puedes canjear en las principales plataformas de videojuegos.',
    getGame: 'Obtener Juego',
    close: 'Cerrar',
    aiDisclaimer:
      'El modelo de IA está en desarrollo y puede dar resultados erróneos. Lamentamos las molestias.',
  },
  de: {
    headerSubtitle: 'TÄGLICHE SPIELE-DROPS',
    description:
      'Bleiben Sie über alle zeitlich begrenzten, vollständig einlösbaren kostenlosen Spiele auf dem Laufenden, die auf den wichtigsten Videospielplattformen verfügbar sind.',
    getGame: 'Spiel holen',
    close: 'Schließen',
    aiDisclaimer:
      'Das KI-Modell befindet sich in der Entwicklung und kann fehlerhafte Ergebnisse liefern. Wir bitten um Entschuldigung für eventuelle Unannehmlichkeiten.',
  },
  fr: {
    headerSubtitle: 'JEUX GRATUITS DU JOUR',
    description:
      'Restez à jour avec tous les jeux gratuits à durée limitée, entièrement récupérables, disponibles sur les principales plateformes de jeux vidéo.',
    getGame: 'Obtenir le jeu',
    close: 'Fermer',
    aiDisclaimer:
      'Le modèle d\'IA est en cours de développement et peut produire des résultats incorrects. Nous nous excusons pour tout inconvénient.',
  },
  pt: {
    headerSubtitle: 'JOGOS GRÁTIS DIÁRIOS',
    description:
      'Mantenha-se atualizado com todos os jogos gratuitos por tempo limitado e totalmente resgatáveis disponíveis nas principais plataformas de videojogos.',
    getGame: 'Obter Jogo',
    close: 'Fechar',
    aiDisclaimer:
      'O modelo de IA está em desenvolvimento e pode produzir resultados incorretos. Pedimos desculpa por qualquer inconveniente.',
  },
  it: {
    headerSubtitle: 'GIOCHI GRATIS DEL GIORNO',
    description:
      'Rimani aggiornato su tutti i giochi gratuiti a tempo limitato e completamente riscattabili disponibili sulle principali piattaforme di videogiochi.',
    getGame: 'Ottieni Gioco',
    close: 'Chiudi',
    aiDisclaimer:
      'Il modello di intelligenza artificiale è in fase di sviluppo e potrebbe produrre risultati errati. Ci scusiamo per eventuali inconvenienti.',
  },
};

export const FREE_GAMES_CACHE_TAG = 'free-games-list';
