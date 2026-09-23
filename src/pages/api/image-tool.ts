import type { APIRoute } from 'astro';
import { OMNIROUTER_API_BASE_URL, OMNIROUTER_API_KEY } from 'astro:env/server';

export const prerender = false;

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 6;

const CODEX_MODELS = new Set([
  'codex/gpt-5.6-luna',
  'codex/gpt-5.6-sol',
  'codex/gpt-5.6-terra',
]);

const CODEX_SIZES = new Set(['1024x1024', '1024x1536', '1536x1024']);
const buckets = new Map<string, number[]>();

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}

function getClientId(request: Request) {
  return (
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'local'
  );
}

function isRateLimited(clientId: string) {
  const now = Date.now();
  const active = (buckets.get(clientId) || []).filter(
    (timestamp) => now - timestamp < WINDOW_MS,
  );

  if (active.length >= MAX_REQUESTS_PER_WINDOW) {
    buckets.set(clientId, active);
    return true;
  }

  active.push(now);
  buckets.set(clientId, active);
  return false;
}

function inferMimeType(base64: string) {
  if (base64.startsWith('iVBOR')) return 'image/png';
  if (base64.startsWith('/9j/')) return 'image/jpeg';
  if (base64.startsWith('UklGR')) return 'image/webp';
  if (base64.startsWith('R0lGOD')) return 'image/gif';
  return 'image/png';
}

function normalizeResult(payload: any, model: string) {
  const result = payload?.data?.[0];

  if (!result) {
    throw new Error('OmniRouter returned no image. Please try another model.');
  }

  if (typeof result.b64_json === 'string' && result.b64_json.length > 0) {
    const mimeType = inferMimeType(result.b64_json);
    return {
      image: `data:${mimeType};base64,${result.b64_json}`,
      mimeType,
      revisedPrompt: result.revised_prompt || null,
      model,
    };
  }

  if (typeof result.url === 'string' && result.url.length > 0) {
    return {
      image: result.url,
      mimeType: null,
      revisedPrompt: result.revised_prompt || null,
      model,
    };
  }

  throw new Error('OmniRouter returned an unsupported image format.');
}

export const POST: APIRoute = async ({ request }) => {
  const apiKey = OMNIROUTER_API_KEY;
  const baseUrl = OMNIROUTER_API_BASE_URL.replace(/\/$/, '');

  if (!apiKey) {
    return json({ error: 'The image service is not configured.' }, 503);
  }

  const origin = request.headers.get('origin');
  if (origin && new URL(origin).host !== new URL(request.url).host) {
    return json({ error: 'Cross-origin requests are not allowed.' }, 403);
  }

  if (isRateLimited(getClientId(request))) {
    return json({ error: 'Too many requests. Please wait a few minutes and try again.' }, 429);
  }

  try {
    const input = await request.formData();
    const mode = input.get('mode') === 'edit' ? 'edit' : 'generate';
    const prompt = String(input.get('prompt') || '').trim();
    const requestedModel = String(input.get('model') || '');
    const requestedSize = String(input.get('size') || '');
    const model = CODEX_MODELS.has(requestedModel)
      ? requestedModel
      : 'codex/gpt-5.6-luna';
    const size = CODEX_SIZES.has(requestedSize) ? requestedSize : '1024x1024';

    if (!prompt || prompt.length > 4000) {
      return json({ error: 'Enter instructions between 1 and 4,000 characters.' }, 400);
    }

    let endpoint = `${baseUrl}/v1/images/generations`;
    let body: BodyInit;
    const headers: Record<string, string> = {
      Authorization: `Bearer ${apiKey}`,
    };

    if (mode === 'edit') {
      const image = input.get('image');

      if (!(image instanceof File) || image.size === 0) {
        return json({ error: 'Choose an image to edit.' }, 400);
      }

      if (!['image/png', 'image/jpeg', 'image/webp'].includes(image.type)) {
        return json({ error: 'Use a PNG, JPEG, or WebP image.' }, 400);
      }

      if (image.size > MAX_IMAGE_BYTES) {
        return json({ error: 'The source image must be 10 MB or smaller.' }, 413);
      }

      endpoint = `${baseUrl}/v1/images/edits`;
      const upstreamForm = new FormData();
      upstreamForm.set('model', model);
      upstreamForm.set('prompt', prompt);
      upstreamForm.set('size', size);
      upstreamForm.set('n', '1');
      upstreamForm.set('response_format', 'b64_json');
      upstreamForm.set('image', image, image.name || 'source-image');
      body = upstreamForm;
    } else {
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify({
        model,
        prompt,
        size,
        n: 1,
        response_format: 'b64_json',
      });
    }

    const upstream = await fetch(endpoint, {
      method: 'POST',
      headers,
      body,
      signal: AbortSignal.timeout(180_000),
    });
    const payload = await upstream.json().catch(() => null);

    if (!upstream.ok) {
      const message =
        payload?.error?.message || payload?.message || 'OmniRouter could not process this image.';
      return json({ error: message }, upstream.status >= 500 ? 502 : upstream.status);
    }

    return json(normalizeResult(payload, model));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Image request failed.';
    const safeMessage =
      message.includes('timeout') || message.includes('aborted')
        ? 'The image request timed out. Please try again.'
        : message;
    return json({ error: safeMessage }, 500);
  }
};
