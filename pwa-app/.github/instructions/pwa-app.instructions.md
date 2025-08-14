---
applyTo: '**'
description: 'Active Target PWA - Comprehensive Coding Instructions & Standards'
---

# Active Target PWA - Comprehensive Coding Instructions & Standards

## CRITICAL ENFORCEMENT RULES

### 1. MANDATORY TODO PROTOCOL
**AGENT MUST HALT EXECUTION IF TODO NOT FOLLOWED**

```
BEFORE ANY ACTION:
1. CREATE TODO with all tasks
2. MARK each task as COMPLETE when done
3. UPDATE status in real-time
4. VALIDATE completion before next task
5. FAIL if any task unmarked
```

### 2. STRICT TODO FORMAT
```
## TODO: [FEATURE_NAME]

- 🔳 Task 1: [Implementation + acceptance criteria]

- 🔳 Task 2: [Implementation + acceptance criteria]

CONTEXT_REQUIRED: [Files/modules needed]
ACCEPTANCE: [Measurable completion criteria]
STATUS: PENDING

## UPDATE RULES:

- ✅ Replace 🔳 with ✅ when COMPLETE
- 🔄 Use 🔄 for IN_PROGRESS
- ❌ Use ❌ for FAILED
- UPDATE STATUS: PENDING → IN_PROGRESS → COMPLETE

```

## PROJECT CONTEXT

### Application Architecture
- **Type**: Progressive Web Application (PWA) for shooting sports management
- **Domain**: Active Target shooting range control system
- **Core Features**: Device management, stage timing, scoring, MQTT real-time communication
- **Target Users**: Shooting range operators, competition organizers

### Technology Stack
```typescript
const TECH_STACK = {
  frontend: {
    framework: 'React 18',
    language: 'TypeScript 5.7',
    bundler: 'RSBuild + Rspack',
    routing: 'TanStack Router (file-based)',
    ui: 'Mantine v7.16',
    styling: 'CSS Modules + PostCSS'
  },
  stateManagement: {
    store: 'Redux Toolkit',
    middleware: ['MQTT', 'Devices', 'Timestamp'],
    persistence: 'redux-remember (localStorage)'
  },
  realtime: {
    protocol: 'MQTT over WebSocket',
    client: 'mqtt.js',
    server: 'ws://localhost:9001'
  },
  development: {
    linting: 'ESLint + @stylistic',
    typeChecking: 'TypeScript strict mode',
    hotReload: 'React Refresh'
  }
};
```

### Domain Model
```typescript
// Core entities in the system (Updated August 2025)
interface CoreEntities {
  Device: {
    types: ['TARGET', 'POPPER', 'NOSHOOT', 'STOP_PLATE']; // Simplified from 6 to 4 types
    states: ['online', 'offline'];
    communication: 'MQTT';
    management: 'Full CRUD operations at /manage/devices/';
  };
  User: {
    management: 'Full CRUD operations at /manage/users/';
    scoring: 'Per-stage tracking';
    authentication: 'Future implementation';
  };
  Stage: {
    states: ['STAGE_ACTIVE', 'STAGE_INACTIVE'];
    timing: 'Real-time with stopwatch';
    scoring: 'Device hit tracking';
    management: 'Available at /manage/stages/';
  };
  BigScreen: {
    status: 'Mock data - ready for Redux integration';
    simulation: 'useShootingSimulation hook';
    timer: 'useStageTimer hook integration';
  };
}
```

## CODING STANDARDS & CONVENTIONS

### 1. TypeScript Standards
```typescript
// REQUIRED: Strict type definitions
interface Device {
  id: string;                    // UUID format
  name: string;                  // Human readable
  type: DeviceType;              // Const union type
  status?: STATUS;               // Optional enum
  lastUpdated?: Date | string;   // Flexible date handling
  responses: string[];           // Array of responses
  sideEffects?: SideEffect[];    // Optional side effects
}

// REQUIRED: Const assertions for enums
export const DEVICE_TYPE_TARGET = 'TARGET' as const;
export const DEVICE_TYPE_POPPER = 'POPPER' as const;

// REQUIRED: Union types over enums
export type DeviceType =
  | typeof DEVICE_TYPE_TARGET
  | typeof DEVICE_TYPE_POPPER;
```

