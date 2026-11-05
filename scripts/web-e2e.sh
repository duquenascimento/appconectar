#!/bin/sh
# Sobe o web apontando para a API falsa dos testes e2e (testes/e2e/apiFalsa.js).
# Em dev o Expo mescla os arquivos .env sobre as variáveis do shell, e o
# .env.development.local é o que tem a última palavra. Ele é criado aqui e
# removido quando o servidor termina; o .env do repositório não é alterado.
arquivo=".env.development.local"

if [ -f "$arquivo" ]; then
  echo "$arquivo já existe. Remova-o (ou renomeie) antes de rodar o web:e2e." >&2
  exit 1
fi

printf 'EXPO_PUBLIC_API_URL=http://localhost:3333\n' > "$arquivo"
trap 'rm -f "$arquivo"' EXIT INT TERM

npx expo start --web --port 8081 --clear
