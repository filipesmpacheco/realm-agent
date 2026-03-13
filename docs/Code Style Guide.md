# Guia de Boas Práticas

## 1. ESTRUTURA DE COMPONENTES

### ✅ DO's

- **Use Function Components com Hooks** (padrão moderno)

  ```tsx
  // ✅ CORRETO
  export default function MyComponent({ prop1, prop2 }: Props) {
    const [state, setState] = useState(0);
    return <View>...</View>;
  }
  ```

- **Use PascalCase para nomes de componentes**

  ```tsx
  // ✅ CORRETO
  export default function UserProfile() {}
  export const NavigationCard = () => {};
  ```

- **Mantenha componentes pequenos e focados** (Single Responsibility)
- **Use TypeScript para tipagem de props**

  ```tsx
  // ✅ CORRETO
  interface ComponentProps {
    title: string;
    onPress: () => void;
    optional?: boolean;
  }
  ```

- **Separe lógica de apresentação** (custom hooks para lógica complexa)
- **Use `Pressable` no lugar de `TouchableOpacity`** (componente moderno e mais flexível)

  ```tsx
  // ✅ CORRETO - Use Pressable
  <Pressable
    onPress={handlePress}
    style={({ pressed }) => [
      styles.button,
      pressed && styles.buttonPressed,
    ]}
  >
    <Text>Press me</Text>
  </Pressable>

  // ❌ EVITAR - TouchableOpacity é legado
  <TouchableOpacity onPress={handlePress}>
    <Text>Press me</Text>
  </TouchableOpacity>
  ```

- **Deixe as rotas limpas** - Leve template e lógica dos componentes para dentro de `/components/screens`

  ```tsx
  // ✅ CORRETO - Rota limpa (src/app/screen.tsx)
  import ScreenComponent from '@/src/screens/ScreenComponent';

  export default function Screen() {
    return <ScreenComponent />;
  }

  // ✅ CORRETO - Componente com lógica (src/screens/ScreenComponent.tsx)
  export default function ScreenComponent() {
    const [state, setState] = useState();
    // toda a lógica e template aqui
    return <View>...</View>;
  }
  ```

### ❌ DON'Ts

- **NÃO use Class Components** (legado, use Function Components)

  ```tsx
  // ❌ EVITAR
  class MyComponent extends React.Component {}
  ```

- **NÃO misture lógica de negócio com UI** no mesmo componente
- **NÃO crie componentes muito grandes** (>200 linhas geralmente indica necessidade de refatoração)
- **NÃO use `TouchableOpacity`** (prefira `Pressable`)

  ```tsx
  // ❌ EVITAR
  <TouchableOpacity onPress={handlePress}>
    <Text>Button</Text>
  </TouchableOpacity>
  ```

- **NÃO coloque lógica complexa nas rotas** (mova para `/components/screens`)

  ```tsx
  // ❌ EVITAR - Rota com muita lógica
  export default function Screen() {
    const [state, setState] = useState();
    const data = useQuery(...);
    // muita lógica aqui...
    return <View>...</View>;
  }
  ```

---

## 2. CONVENÇÕES DE NOMENCLATURA (NAMING CONVENTIONS)

### ✅ DO's

- **Arquivos de componentes → PascalCase com extensão `.tsx`**

  ```tsx
  // ✅ CORRETO
  UserCard.tsx;
  LoginButton.tsx;
  PatientProfile.tsx;
  ```

- **Arquivos de hooks → camelCase começando com `use` e extensão `.ts` ou `.tsx`**

  ```tsx
  // ✅ CORRETO
  useAuth.ts; // Hook sem JSX
  useExamFetcher.ts; // Hook sem JSX
  sessionCtx.tsx; // Hook com Context Provider (retorna JSX)
  ```

  **Quando usar `.tsx` vs `.ts` em hooks:**
  - Use `.tsx` apenas quando o hook exporta um componente React (ex: Context Provider)
  - Use `.ts` quando o hook retorna apenas dados, funções ou objetos (sem JSX)

- **Arquivos de services → camelCase com extensão `.ts`**

  ```tsx
  // ✅ CORRETO
  patientService.ts;
  userService.ts;
  fetchUser.ts;
  ```

