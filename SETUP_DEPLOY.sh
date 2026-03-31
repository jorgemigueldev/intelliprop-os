#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════
#  IMOVAI OS v12 — Script de Deploy Automático Completo
#  Executa TUDO: GitHub push + Vercel deploy + configuração CI/CD
# ═══════════════════════════════════════════════════════════════════════
set -e

GITHUB_TOKEN="${1:-}"
VERCEL_TOKEN="${2:-}"
GITHUB_USER="jorgemigueldev"
REPO="intelliprop-os"

echo ""
echo "═══════════════════════════════════════════════════════"
echo " IMOVAI OS v12 — Deploy Automático"
echo "═══════════════════════════════════════════════════════"
echo ""

if [ -z "$GITHUB_TOKEN" ]; then
  echo "❌ Uso: ./SETUP_DEPLOY.sh GITHUB_TOKEN [VERCEL_TOKEN]"
  echo ""
  echo "Como gerar os tokens:"
  echo "  GitHub:  https://github.com/settings/tokens → New token → marcar 'repo'"
  echo "  Vercel:  https://vercel.com/account/tokens → Create Token"
  echo ""
  exit 1
fi

# ── 1. Push para GitHub ────────────────────────────────────────────────
echo "▶ PASSO 1/4 — Enviando código para GitHub..."
git remote set-url origin "https://${GITHUB_TOKEN}@github.com/${GITHUB_USER}/${REPO}.git"
git push -u origin main --force
echo "  ✅ Código enviado para https://github.com/${GITHUB_USER}/${REPO}"

# ── 2. Configurar secrets do GitHub Actions ────────────────────────────
if [ -n "$VERCEL_TOKEN" ]; then
  echo ""
  echo "▶ PASSO 2/4 — Configurando GitHub Secrets para CI/CD..."
  
  # Verificar se gh CLI está disponível
  if command -v gh &>/dev/null; then
    gh auth login --with-token <<< "$GITHUB_TOKEN" 2>/dev/null || true
    gh secret set VERCEL_TOKEN --body "$VERCEL_TOKEN" --repo "${GITHUB_USER}/${REPO}" 2>/dev/null && echo "  ✅ VERCEL_TOKEN configurado" || echo "  ⚠️  Configure manualmente: Settings → Secrets → VERCEL_TOKEN"
  else
    echo "  ℹ️  GitHub CLI não encontrado. Configure manualmente:"
    echo "     https://github.com/${GITHUB_USER}/${REPO}/settings/secrets/actions"
    echo "     → New secret → VERCEL_TOKEN = $VERCEL_TOKEN"
  fi
  
  # ── 3. Deploy no Vercel via CLI ────────────────────────────────────────
  echo ""
  echo "▶ PASSO 3/4 — Fazendo deploy no Vercel..."
  
  if command -v vercel &>/dev/null; then
    VERCEL_TOKEN="$VERCEL_TOKEN" vercel deploy \
      --prod \
      --yes \
      --token="$VERCEL_TOKEN" \
      --name="$REPO" 2>&1 | tail -5
    echo "  ✅ Deploy concluído!"
  else
    npm install -g vercel@latest 2>/dev/null
    VERCEL_TOKEN="$VERCEL_TOKEN" vercel deploy --prod --yes --token="$VERCEL_TOKEN" --name="$REPO" 2>&1 | tail -5
  fi
else
  echo ""
  echo "▶ PASSO 2/4 — Deploy manual no Vercel:"
  echo ""
  echo "  OPÇÃO A (Mais fácil) — Interface Web:"
  echo "    1. Acesse: https://vercel.com/new"
  echo "    2. Clique em 'Import Git Repository'"
  echo "    3. Selecione: ${GITHUB_USER}/${REPO}"
  echo "    4. Framework: Next.js (detectado automaticamente)"
  echo "    5. Clique 'Deploy' → URL gerada em ~2 minutos"
  echo ""
  echo "  OPÇÃO B — CLI:"
  echo "    npm install -g vercel"
  echo "    vercel login"
  echo "    vercel --prod"
fi

echo ""
echo "▶ PASSO 4/4 — Resumo final:"
echo ""
echo "  📦 Repositório: https://github.com/${GITHUB_USER}/${REPO}"
echo "  🌐 Deploy web: https://vercel.com/new/clone?repository-url=https://github.com/${GITHUB_USER}/${REPO}"
echo "  🔁 CI/CD: automático em cada push para 'main'"
echo ""
echo "═══════════════════════════════════════════════════════"
echo " ✅ IMOVAI OS v12 — Deploy concluído!"
echo "═══════════════════════════════════════════════════════"
