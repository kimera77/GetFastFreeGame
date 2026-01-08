
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
    headerSubtitle: 'GET FAST FREE GAME',
    description:
      'Stay up-to-date with all the limited-time, fully redeemable free games available on major video game platforms.',
    getGame: 'Get Game',
    close: 'Close',
    aiDisclaimer:
      'The AI model is under development and may produce incorrect results. We apologize for any inconvenience. If you want to help or provide suggestions, please contact jsrbtc7@gmail.com.',
  },
  es: {
    headerSubtitle: 'JUEGOS GRATIS RÁPIDO',
    description:
      'Mantente al día de todos los juegos gratuitos por tiempo limitado que puedes canjear en las principales plataformas de videojuegos.',
    getGame: 'Obtener Juego',
    close: 'Cerrar',
    aiDisclaimer:
      'El modelo de IA está en desarrollo y puede dar resultados erróneos. Lamentamos las molestias. Si quieres aportar ayuda o sugerencias, contacta a jsrbtc7@gmail.com.',
  },
  de: {
    headerSubtitle: 'SCHNELLE KOSTENLOSE SPIELE',
    description:
      'Bleiben Sie über alle zeitlich begrenzten, vollständig einlösbaren kostenlosen Spiele auf dem Laufenden, die auf den wichtigsten Videospielplattformen verfügbar sind.',
    getGame: 'Spiel holen',
    close: 'Schließen',
    aiDisclaimer:
      'Das KI-Modell befindet sich in der Entwicklung und kann fehlerhafte Ergebnisse liefern. Wir bitten um Entschuldigung für eventuelle Unannehmlichkeiten. Wenn Sie helfen oder Vorschläge machen möchten, kontaktieren Sie bitte jsrbtc7@gmail.com.',
  },
  fr: {
    headerSubtitle: 'JEUX GRATUITS RAPIDEMENT',
    description:
      'Restez à jour avec tous les jeux gratuits à durée limitée, entièrement récupérables, disponibles sur les principales plateformes de jeux vidéo.',
    getGame: 'Obtenir le jeu',
    close: 'Fermer',
    aiDisclaimer:
      'Le modèle d\'IA est en cours de développement et peut produire des résultats incorrects. Nous nous excusons pour tout inconvénient. Si vous souhaitez aider ou faire des suggestions, veuillez contacter jsrbtc7@gmail.com.',
  },
  pt: {
    headerSubtitle: 'JOGOS GRÁTIS RÁPIDOS',
    description:
      'Mantenha-se atualizado com todos os jogos gratuitos por tempo limitado e totalmente resgatáveis disponíveis nas principais plataformas de videojogos.',
    getGame: 'Obter Jogo',
    close: 'Fechar',
    aiDisclaimer:
      'O modelo de IA está em desenvolvimento e pode produzir resultados incorretos. Pedimos desculpa por qualquer inconveniente. Se quiser ajudar ou dar sugestões, por favor contacte jsrbtc7@gmail.com.',
  },
  it: {
    headerSubtitle: 'GIOCHI GRATIS VELOCI',
    description:
      'Rimani aggiornato su tutti i giochi gratuiti a tempo limitato e completamente riscattabili disponibili sulle principali piattaforme di videogiochi.',
    getGame: 'Ottieni Gioco',
    close: 'Chiudi',
    aiDisclaimer:
      'Il modello di intelligenza artificiale è in fase di sviluppo e potrebbe produrre risultati errati. Ci scusiamo per eventuali inconvenienti. Se vuoi aiutare o fornire suggerimenti, contatta jsrbtc7@gmail.com.',
  },
};

export const FREE_GAMES_CACHE_TAG = 'free-games-list';
