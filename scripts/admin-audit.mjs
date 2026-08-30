import { execFileSync } from 'node:child_process'
import { writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = join(root, 'test-results', 'admin-audit')

console.log('▶ Ejecutando tests unit del paquete de Admin/Gerencia...')
const unitFiles = [
  'src/tests/settingsIntegration.test.ts',
  'src/tests/auditLogIntegration.test.ts',
  'src/tests/adminUserFlow.test.ts',
  'src/tests/poApproval.test.ts',
  'src/tests/dashboardReports.test.ts',
  'src/tests/csvExportButton.test.tsx',
  'src/tests/salesIntegration.test.ts',
]
execFileSync('npx', ['vitest', 'run', ...unitFiles], {
  cwd: root,
  encoding: 'utf8',
  shell: true,
  stdio: ['inherit', 'inherit', 'inherit'],
})

console.log('▶ Ejecutando E2E del paquete de Admin/Gerencia (headless)...')
let raw = ''
try {
  raw = execFileSync('npx', ['playwright', 'test', 'e2e/admin', '--reporter=json'], {
    cwd: root,
    encoding: 'utf8',
    shell: true,
    stdio: ['ignore', 'pipe', 'inherit'],
  })
} catch (err) {
  if (err.stdout) raw = String(err.stdout)
}

let data
try {
  data = JSON.parse(raw)
} catch {
  console.error('No se pudo interpretar el reporte JSON de Playwright.')
  process.exit(1)
}

const specs = []
const walk = (suites) => {
  for (const suite of suites) {
    if (suite.specs) specs.push(...suite.specs)
    if (suite.suites) walk(suite.suites)
  }
}
walk(data.suites || [])

const lines = []
lines.push('===========================================================')
lines.push(' AUDITORÍA DEL PAQUETE ADMIN/GERENCIA (UNIT + E2E)')
lines.push(' Fecha: ' + new Date().toLocaleString())
lines.push('===========================================================')
lines.push('')

let passed = 0
let failed = 0
let skipped = 0

for (const spec of specs) {
  const file = spec.file?.split(/[\\/]/).pop() || spec.file
  for (const test of spec.tests || []) {
    const results = test.results || []
    const last = results[results.length - 1]
    const status = test.expectedStatus === 'skipped' ? 'skipped' : last?.status || 'unknown'
    const label = status === 'passed' ? '✔ PASÓ' : status === 'failed' ? '✖ FALLÓ' : '▬ OMITIDO'
    lines.push(`${label}  ${file} :: ${spec.title || test.title}`)
    if (status === 'passed') passed++
    else if (status === 'failed') failed++
    else skipped++
  }
}

lines.push('')
lines.push('-------------------------------------------')
lines.push(` TOTAL E2E: ${passed + failed + skipped} | PASARON: ${passed} | FALLARON: ${failed} | OMITIDOS: ${skipped}`)
lines.push('-------------------------------------------')

const reportTxt = lines.join('\n')
mkdirSync(outDir, { recursive: true })
writeFileSync(join(outDir, 'admin-audit-report.txt'), reportTxt, 'utf8')
writeFileSync(join(outDir, 'results.json'), JSON.stringify(data, null, 2), 'utf8')

console.log(reportTxt)
console.log('')
console.log('Archivos de auditoría generados en: test-results/admin-audit/')

if (failed > 0) process.exit(1)
