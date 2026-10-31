import { describe, test, expect } from 'vitest'
import GitHubDataParser from '@/js/api/gitHubClient/gitHubDataParser'
import { createFile } from '#/fixtures/github/dataParser'
import { expectInvalidParserResult } from '#/vitest/expectInvalidParserResult'

const createFiles = (count) =>
  Array.from({ length: count }, (_, index) => createFile({ filename: `src/file-${index}.js` }))

describe('parseCommitFilesData', () => {
  const parser = new GitHubDataParser()

  test('normalizes file names, changes, extensions, and statuses', () => {
    const files = [
      createFile({ filename: 'src/js/<app>.js', status: 'modified', additions: 12, deletions: 3 }),
      createFile({ filename: 'assets/README', status: 'added', additions: 5, deletions: 0 }),
    ]

    const result = parser.parseCommitFilesData({ files })

    expect(result).toStrictEqual({
      success: true,
      files: [
        {
          name: 'src/js/&lt;app&gt;.js',
          additions: 12,
          deletions: 3,
          extension: 'js',
          fullStatus: 'modified',
          status: 'M',
        },
        {
          name: 'assets/README',
          additions: 5,
          deletions: 0,
          extension: 'file',
          fullStatus: 'added',
          status: 'A',
        },
      ],
      truncated: false,
    })
  })

  test('returns an empty file list as a successful result', () => {
    const raw = { files: [] }

    const result = parser.parseCommitFilesData(raw)

    expect(result).toStrictEqual({ success: true, files: [], truncated: false })
  })

  test('marks the result as truncated at 300 files', () => {
    const underLimit = parser.parseCommitFilesData({ files: createFiles(299) })
    const atLimit = parser.parseCommitFilesData({ files: createFiles(300) })

    expect(underLimit.truncated).toBe(false)
    expect(underLimit.files).toHaveLength(299)
    expect(atLimit.truncated).toBe(true)
    expect(atLimit.files).toHaveLength(300)
  })

  test.each([
    { label: 'a missing files array', raw: { message: 'invalid' } },
    { label: 'a non-array files value', raw: { files: 'invalid' } },
    { label: 'a non-object response', raw: null },
  ])('rejects $label', ({ raw }) => {
    const result = parser.parseCommitFilesData(raw)

    expectInvalidParserResult(result, 'parseCommitFilesData', raw)
  })

  test.each([
    {
      label: 'a file without a filename',
      file: { status: 'modified', additions: 1, deletions: 0 },
    },
    {
      label: 'a file without a status',
      file: { filename: 'README.md', additions: 1, deletions: 0 },
    },
    {
      label: 'a file with non-numeric changes',
      file: { filename: 'README.md', status: 'modified', additions: '1', deletions: 0 },
    },
  ])('rejects $label', ({ file }) => {
    const result = parser.parseCommitFilesData({ files: [file] })

    expectInvalidParserResult(result, 'parseCommitFilesData', file)
  })
})
