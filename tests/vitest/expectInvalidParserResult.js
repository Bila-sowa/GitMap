import { expect } from 'vitest'
import { ParseError } from '@/js/errors'

const expectInvalidParserResult = (action, method) => {
  expect(action).toThrow(ParseError)

  try {
    action()
  } catch (error) {
    expect(error.userMessage).toBe('Unexpected response format from GitHub')
    expect(error.context).toBe(method)
  }
}

export { expectInvalidParserResult }