- **Arquivos de utils/helpers → camelCase com extensão `.ts`**

  ```tsx
  // ✅ CORRETO
  constants.ts;
  formatters.ts;
  apiHelpers.ts;
  ```

- **Funções, hooks e variáveis → camelCase**

  ```tsx
  // ✅ CORRETO
  const fetchUserData = () => {};
  const useExamData = () => {};
  const userName = 'John';
  const isLoggedIn = true;
  ```

- **Custom hooks → devem começar com `use`**

  ```tsx
  // ✅ CORRETO
  export function useAuth() {}
  export function useExamFetcher() {}
  export function useTeresaTheme() {}
  ```

- **Nomes de componentes devem descrever o que o componente é**

  ```tsx
  // ✅ CORRETO - Nomes descritivos
  <UserProfileHeader />
  <LoginButton />
  <PatientCard />
  <ExamSummaryCard />
  ```

### ❌ DON'Ts

- **NÃO use números ou sufixos genéricos em nomes de componentes**

  ```tsx
  // ❌ PROIBIDO
  <ProfileHeaderNew2 />
  <Button3 />
  <Component1 />
  ```

- **NÃO use nomes genéricos ou vagos**

  ```tsx
  // ❌ EVITAR
  <Header />        // Muito genérico
  <Card />          // Muito genérico
  <Wrapper />       // Muito genérico

  // ✅ PREFERIR
  <UserProfileHeader />
  <PatientCard />
  <FormWrapper />
  ```

- **NÃO use PascalCase para funções, hooks ou variáveis**

  ```tsx
  // ❌ PROIBIDO
  const FetchUser = () => {};
  const UserName = 'John';

  // ✅ CORRETO
  const fetchUser = () => {};
  const userName = 'John';
  ```

- **NÃO crie hooks sem o prefixo `use`**

  ```tsx
  // ❌ PROIBIDO
  export function examFetcher() {} // Deveria ser useExamFetcher
  export function auth() {} // Deveria ser useAuth

  // ✅ CORRETO
  export function useExamFetcher() {}
  export function useAuth() {}
  ```

- **NÃO use camelCase para arquivos de componentes**

  ```tsx
  // ❌ PROIBIDO
  userCard.tsx;
  loginButton.tsx;

  // ✅ CORRETO
  UserCard.tsx;
  LoginButton.tsx;
  ```

---

## 3. HOOKS E STATE MANAGEMENT

### ✅ DO's

- **Use `useState` para estado local simples**

  ```tsx
  // ✅ CORRETO
  const [count, setCount] = useState(0);
  ```

- **Use `useEffect` com dependências corretas**

  ```tsx
  // ✅ CORRETO
  useEffect(() => {
    // effect logic
  }, [dependency1, dependency2]);
  ```

- **Use `useMemo` para cálculos custosos**

  ```tsx
  // ✅ CORRETO
  const expensiveValue = useMemo(() => {
    return heavyCalculation(data);
  }, [data]);
  ```

- **Use `useCallback` para funções passadas como props**

  ```tsx
  // ✅ CORRETO
  const handlePress = useCallback(() => {
    doSomething();
  }, [dependency]);

  // ✅ PRECISA
  const fn = useCallback(() => {}, []); // Passada para React.memo

  // ✅ PRECISA
  const fn = useCallback(() => {}, [id]); // Dependência de useEffect
  useEffect(() => {
    fn();
  }, [fn]);
  ```

- **Siga as Rules of Hooks** (sempre no topo, não em condicionais)

  ```tsx
  // ✅ CORRETO
  function Component() {
    const [state] = useState(); // Topo do componente
    const memo = useMemo(() => {}, []);
    // ... resto do código
  }
  ```

- **Use custom hooks para lógica reutilizável**
  ```tsx
  // ✅ CORRETO
  export const useExamData = (patientId?: number) => {
    // lógica reutilizável
  };
  ```

### ❌ DON'Ts

- **NÃO viole as Rules of Hooks**

  ```tsx
  // ❌ PROIBIDO
  if (condition) {
    const [state] = useState(); // ❌ Hook em condicional
  }
  ```

