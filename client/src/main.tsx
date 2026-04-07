import { createRoot } from "react-dom/client";
import * as Sentry from "@sentry/react";
import LogRocket from "logrocket";
import App from "./App.tsx";
import "./index.css";
import "./styles/animations.css";

const sentryDsn = import.meta.env.VITE_SENTRY_DSN as string | undefined;
if (sentryDsn) {
	Sentry.init({
		dsn: sentryDsn,
		tracesSampleRate: Number(import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE || 0.1),
		environment: import.meta.env.MODE,
	});
}

const logRocketAppId = import.meta.env.VITE_LOGROCKET_APP_ID as string | undefined;
if (logRocketAppId) {
	LogRocket.init(logRocketAppId);
}

createRoot(document.getElementById("root")!).render(<App />);
