# Copilot Instructions - ConectarApp Frontend

## Project Overview
This is a React Native mobile application built with Expo and TypeScript. The app handles supplier ordering, price quotations, order management, and restaurant operations for the Conectar platform. It primarily connects to the conectarapp-backend API with some direct calls to the api-dbconectar microservice.

## Tech Stack
- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Navigation**: Expo Router (file-based routing)
- **UI Framework**: Tamagui (styled components)
- **State Management**: React Context API
- **Form Management**: Formik with Yup validation
- **HTTP Client**: Axios
- **Date/Time**: Luxon (via centralized utilities)
- **Storage**: AsyncStorage, Expo SecureStore
- **Authentication**: JWT with expo-secure-store
- **Notifications**: expo-notifications
- **Platform Support**: iOS, Android, Web

## Architecture & Folder Structure

### Core Layers
```
app/                    # Expo Router screens (file-based routing)
src/
├── components/         # Reusable React components
├── contexts/           # React Context providers (state management)
├── services/           # API calls and backend integration
├── hooks/              # Custom React hooks
├── types/              # TypeScript type definitions
├── utils/              # Helper functions and utilities
├── validators/         # Form validation schemas (Formik + Yup)
├── styles/             # Global styles and Tamagui configuration
└── assets/             # Images and static resources
```

### Layer Responsibilities

#### App Directory (`./app/`)
- **File-based routing** with Expo Router
- Each file represents a screen/route
- `_layout.tsx` defines navigation structure
- Handles screen composition and navigation
- **Should NOT contain business logic**

#### Components (`./src/components/`)
- Reusable UI components organized by feature/type
- Presentation logic only
- Receives data via props
- Emits events via callbacks
- **Should be as stateless as possible**

#### Contexts (`./src/contexts/`)
- Global state management using React Context
- Available contexts:
  - `auth.context.tsx`: Authentication state
  - `produtos.context.tsx`: Products state
  - `restaurant.context.tsx`: Restaurant data
  - `fornecedores.context.tsx`: Suppliers state
  - `combinacao.context.tsx`: Combinations state
  - `favoritos.context.tsx`: Favorites state
- Use `useContext` hook to access context in components

#### Services (`./src/services/`)
- API calls to backend services
- HTTP request/response handling
- Data transformation for API consumption
- Error handling for network requests
- **All backend communication goes through services**

**Available Services:**
- `authService.ts`: Authentication and login
- `cartService.ts`: Shopping cart operations
- `combinationsService.ts`: Supplier combinations management
- `deliveryDateService.ts`: Available delivery dates
- `favoritosService.ts`: Favorite products management
- `orderService.ts`: Order creation and management
- `pricesService.ts`: Price quotations
- `productsService.ts`: Product catalog operations
- `quotationService.ts`: Quotation details and submission
- `registerProgressService.ts`: Registration progress tracking
- `restaurantService.ts`: Restaurant data and settings
- `scheduleOrderService.ts`: Scheduled orders management
- `supplierService.ts`: Supplier information
- `versionService.ts`: App version control and updates

#### Hooks (`./src/hooks/` and `./src/components/hooks/`)
- Custom React hooks for reusable logic
- Main hooks: `useDeliveryDate.ts`
- Component-specific hooks: `useAuth.ts`, `useBackHandler.ts`
- Encapsulate stateful logic
- Can combine multiple hooks and contexts

#### Utils (`./src/utils/`)
- Pure helper functions
- Formatting utilities (currency, date, CNPJ, CEP)
- Validation functions
- Data transformation utilities
- **Must be stateless and testable**

#### Types (`./src/types/`)
- TypeScript type definitions
- Interface definitions for API responses
- Type safety across the application
- Organized by feature (orders, products, restaurants, etc.)

#### Validators (`./src/validators/`)
- Formik form schemas
- Yup validation rules
- Form-specific validation logic

**Current Validators:**
- `register.form.validator.ts`: Multi-step registration form validation
- `combination.form.validator.ts`: Supplier combination form validation

Note: Not all forms have dedicated validator files - some use inline validation or utility functions

## Critical Rules & Patterns

### 1. Date/DateTime Handling
**ALWAYS use the centralized date utilities:**
```typescript
import { /* date functions */ } from '../utils/dateUtils';
```
- Never use `new Date()` or Luxon directly in components
- All date operations must go through `dateUtils.ts`
- Ensures consistent timezone handling across the application