- **NÃO esqueça dependências no `useEffect`**

  ```tsx
  // ❌ PERIGOSO
  useEffect(() => {
    fetchData(id);
  }, []); // ❌ Falta 'id' nas dependências
  ```

- **NÃO use `useMemo`/`useCallback` desnecessariamente** (só quando há ganho real)
- **NÃO modifique state diretamente**
  ```tsx
  // ❌ PROIBIDO
  state.count = 5; // ❌ Nunca faça isso
  setState({ ...state, count: 5 }); // ✅ Correto
  ```

---

## 4. PROPS E COMPOSIÇÃO

### ✅ DO's

- **Use props para customizar componentes**

  ```tsx
  // ✅ CORRETO
  function Greeting({ name }: { name: string }) {
    return <Text>Hello, {name}!</Text>;
  }
  ```

- **Defina interfaces TypeScript para props**

  ```tsx
  // ✅ CORRETO
  interface ButtonProps {
    title: string;
    onPress: () => void;
    disabled?: boolean;
  }
  ```

- **Use props opcionais com `?`**

  ```tsx
  // ✅ CORRETO
  interface Props {
    required: string;
    optional?: number;
  }
  ```

- **Passe funções como props para callbacks**
  ```tsx
  // ✅ CORRETO
  <Button onPress={() => handleClick()} />
  ```

### ❌ DON'Ts

- **NÃO modifique props diretamente** (props são read-only)

  ```tsx
  // ❌ PROIBIDO
  function Component({ data }: Props) {
    data.value = 5; // ❌ Nunca modifique props
  }
  ```

- **NÃO use props para estado que deve ser interno**
- **NÃO passe objetos grandes como props** (prefira passar apenas o necessário)

---

## 5. ESTILIZAÇÃO (STYLING)

### ✅ DO's

- **Use `StyleSheet.create()` para estilos** (performance)

  ```tsx
  // ✅ CORRETO
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
  ```

- **Use `flex` para layouts** (padrão React Native)

  ```tsx
  // ✅ CORRETO
  container: {
    flex: 1, // Preenche espaço disponível
    justifyContent: 'center',
    alignItems: 'center',
  }
  ```

- **Use cores do tema** (`/src/theme/colors.ts`)

  ```tsx
  // ✅ CORRETO
  import { useTeresaTheme } from '@/src/hooks/useTeresaTheme';
  const teresaTheme = useTeresaTheme();
  const colors = teresaTheme.colors as TeresaMD3Colors;
  backgroundColor: colors.background;
  ```

- **Use valores do design system** (não hardcode)

  ```tsx
  // ✅ CORRETO
  padding: theme.spacing.medium;
  ```

- **Organize estilos no final do arquivo**

  ```tsx
  // ✅ CORRETO
  export default function Component() {
    // ... código
  }

  const styles = StyleSheet.create({
    // ... estilos
  });
  ```

### ❌ DON'Ts

- **NÃO use hardcoded cores/valores** (use tema)

  ```tsx
  // ❌ PROIBIDO
  backgroundColor: '#FF0000'; // ❌ Use colors.primary
  ```

- **NÃO use inline styles complexos** (use StyleSheet.create)

  ```tsx
  // ❌ EVITAR
  <View style={{ flex: 1, padding: 10, margin: 5 }} />

  // ✅ PREFERIR
  <View style={styles.container} />
  ```

- **NÃO misture unidades** (use números para React Native)

  ```tsx
  // ❌ INCORRETO
  width: '100px'; // ❌ React Native não usa px

  // ✅ CORRETO
  width: 100; // ou '100%'
  ```

---

## 6. IMPORTS E ORGANIZAÇÃO

### ✅ DO's

- **Use aliases `@/` para imports de `src/`** (configurado no projeto)

  ```tsx
  // ✅ CORRETO
  import { Button } from '@/src/components/Button';
  import { useTheme } from '@/src/hooks/useTeresaTheme';
  ```

- **Organize imports por tipo** (conforme ESLint config)

  ```tsx
  // ✅ CORRETO (ordem: builtin, external, internal, parent, sibling)
  import { useEffect, useState } from 'react';
  import { View, Text } from 'react-native';
  import { useTheme } from 'react-native-paper';

  import { Button } from '@/src/components/Button';
  import { useCustomHook } from '@/src/hooks/useCustomHook';

  import { localHelper } from './helpers';
  ```

