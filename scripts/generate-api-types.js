// Minimal OpenAPI -> TypeScript client generation using openapi-typescript (if available)
// Falls back to copying basic declarations for both apps

import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const schema = path.join(root, 'openapi', 'openapi.yaml')
const outReact = path.join(root, 'src', 'types', 'api.d.ts')
const outAngular = path.join(root, 'angular', 'src', 'app', 'types', 'api.d.ts')

function run(cmd) {
  try {
    execSync(cmd, { stdio: 'inherit' })
    return true
  } catch {
    return false
  }
}

fs.mkdirSync(path.dirname(outReact), { recursive: true })
fs.mkdirSync(path.dirname(outAngular), { recursive: true })

let generated = run(`npx --yes openapi-typescript ${schema} -o ${outReact}`)
if (!generated) {
  const fallback = `declare namespace API { interface Health { status: string } interface Summary { netIncome: number; netMargin: number; totalRevenue: number } }\n`
  fs.writeFileSync(outReact, fallback, 'utf8')
}
fs.copyFileSync(outReact, outAngular)
console.log('API types generated:', outReact, 'and', outAngular)
