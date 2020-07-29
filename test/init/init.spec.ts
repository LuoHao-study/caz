import os from 'os'
import fs from 'fs'
import path from 'path'
import { createContext } from './util'
import init from '../../src/init/init'

test('unit:init:init', async () => {
  expect(typeof init).toBe('function')
})

test('unit:init:init:null', async () => {
  const ctx = createContext()
  const result = await init(ctx)
  expect(result).toBe(undefined)
})

test('unit:init:init:false', async () => {
  const ctx = createContext({}, { init: false })
  const result = await init(ctx)
  expect(result).toBe(undefined)
})

test('unit:init:init:default', async () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'caz-test-'))
  await fs.promises.writeFile(path.join(temp, 'caz.txt'), 'hello')
  const ctx = createContext({
    dest: temp,
    files: [{ path: '.gitignore', contents: Buffer.from('') }]
  })
  await init(ctx)
  expect(fs.existsSync(path.join(temp, '.git'))).toBe(true)
  const stats = await fs.promises.stat(path.join(temp, '.git'))
  expect(stats.isDirectory()).toBe(true)
  expect(fs.existsSync(path.join(temp, '.git', 'COMMIT_EDITMSG'))).toBe(true)
  const msg = await fs.promises.readFile(path.join(temp, '.git', 'COMMIT_EDITMSG'), 'utf8')
  expect(msg.trim()).toBe('feat: initial commit')
  await fs.promises.rmdir(temp, { recursive: true })
})

test('unit:init:init:manual', async () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'caz-test-'))
  await fs.promises.writeFile(path.join(temp, 'caz.txt'), 'hello')
  const ctx = createContext({ dest: temp }, { init: true })
  await init(ctx)
  expect(fs.existsSync(path.join(temp, '.git'))).toBe(true)
  const stats = await fs.promises.stat(path.join(temp, '.git'))
  expect(stats.isDirectory()).toBe(true)
  expect(fs.existsSync(path.join(temp, '.git', 'COMMIT_EDITMSG'))).toBe(true)
  const msg = await fs.promises.readFile(path.join(temp, '.git', 'COMMIT_EDITMSG'), 'utf8')
  expect(msg.trim()).toBe('feat: initial commit')
  await fs.promises.rmdir(temp, { recursive: true })
})

test('unit:init:init:error', async () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'caz-test-'))
  const ctx = createContext({ dest: temp }, { init: true })
  expect.hasAssertions()
  try {
    await init(ctx)
  } catch (e) {
    expect(e.message).toBe('Initial repository failed.')
  }
  await fs.promises.rmdir(temp, { recursive: true })
})
