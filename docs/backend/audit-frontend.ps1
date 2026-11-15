# Read-only repository inspection; writes one Markdown report outside the repository by default.
# Usage: pwsh -File .\audit-frontend.ps1 -RepositoryPath C:\path\CSIA6
param(
    [Parameter(Mandatory=$true)][string]$RepositoryPath,
    [string]$OutputPath = (Join-Path $env:TEMP 'flaht-bladi-main-audit.md')
)
$ErrorActionPreference = 'Stop'
function GitText([string[]]$Arguments) {
    $value = & git @Arguments 2>&1
    if ($LASTEXITCODE -ne 0) { throw "git $($Arguments -join ' ') failed: $value" }
    return @($value | ForEach-Object { "$_" })
}
$repo = (Resolve-Path -LiteralPath $RepositoryPath).Path
Push-Location $repo
try {
    $root = @((GitText @('rev-parse','--show-toplevel')))[0].Trim()
    if ([IO.Path]::GetFullPath($root) -ne [IO.Path]::GetFullPath($repo)) {
        throw 'RepositoryPath must be the repository root, not a nested folder.'
    }
    $remote = @((GitText @('remote','get-url','origin')))[0].Trim()
    if ($remote -notmatch '(^|[:/])mudma224/CSIA6(\.git)?$') {
        throw "Unexpected origin: $remote (expected mudma224/CSIA6)."
    }
    $before = @(GitText @('status','--porcelain'))
    if ($before.Count -gt 0) { throw 'Working tree is not clean. Commit or stash unrelated work.' }
    GitText @('fetch','origin') | Out-Null
    $sha = @((GitText @('rev-parse','origin/main')))[0].Trim()
    $local = @((GitText @('rev-parse','HEAD')))[0].Trim()
    if ($sha -ne $local) { throw "HEAD=$local differs from origin/main=$sha. Switch/pull main first." }
    if (@((GitText @('branch','--show-current')))[0].Trim() -ne 'main') { throw 'Switch to main first.' }
    $paths = @(GitText @('ls-tree','-r','--name-only','origin/main'))
    $routes = @($paths | Where-Object { $_ -match '^src/app/.*/?page\.tsx$|^src/app/page\.tsx$' })
    $source = @($paths | Where-Object { $_ -match '^src/(components|features|i18n|data|lib|types)/.*\.(ts|tsx)$' })
    $tests = @($paths | Where-Object { $_ -match '^(tests|e2e)/' })
    $milestones = @($paths | Where-Object { $_ -match '^docs/frontend/milestone-M[0-5]/M[0-5]-DEV[12]\.md$' })
    $package = if (Test-Path 'package.json') { Get-Content -Raw -Encoding utf8 'package.json' | ConvertFrom-Json } else { $null }
    $node = if (Test-Path '.nvmrc') { (Get-Content -Raw '.nvmrc').Trim() } else { 'NOT FOUND' }
    $lines = [System.Collections.Generic.List[string]]::new()
    foreach ($l in @(
        '# Frontend main audit (actual git tree)', '',
        "- Time (UTC): $([DateTime]::UtcNow.ToString('o'))",
        "- Origin: $remote", "- main SHA: $sha", "- Node pin: $node",
        "- Package manager: $(if (Test-Path 'package-lock.json') { 'npm lockfile present' } else { 'npm lockfile missing' })",
        "- Scripts: $(if ($package) { ($package.scripts.PSObject.Properties.Name -join ', ') } else { 'package.json missing' })",
        "- M0–M5 guides found: $($milestones.Count) (presence does not verify completion)", '',
        '## Exact tracked route files', '')) { $lines.Add($l) }
    foreach ($p in $routes) { $lines.Add("- ``$p``") }
    $lines.Add('');$lines.Add('## Exact tracked source modules')
    foreach ($p in $source) { $lines.Add("- ``$p``") }
    $lines.Add('');$lines.Add('## Tracked tests')
    foreach ($p in $tests) { $lines.Add("- ``$p``") }
    $lines.Add('');$lines.Add('## Current known source interfaces (inspect manually)')
    foreach ($p in @('src/features/m2/parcelDraft.ts','src/features/m2/ParcelJourney.tsx','src/features/m4/communityDraft.ts','src/components/navigation/AppFrame.tsx','src/i18n/LocaleProvider.tsx','src/features/m2/RotationScreen.tsx','src/features/m3/MapScreen.tsx','src/components/audio/AudioHelp.tsx')) {
        if (-not (Test-Path -LiteralPath $p)) { $lines.Add("- ``$p``: NOT PRESENT"); continue }
        $matches = @(Select-String -LiteralPath $p -Pattern '^export (type|function|const|class)|^export default|^type [A-Z]|^interface [A-Z]' -Encoding UTF8)
        $lines.Add("- ``$p``:")
        foreach ($m in $matches) { $lines.Add("  - L$($m.LineNumber): ``$($m.Line.Trim().Replace('``',''))``") }
    }
    $lines.Add(''); $lines.Add('## Verification required before implementation')
    foreach ($item in @('Review component props and actual state transitions manually.','Check latest successful CI against this exact SHA.','Run npm ci, npm run lint, npm run typecheck, npm run test, npm run build; then npm run test:e2e only if present.','Capture M5 handoff and evidence; do not infer tests passed from source file presence.','Cross-check guide-derived field matrix in 01-CURRENT-FRONTEND-AUDIT.md.')) { $lines.Add("- [ ] $item") }
    $parent = Split-Path -Parent $OutputPath
    if (-not (Test-Path -LiteralPath $parent)) { New-Item -ItemType Directory -Path $parent -Force | Out-Null }
    [IO.File]::WriteAllLines($OutputPath,$lines,[Text.UTF8Encoding]::new($false))
    Write-Host "Audit report: $OutputPath"; Write-Host "Remote main SHA: $sha"; Write-Host "Tracked routes: $($routes.Count); source modules: $($source.Count); tests: $($tests.Count)"
} finally { Pop-Location }
