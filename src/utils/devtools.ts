// Utility per nascondere l'avviso dei React DevTools in produzione

// Nasconde l'avviso dei React DevTools in produzione
if (import.meta.env.PROD) {
  // Sovrascrivi console.info per filtrare i messaggi dei DevTools
  const originalConsoleInfo = console.info;
  console.info = (...args: any[]) => {
    // Filtra i messaggi che contengono "React DevTools"
    const message = args.join(' ');
    if (message.includes('React DevTools') || message.includes('react-devtools')) {
      return; // Non mostrare il messaggio
    }
    originalConsoleInfo.apply(console, args);
  };

  // Sovrascrivi console.log per sicurezza
  const originalConsoleLog = console.log;
  console.log = (...args: any[]) => {
    const message = args.join(' ');
    if (message.includes('React DevTools') || message.includes('react-devtools')) {
      return;
    }
    originalConsoleLog.apply(console, args);
  };
}

export {};