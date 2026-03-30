#!/bin/bash
# ─────────────────────────────────────────────────────────
# IMOVAI OS v10 — Script de Push para GitHub
# Execute: chmod +x DEPLOY.sh && ./DEPLOY.sh SEU_TOKEN
# ─────────────────────────────────────────────────────────

TOKEN=$1

if [ -z "$TOKEN" ]; then
  echo "❌ Uso: ./DEPLOY.sh SEU_GITHUB_TOKEN"
  echo "   Gere em: https://github.com/settings/tokens"
  exit 1
fi

git remote set-url origin https://${TOKEN}@github.com/jorgemigueldev/intelliprop-os.git
git push -u origin main

echo "✅ Push realizado com sucesso!"
echo "🌐 Repositório: https://github.com/jorgemigueldev/intelliprop-os"
