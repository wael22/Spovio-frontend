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
  const cfg = patterns[normalizedType] || patterns[typeAliases[normalizedType]];

  if (!cfg) {
    return { title, message };
  }

  const params: Record<string, string> = {};
  if (cfg.regex && cfg.paramNames) {
    const match = title.match(cfg.regex) || message.match(cfg.regex);
    if (match) {
      cfg.paramNames.forEach((name, i) => {
        params[name] = (match[i + 1] || "").trim();
      });
    }
  }

  return {
    title: i18n.t(cfg.titleKey, params),
    message: i18n.t(cfg.msgKey, params),
  };
}