- **Separe imports com linhas em branco** (conforme ESLint)
- **Alfabetize imports do mesmo grupo**

### ❌ DON'Ts

- **NÃO use imports relativos para `src/`**

  ```tsx
  // ❌ PROIBIDO (ESLint vai bloquear)
  import { Component } from '../../src/components/Component';
  ```

- **NÃO misture tipos de imports sem separação**
- **NÃO deixe imports não utilizados** (ESLint remove automaticamente)

---

## 7. PERFORMANCE

### ✅ DO's

- **Use `FlatList` para listas**

  ```tsx
  // ✅ CORRETO
  <FlatList
    data={items}
    renderItem={({ item }) => <Item data={item} />}
    keyExtractor={(item) => item.id}
  />
  ```

- **Use `contentInsetAdjustmentBehavior="automatic"` no FlatList** para não precisar de SafeAreaView

  ```tsx
  // ✅ CORRETO - Ajusta automaticamente para safe areas
  <FlatList
    data={items}
    renderItem={({ item }) => <Item data={item} />}
    keyExtractor={(item) => item.id}
    contentInsetAdjustmentBehavior="automatic"
  />
  ```

- **Use `ListEmptyComponent` para listas vazias no FlatList**

  ```tsx
  // ✅ CORRETO
  <FlatList
    data={items}
    renderItem={({ item }) => <Item data={item} />}
    keyExtractor={(item) => item.id}
    ListEmptyComponent={
      <View style={styles.emptyContainer}>
        <Text>Nenhum item encontrado</Text>
      </View>
    }
    ListHeaderComponent={<Header />}
    ListFooterComponent={<Footer />}
  />
  ```

- **Use outras propriedades úteis do FlatList**

  ```tsx
  // ✅ CORRETO - Exemplo completo
  <FlatList
    data={items}
    renderItem={({ item }) => <Item data={item} />}
    keyExtractor={(item) => item.id.toString()}
    contentInsetAdjustmentBehavior="automatic"
    ListEmptyComponent={<EmptyState />}
    ListHeaderComponent={<Header />}
    ListFooterComponent={<Footer />}
    refreshing={isRefreshing}
    onRefresh={handleRefresh}
    onEndReached={handleLoadMore}
    onEndReachedThreshold={0.5}
  />
  ```

- **Use `React.memo()` para componentes pesados**

  ```tsx
  // ✅ CORRETO
  export default React.memo(function ExpensiveComponent({ data }: Props) {
    // ...
  });
  ```

- **Use `keyExtractor` em FlatList**

  ```tsx
  // ✅ CORRETO
  <FlatList keyExtractor={(item) => item.id.toString()} />
  ```

- **Otimize re-renders com `useMemo` e `useCallback`**
- **Use `getItemLayout` quando possível** (FlatList performance)

### ❌ DON'Ts

- **NÃO use `ScrollView` para listas**

  ```tsx
  // ❌ PROIBIDO (crítico para mobile)
  <ScrollView>
    {items.map((item) => (
      <Item key={item.id} />
    ))}
  </ScrollView>
  ```

- **NÃO ignore re-renders desnecessários**
- **NÃO faça queries duplicadas** (use React Query cache)
- **NÃO crie funções inline em render**

  ```tsx
  // ❌ EVITAR
  <Button onPress={() => doSomething(id)} />;

  // ✅ PREFERIR
  const handlePress = useCallback(() => doSomething(id), [id]);
  <Button onPress={handlePress} />;
  ```

---

## 8. TYPESCRIPT

### ✅ DO's

- **Use tipos do projeto** (`/src/client/types.gen.ts`)

  ```tsx
  // ✅ CORRETO
  import { DiagnosticReport } from '@/src/client/types.gen';
  ```

- **Use `as` para type assertions quando necessário**

  ```tsx
  // ✅ CORRETO
  const colors = theme.colors as TeresaMD3Colors;
  ```

- **Prefira `interface` para objetos, `type` para unions**

  ```tsx
  // ✅ CORRETO
  interface User {
    name: string;
    age: number;
  }

  type Status = 'loading' | 'success' | 'error';
  ```

### ❌ DON'Ts