### 2. Navigation
**Use Expo Router for navigation:**
```typescript
import { router } from 'expo-router';

// Navigate to a route
router.push('/products');
router.replace('/login');
router.back();
```
- File-based routing in `/app` directory
- Type-safe navigation with TypeScript
- No need to manually configure routes

### 3. State Management
**Use Context API for global state:**
```typescript
import { useAuth } from '../contexts/auth.context';

const MyComponent = () => {
  const { user, signIn, signOut } = useAuth();
  
  // Use auth state and methods
};
```
- Contexts for global state (auth, products, restaurant)
- Local state with `useState` for component-specific data
- Avoid prop drilling - use contexts for deeply nested data

### 4. API Calls
**Always use service layer for API calls:**
```typescript
import { getProducts } from '../services/productsService';

const fetchProducts = async () => {
  try {
    const products = await getProducts(restaurantId);
    setProducts(products);
  } catch (error) {
    handleError(error);
  }
};
```
- Never make Axios calls directly in components
- All API logic in `./src/services/`
- Handle errors at the service layer when possible

### 5. Form Management
**Use Formik with Yup for forms:**
```typescript
import { Formik } from 'formik';
import { registerFormValidator } from '../validators/register.form.validator';

<Formik
  initialValues={initialValues}
  validationSchema={registerFormValidator}
  onSubmit={handleSubmit}
>
  {({ values, errors, handleChange, handleSubmit }) => (
    // Form fields
  )}
</Formik>
```
- Formik for form state management
- Yup schemas in `./src/validators/`
- Centralized validation logic

### 6. Storage
**Use appropriate storage for different data types:**
```typescript
// Sensitive data (tokens, credentials)
import * as SecureStore from 'expo-secure-store';
await SecureStore.setItemAsync('authToken', token);

// Non-sensitive data (preferences, cache)
import AsyncStorage from '@react-native-async-storage/async-storage';
await AsyncStorage.setItem('theme', 'dark');
```
- **SecureStore**: Authentication tokens, sensitive data
- **AsyncStorage**: User preferences, cached data
- Never store sensitive data in AsyncStorage

### 7. Component Organization
**Organize components by feature/type:**
```
components/
├── box/             # Container/wrapper components
├── button/          # Button components
├── card/            # Card components
├── Combination/     # Combination-specific components
├── confirm/         # Confirmation components
├── data/            # Data display components
├── header/          # Header components
├── hooks/           # Component-specific hooks
├── image/           # Image components
├── input/           # Input components
├── list/            # List components
├── loading/         # Loading/skeleton components
├── modais/          # Modal components
├── pages/           # Full-page components
├── quotations/      # Quotation-specific components
├── subtitle/        # Subtitle components
└── text/            # Text components
```
- Group related components in folders
- Keep components small and focused
- Extract reusable logic into hooks

### 8. Styling
**Use Tamagui for styling:**
```typescript
import { View, Text, Button } from 'tamagui';

<View padding="$4" backgroundColor="$background">
  <Text fontSize="$6" color="$color">
    Hello World
  </Text>
</View>
```
- Tamagui provides styled components
- Use design tokens for consistency
- Configuration in `tamagui.config.ts`
- Global styles in `./src/styles/`

## Code Patterns

### Screen Pattern (Expo Router)
```typescript
// app/products.tsx
import { View, Text } from 'tamagui';
import { useProducts } from '../src/contexts/produtos.context';
import { ProductCard } from '../src/components/card/productCard';

export default function ProductsScreen() {
  const { products, loading } = useProducts();

  if (loading) return <Text>Loading...</Text>;

  return (
    <View>
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </View>
  );
}
```

### Component Pattern
```typescript
// src/components/card/productCard.tsx
import { Card, Text, Button } from 'tamagui';
import { Product } from '../../types/productTypes';

interface ProductCardProps {
  product: Product;
  onPress?: (product: Product) => void;
}

export const ProductCard = ({ product, onPress }: ProductCardProps) => {
  return (
    <Card padding="$4" onPress={() => onPress?.(product)}>
      <Text fontSize="$5">{product.name}</Text>
      <Text fontSize="$3" color="$gray10">
        {formatCurrency(product.price)}
      </Text>
    </Card>
  );
};
```

