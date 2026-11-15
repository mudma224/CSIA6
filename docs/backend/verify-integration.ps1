# Run existing npm gates in the actual checked-out repo; write evidence even on failure.
# This script does NOT merge, push, deploy, test scientific validity or assert manual PASS.
param(
  [Parameter(Mandatory=$true)][string]$RepositoryPath,
  [string]$OutputPath = (Join-Path $env:TEMP 'flaht-bladi-verification.md'),
  [switch]$RunBrowserTests
)
$ErrorActionPreference = 'Stop'
$results = [System.Collections.Generic.List[string]]::new()
$sha = 'UNKNOWN'; $branch = 'UNKNOWN'; $failure = $null
Push-Location (Resolve-Path -LiteralPath $RepositoryPath).Path
try {
  $repo = (git rev-parse --show-toplevel).Trim()
  if ($LASTEXITCODE -ne 0 -or -not $repo) { throw 'Not a Git repository.' }
  $sha = (git rev-parse HEAD).Trim()
  $branch = (git branch --show-current).Trim()
  $pkg = Get-Content -Raw -Encoding utf8 package.json | ConvertFrom-Json
  function Gate([string]$Name, [string[]]$ArgsForNpm) {
    Write-Host "Running: npm $($ArgsForNpm -join ' ')"
    & npm @ArgsForNpm
    $code = $LASTEXITCODE
    $status = if ($code -eq 0) { 'PASS' } else { 'FAIL' }
    $results.Add("- $Name`: $status (exit $code)")
    if ($code -ne 0) { throw "$Name failed with exit $code." }
  }
  Gate 'npm ci' @('ci')
  Gate 'lint' @('run','lint')
  Gate 'typecheck' @('run','typecheck')
  Gate 'tests' @('run','test')
  Gate 'build' @('run','build')
  if ($RunBrowserTests) {
    if ($pkg.scripts.PSObject.Properties.Name -notcontains 'test:e2e') { throw 'No test:e2e script found.' }
    Gate 'browser E2E' @('run','test:e2e')
  } else { $results.Add('- browser E2E: NOT RUN (use -RunBrowserTests when configured)') }
} catch {
  $failure = $_.Exception.Message
  $results.Add("- stopped: $failure")
} finally {
  Pop-Location
  $outDir = Split-Path -Parent $OutputPath
  if (-not (Test-Path -LiteralPath $outDir)) {
    New-Item -ItemType Directory -Force -Path $outDir | Out-Null
  }
  $report = @(
    '# Integration verification evidence', '',
    "- UTC: $([DateTime]::UtcNow.ToString('o'))",
    "- SHA: $sha", "- Branch: $branch", '', '## Automated results'
  ) + @($results) + @(
    '', '## Still required (manual, never auto-pass)',
    '- [ ] English mobile/desktop', '- [ ] Darija RTL mobile/desktop',
    '- [ ] Keyboard/screen reader',
    '- [ ] Authorized/unauthorized RLS & API tests',
    '- [ ] Scientific review and model-data provenance',
    '- [ ] Deployment and rollback rehearsal',
    '- [ ] Contract schema version/hash and approver signatures'
  )
  [IO.File]::WriteAllLines($OutputPath,$report,[Text.UTF8Encoding]::new($false))
  Write-Host "Evidence: $OutputPath"
}
if ($null -ne $failure) { Write-Error "Verification failed: $failure"; exit 1 }
