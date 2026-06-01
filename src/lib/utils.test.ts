import { describe, it, expect } from 'vitest'
import { cn, formatBytes } from './utils'

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('handles conditional classes', () => {
    expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz')
  })

  it('resolves tailwind conflicts', () => {
    expect(cn('p-4', 'p-2')).toBe('p-2')
  })
})

describe('formatBytes', () => {
  it('returns — for null', () => {
    expect(formatBytes(null)).toBe('—')
  })

  it('returns — for 0', () => {
    expect(formatBytes(0)).toBe('—')
  })

  it('formats bytes under 1 KB', () => {
    expect(formatBytes(512)).toBe('512 B')
  })

  it('formats bytes as KB', () => {
    expect(formatBytes(2048)).toBe('2.0 KB')
  })

  it('formats bytes as MB', () => {
    expect(formatBytes(1024 * 1024 * 3)).toBe('3.0 MB')
  })

  it('rounds KB to one decimal', () => {
    expect(formatBytes(1536)).toBe('1.5 KB')
  })
})