### Service Pattern
```typescript
// src/services/productsService.ts
import axios from 'axios';
import { API_URL } from '../config';
import { Product } from '../types/productTypes';

export const getProducts = async (restaurantId: string): Promise<Product[]> => {
  try {
    const response = await axios.get(`${API_URL}/products`, {
      params: { restaurantId },
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

export const createProduct = async (product: Product): Promise<Product> => {
  const response = await axios.post(`${API_URL}/products`, product);
  return response.data;
};
```

### Context Pattern
```typescript
// src/contexts/produtos.context.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Product } from '../types/productTypes';
import { getProducts } from '../services/productsService';

interface ProductsContextData {
  products: Product[];
  loading: boolean;
  fetchProducts: (restaurantId: string) => Promise<void>;
}

const ProductsContext = createContext<ProductsContextData>({} as ProductsContextData);

export const ProductsProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchProducts = async (restaurantId: string) => {
    setLoading(true);
    try {
      const data = await getProducts(restaurantId);
      setProducts(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProductsContext.Provider value={{ products, loading, fetchProducts }}>
      {children}
    </ProductsContext.Provider>
  );
};

export const useProducts = () => useContext(ProductsContext);
```

### Custom Hook Pattern
```typescript
// src/hooks/useDeliveryDate.ts
import { useState, useEffect } from 'react';
import { getDeliveryDates } from '../services/deliveryDateService';
import { DeliveryDate } from '../types/deliveryDateTypes';

export const useDeliveryDate = (restaurantId: string) => {
  const [dates, setDates] = useState<DeliveryDate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchDates = async () => {
      setLoading(true);
      try {
        const data = await getDeliveryDates(restaurantId);
        setDates(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchDates();
  }, [restaurantId]);

  return { dates, loading, error };
};
```

## Key Features

### Authentication
- JWT-based authentication
- Token storage in SecureStore
- Auth context provides user state globally
- Login/logout/register screens in `./app/`

### Order Management
- Order creation and confirmation
- Order history and details
- Schedule orders feature
- Cart management with context

### Quotation System
- Price quotation from multiple suppliers
- Quotation details and comparison
- Missing items handling
- Integration with backend quotation engine

### Product Management
- Product listing with search and filters
- Product categories
- Favorites system
- Cart functionality

### Combination System
- Product and supplier preference management
- Combination creation and editing
- Priority and blocking settings
- Complex state management

### Restaurant Management
- Restaurant profile and settings
- Multi-restaurant support
- Restaurant context for data filtering

## External Integrations

### Backend APIs
- **Primary**: conectarapp-backend (Fastify)
- **Secondary**: api-dbconectar (Express)
- All API calls through service layer

### Expo Services
- **SecureStore**: Secure token storage
- **Notifications**: Push notifications
- **FileSystem**: File downloads
- **Sharing**: Share functionality
- **WebBrowser**: In-app browser

## Development Guidelines

### When Adding New Features
1. **Define types** in `./src/types/` for data structures
2. **Create service methods** in `./src/services/` for API calls
3. **Create components** in `./src/components/` for UI elements
4. **Add screen** in `./app/` directory for new routes
5. **Create context** if feature needs global state
6. **Add validators** in `./src/validators/` for forms
7. **Create utils** in `./src/utils/` for helper functions

### Platform-Specific Code
```typescript
import { Platform } from 'react-native';

if (Platform.OS === 'ios') {
  // iOS-specific code
} else if (Platform.OS === 'android') {
  // Android-specific code
} else if (Platform.OS === 'web') {
  // Web-specific code
}
```

### Common Patterns to Follow
- Async/await for asynchronous operations
- Try-catch blocks for error handling
- Proper TypeScript typing (avoid `any`)
- Functional components with hooks
- Extract complex logic into custom hooks
- Use Context for global state, not prop drilling
- Keep components small and focused
- Meaningful variable and function names

### Code Style & Formatting
- **ESLint**: Check `.eslintrc.js` for linting rules
- **Prettier**: Check `.prettierrc` for code formatting standards
- **Husky**: Pre-commit hooks run lint and format automatically
- **lint-staged**: Automatically fixes and formats staged files
- Follow Airbnb React style guide (configured in ESLint)
- Run `npm run lint` to check for issues

### What to Avoid
- Don't make API calls directly in components
- Don't use `any` type - define proper types
- Don't store sensitive data in AsyncStorage
- Don't bypass form validation
- Don't use inline styles - use Tamagui
- Don't use dates without `dateUtils.ts`
- Don't mutate state directly - use setState
- Don't forget error handling for async operations