### 2. React Component Standards
```tsx
// REQUIRED: Functional components with TypeScript
interface ComponentProps {
  deviceId: string;
  onDeviceUpdate: (device: Device) => void;
  children?: React.ReactNode;
}

export function DeviceComponent({ deviceId, onDeviceUpdate, children }: ComponentProps) {
  // REQUIRED: Hooks at top level
  const device = useAppSelector(state => selectDeviceById(state, deviceId));
  const dispatch = useAppDispatch();

  // REQUIRED: Event handlers with proper typing
  const handleStatusToggle = useCallback(() => {
    const action = device.status === STATUS.ONLINE ? deviceOffline : deviceOnline;
    dispatch(action({ id: deviceId }));
  }, [device.status, deviceId, dispatch]);

  return (
    <div>
      {/* REQUIRED: Semantic JSX with proper event handling */}
    </div>
  );
}
```

### 3. Redux/State Management Standards
```typescript
// REQUIRED: RTK slice pattern
export const devicesSlice = createSlice({
  name: 'devices',
  initialState: mockDevices,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(deviceAdded, (state, { payload }) => {
        // REQUIRED: Immer-safe mutations
        const idx = state.findIndex(device => device.id === payload.id);
        if (idx === -1) {
          state.push(payload);
        }
      });
  }
});

// REQUIRED: Typed selectors
export const selectDevices = createSelector(
  (state: AppRootState) => state.devices,
  (devices) => devices.map(device => ({
    ...device,
    lastUpdated: device.lastUpdated ? new Date(device.lastUpdated) : undefined
  }))
);

// REQUIRED: Action creators with proper typing
export const deviceAdded = createAction<Device>('DEVICE/ADDED');
```

### 4. TanStack Router Standards
```tsx
// REQUIRED: File-based route definitions
export const Route = createFileRoute('/devices/$deviceId')({
  component: DeviceDetailsPage
});

function DeviceDetailsPage() {
  // REQUIRED: Use Route.useParams() for parameters
  const { deviceId } = Route.useParams();
  const navigate = useNavigate({ from: '/devices' });

  // REQUIRED: Type-safe navigation
  const handleNavigation = () => {
    navigate({ to: '/devices/$deviceId', params: { deviceId: 'new-id' } });
  };

  return <div>Device Details</div>;
}
```

### 5. MQTT/Real-time Standards
```typescript
// REQUIRED: MQTT action/message mapping
const mqttMiddleware: Middleware = ({ dispatch }) => {
  return next => action => {
    if (actions.connected.match(action)) {
      mqttClient.on('message', (topic, message) => {
        const { type, meta, payload } = parseMqttMessage(message.toString());
        const reduxAction = createAction(type, (payload, meta) => ({ payload, meta }));
        dispatch(reduxAction(payload, meta));
      });
    }
    next(action);
  };
};

// REQUIRED: Device communication constants
export const MQTT_TOPICS = {
  DEVICE_STATUS: 'at/device/+/status',
  DEVICE_RESPONSE: 'at/device/+/response',
  BROADCAST: 'at/devices/broadcast'
};
```

### 6. Import/Export Standards
```typescript
// REQUIRED: No barrel files - import directly from source
❌ // Avoid barrel files
import { DeviceComponent, DeviceList } from './devices';

✅ // Import directly from source files
import { DeviceComponent } from './devices/DeviceComponent';
import { DeviceList } from './devices/DeviceList';

// REQUIRED: Use named imports/exports when possible
❌ // Avoid default exports when not necessary
export default function DeviceComponent() { /* */ }

✅ // Prefer named exports
export function DeviceComponent() { /* */ }

// REQUIRED: Use tsconfig path aliases when available
❌ // Avoid relative paths for deep imports
import { selectDevices } from '../../../features/devices/devicesSlice';

✅ // Use tsconfig path aliases
import { selectDevices } from '@/features/devices/devicesSlice';

// REQUIRED: Import grouping and ordering
import React from 'react'; // 1. Built-in modules
import { useCallback } from 'react';

import { Button, Paper } from '@mantine/core'; // 2. External libraries
import { useAppSelector } from 'react-redux';

import { selectDevices } from '@/features/devices/devicesSlice'; // 3. Internal modules
import { DeviceCard } from '@/components/DeviceCard';

import type { Device, DeviceType } from './types'; // 4. Type-only imports (last)

// REQUIRED: Export patterns
// Single responsibility exports
export { DeviceComponent } from './DeviceComponent';
export { DeviceList } from './DeviceList';
export type { DeviceProps } from './types';

// Feature module exports (no barrel files)
// devices/index.ts should NOT exist
// Import directly: import { DeviceComponent } from '@/features/devices/DeviceComponent';
```

