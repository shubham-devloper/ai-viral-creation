/**
 * Image generation helper using internal ImageService
 *
 * Example usage:
 *   const { url: imageUrl } = await generateImage({
 *     prompt: "A serene landscape with mountains"
 *   });
 *
 * For editing:
 *   const { url: imageUrl } = await generateImage({
 *     prompt: "Add a rainbow to this landscape",
 *     originalImages: [{
 *       url: "https://example.com/original.jpg",
 *       mimeType: "image/jpeg"
 *     }]
 *   });
 */
import { storagePut } from "server/storage";
import { ENV } from "./env";

export type GenerateImageOptions = {
  prompt: string;
  originalImages?: Array<{
    url?: string;
    b64Json?: string;
    mimeType?: string;
  }>;
};

export type GenerateImageResponse = {
  url?: string;
};

export async function generateImage(
  options: GenerateImageOptions
): Promise<GenerateImageResponse> {
  if (!ENV.forgeApiUrl) {
    throw new Error("BUILT_IN_FORGE_API_URL is not configured");
  }
  if (!ENV.forgeApiKey) {
    throw new Error("BUILT_IN_FORGE_API_KEY is not configured");
  }

  // Build the full URL by appending the service path to the base URL
  const baseUrl = ENV.forgeApiUrl.endsWith("/")
    ? ENV.forgeApiUrl
    : `${ENV.forgeApiUrl}/`;
  const fullUrl = new URL(
    "images.v1.ImageService/GenerateImage",
    baseUrl
  ).toString();

  const response = await fetch(fullUrl, {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "connect-protocol-version": "1",
      authorization: `Bearer ${ENV.forgeApiKey}`,
    },
    body: JSON.stringify({
      prompt: options.prompt,
      original_images: options.originalImages || [],
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(
      `Image generation request failed (${response.status} ${response.statusText})${detail ? `: ${detail}` : ""}`
    );
  }

  const result = (await response.json()) as {
    image: {
      b64Json: string;
      mimeType: string;
    };
  };
  const base64Data = result.image.b64Json;
  const buffer = Buffer.from(base64Data, "base64");

  // Save to S3
  const { url } = await storagePut(
    `generated/${Date.now()}.png`,
    buffer,
    result.image.mimeType
  );
  return {
    url,
  };
}

/**
 * Generate story using Manus LLM
 */
export async function generateStory(
  prompt: string,
  tone: string = "neutral",
  length: "short" | "medium" | "long" = "medium"
): Promise<string> {
  const { invokeLLM } = await import("./llm");
  
  const lengthGuide = {
    short: "100-200 words",
    medium: "300-500 words",
    long: "800-1200 words",
  };

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "You are a creative story writer. Write engaging stories based on user prompts with the specified tone and length.",
      },
      {
        role: "user",
        content: `Write a ${tone} story based on this prompt: "${prompt}"\n        \n        Length: ${lengthGuide[length]}\n        Tone: ${tone}\n        \n        Write only the story, no additional commentary.`,
      },
    ],
  });

  const content = response.choices[0]?.message?.content;
  if (typeof content === "string") {
    return content;
  }

  throw new Error("Failed to generate story");
}

/**
 * Generate avatar description using Manus LLM
 */
export async function generateAvatarDescription(
  character: string,
  style: string,
  customizations: Record<string, string>
): Promise<string> {
  const { invokeLLM } = await import("./llm");
  
  const customizationText = Object.entries(customizations)
    .map(([key, value]) => `${key}: ${value}`)
    .join(", ");

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "You are an avatar designer. Create detailed visual descriptions for avatars based on character specifications.",
      },
      {
        role: "user",
        content: `Design an avatar with these specifications:\n        - Character: ${character}\n        - Style: ${style}\n        - Customizations: ${customizationText}\n        \n        Provide a detailed visual description that can be used to generate the avatar image.`,
      },
    ],
  });

  const content = response.choices[0]?.message?.content;
  if (typeof content === "string") {
    return content;
  }

  throw new Error("Failed to generate avatar description");
}

/**
 * Generate avatar image URL (placeholder for demo)
 */
export function generateAvatarImageUrl(
  character: string,
  style: string,
  seed: number = Math.random()
): string {
  const styleMap: Record<string, string> = {
    cartoon: "ff6b9d",
    realistic: "667eea",
    anime: "f093fb",
    pixel: "00ff00",
    "3d": "ffd700",
  };

  const color = styleMap[style] || "667eea";
  const encodedCharacter = encodeURIComponent(character.substring(0, 30));

  return `https://via.placeholder.com/512x512/${color}/ffffff?text=${encodedCharacter}+Avatar`;
}