- **NÃO use `any`** (proibido - ESLint error)

  ```tsx
  // ❌ PROIBIDO
  const data: any = {};
  ```

- **NÃO ignore erros de tipo** (use `@ts-ignore` apenas em casos extremos)
- **NÃO use tipos genéricos desnecessários**
- **NÃO deixe `noUncheckedIndexedAccess` desabilitado** (está ativo no projeto)

---

## 9. NAVEGAÇÃO (EXPO ROUTER)

### ✅ DO's

- **Use `Stack` para navegação hierárquica**

  ```tsx
  // ✅ CORRETO
  <Stack screenOptions={{ headerShown: false }} />
  ```

- **Use `Slot` para layouts simples** (sem histórico)
- **Use `router.push()` para navegação programática**

  ```tsx
  // ✅ CORRETO
  import { router } from 'expo-router';
  router.push('/path');
  ```

- **Use `useLocalSearchParams()` para parâmetros**
  ```tsx
  // ✅ CORRETO
  const { id } = useLocalSearchParams<{ id: string }>();
  ```

### ❌ DON'Ts

- **NÃO use navegação imperativa desnecessariamente**
- **NÃO ignore tipos de rotas** (use typed routes se configurado)

---

## 10. CÓDIGO LIMPO

### ✅ DO's

- **Remova código comentado**
- **Use nomes descritivos**

  ```tsx
  // ✅ CORRETO
  const userProfileData = getUserData();
  const isUserLoggedIn = checkAuth();
  ```

- **Comente apenas lógica complexa** (em inglês)

  ```tsx
  // ✅ CORRETO
  // Calculate dynamic font size based on chart width and data density
  const fontSize = useMemo(() => {
    // complex calculation
  }, [dependencies]);
  ```

- **Use JSDoc para funções complexas**

  ```tsx
  // ✅ CORRETO
  /**
   * useExamData hook provides data fetching and processing.
   * @param patientId - Optional patient identifier
   * @returns Object containing processed reports and loading states
   */
  export const useExamData = (patientId?: number) => {
    // ...
  };
  ```

- **Mantenha funções pequenas e focadas**

### ❌ DON'Ts

- **NÃO use `console.log()`** (proibido - remover antes de commit)

  ```tsx
  // ❌ PROIBIDO
  console.log('debug', data);
  ```

- **NÃO deixe código comentado**

  ```tsx
  // ❌ PROIBIDO
  // const oldCode = something();
  ```

- **NÃO use comentários em português** (use inglês)

  ```tsx
  // ❌ PROIBIDO
  // Busca dados do paciente

  // ✅ CORRETO
  // Fetch patient data
  ```

- **NÃO use variáveis/imports/funções não utilizadas**

---

## 11. SEGURANÇA E BOAS PRÁTICAS

### ✅ DO's

- **Valide dados de entrada**
- **Use TypeScript para type safety**
- **Trate erros adequadamente**

  ```tsx
  // ✅ CORRETO
  try {
    await fetchData();
  } catch (error) {
    handleError(error);
  }
  ```

- **Use React Query para cache e error handling**
  ```tsx
  // ✅ CORRETO
  const { data, isLoading, error } = useQuery({
    queryKey: ['data', id],
    queryFn: () => fetchData(id),
  });
  ```

### ❌ DON'Ts

- **NÃO exponha dados sensíveis** (API keys, tokens)
- **NÃO ignore erros silenciosamente**
- **NÃO faça chamadas de API duplicadas** (use cache)

---

## 12. ESTRUTURA DE PASTAS

### ✅ DO's

- **Siga a estrutura padrão de pastas do projeto**

  ```
  src/
    app/              # Rotas do Expo Router (apenas imports de screens)
    components/       # Componentes reutilizáveis
    screens/          # Componentes específicos de tela
    navigation/       # Componentes de navegação
    hooks/            # Custom hooks
    services/         # Lógica de negócio e APIs
    store/            # Estado global (Context/Zustand)
    utils/            # Funções utilitárias
    types/            # Tipos TypeScript globais
    assets/           # Imagens, fontes, etc.
    theme/            # Tema e estilos globais
  ```

