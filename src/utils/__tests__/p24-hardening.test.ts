import { describe, expect, it } from 'vitest'

import { coerceSandbox } from '../coerce-sandbox'
import { buildLocalizedP24ErrorMessage, mapP24ErrorCode } from '../p24-errors'
import { redactUnknown } from '../p24-logger'
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

  it('treats unrecognized strings as false', () => {
    expect(coerceSandbox('flase')).toBe(false)
    expect(coerceSandbox('prod')).toBe(false)
  })

  it('treats nullish and unknown types as false', () => {
    expect(coerceSandbox(null)).toBe(false)
    expect(coerceSandbox(undefined)).toBe(false)
    expect(coerceSandbox({})).toBe(false)
  })
})

describe('redactUnknown', () => {
  it('redacts P24 clientAddres and correctly spelled clientAddress', () => {
    expect(
      redactUnknown({
        clientAddres: 'ul. Testowa 1',
        clientAddress: 'ul. Testowa 2',
        sessionId: 'sess_1',
      }),
    ).toEqual({
      clientAddres: '[REDACTED]',
      clientAddress: '[REDACTED]',
      sessionId: 'sess_1',
    })
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

  it('zero-pads single-digit numeric and string codes', () => {
    expect(mapP24ErrorCode(5, 'en')).toContain('signature')
    expect(mapP24ErrorCode('err5', 'en')).toContain('signature')
    expect(mapP24ErrorCode('5', 'en')).toContain('signature')
  })

  it('preserves multi-digit codes', () => {
    expect(mapP24ErrorCode(101, 'en')).toContain('expired')
    expect(mapP24ErrorCode('err101', 'en')).toContain('expired')
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
