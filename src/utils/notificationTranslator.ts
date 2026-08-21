import i18n from "i18next";

interface PatternConfig {
  titleKey: string;
  msgKey: string;
  regex?: RegExp;
  paramNames?: string[];
}

const patterns: Record<string, PatternConfig> = {
  video_ready: {
    titleKey: "notifications.videoReady",
    msgKey: "notifications.videoReadyMsg",
    regex: /'([^']+)'/,
    paramNames: ["title"],
  },
  recording_started: {
    titleKey: "notifications.recordingStarted.title",
    msgKey: "notifications.recordingStarted.msg",
    regex: /terrain\s+(.+?)\s+a commencé/,
    paramNames: ["courtName"],
  },
  recording_stopped: {
    titleKey: "notifications.recordingStopped.title",
    msgKey: "notifications.recordingStopped.msg",
  },
  credits_added: {
    titleKey: "notifications.creditsAdded.title",
    msgKey: "notifications.creditsAdded.msg",
    regex: /(\d+)\s*crédits?/,
    paramNames: ["amount"],
  },
  credit: {
    titleKey: "notifications.credit.title",
    msgKey: "notifications.credit.msg",
    regex: /(\d+)\s*crédits?/,
    paramNames: ["amount"],
  },
  payment_success: {
    titleKey: "notifications.paymentSuccess.title",
    msgKey: "notifications.paymentSuccess.msg",
    regex: /(\d+)\s*crédits?/,
    paramNames: ["amount"],
  },
  payment_failed: {
    titleKey: "notifications.paymentFailed.title",
    msgKey: "notifications.paymentFailed.msg",
    regex: /(\d+)\s*crédits?/,
    paramNames: ["amount"],
  },
  support: {
    titleKey: "notifications.support.title",
    msgKey: "notifications.support.msg",
    regex: /['"]([^'"]+)['"]/,
    paramNames: ["subject"],
  },
  video_shared: {
    titleKey: "notifications.videoShared.title",
    msgKey: "notifications.videoShared.msg",
    regex: /(.+?)\s+a partagé/,
    paramNames: ["sender"],
  },
  system_maintenance: {
    titleKey: "notifications.systemMaintenance.title",
    msgKey: "notifications.systemMaintenance.msg",
  },
  welcome: {
    titleKey: "notifications.welcome.title",
    msgKey: "notifications.welcome.msg",
    regex: /Bonjour\s+(.+?),/,
    paramNames: ["name"],
  },
};

const typeAliases: Record<string, string> = {
  video: "video_ready",
  share: "video_shared",
  credit: "credit",
  system: "system_maintenance",
};

export function translateNotification(
  type: string | undefined,
  title: string,
  message: string
): { title: string; message: string } {
  const normalizedType = (type || "").toLowerCase();

  // Special handling for videos claimed via public link / QR code
  if (normalizedType === "video_shared" || normalizedType === "share") {
    if (message.includes("lien de partage") || message.includes("bibliothèque") || message.includes("ajoutée") || message.includes("added to your library")) {
      const titleMatch = message.match(/["']([^"']+)["']/);
      const videoTitle = titleMatch ? titleMatch[1] : "";
      return {
        title: i18n.t("notifications.videoClaimed.title", "🔗 Nouvelle vidéo ajoutée"),
        message: videoTitle
          ? i18n.t("notifications.videoClaimed.msg", { title: videoTitle, defaultValue: `La vidéo "${videoTitle}" a été ajoutée à votre bibliothèque.` })
          : message,
      };
    }
  }

  const cfg = patterns[normalizedType] || patterns[typeAliases[normalizedType]];

  if (!cfg) {
    return { title, message };
  }

  const params: Record<string, string> = {};
  if (cfg.regex && cfg.paramNames) {
    const match = message.match(cfg.regex) || title.match(cfg.regex);
    if (match) {
      cfg.paramNames.forEach((name, i) => {
        params[name] = (match[i + 1] || "").trim();
      });
    }
  }

  // Fallback to ensure {{sender}} is never displayed raw if regex match fails
  if (normalizedType === "video_shared" || normalizedType === "share") {
    if (!params.sender) {
      params.sender = i18n.language?.startsWith('fr') ? "Un joueur" : "A player";
    }
  }

  return {
    title: i18n.t(cfg.titleKey, params),
    message: i18n.t(cfg.msgKey, params),
  };
}
