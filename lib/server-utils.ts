import { NextRequest } from "next/server"
import { ACTIONS_CORS_HEADERS, BLOCKCHAIN_IDS } from "@solana/actions"

/**
 * This helper won't parse FormData correctly in case of array-like data
 */
export const getBody = async <T>(
  request: NextRequest & { _body?: T }
): Promise<T> => {
  const body = {} as T

  if (request.bodyUsed) {
    return request._body ?? body
  }

  if (
    request.headers
      .get("Content-Type")
      ?.toLowerCase()
      .startsWith("application/json")
  ) {
    return await request.json()
  }

  const formData = await request.formData()

  formData.forEach((val, key) => {
    body[key] = val
  })

  request._body = body

  return body
}

/**
 * Duplicate `getBody` functionality as original one
 * does not give correct result for FormData with array-like data
 */
export const getBody2 = async <T>(
  request: NextRequest & { _body?: T }
): Promise<T> => {
  const body = {} as T

  if (request.bodyUsed) {
    return request._body ?? body
  }

  if (request.headers.get("Content-Type") === "application/json") {
    return await request.json()
  }

  const formData = await request.formData()

  // tinkering FormData to support array-like data
  // anyway doing this seems a bit strange.
  // TODO: figure out whether is it necessary to make this work here
  formData.forEach((val, key) => {
    const prev = body[key]
    if (Array.isArray(prev)) {
      body[key] = prev.concat([val])
    } else if (Boolean(prev)) {
      body[key] = [prev, val]
    } else {
      body[key] = val
    }
  })

  request._body = body

  return body
}

const DEFAULT_SOLANA_HEADERS = {
  ...ACTIONS_CORS_HEADERS,
  "X-Blockchain-Ids":
    process.env.NODE_ENV === "production"
      ? BLOCKCHAIN_IDS.mainnet
      : BLOCKCHAIN_IDS.devnet,
  "X-Action-Version": "1.6.6",
}

export function resSolanaActionSuccess(options: {
  status?: number
  payload: object | null
  headers?: Record<string, string>
}) {
  const { status = 200, payload, headers = DEFAULT_SOLANA_HEADERS } = options

  return Response.json(payload, { status, headers })
}

export function resSolanaActionError(options: {
  status: number
  error: string
  headers?: Record<string, string>
}) {
  const { status, error, headers = DEFAULT_SOLANA_HEADERS } = options

  return Response.json({ message: error }, { status, headers })
}

export function getActionProp(
  name: string,
  query?: URLSearchParams,
  body?: { data?: Record<string, string | Array<string> | undefined> }
): string | Array<string> | object {
  return (
    body?.data?.[name] ||
    (query?.get(name) !== `{${name}}` ? query?.get(name) : "") ||
    ""
  )
}
