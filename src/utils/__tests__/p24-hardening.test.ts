import { describe, expect, it } from 'vitest'

import { coerceSandbox } from '../coerce-sandbox'
import { buildLocalizedP24ErrorMessage, mapP24ErrorCode } from '../p24-errors'
import {
  getOrderId,
  getSessionId,
  normalizeP24SessionData,
} from '../p24-session-data'

describe('coerceSandbox', () => {
  it('coerces string false to boolean false', () => {
    expect(coerceSandbox('false')).toBe(false)
    expect(coerceSandbox('true')).toBe(true)
  })
})

describe('p24 session data helpers', () => {
  it('normalizes mixed session key casing', () => {
    const normalized = normalizeP24SessionData({
      sessionId: 'sess_1',
      orderId: 123,
      token: 'tok',
      currency: 'PLN',
    })

    expect(normalized.session_id).toBe('sess_1')
    expect(normalized.order_id).toBe(123)
    expect(getSessionId(normalized)).toBe('sess_1')
    expect(getOrderId(normalized)).toBe(123)
  })
})

describe('p24 error mapping', () => {
  it('maps known err codes to localized messages', () => {
    expect(mapP24ErrorCode('err59', 'pl')).toContain('środk')
    expect(mapP24ErrorCode('err54', 'en')).toContain('BLIK')
  })

  it('falls back to payload message', () => {
    expect(
      buildLocalizedP24ErrorMessage(
        { responseCode: 999, data: { message: 'Custom decline' } },
        'Payment failed',
      ),
    ).toBe('Custom decline')
  })
})
