# CLAUDE.md — ConectarApp Frontend (V1)

**Expo / React Native + TypeScript + expo-router + Tamagui.** The restaurant-facing client for
`conectarapp-backend` (with a few direct calls to the `api-dbconectar` microservice). Ships to iOS,
Android and web.

Node **20** (`.nvmrc`). Path alias `@/` → repo root. `npm start` (`expo start`),
`npm run android` / `ios` / `web`, `npm run build-web`.

## Structure

```
app/                 expo-router screens (file-based routing)
  _layout.tsx        the provider tree — read this before adding any context
  index.tsx          login;  prices, cart, combination, confirm, schedule,
                     quotationDetailsScreen, orderDetailsScreen, register…
  (app)/             authenticated group: products, ordersScreen, chat, userInfo
src/contexts/        11 React Context providers — ALL app-wide state lives here
src/services/        one file per domain; the ONLY place axios is allowed
src/components/      subfoldered by kind: restaurant/, quotations/, modais/, input/,
                     card/, list/, chat/, hooks/, pages/…
src/utils/           helpers (dateUtils, errorUtils, utils, formatters…)
src/types/           interfaces + response DTOs
src/validators/      Yup form schemas (only 3 forms have them)
src/styles/          shared styles;  tamagui.config.ts at the root
```

State is **plain React Context** — no Redux, no Zustand, no React Query.

## Gotchas that will cost you an hour

1. **`npm test` runs `jest --watchAll` and never exits.** Use `npx jest --watchAll=false`.
2. **`eslint.config.js` (flat) is the live config**; the `.eslintrc.js` next to it is dead weight from
   ESLint 8 — don't edit it expecting an effect.
