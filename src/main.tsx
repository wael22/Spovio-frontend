import { createRoot } from "react-dom/client";
import * as Sentry from "@sentry/react";
import App from "./App.tsx";
import { ThemeProvider } from "./components/ThemeProvider.tsx";
import "./i18n";
import "./index.css";

Sentry.init({
  dsn: "https://41dbfc79c49f1fc02752a7f0274f06f0@o4511152474030080.ingest.de.sentry.io/4511152476127312",
  // Setting this option to true will send default PII data to Sentry.
  // For example, automatic IP address collection on events
  sendDefaultPii: true,
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration()
  ],
  // Tracing
  tracesSampleRate: 1.0, //  Capture 100% of the transactions
  // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
  tracePropagationTargets: ["localhost", /^https:\/\/yourserver\.io\/api/],
  // Session Replay
  replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
  replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.,
  // Enable logs to be sent to Sentry
  enableLogs: true
});

createRoot(document.getElementById("root")!).render(
  <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
    <App />
  </ThemeProvider>
);