### 7. Styling Standards
```css
/* REQUIRED: CSS Modules naming */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--mantine-spacing-md);
}

.deviceList {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--mantine-spacing-md);
}

/* REQUIRED: Use Mantine CSS variables */
.primaryButton {
  background-color: var(--mantine-color-primary-filled);
  color: var(--mantine-color-primary-contrast);
}
```

### 8. File Organization Standards
```
src/
├── components/           # Reusable UI components
│   ├── Header/          # Feature-specific components
│   ├── NavBar/          # Navigation components
│   └── Timer/           # Shared components
├── features/            # Domain-based feature modules
│   ├── devices/         # Device management
│   ├── stages/          # Stage management
│   ├── users/           # User management
│   └── mqtt/            # MQTT communication
├── routes/              # File-based routing (TanStack)
├── hooks/               # Custom React hooks
├── themes/              # Mantine theme definitions
├── store/               # Redux store configuration
└── utils/               # Pure utility functions
```

## QUALITY STANDARDS

### Code Quality Rules
```typescript
const QUALITY_STANDARDS = {
  naming: {
    components: 'PascalCase', // DeviceComponent
    hooks: 'camelCase with use prefix', // useDeviceStatus
    files: 'camelCase for utilities, PascalCase for components',
    constants: 'UPPER_SNAKE_CASE', // DEVICE_TYPE_TARGET
    types: 'PascalCase' // DeviceType
  },
  functions: {
    maxLength: 50, // lines per function
    singlePurpose: true,
    pureWhenPossible: true
  },
  components: {
    maxProps: 8,
    defaultProps: 'Use default parameters',
    stateManagement: 'Prefer Redux for global, useState for local'
  },
  imports: {
    order: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
    grouping: 'By type (React, libraries, internal, types)',
    exportAll: 'FORBIDDEN - Do not use export *',
    namedImports: 'REQUIRED - Use named imports/exports only when possible',
    aliases: 'REQUIRED - Use tsconfig path aliases when available'
  }
};
```

### ESLint Configuration
```javascript
// REQUIRED: Follow existing ESLint config
const rules = {
  '@stylistic/indent': ['error', 2],
  '@stylistic/quotes': ['error', 'single'],
  '@stylistic/jsx-quotes': ['error', 'prefer-double'],
  'max-len': ['warn', { code: 140 }],
  'prefer-const': 'error',
  'react/prefer-stateless-function': 'error',
  'react-hooks/exhaustive-deps': 'warn'
};
```

## MANTINE UI STANDARDS

### Theme Management
```typescript
// REQUIRED: Use custom theme system
const theme = createMantineTheme({
  baseHue: 260,
  baseSaturation: 50,
  colors: {
    primary: [...], // 10-color array
    secondary: [...],
    tertiary: [...]
  }
});

// REQUIRED: Theme switching capability
export const themes = {
  corporate: corporateTheme,
  synthwave: synthwaveTheme,
  dracula: draculaTheme
};
```

### Component Usage
```tsx
// REQUIRED: Use Mantine components consistently
import { Table, Switch, Button, Container, Paper } from '@mantine/core';

function DeviceTable() {
  return (
    <Container>
      <Paper p="md">
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Name</Table.Th>
              <Table.Th>Status</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {/* Table rows */}
          </Table.Tbody>
        </Table>
      </Paper>
    </Container>
  );
}
```

## LEARNED PATTERNS & PROJECT INTELLIGENCE

### Implementation Lessons (August 2025)
```typescript
const PROJECT_LEARNINGS = {
  routeManagement: {
    pattern: 'File-based routing with TanStack Router',
    organization: 'Feature-based under /manage/ for admin functions',
    autoGeneration: 'Route generation happens automatically during dev server',
    navigation: 'Tab-based navigation for management sections'
  },
  deviceTypes: {
    evolution: 'Simplified from 6 types (including TRIGGER, ACTUATOR) to 4 core types',
    reasoning: 'Focus on scoring devices, removed auxiliary device types',
    types: ['TARGET', 'POPPER', 'NOSHOOT', 'STOP_PLATE'],
    impact: 'Cleaner UI, better focus on core functionality'
  },
  crudPatterns: {
    modals: 'Mantine Modal components for create/edit forms',
    validation: 'useForm hook with inline validation',
    notifications: 'Mantine notifications for success/error feedback',
    search: 'Real-time filtering with local state',
    redux: 'Direct integration with existing slices, preserve actions'
  },
  bigScreenArchitecture: {
    current: 'Mock data with useShootingSimulation hook',
    timer: 'useStageTimer hook connects to Redux match state',
    simulation: 'Simulates device responses without MQTT',
    nextStep: 'Replace mocks with Redux selectors, dispatch real actions'
  }
};
```