## Testing
- Jest configured for testing
- Run tests with `npm test`
- Testing is not a priority in current V1 phase
- Focus on functionality over test coverage for now

## Build & Deployment

### Development
```bash
npm start              # Start Expo dev server
npm run android        # Run on Android
npm run ios            # Run on iOS
npm run web            # Run on web
```

### Production
```bash
npm run build-web      # Build for web deployment
npm run prod           # Serve production web build
```

### EAS Build
- Configuration in `eas.json`
- Expo Application Services for cloud builds
- Used for iOS and Android production builds

## Environment & Configuration
- `.env` file for environment variables
- `app.json` for Expo configuration
- `tsconfig.json` for TypeScript settings
- `tamagui.config.ts` for UI theme configuration
- `metro.config.js` for React Native bundler
- `babel.config.js` for JavaScript transpilation

## Native Modules
- **iOS**: Native code in `./ios/` directory (Swift/Objective-C)
- **Android**: Native code in `./android/` directory (Java/Kotlin)
- CocoaPods for iOS dependencies
- Gradle for Android dependencies

## Utilities Organization

### Formatting Utils
- `formatCurrency.ts`: Currency formatting
- `formatCNPJ.ts`: CNPJ formatting
- `formatCep.ts`: CEP/postal code formatting
- `formatCampos.ts`: General field formatting
- `formatUnit.ts`: Unit formatting

### Validation Utils
- `validateAddress.ts`: Address validation
- `validateFields.ts`: General field validation
- `encontrarInscricaoEstadual.ts`: State registration validation

### Cart Utils
- `cartUtils.ts`: Cart operations
- `abandonedCart.ts`: Abandoned cart handling
- `filterCarts.ts`: Cart filtering

### Date/Time Utils
- `dateUtils.ts`: **Core date operations (Luxon-based) - ALWAYS USE THIS**
- `timeUtils.ts`: Time-specific operations (uses dateUtils internally)
- `agendamentoUtils.ts`: Schedule-related utilities
- `orderDateValidation.utils.ts`: Order date validation logic

### Payment Utils
- `paymentUtils.ts`: Payment date calculations (Luxon-based, follows dateUtils pattern)
- `getPaymentDate.ts`: Legacy payment date utility (being replaced by paymentUtils)

### Data Processing Utils
- `mapCombination.ts`: Combination data mapping
- `mergeSuppliersData.ts`: Supplier data merging
- `processOrderResponse.ts`: Order response processing
- `mapMaxSpecificSuppliers.ts`: Supplier limit mapping

### Combination Utils
- `combinacaoUtils.ts`: Combination transformation utilities
- `preferenciaUtils.ts`: Preference handling utilities

### User & Restaurant Utils
- `userUtils.ts`: User-related utilities
- `restaurantUtils.ts`: Restaurant data utilities

### UI Utils
- `generateAbbreviation.ts`: Generate abbreviations for display
- `getStarValue.ts`: Rating/star value calculations
- `inativityTimer.ts`: Inactivity tracking and redirect

### Miscellaneous Utils
- `utils.ts`: General utilities (storage, token management)
- `errorUtils.ts`: Error handling utilities
- `formikUtils.ts`: Formik helper functions
- `loadFavorite.ts`: Favorite loading utilities
- `productObservation.ts`: Product observation handling
- `stringUtils.ts`: String manipulation utilities
- `DividirLogradouro.ts`: Address parsing
- `register.api.ts`: Registration API utilities
- `VersionApp.tsx`: Version display component (in utils folder)
- `NavigationTypes.ts`: Navigation type definitions (legacy - prefer src/types/navigationTypes.ts)

## Important Notes
- This is a V1 project transitioning to V2 in another repository
- **Code style and formatting rules are defined in `.eslintrc.js` and `.prettierrc`** - always check these files for current standards
- Husky pre-commit hooks enforce linting and formatting
- Expo Router provides file-based routing - no manual route configuration needed
- Tamagui provides cross-platform styling with web support
- Use contexts sparingly - only for truly global state
- Performance matters on mobile - avoid unnecessary re-renders
- Test on both iOS and Android during development
- Web support is secondary but should work
- When in doubt, check existing similar implementations in the codebase

## Type Definitions
- Navigation types exist in two locations: `src/types/navigationTypes.ts` (preferred) and `src/utils/NavigationTypes.ts` (legacy)
- Always use types from `src/types/` for consistency
- All type files are organized by feature in `src/types/` directory