3. **Prettier here is `semi: true`.** (The backend repo is `semi: false` — don't carry style across.)
   Also `singleQuote`, `printWidth: 100`, `trailingComma: all`. Husky pre-commit runs lint-staged
   (`eslint --fix` + `prettier --write`) on staged `.ts,.tsx`.
4. **`deliveryDate.context` and `restaurant.context` are mutually dependent.** In `app/_layout.tsx`,
   `DeliveryDateProvider` *wraps* `RestaurantProvider`, yet `deliveryDate.context.tsx` calls
   `useRestaurantContext()` and `restaurant.context.tsx` calls `useDeliveryDate()`. It only works
   because each reads a value that starts empty and settles later. **Mount new providers outside that
   pair** (typically directly inside `AuthProvider`) rather than adding to the cycle — a mistake there
   breaks every quotation flow, not just your feature.
5. **CI checks nothing.** The only workflows are a Slack PR notification and a force-push mirror of
   `develop`/`main` to a third-party repo. Releases go through EAS (`eas.json`) and Vercel
   (`vercel.json`), not Actions. So run `npx tsc --noEmit`, `npx eslint <files>` and
   `npx jest --watchAll=false` yourself.
6. **There is no central API config.** Every service re-declares
   `const API_URL = process.env.EXPO_PUBLIC_API_URL;`. Env lives in `.env`
   (`EXPO_PUBLIC_API_URL`, `EXPO_PUBLIC_API_DBCONECTAR_URL`, `EXPO_PUBLIC_VERSION`, Keycloak + chat
   vars); dev/prod are swapped by commenting lines.

## Critical rules

**Dates — always `src/utils/dateUtils.ts`** (Luxon, `America/Sao_Paulo`). Never `new Date()` or Luxon
directly in components. `dayjs` is installed but effectively unused — don't add usages.

**Navigation — expo-router only.** `useRouter()` + `router.push('/route')`, `<Link>`; file-based
routes under `app/`. Types in `src/types/navigationTypes.ts` (**preferred**);
`src/utils/NavigationTypes.ts` is legacy.

**API calls only in `src/services/`.** Never axios in a component or a context — contexts call
services. Standard shape (mirror `src/services/deliveryDateService.ts`):

```ts
const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const getThing = async (id: string): Promise<Thing> => {
  try {
    const response = await axios.get(`${API_URL}/thing/${id}`, {
      headers: { Authorization: `Bearer ${await getToken()}` },
    });
    const dto: GetThingResponseDTO = response.data;
    return dto.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.msg || 'Erro ao buscar …');
    }
    throw error;
  }
};
```

Backend envelopes are inconsistent — some endpoints return `{ status, data }`, others
`{ success, statusCode, data, msg }`. **Check the real endpoint**; services unwrap `response.data.data`.

Two legitimate error strategies, pick by consequence: **throw** when a screen must show the failure
(most services), or **log and return a safe default / `null`** when the value is app-wide and
non-blocking (`versionService`, config reads). For config-style reads, return `null` on failure rather
than the fallback — otherwise a failed refresh silently overwrites a good cached value.

**Errors.** `src/utils/errorUtils.ts` — `extractErrorMessage(error, default)` reads
`error.response.data.msg ?? .message` and is what surfaces backend Portuguese messages to users;
`handleHttpException`, `ApiException`. Also `src/types/apiErrorTypes.ts`.

**Storage — `src/utils/utils.ts`, platform-branched.** `setStorage`/`getStorage`/`deleteStorage` use
`localStorage` on web and `AsyncStorage` on native; `getToken`/`setToken` use `js-cookie` on web and
`expo-secure-store` on native. **Add new keys to the `STORAGE_DEFAULT_KEYS` enum** — everything under
it is wiped by `clearAllStoragesData()` on logout and on app-version change
(`versionService.checkLocalVersionAndClearData`, called from `app/_layout.tsx`).

**Server-driven config.** Values the backend owns are fetched at runtime, never hardcoded:

- Per-restaurant flags (`allowRetroactiveQuotation`, `allowEmergencyOrder`, `allowMinimumOrder`,
  `allowClosedSupplier`, `premium`, `max_specific_suppliers`, `deliveryPolicy.*`) ride the
  `Restaurant` object from `POST /restaurant/list`, held in `restaurant.context.tsx`. Adding a backend
  column just means adding the field to `src/types/restaurantTypes.ts`.
- Global tunables come from `GET /client-settings` via `src/services/clientSettingsService.ts` +
  `src/contexts/clientSettings.context.tsx`. Resolution order is **fresh fetch → cached →
  `FALLBACK_CLIENT_SETTINGS`**; that fallback is a last resort, not a second source of truth, and
  nothing outside the provider may import it.
- Available delivery dates come from `GET /available-delivery-dates/:restaurantId`.

**Forms — Formik + Yup**, schemas in `src/validators/`.

**Styling — Tamagui** (`tamagui.config.ts`) with design tokens; avoid ad-hoc inline colours.

**Platform branches** — `Platform.OS === 'web'` where behaviour genuinely differs. The date pickers are
the canonical case: `react-datepicker` on web (prop `minDate`), `@react-native-community/datetimepicker`
on iOS (`display="spinner"`) and Android (`display="default"`), both using prop `minimumDate`. **Three
branches means three places to change — the prop names differ.**

## Adding a feature

1. types in `src/types/` → 2. service in `src/services/` → 3. context if the state is app-wide
(mount it in `app/_layout.tsx`, minding gotcha 4) → 4. components in the right
`src/components/<kind>/` → 5. screen in `app/` → 6. Yup validator if it's a form → 7. helpers in
`src/utils/`.

## Domain notes

**Quotation flow.** `app/prices.tsx` loads suppliers and combinations via `fornecedores.context` and
`combination.context` (which call `quotationService` → `POST /quote/supplier`, `/quote/combination`),
then `app/quotationDetailsScreen.tsx` → `app/confirm.tsx` creates the order. `app/schedule.tsx` uses
`POST /prices_by_suppliers`.

**Retroactive quotation** = a delivery date in the past. Gated per restaurant by
`allowRetroactiveQuotation`: when true, `RestaurantInfoDialog` shows a free date picker instead of the
`DropDownPicker` of available dates. The window floor comes from
`clientSettings.maxRetroactiveQuotationDays` (**not** a local constant); the backend independently
enforces it and returns **422** with a Portuguese `msg` if a date is out of window, so quotation error
paths must surface `extractErrorMessage(error)`. `deliveryDate.context.isRetroactiveDate` is the
derived flag; `RetroactiveQuotationWarningBanner` and `app/confirm.tsx` use it to block order
submission.

**Chat** — `socket.io-client` + Keycloak, `chat.context.tsx`, `chatSocketService.ts`,
`src/components/chat/`.

## Testing

`jest-expo` preset (config inline in `package.json`), `@testing-library/react-native`,
`jest-setup.js` mocks AsyncStorage. Specs are **co-located** with the code
(`Thing.spec.tsx` next to `Thing.tsx`). The established pattern is to mock the context or service
module — `jest.mock('../../contexts/x.context')` then `mockUseX.mockReturnValue({…})`. See
`src/components/modais/NotificationModal.spec.tsx`.

Coverage is thin by design in V1 — prefer a couple of high-value specs (a service's error/fallback
behaviour, a provider's resolution order) over rendering the huge composite screens. When mocking
`src/utils/utils.ts`, mock it **fully** and supply `STORAGE_DEFAULT_KEYS`; `requireActual` drags in
`expo-secure-store`/`js-cookie`.

**E2E:** WebdriverIO + Appium, specs in `testes/e2e/`, `npm run teste:web`. See `docs/TESTS.md`.

## What to avoid

- axios outside `src/services/`
- `new Date()` / direct Luxon outside `dateUtils.ts`
- Hardcoding a value the backend owns (limits, windows, flags) — fetch it
- Raw storage keys instead of `STORAGE_DEFAULT_KEYS`
- Adding to the `deliveryDate`/`restaurant` context cycle
- `src/utils/NavigationTypes.ts` (legacy) — use `src/types/navigationTypes.ts`

## Conventions

Branches: `feature/CH-###-slug`, `bugfix/CH-###-slug` (or `bugfix/slug`), `hotfix/slug`. Ticket
namespaces `CH-###` (current) and `DT-###` (older); the ID lives in the branch name and PR title, not
the commit subject. Commits: loose conventional — `fix: …`, `feat: …`, subjects predominantly
**Portuguese**, no scopes. Nothing enforces this.

## Reference

`.github/copilot-instructions.md` (fuller inventory of utils and components) · `docs/TESTS.md` ·
`docs/ESLINT_RULES.md`