- **Components stay reusable** - Componentes em `/components/` devem ser reutilizáveis

  ```tsx
  // ✅ CORRETO - Componente reutilizável
  // src/components/Button.tsx
  export default function Button({ title, onPress }: ButtonProps) {
    return <Pressable onPress={onPress}>...</Pressable>;
  }
  ```

- **Screens stay screen-specific** - Componentes de tela em `/screens/`

  ```tsx
  // ✅ CORRETO - Componente específico de tela
  // src/screens/UserProfileScreen.tsx
  export default function UserProfileScreen() {
    const { user } = useUser();
    // lógica e template específicos desta tela
    return <View>...</View>;
  }

  // src/app/user-profile.tsx - Rota limpa
  import UserProfileScreen from '@/src/screens/UserProfileScreen';
  export default function UserProfile() {
    return <UserProfileScreen />;
  }
  ```

- **Navigation stays isolated** - Componentes de navegação em `/navigation/`

  ```tsx
  // ✅ CORRETO
  // src/navigation/TabBar.tsx
  export default function CustomTabBar() {
    // lógica de navegação isolada
  }
  ```

- **Business logic moves to hooks/services** - Lógica de negócio em hooks ou services

  ```tsx
  // ✅ CORRETO - Lógica em hook
  // src/hooks/useUserData.ts
  export const useUserData = (userId: string) => {
    // lógica de negócio
  };

  // ✅ CORRETO - Lógica em service
  // src/services/userService.ts
  export const userService = {
    fetchUser: async (id: string) => {
      /* ... */
    },
    updateUser: async (id: string, data: UserData) => {
      /* ... */
    },
  };
  ```

- **Types become globally reusable** - Tipos compartilhados em `/types/`

  ```tsx
  // ✅ CORRETO
  // src/types/user.ts
  export interface User {
    id: string;
    name: string;
  }

  // Usar em qualquer lugar
  import { User } from '@/src/types/user';
  ```

- **Utils para funções auxiliares** - Funções utilitárias em `/utils/`

  ```tsx
  // ✅ CORRETO
  // src/utils/formatters.ts
  export const formatDate = (date: Date) => {
    /* ... */
  };
  export const formatCurrency = (value: number) => {
    /* ... */
  };
  ```

### ❌ DON'Ts

- **NÃO coloque componentes reutilizáveis em `/components/screens/`**

  ```tsx
  // ❌ ERRADO
  // src/components/screens/Button.tsx - Button é reutilizável!

  // ✅ CORRETO
  // src/components/Button.tsx
  ```

- **NÃO coloque lógica de negócio diretamente em componentes**

  ```tsx
  // ❌ EVITAR - Lógica de negócio no componente
  function UserProfile() {
    const [user, setUser] = useState();
    useEffect(() => {
      fetch('/api/user').then(...); // ❌ Lógica deveria estar em service
    }, []);
  }

  // ✅ CORRETO - Lógica em hook/service
  function UserProfile() {
    const { user } = useUserData(); // Hook com lógica de negócio
  }
  ```

- **NÃO coloque tipos específicos de componente junto com o componente**

  ```tsx
  // ❌ EVITAR - Tipo específico no arquivo do componente
  // src/components/Button.tsx
  interface ButtonProps { ... } // Se usado em outros lugares

  // ✅ CORRETO - Tipo compartilhado em /types/
  // src/types/components.ts
  export interface ButtonProps { ... }
  ```

- **NÃO misture responsabilidades nas pastas**

  ```tsx
  // ❌ ERRADO - Service dentro de hooks
  // src/hooks/userService.ts

  // ✅ CORRETO
  // src/services/userService.ts
  ```

---

## 13. ESPECÍFICO DO PROJETO TERESA

### ✅ DO's

- **Use componentes compartilhados e do design sytem** (`/src/components/`)
- **Use tema do projeto** (`/src/theme/`)
- **Siga estrutura de pastas** conforme seção acima
- **Coloque componentes de tela em `/screens/<ScreenComponent.tsx>`** - Mantenha rotas limpas

  ```tsx
  // ✅ CORRETO - Estrutura de pastas
  /src/app / user -
    profile.tsx / // Rota limpa
      src /
      components /
      screens /
      UserProfileScreen.tsx; // Lógica e template
  ```

