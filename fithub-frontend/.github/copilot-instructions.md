# FitHub Frontend - AI Coding Instructions

## Project Overview
This is a React + TypeScript + Vite gym management frontend with role-based routing (admin/trainer/member). Uses microservices backend with 5 separate APIs and real-time WebSocket notifications.

## Architecture & Key Patterns

### 🏗️ Role-Based Navigation Structure
- **App.tsx**: Handles authentication state + login redirects  
- **DashboardRoutes.tsx**: Role-specific route configuration with nested paths
- Routes follow pattern: `/{role}/*` (e.g., `/admin/users`, `/trainer/clients`, `/member/plans`)
- All authenticated routes wrapped in `DashboardLayout` with role-aware `Sidebar`

### 🌐 API Layer Pattern
- **Centralized API utilities**: `/src/utils/api.ts` with auth token handling
- **Service modules**: `/src/api/*.ts` for each domain (users, plans, etc.)
- **Microservice endpoints**: 5 different base URLs in `/src/utils/config.ts`
  - User Service: `:8001`, Membership: `:8002`, Attendance: `:8003`, etc.
- **Authentication**: Basic token in localStorage, added to all requests

### 🪝 Data Management with React Query
- **Custom hooks**: `/src/hooks/use*.ts` wrapping `@tanstack/react-query`
- **Pattern**: `useQuery` for fetching, mutations handled in components
- **Example**: `useUsers()` → `loadUsers()` → `/auth/admin/members` endpoint

### 🎨 Component Design System
- **Tailwind + CVA**: Components use `class-variance-authority` for variant props
- **cn utility**: `twMerge(clsx(inputs))` for conditional classes
- **Button component**: Shows full CVA pattern with size/variant props
- **Reusable components**: Table, Card, Modal patterns in `/components/`

### 🔄 Real-time Notifications
- **WebSocket integration**: `useWebSocketNotifications` hook with SockJS + Stomp
- **User-specific subscriptions**: `/user/${userId}/queue/notifications`
- **Connection**: Notification service on `:8005/ws` endpoint

## Development Workflow

### 🚀 Essential Commands
```bash
npm run dev        # Development server with HMR
npm run build      # TypeScript compilation + Vite build
npm run lint       # ESLint across project
npm run preview    # Preview production build
```

### 🗂️ File Organization
- **Pages**: Role-organized in `/pages/{admin|trainer|member}/`
- **Shared pages**: `/pages/Login.tsx`, `/pages/MembershipPlansPage.tsx`
- **Modals**: Centralized in `/modals/` with consistent naming (Add*, Edit*)
- **Types**: Domain types in `/types/*.ts` matching API responses

### 🔧 Common Patterns

#### Adding New Feature
1. Create type in `/types/` matching backend response
2. Add API functions in `/api/` following existing auth pattern
3. Create custom hook in `/hooks/` wrapping React Query
4. Add page component in appropriate role directory
5. Update `DashboardRoutes.tsx` with new route

#### Modal Pattern
- Props: `isOpen`, `onClose`, `onSubmit?`, data props
- Use consistent naming: `Add{Entity}Modal`, `Edit{Entity}Modal`
- Place in `/modals/` directory

#### API Error Handling
- API functions throw errors for non-ok responses
- React Query handles error states in components
- Toast notifications for user feedback (via `ToastProvider`)

## Key Files to Reference
- **[DashboardRoutes.tsx](src/components/DashboardRoutes.tsx)**: Role-based routing patterns
- **[api.ts](src/utils/api.ts)**: Request wrapper with auth
- **[Button.tsx](src/components/Button.tsx)**: CVA component pattern
- **[useUsers.ts](src/hooks/useUsers.ts)**: React Query hook pattern
- **[config.ts](src/utils/config.ts)**: Microservice endpoint definitions

## TypeScript Configuration
- Strict mode enabled with path mapping
- Types separated from components
- React 19 + Vite for fast development
- ESLint configured for React hooks + TypeScript