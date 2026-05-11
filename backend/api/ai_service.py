"""Gemini Nano Banana image generation service."""
import asyncio
import base64
import uuid

from django.conf import settings
from emergentintegrations.llm.chat import LlmChat, UserMessage, ImageContent


MODEL_ID = "gemini-3.1-flash-image-preview"


def _build_prompt(prompt: str, style: str = "", color: str = "", material: str = "",
                  audience: str = "") -> str:
    parts = []
    if prompt:
        parts.append(prompt.strip())
    if style:
        parts.append(f"Style: {style}.")
    if color:
        parts.append(f"Color palette: {color}.")
    if material:
        parts.append(f"Material: {material}.")
    if audience:
        parts.append(f"Designed for: {audience}.")
    parts.append(
        "High-fashion editorial photography, sharp detail, studio lighting, "
        "luxury aesthetic, clean background, full garment visible."
    )
    return " ".join(parts)


async def _generate_async(full_prompt: str, reference_b64: str | None):
    chat = LlmChat(
        api_key=settings.EMERGENT_LLM_KEY,
        session_id=f"fashion-{uuid.uuid4()}",
        system_message=(
            "You are an elite fashion designer AI specializing in high-fashion "
            "editorial concept generation. Always output a single fashion design image."
        ),
    )
    chat.with_model("gemini", MODEL_ID).with_params(modalities=["image", "text"])

    if reference_b64:
        msg = UserMessage(text=full_prompt, file_contents=[ImageContent(reference_b64)])
    else:
        msg = UserMessage(text=full_prompt)

    text, images = await chat.send_message_multimodal_response(msg)
    return text, images


def generate_fashion_image(prompt: str, reference_b64: str | None = None,
                           style: str = "", color: str = "", material: str = "",
                           audience: str = ""):
    full_prompt = _build_prompt(prompt, style, color, material, audience)
    text, images = asyncio.run(_generate_async(full_prompt, reference_b64))

    if not images:
        return None, text, full_prompt

    first = images[0]
    mime = first.get("mime_type", "image/png")
    data_uri = f"data:{mime};base64,{first['data']}"
    return data_uri, text, full_prompt
