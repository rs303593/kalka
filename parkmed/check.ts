#!/usr/bin/env bun
/**
 * Parkmed design check: spacing, corner radius, type sizes, colours and positioning against a look's
 * values (parkmed/parkmed-values.json; with --look garo, parkmed/garo-values.json), on a saved Kalka
 * folder or .fig, or live on the document open in the Kalka app.
 *
 *   bun parkmed/check.ts <folder or .fig>                 report only
 *   bun parkmed/check.ts <folder or .fig> --fix -o <copy> snap spacing, radius and colours into a copy
 *   bun parkmed/check.ts <folder or .fig> --fix --write   the same, in place
 *   bun parkmed/check.ts --app                            the document open in Kalka
 *   bun parkmed/check.ts --app --fix                      fix it live (undo: bun kalka undo)
 *
 * Options: --look parkmed (the default) or garo; --artboard "<name>" checks one artboard; --json
 * prints the raw result.
 * It runs through `kalka eval`, so it uses the Figma plugin API and touches no Kalka internals.
 */
import { cpSync, existsSync, rmSync, statSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { parseArgs as parseCommandLine } from 'node:util'

import * as v from 'valibot'

const IssueSchema = v.object({
  page: v.string(),
  artboard: v.string(),
  path: v.string(),
  id: v.string(),
  kind: v.picklist(['spacing', 'radius', 'type', 'colour', 'position']),
  severity: v.picklist(['error', 'warning', 'info']),
  prop: v.string(),
  value: v.union([v.string(), v.number()]),
  expected: v.array(v.union([v.string(), v.number()])),
  fix: v.optional(v.union([v.string(), v.number()])),
  fixed: v.optional(v.boolean())
})

const ResultSchema = v.object({
  pages: v.number(),
  artboards: v.number(),
  layers: v.number(),
  fixed: v.number(),
  issues: v.array(IssueSchema)
})

type Issue = v.InferOutput<typeof IssueSchema>
type Result = v.InferOutput<typeof ResultSchema>

const HERE = import.meta.dir
const CLI = join(HERE, '..', 'packages', 'cli', 'src', 'index.ts')

function usage(message?: string): never {
  if (message) console.error(`parkmed check: ${message}\n`)
  console.error(
    [
      'Usage:',
      '  bun parkmed/check.ts <folder or .fig> [--fix -o <copy> | --fix --write] [--look parkmed|garo] [--artboard "<name>"] [--json]',
      '  bun parkmed/check.ts --app [--fix] [--look parkmed|garo] [--artboard "<name>"] [--json]'
    ].join('\n')
  )
  process.exit(2)
}

interface Options {
  file: string
  app: boolean
  fix: boolean
  write: boolean
  output: string
  artboard: string
  json: boolean
  look: string
}

function parseArgs(argv: string[]): Options {
  let parsed
  try {
    parsed = parseCommandLine({
      args: argv,
      allowPositionals: true,
      options: {
        app: { type: 'boolean', default: false },
        fix: { type: 'boolean', default: false },
        write: { type: 'boolean', short: 'w', default: false },
        json: { type: 'boolean', default: false },
        output: { type: 'string', short: 'o', default: '' },
        artboard: { type: 'string', default: '' },
        look: { type: 'string', default: 'parkmed' },
        help: { type: 'boolean', short: 'h', default: false }
      }
    })
  } catch (error) {
    usage(error instanceof Error ? error.message : String(error))
  }
  const { help, ...flags } = parsed.values
  if (help) usage()
  if (parsed.positionals.length > 1) usage('give one folder or .fig')
  const options = { ...flags, file: parsed.positionals[0] ?? '' }
  validate(options)
  return options
}

const LOOKS: Record<string, string> = { parkmed: 'parkmed-values.json', garo: 'garo-values.json' }

function validate(options: Options) {
  if (!(options.look in LOOKS)) usage(`--look is parkmed or garo, not ${options.look}`)
  if (options.app === (options.file !== '')) usage('give a folder or .fig, or --app, not both')
  if (options.file && options.fix && !options.write && !options.output)
    usage('--fix on a file needs -o <copy>, or --write to change it in place')
  if (options.file && isFolder(options.file) && options.write)
    usage(
      '--write is for a .fig; for a Kalka folder use --fix -o <new folder>, then open that folder in Kalka'
    )
  if (options.output && existsSync(resolve(options.output)))
    usage(`${options.output} already exists: give a new name`)
}

function isFolder(path: string): boolean {
  return existsSync(path) && statSync(path).isDirectory()
}

/** Runs the Kalka CLI from this checkout and returns its output, or stops with its error. */
async function kalka(args: string[], stdin?: string): Promise<string> {
  const child = Bun.spawn(['bun', 'run', CLI, ...args], {
    stdin: 'pipe',
    stdout: 'pipe',
    stderr: 'pipe'
  })
  if (stdin !== undefined) child.stdin.write(stdin)
  child.stdin.end()
  const [stdout, stderr, exit] = await Promise.all([
    new Response(child.stdout).text(),
    new Response(child.stderr).text(),
    child.exited
  ])
  if (exit !== 0) {
    console.error(stderr.trim() || stdout.trim() || `kalka ${args[0]} exited with ${exit}`)
    if (!args.some((arg) => arg.startsWith('/')))
      console.error(
        '\nIs the Kalka app open with a document, and is its MCP server on (Settings → MCP)?'
      )
    if (stderr.includes('Cannot find module'))
      console.error('\nBuild the packages once first: bun install && bun run build:packages')
    process.exit(2)
  }
  return stdout
}

async function run(options: Options): Promise<Result> {
  const values = await Bun.file(join(HERE, LOOKS[options.look] ?? 'parkmed-values.json')).text()
  const body = await Bun.file(join(HERE, 'check', 'parkmed-check.js')).text()
  const code = [
    `const V = ${values.trim()}`,
    `const FIX = ${options.fix}`,
    `const ONLY = ${JSON.stringify(options.artboard)}`,
    body
  ].join('\n')

  // `kalka eval` saves a .fig; a fixed folder goes through one and is converted back to a folder.
  const folderOut = options.output !== '' && isFolder(options.file)
  const scratch = folderOut ? join(tmpdir(), `parkmed-fix-${process.pid}.fig`) : ''

  const args = ['eval']
  if (options.file) args.push(resolve(options.file))
  args.push('--stdin', '--json')
  if (options.output) args.push('-o', folderOut ? scratch : resolve(options.output))
  if (options.write) args.push('-w')

  if (options.app) console.error('Checking the document open in Kalka…')
  const stdout = await kalka(args, code)
  const start = stdout.indexOf('{')
  if (start === -1) {
    console.error(stdout.trim() || 'kalka eval returned nothing')
    if (options.app)
      console.error(
        '\nIs the Kalka app open with a document, and is its MCP server on (Settings → MCP)?'
      )
    process.exit(2)
  }
  if (folderOut) {
    await kalka(['convert', scratch, '-f', 'folder', '-o', resolve(options.output)])
    rmSync(scratch, { force: true })
    copyInstructions(resolve(options.file), resolve(options.output))
  }
  const result = v.safeParse(v.pipe(v.string(), v.parseJson(), ResultSchema), stdout.slice(start))
  if (!result.success) {
    console.error('The check returned something unexpected:\n' + stdout.slice(start, start + 400))
    process.exit(2)
  }
  return result.output
}

/** A converted folder has no instructions: the source folder's rules and skills go with it. */
function copyInstructions(from: string, to: string) {
  const source = join(from, 'instructions')
  if (isFolder(source)) cpSync(source, join(to, 'instructions'), { recursive: true })
}

function describe(issue: Issue, look: string): string {
  const expected = issue.expected.join(' or ')
  switch (issue.kind) {
    case 'spacing':
      return `${issue.prop} ${issue.value}px → ${look} step ${expected}`
    case 'radius':
      return `${issue.prop} ${issue.value}px → ${expected}`
    case 'type':
      return `font size ${issue.value}px → type scale ${expected}`
    case 'colour':
      return issue.severity === 'error'
        ? `${issue.prop} ${issue.value} is teal → ${expected}`
        : `${issue.prop} ${issue.value} is not a ${look} colour → nearest ${expected}`
    case 'position':
      return `${issue.value} → ${expected}`
  }
}

function print(result: Result, options: Options) {
  const look = options.look === 'garo' ? 'GARO' : 'Parkmed'
  const open = result.issues.filter((issue) => !issue.fixed)
  const where = options.app ? 'the open document' : options.file
  console.log(
    `${look} check · ${where} · ${result.artboards} artboards · ${result.layers} layers · ` +
      `${open.length} to look at${result.fixed ? ` · ${result.fixed} fixed` : ''}\n`
  )
  const byArtboard = Map.groupBy(result.issues, (issue) => `${issue.page} › ${issue.artboard}`)
  for (const [artboard, issues] of byArtboard) {
    console.log(artboard)
    for (const issue of issues) {
      const mark = issue.fixed ? 'fixed  ' : issue.severity.padEnd(7)
      const layer = issue.path.split(' / ').slice(-2).join(' / ')
      console.log(`  ${mark}  ${issue.kind.padEnd(8)} ${describe(issue, look)}   [${layer}]`)
    }
    console.log('')
  }
  const counts = Object.entries(Object.groupBy(open, (issue) => issue.kind))
    .map(([kind, list]) => `${kind} ${list?.length ?? 0}`)
    .join(', ')
  if (open.length === 0) {
    console.log(
      `Clean: every spacing, radius, type size and colour is a ${look} value, and nothing is placed by hand.`
    )
    return
  }
  console.log(`To look at: ${counts}.`)
  const fixable = open.filter((issue) => issue.fix !== undefined).length
  if (fixable > 0 && !options.fix)
    console.log(
      `${fixable} can be fixed with --fix (spacing, radius, near-${look} colours, teal to the ${look} action colour).`
    )
  if (open.some((issue) => issue.fix === undefined))
    console.log(
      'Positioning, font sizes and other colours need a decision: fix them by hand, or ask the Kalka agent for /parkmed-tidy.'
    )
}

const options = parseArgs(process.argv.slice(2))
const result = await run(options)
if (options.json) console.log(JSON.stringify(result, null, 2))
else print(result, options)
process.exit(result.issues.some((issue) => !issue.fixed && issue.severity !== 'info') ? 1 : 0)
