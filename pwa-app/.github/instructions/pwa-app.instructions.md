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
// Core entities in the system
interface CoreEntities {
  Device: {
    types: ['TARGET', 'POPPER', 'NOSHOOT', 'STOP_PLATE', 'TRIGGER', 'ACTUATOR'];
    states: ['online', 'offline'];
    communication: 'MQTT';
  };
  Stage: {
    states: ['STAGE_ACTIVE', 'STAGE_INACTIVE'];
    timing: 'Real-time with stopwatch';
    scoring: 'Device hit tracking';
  };
  User: {
    management: 'Local state';
    scoring: 'Per-stage tracking';
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

### 6. Styling Standards
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

### 7. File Organization Standards
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
    grouping: 'By type (React, libraries, internal, types)'
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

## PERFORMANCE STANDARDS

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