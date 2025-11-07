# Documento de Regras ESLint – Frontend (React Native + TypeScript)

## 📌 Objetivo
Padronizar o código do projeto **React Native com TypeScript** utilizando as regras do **Airbnb Style Guide**, ajustadas às necessidades da equipe, garantindo legibilidade, consistência e boas práticas.

---

## 📏 Regras de Estilo

| Regra | Valor | Descrição |
|-------|-------|-----------|
| `quotes` | `'single'` | Sempre usar **aspas simples**. |
| `semi` | `'always'` | Sempre usar ponto e vírgula no final das instruções. |
| `comma-dangle` | `'always-multiline'` | Adicionar vírgula no final de arrays/objetos/funções em **multilinha**. |
| `max-len` | `100` | Máximo de **100 caracteres por linha** (ignora comentários). |
| `indent` | `off` | Desativado, o Prettier controla indentação. |
| `@typescript-eslint/indent` | `off` | Desativado, o Prettier controla indentação. |

---

## ⚛️ Regras React / React Native

| Regra | Valor | Descrição |
|-------|-------|-----------|
| `react/react-in-jsx-scope` | `off` | Não é necessário importar `React` no React 17+. |
| `react/jsx-filename-extension` | `['.tsx']` | Apenas arquivos `.tsx` podem conter JSX. |
| `react/prop-types` | `off` | Desativado, usamos **TypeScript** para tipagem. |
| `react/jsx-props-no-spreading` | `off` | Permitido usar spread em props. |
| `react-native/no-inline-styles` | `warn` | Aviso para evitar **inline styles**. |
| `react-native/no-raw-text` | `off` | Desativado (permitido texto direto em `<Text>`). |
| `react-native/no-color-literals` | `off` | Desativado (permitido usar cores literais). |

---

## 🛡️ Regras TypeScript

| Regra | Valor | Descrição |
|-------|-------|-----------|
| `@typescript-eslint/no-explicit-any` | `warn` | Aviso quando usar `any`. |
| `@typescript-eslint/no-unused-vars` | `error` | Erro em variáveis não utilizadas (ignora args iniciados com `_`). |
| `@typescript-eslint/no-non-null-assertion` | `warn` | Aviso quando usar `!` para forçar não-nulo. |
| `@typescript-eslint/no-non-null-asserted-optional-chain` | `warn` | Aviso quando usar `?.!`. |

---

## 🔍 Boas Práticas

| Regra | Valor | Descrição |
|-------|-------|-----------|
| `no-console` | `warn` | Aviso ao usar `console.log`. |
| `no-unused-vars` | `off` | Desativado em favor do TypeScript. |
| `import/prefer-default-export` | `off` | Não força export default. |
| `class-methods-use-this` | `off` | Métodos de classe não precisam usar `this`. |

---
