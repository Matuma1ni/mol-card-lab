import { Conformer, ConformerSet, GenerateRequest } from '../types/molecule'

export class GenerationApiError extends Error {
  readonly status?: number
  readonly technicalPayload?: unknown

  constructor(message: string, status?: number, technicalPayload?: unknown) {
    super(message)
    this.name = 'GenerationApiError'
    this.status = status
    this.technicalPayload = technicalPayload
  }
}

function isCoordinate(value: unknown): value is [number, number, number] {
  return Array.isArray(value)
    && value.length === 3
    && value.every((part) => typeof part === 'number' && Number.isFinite(part))
}

function isConformer(value: unknown): value is Conformer {
  if (typeof value !== 'object' || value === null) return false
  const item = value as Record<string, unknown>
  return typeof item.id === 'string'
    && typeof item.smiles === 'string'
    && typeof item.molBlock === 'string'
    && item.molBlock.trim().length > 0
    && typeof item.num_atoms === 'number'
    && Array.isArray(item.coordinates)
    && item.coordinates.every(isCoordinate)
}

function isConformerSet(value: unknown): value is ConformerSet {
  if (typeof value !== 'object' || value === null) return false
  const result = value as Record<string, unknown>
  return Array.isArray(result.conformers)
    && result.conformers.every(isConformer)
    && typeof result.count === 'number'
    && result.count === result.conformers.length
}

function detailMessage(payload: unknown): string | undefined {
  if (typeof payload !== 'object' || payload === null) return undefined
  const detail = (payload as Record<string, unknown>).detail
  return typeof detail === 'string' && detail.trim() ? detail : undefined
}

export async function generateConformers(
  request: GenerateRequest,
  signal?: AbortSignal,
): Promise<ConformerSet> {
  const body = Object.fromEntries(
    Object.entries(request).filter(([, value]) => value !== undefined),
  )
  let response: Response
  try {
    response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal,
    })
  } catch (error) {
    throw new GenerationApiError('Unable to reach the conformer service.', undefined, error)
  }

  const responseText = await response.text()
  let payload: unknown
  try {
    payload = responseText ? JSON.parse(responseText) : null
  } catch (error) {
    throw new GenerationApiError(
      'The conformer service returned an unreadable response.',
      response.status,
      { responseText, error },
    )
  }

  if (!response.ok) {
    throw new GenerationApiError(
      detailMessage(payload) ?? 'Conformer generation failed.',
      response.status,
      payload,
    )
  }
  if (!isConformerSet(payload)) {
    throw new GenerationApiError(
      'The conformer service returned incomplete geometry data.',
      response.status,
      payload,
    )
  }
  return payload
}
