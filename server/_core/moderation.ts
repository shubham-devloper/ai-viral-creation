/**
 * Content moderation system for AI generation prompts
 * Validates prompts against prohibited content patterns
 */

const PROHIBITED_PATTERNS = [
  // Violence and harm
  /kill|murder|harm|hurt|violence|violent/i,
  // Sexual content
  /sex|porn|nude|naked|xxx|adult/i,
  // Hate speech
  /hate|racist|racist|slur|discrimination/i,
  // Illegal activities
  /illegal|drug|cocaine|heroin|meth|steal|robbery/i,
  // Misinformation
  /fake news|hoax|conspiracy|qanon/i,
];

const SUSPICIOUS_PATTERNS = [
  // Potentially harmful
  /weapon|gun|bomb|explosive/i,
  // Potentially inappropriate
  /adult|mature|nsfw/i,
];

export interface ModerationResult {
  isAllowed: boolean;
  isSuspicious: boolean;
  reason?: string;
  score: number; // 0-100, higher = more risky
}

/**
 * Validate a prompt for prohibited content
 * @param prompt The user's generation prompt
 * @returns ModerationResult with validation details
 */
export function validatePrompt(prompt: string): ModerationResult {
  if (!prompt || prompt.trim().length === 0) {
    return {
      isAllowed: false,
      isSuspicious: false,
      reason: "Prompt cannot be empty",
      score: 0,
    };
  }

  if (prompt.length > 2000) {
    return {
      isAllowed: false,
      isSuspicious: false,
      reason: "Prompt exceeds maximum length of 2000 characters",
      score: 0,
    };
  }

  let score = 0;
  let reason: string | undefined;

  // Check prohibited patterns
  for (const pattern of PROHIBITED_PATTERNS) {
    if (pattern.test(prompt)) {
      return {
        isAllowed: false,
        isSuspicious: false,
        reason: `Prompt contains prohibited content: ${pattern.source}`,
        score: 100,
      };
    }
  }

  // Check suspicious patterns
  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(prompt)) {
      score += 30;
    }
  }

  // Check for excessive repetition (spam indicator)
  const words = prompt.split(/\s+/);
  const uniqueWords = new Set(words);
  const repetitionRatio = 1 - uniqueWords.size / words.length;
  if (repetitionRatio > 0.5) {
    score += 20;
    reason = "Prompt contains excessive repetition";
  }

  // Check for URL patterns (potential phishing/spam)
  if (/https?:\/\/|www\./i.test(prompt)) {
    score += 15;
  }

  return {
    isAllowed: score < 50,
    isSuspicious: score >= 30 && score < 50,
    reason,
    score,
  };
}

/**
 * Check if user has exceeded rate limit
 * @param userId User ID
 * @param generationsInLastMinute Number of generations in last minute
 * @param maxPerMinute Maximum allowed generations per minute
 * @returns true if user is within limit, false if exceeded
 */
export function checkRateLimit(
  userId: string,
  generationsInLastMinute: number,
  maxPerMinute: number = 5
): boolean {
  return generationsInLastMinute < maxPerMinute;
}

/**
 * Check if user's plan allows HD/Video generation
 * @param plan User's subscription plan
 * @param generationType Type of generation (IMAGE, VIDEO, STORY, AVATAR)
 * @param quality Quality level (standard, hd)
 * @returns true if allowed, false if not
 */
export function checkPlanRestrictions(
  plan: "FREE" | "STARTER" | "PRO" | "ENTERPRISE",
  generationType: string,
  quality: string
): boolean {
  const restrictions: Record<string, Record<string, boolean>> = {
    FREE: {
      IMAGE_standard: true,
      IMAGE_hd: false,
      STORY_standard: true,
      STORY_hd: false,
      AVATAR_standard: false,
      AVATAR_hd: false,
      VIDEO_standard: false,
      VIDEO_hd: false,
    },
    STARTER: {
      IMAGE_standard: true,
      IMAGE_hd: true,
      STORY_standard: true,
      STORY_hd: true,
      AVATAR_standard: true,
      AVATAR_hd: false,
      VIDEO_standard: false,
      VIDEO_hd: false,
    },
    PRO: {
      IMAGE_standard: true,
      IMAGE_hd: true,
      STORY_standard: true,
      STORY_hd: true,
      AVATAR_standard: true,
      AVATAR_hd: true,
      VIDEO_standard: true,
      VIDEO_hd: false,
    },
    ENTERPRISE: {
      IMAGE_standard: true,
      IMAGE_hd: true,
      STORY_standard: true,
      STORY_hd: true,
      AVATAR_standard: true,
      AVATAR_hd: true,
      VIDEO_standard: true,
      VIDEO_hd: true,
    },
  };

  const key = `${generationType}_${quality}`;
  return restrictions[plan]?.[key] ?? false;
}