- **Use ícones da lib baseada Figma de ícones da Teresa** (conforme seção abaixo)
  ```tsx
  // ✅ CORRETO
  <Icons.Home fill="currentColor" />
  ```

### ❌ DON'Ts

- **NÃO crie componentes que já existem**
- **NÃO ignore o design system**
- **NÃO use valores hardcoded** (cores, espaçamentos)
- **NÃO coloque lógica de tela diretamente nas rotas** (use `/components/screens`)

---

## 14. ÍCONES

### ✅ DO's

- **Add icons only from our lib** [here](https://www.figma.com/design/JMBs0MLohStiKGg4H9Wcso/Teresa-ICONS?node-id=5-21733&t=0kvC0PJcyEavclGx-0)
- **Always set `fill` property to `currentColor`**
  ```tsx
  // ✅ CORRETO
  <Icons.Home fill="currentColor" />
  ```

### ❌ DON'Ts

- **NÃO use ícones de outras bibliotecas** sem aprovação
- **NÃO hardcode cores em ícones** (use `currentColor`)

---

## 15. USO DE useEffect

1. **Estado derivado não deve ser sincronizado com `useEffect`**  
   Se o valor depende apenas de props/estado existente, derive-o durante o render (const ou `useMemo`). Usar `useEffect` + `setState` para “sincronizar” gera um render extra e estado inconsistente entre renders.

2. **Cadeias de effects causam múltiplos renders e estado inconsistente**  
   Vários `useEffect` que dependem um do outro ou que atualizam estado em sequência levam a mais renderizações e a janelas onde a UI está inconsistente. Prefira derivar valores no render ou consolidar lógica em um único effect quando for inevitável.

3. **Data fetching direto em `useEffect` é frágil**  
   Fazer fetch dentro de `useEffect` sem cuidado gera race conditions (resposta antiga sobrescreve a nova) e risco de memory leak (atualizar estado após unmount). A solução recomendada é usar TanStack Query (React Query), que trata cache, deduplicação, race conditions e cleanup.

4. **Stale closures**  
   Effects que capturam valores em closures podem usar versões antigas desses valores (stale closure), causando bugs difíceis de ver. Reduzir a dependência de effects e usar as alternativas acima diminui esse risco.

### ✅ DO's

- **Prefira estado derivado com `const` ou `useMemo` em vez de `useEffect` + `setState`**

  ```tsx
  // ✅ CORRETO - Derived state during render
  const fullName = [firstName, lastName].filter(Boolean).join(' ');

  // Ou para cálculo custoso
  const sortedItems = useMemo(() => sortItems(items), [items]);
  ```

- **Use TanStack Query (React Query) para data fetching** (cache, loading, error, race conditions, cleanup)

  ```tsx
  // ✅ CORRETO
  const { data, isLoading, error } = useQuery({
    queryKey: ['user', id],
    queryFn: () => fetchUser(id),
  });
  ```

- **Use `useEffect` apenas para sincronizar com sistemas externos** (subscriptions, listeners, APIs imperativas que não são “fetch de dados para UI”)

### ❌ DON'Ts

- **NÃO use `useEffect` para espelhar props/estado em outro estado** (derive no render)

  ```tsx
  // ❌ EVITAR - Extra render, inconsistent state
  const [fullName, setFullName] = useState('');
  useEffect(() => {
    setFullName([firstName, lastName].filter(Boolean).join(' '));
  }, [firstName, lastName]);

  // ✅ PREFERIR
  const fullName = [firstName, lastName].filter(Boolean).join(' ');
  ```

- **NÃO faça data fetching “na mão” em `useEffect`** (prefira React Query)

  ```tsx
  // ❌ EVITAR - Race conditions, memory leak, sem cache
  useEffect(() => {
    let cancelled = false;
    fetchUser(id).then((data) => {
      if (!cancelled) setUser(data);
    });
    return () => {
      cancelled = true;
    };
  }, [id]);

  // ✅ PREFERIR
  const { data: user } = useQuery({
    queryKey: ['user', id],
    queryFn: () => fetchUser(id),
  });
  ```

- **NÃO crie cadeias de effects que atualizam estado em sequência** (derive ou unifique a lógica para menos renders e estado previsível)

---
