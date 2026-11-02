import { describe, test, expect } from 'vitest'
import { Formatter } from '@/js/utils/formatter'

describe('Formatter', () => {
  const formatter = new Formatter()
  const testDate = '2026-08-16T12:55:32Z'

  test.each([
    { input: 'https://github.com/user/repo.git', expected: 'https://github.com/user/repo' },
    { input: 'https://github.com/user/repo.git/', expected: 'https://github.com/user/repo' },
    { input: 'https://github.com/user/repo/', expected: 'https://github.com/user/repo' },
    { input: 'https://github.com/user/repo', expected: 'https://github.com/user/repo' },
    { input: 'non-url', expected: 'non-url' },
    { input: undefined, expected: '' },
    { input: null, expected: '' },
    { input: '', expected: '' },
    { input: 123, expected: '' },
  ])('clean strips .git and trailing slash: $input', ({ input, expected }) => {
    const result = formatter.getCleanRepoUrl(input)
    expect(result).toBe(expected)
  })

  test.each([
    { input: 'title\ndescription\nchangelog', expected: 'title' },
    { input: 'single line title', expected: 'single line title' },
    { input: undefined, expected: '' },
    { input: null, expected: '' },
    { input: '', expected: '' },
    { input: 123, expected: '' },
  ])('splits lines into title: $input', ({ input, expected }) => {
    const result = formatter.getFormattedTitle(input)
    expect(result).toBe(expected)
  })

  test.each([
    { input: 'title\ndescription\nchangelog', expected: 'description\nchangelog' },
    {
      input: 'update tests\n\n- item 1\n- item 2',
      expected: '\n- item 1\n- item 2',
    },
    { input: 'single line title', expected: '' },
    { input: undefined, expected: '' },
    { input: null, expected: '' },
    { input: '', expected: '' },
    { input: 123, expected: '' },
  ])('splits lines into description: $input', ({ input, expected }) => {
    const result = formatter.getFormattedDescription(input)
    expect(result).toBe(expected)
  })

  test.each([
    {
      locales: 'en-US',
      options: { timeZone: 'UTC' },
      expected: '8/16/2026, 12:55:32 PM',
    },
    {
      locales: 'en-US',
      options: { timeZone: 'America/Los_Angeles' },
      expected: '8/16/2026, 5:55:32 AM',
    },
    {
      locales: 'uk-UA',
      options: { timeZone: 'Europe/Kyiv' },
      expected: '16.08.2026, 15:55:32',
    },
  ])(
    'formats date in locale string for $locales with $options.timeZone',
    ({ locales, options, expected }) => {
      const result = formatter.getDateInLocaleString(testDate, locales, options)
      expect(result).toBe(expected)
    },
  )

  test.each([
    {
      locales: 'en-US',
      options: { timeZone: 'UTC' },
      expected: '8/16/2026',
    },
    {
      locales: 'en-US',
      options: { timeZone: 'America/Los_Angeles' },
      expected: '8/16/2026',
    },
    {
      locales: 'uk-UA',
      options: { timeZone: 'Europe/Kyiv' },
      expected: '16.08.2026',
    },
  ])('formats date for $locales with $options.timeZone', ({ locales, options, expected }) => {
    const result = formatter.getFormattedDate(testDate, locales, options)
    expect(result).toBe(expected)
  })

  test.each([{ input: 'invalid-date' }, { input: null }, { input: undefined }, { input: NaN }])(
    "returns 'Invalid Date' for invalid date in locale string: $input",
    ({ input }) => {
      const result = formatter.getDateInLocaleString(input)
      expect(result).toBe('Invalid Date')
    },
  )

  test.each([{ input: 'invalid-date' }, { input: null }, { input: undefined }, { input: NaN }])(
    "returns 'Invalid Date' for invalid date in formatted date: $input",
    ({ input }) => {
      const result = formatter.getFormattedDate(input)
      expect(result).toBe('Invalid Date')
    },
  )

  test.each([
    { input: '35c2ab6d6ac3526a22a21d0a83c6309f574daeac', expected: '35c2ab6' },
    { input: 'abcdef1234567890', expected: 'abcdef1' },
    { input: 'abc', expected: 'abc' },
    { input: true, expected: '' },
    { input: 123, expected: '' },
    { input: null, expected: '' },
    { input: undefined, expected: '' },
    { input: '', expected: '' },
  ])('truncates to 7 chars: $input', ({ input, expected }) => {
    const result = formatter.getShortHash(input)
    expect(result).toBe(expected)
  })

  test.each([
    { input: '.hidden', expected: 'file' },
    { input: 123, expected: 'file' },
    { input: 'Component.tsx', expected: 'tsx' },
    { input: 'styles.module.scss', expected: 'scss' },
    { input: 'Makefile', expected: 'file' },
    { input: 'example.js', expected: 'js' },
    { input: null, expected: 'file' },
    { input: undefined, expected: 'file' },
    { input: '', expected: 'file' },
  ])('extracts extension for file: $input', ({ input, expected }) => {
    const result = formatter.getFormattedExtension(input)
    expect(result).toBe(expected)
  })

  test.each([
    { input: 'modified', expected: 'M' },
    { input: 'A', expected: 'A' },
    { input: 'unknown', expected: 'U' },
    { input: true, expected: '' },
    { input: 123, expected: '' },
    { input: null, expected: '' },
    { input: undefined, expected: '' },
    { input: '', expected: '' },
  ])('returns first char uppercase for status: $input', ({ input, expected }) => {
    const result = formatter.getShortStatus(input)
    expect(result).toBe(expected)
  })
})