### User Preferences & Workflow
```typescript
const USER_WORKFLOW = {
  taskManagement: {
    format: 'Detailed task files with progress tracking',
    updates: 'Real-time progress logging with subtask completion',
    status: 'Clear status transitions: Pending → In Progress → Complete'
  },
  implementationStyle: {
    preservation: 'Enhance rather than replace existing functionality',
    consistency: 'Follow established UI patterns',
    quality: 'Comprehensive error handling and notifications',
    testing: 'Validate all CRUD operations before completion'
  },
  mqttIntegration: {
    approach: 'Implement simulation first, MQTT integration later',
    philosophy: 'Redux-first development, MQTT as enhancement',
    timing: 'Defer real MQTT until UI and state management solid'
  }
};
```

### Critical Implementation Paths
```typescript
const CRITICAL_PATHS = {
  managementCRUD: {
    structure: '/routes/manage/{feature}/ for all admin functions',
    patterns: 'Modal forms, table views, search functionality',
    redux: 'Preserve existing actions, enhance with CRUD operations',
    validation: 'Client-side validation with server-ready structure'
  },
  deviceManagement: {
    types: 'Simplified to 4 core scoring device types',
    status: 'Online/offline toggle with visual feedback',
    details: 'Side effects and responses management',
    integration: 'MQTT compatibility preserved for future'
  },
  bigScreenIntegration: {
    priority: 'Replace mock data with Redux state',
    simulation: 'Direct Redux dispatches instead of MQTT',
    timer: 'Fix useStageTimer integration with match state',
    leaderboard: 'Connect to real user scores from Redux'
  }
};
```

### Known Challenges & Solutions
```typescript
const CHALLENGES_SOLUTIONS = {
  routeGeneration: {
    challenge: 'TanStack Router requires route file structure changes',
    solution: 'Dev server automatically regenerates routes, no manual intervention',
    timing: 'Route updates happen during file creation/moves'
  },
  deviceTypes: {
    challenge: 'Original 6 device types too complex for current scope',
    solution: 'Simplified to 4 core types, clean up references',
    impact: 'Better UI focus, easier device management'
  },
  mqttIntegration: {
    challenge: 'MQTT dependency blocking UI development',
    solution: 'Simulation-first approach with Redux actions',
    benefit: 'Parallel development, better testing'
  },
  reduxPreservation: {
    challenge: 'Existing Redux actions and middleware need preservation',
    solution: 'Enhance existing slices rather than replace',
    result: 'CRUD operations work with existing MQTT infrastructure'
  }
};
```

### Tool Usage Patterns
```typescript
const TOOL_PATTERNS = {
  semanticSearch: 'Use for understanding codebase structure and finding patterns',
  grep: 'Use for specific string searches within known file contexts',
  readFile: 'Read large chunks (50-100 lines) rather than small sections',
  replaceString: 'Include 3-5 lines context for unique identification',
  fileCreation: 'Use createFile for new files, edit tools for modifications'
};
```

### Loading & Rendering
```typescript
const PERFORMANCE_TARGETS = {
  initialLoad: '<2s',
  routeTransition: '<300ms',
  mqttMessageProcessing: '<100ms',
  stateUpdates: '<50ms',
  componentRender: '<16ms (60fps)'
};

// REQUIRED: Lazy loading for routes
const LazyDeviceDetails = lazy(() => import('./routes/devices/$deviceId'));

// REQUIRED: Memo for expensive components
const ExpensiveComponent = memo(function ExpensiveComponent({ data }) {
  return <ComplexVisualization data={data} />;
});
```

### State Management Performance
```typescript
// REQUIRED: Selector memoization
export const selectExpensiveCalculation = createSelector(
  [selectDevices, selectStages],
  (devices, stages) => {
    // Expensive calculation here
    return computeComplexData(devices, stages);
  }
);

// REQUIRED: Batch updates in middleware
const timestampMiddleware: Middleware = () => next => action => {
  const result = next({
    ...action,
    meta: { ...action.meta, timestamp: Date.now() }
  });
  return result;
};
```

## TESTING STANDARDS

### Component Testing
```tsx
// REQUIRED: Test component behavior
describe('DeviceComponent', () => {
  it('should toggle device status on switch click', () => {
    const mockDispatch = jest.fn();
    render(<DeviceComponent deviceId="test-id" />);

    fireEvent.click(screen.getByRole('switch'));
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'DEVICE/ONLINE' })
    );
  });
});
```

### Redux Testing
```typescript
// REQUIRED: Test reducers and selectors
describe('devicesSlice', () => {
  it('should add device when deviceAdded action is dispatched', () => {
    const initialState = [];
    const newDevice = { id: 'test', name: 'Test Device', type: 'TARGET' };

    const result = devicesSlice.reducer(initialState, deviceAdded(newDevice));
    expect(result).toContain(newDevice);
  });
});
```

## ERROR HANDLING STANDARDS

### MQTT Error Handling
```typescript
// REQUIRED: Comprehensive error handling
mqttClient.on('error', (error) => {
  console.error('MQTT Error:', error);
  dispatch(mqttSlice.actions.disconnected());
  // Attempt reconnection after delay
  setTimeout(() => dispatch(mqttSlice.actions.startConnecting()), 5000);
});

// REQUIRED: Message parsing error handling
function parseMqttMessage(message: string): MqttMessageObject {
  try {
    return JSON.parse(message);
  } catch (error) {
    console.error('Failed to parse MQTT message:', message, error);
    throw new Error(`Invalid MQTT message format: ${message}`);
  }
}
```

### React Error Boundaries
```tsx
// REQUIRED: Error boundaries for route components
class DeviceErrorBoundary extends Component<Props, State> {
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Device component error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div>Something went wrong with device management.</div>;
    }
    return this.props.children;
  }
}
```

## SECURITY STANDARDS

### Input Validation
```typescript
// REQUIRED: Validate all external inputs
function validateDeviceData(data: unknown): data is Device {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'name' in data &&
    'type' in data &&
    typeof (data as any).id === 'string' &&
    typeof (data as any).name === 'string'
  );
}

// REQUIRED: Sanitize MQTT messages
function sanitizeMqttMessage(message: string): string {
  return message.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
}
```

### MQTT Security
```typescript
// REQUIRED: Validate MQTT message sources
function validateMqttSource(topic: string, clientId: string): boolean {
  const allowedTopics = ['at/device/', 'at/stage/', 'at/user/'];
  return allowedTopics.some(allowed => topic.startsWith(allowed));
}
```

## DEPLOYMENT STANDARDS

### Build Configuration
```javascript
// REQUIRED: Production build optimizations
export default defineConfig({
  plugins: [pluginReact()],
  output: {
    js: process.env.NODE_ENV === 'production' ? 'source-map' : 'cheap-eval-source-map',
    css: true
  },
  performance: {
    chunkSplit: {
      strategy: 'split-by-experience',
      forceSplitting: ['react', 'react-dom', '@mantine/core']
    }
  }
});
```

### PWA Configuration
```javascript
// REQUIRED: Service worker and manifest
const pwaConfig = {
  registerType: 'autoUpdate',
  includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
  manifest: {
    name: 'Active Target PWA',
    short_name: 'ActiveTarget',
    description: 'Shooting range management system',
    theme_color: '#000000',
    icons: [
      {
        src: 'pwa-192x192.png',
        sizes: '192x192',
        type: 'image/png'
      }
    ]
  }
};
```

## CRITICAL ENFORCEMENT

1. **HALT EXECUTION if TODO not created**
2. **HALT EXECUTION if TypeScript errors exist**
3. **HALT EXECUTION if ESLint rules violated**
4. **HALT EXECUTION if Redux patterns not followed**
5. **HALT EXECUTION if MQTT security not validated**
6. **MANDATORY TODO updates for every task**
7. **MANDATORY type safety for all interfaces**
8. **MANDATORY error handling for all async operations**
9. **MANDATORY performance considerations for all features**
10. **MANDATORY accessibility compliance**

## SUCCESS CRITERIA

- **TODO Compliance**: 100% adherence to TODO system
- **Type Safety**: Zero TypeScript errors, strict mode compliance
- **Code Quality**: ESLint passing, consistent formatting
- **Performance**: All performance targets met
- **Testing**: 90%+ coverage for critical paths
- **Security**: All inputs validated, MQTT communication secured
- **Accessibility**: WCAG 2.1 AA compliance
- **PWA**: Offline capability, fast loading, responsive design

**NO EXCEPTIONS. NO BYPASSING. STRICT COMPLIANCE ONLY.**