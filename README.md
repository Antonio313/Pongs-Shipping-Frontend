# 🚢 Pongs Shipping Company - Frontend

> Modern React frontend application for comprehensive shipping management and package tracking.

![React](https://img.shields.io/badge/React-19.1.1-61DAFB.svg?logo=react)
![Vite](https://img.shields.io/badge/Vite-7.1.2-646CFF.svg?logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.1.12-38B2AC.svg?logo=tailwind-css)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-3178C6.svg?logo=typescript)

## 🌟 Overview

The Pongs Shipping Company frontend is a cutting-edge React application built with modern web technologies to provide an exceptional user experience for both customers and administrators managing shipping operations between the United States and Jamaica.

### ✨ Key Features

- **🎨 Modern UI/UX**: Clean, responsive design with Tailwind CSS
- **📱 Mobile-First**: Fully responsive across all devices
- **🔐 Secure Authentication**: JWT-based auth with role-based access control
- **⚡ Fast Performance**: Optimized with Vite for lightning-fast development and builds
- **🎯 Real-time Updates**: Live package tracking and notifications
- **🔄 State Management**: Context API for efficient state handling
- **📊 Interactive Dashboards**: Separate interfaces for customers and admins

## 🏗️ Architecture

### Project Structure

```
pongs-shipping/
├── public/                 # Static assets
│   ├── favicon.svg        # Ship icon favicon
│   └── manifest.json      # PWA manifest
├── src/                   # Source code
│   ├── assets/           # Images, icons, etc.
│   ├── AdminDashboard.jsx # Admin main dashboard
│   ├── CustomerDashboard.jsx # Customer main dashboard
│   ├── Login.jsx         # Authentication pages
│   ├── Signup.jsx
│   ├── Home.jsx          # Landing page
│   └── main.jsx          # App entry point
├── components/           # Reusable components
│   ├── admin/           # Admin-specific components
│   │   ├── PackagesTab.jsx      # Package management
│   │   ├── CustomersTab.jsx     # Customer management
│   │   └── TransfersTab.jsx     # Transfer management
│   └── ProtectedRoute.jsx # Route protection
├── context/             # React Context providers
│   ├── AuthContext.jsx  # Authentication state
│   ├── PackagesContext.jsx # Package management
│   ├── PreAlertContext.jsx # Pre-alert handling
│   └── AdminContext.jsx # Admin-specific state
├── pages/               # Page components
│   ├── admin/          # Admin pages
│   │   ├── AdminProfile.jsx
│   │   └── AdminSettings.jsx
│   └── customer/       # Customer pages
│       ├── CustomerProfile.jsx
│       └── CustomerSettings.jsx
├── services/           # API integration
│   └── api.js         # Centralized API service
└── package.json       # Dependencies and scripts
```

### Tech Stack

- **⚛️ React 19.1.1**: Latest React with modern hooks and concurrent features
- **⚡ Vite 7.1.2**: Next-generation frontend tooling for fast development
- **🎨 Tailwind CSS 4.1.12**: Utility-first CSS framework for rapid UI development
- **🛣️ React Router DOM 7.8.2**: Declarative routing for single-page applications
- **📡 Axios**: Promise-based HTTP client for API communication
- **🔧 ESLint**: Code linting and formatting for consistent code quality

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v16+ recommended)
- **npm** or **yarn**
- **Backend API** running on port 3000

### Installation

```bash
# Clone the repository
git clone https://github.com/Antonio313/pongs-shipping.git
cd pongs-shipping

# Install dependencies
npm install

# Set up environment variables
echo "VITE_API_URL=http://localhost:3000/api" > .env
echo "VITE_APP_NAME=Pongs Shipping Company" >> .env

# Start development server
npm run dev
```

### Available Scripts

```bash
# Development
npm run dev          # Start development server with hot reload

# Production
npm run build        # Build for production
npm run preview      # Preview production build locally

# Code Quality
npm run lint         # Run ESLint for code quality checks
```

## 🎯 Features & Components

### 👤 Customer Features

#### **Package Tracking**
- Real-time package status updates with color-coded badges
- Interactive tracking timeline
- Mobile-responsive tracking interface
- Search functionality across all packages

#### **Pre-Alert Management**
- Create and manage shipping pre-alerts
- Upload receipts with drag-and-drop (AWS S3 integration)
- Edit and delete pre-alerts with confirmation dialogs
- Receipt download functionality with secure presigned URLs

#### **Customer Dashboard Components**
- **Package Overview**: Quick stats and recent activity
- **Pre-Alerts Tab**: Full CRUD operations for pre-alerts
- **Profile Management**: Update personal information
- **Settings**: Manage shipping preferences and branch selection

### 🛠️ Admin Features

#### **Enhanced Package Management**
- **Comprehensive CRUD Operations**: Create, read, update, delete packages
- **Advanced Package Details Modal**:
  - Professional gradient headers with brand colors
  - Color-coded information sections (blue, green, purple, indigo)
  - Mobile-responsive design with proper button placement
  - Confirmation dialogs for destructive actions
  - Loading states and error handling

#### **Customer Management**
- View all customers with their package history
- Customer detail views with comprehensive information
- Search and filter functionality
- Package association and management

#### **Transfer Management**
- Create and manage transfer lists
- Package check-off system with real-time updates
- Transfer status tracking
- Bulk operations for efficiency

#### **Admin Dashboard Components**
```javascript
AdminDashboard.jsx
├── PackagesTab.jsx       # Enhanced package management
│   ├── PackageDetailsModal  # Professional UI with gradients
│   ├── DeleteConfirmationModal  # Safe destructive actions
│   └── NotificationSystem  # Success/error feedback
├── CustomersTab.jsx      # Customer management
├── TransfersTab.jsx      # Transfer management
└── AdminSettings.jsx     # Admin configuration
```

## 🎨 UI/UX Design System

### Color Palette
```css
/* Primary Brand Colors */
--blue-600: #2563eb;      /* Primary brand color */
--blue-700: #1d4ed8;      /* Darker blue for hover states */
--teal-600: #2ca9bc;      /* Ship/ocean theme color (from favicon) */

/* Status Colors */
--green-600: #16a34a;     /* Success states */
--red-600: #dc2626;       /* Error/danger states */
--amber-600: #d97706;     /* Warning states */
--purple-600: #9333ea;    /* Info/accent states */
--gray-600: #4b5563;      /* Neutral states */
```

### Enhanced UI Components

#### **Package Details Modal (Latest Enhancement)**
- **Professional Gradient Headers**: Blue gradient with proper typography
- **Color-Coded Sections**:
  - 🔵 Blue: Tracking information and status
  - 🟢 Green: Customer information
  - 🟣 Purple: Package specifications
  - 🔘 Gray: Description
  - 🟦 Indigo: Timeline information
- **Mobile Optimization**:
  - Fixed height containers for mobile
  - Proper button placement and visibility
  - Responsive spacing and typography
- **Enhanced Interactions**:
  - Confirmation dialogs for delete operations
  - Loading states during operations
  - Auto-dismissing notifications

#### **Status System**
```javascript
// Dynamic status badges with context-aware colors
const statusConfig = {
  'Processing': { class: 'bg-gray-100 text-gray-800', text: 'Processing' },
  'Delivered to Overseas Warehouse': { class: 'bg-blue-100 text-blue-800', text: 'Arrived at Overseas Warehouse' },
  'In Transit to Jamaica': { class: 'bg-indigo-100 text-indigo-800', text: 'In Transit to Jamaica' },
  'Arrived in Jamaica': { class: 'bg-purple-100 text-purple-800', text: 'Arrived in Jamaica' },
  'Ready For Pickup': { class: 'bg-amber-100 text-amber-800', text: 'Ready for Pickup' },
  'Delivered': { class: 'bg-green-100 text-green-800', text: 'Delivered' }
};
```

## 🔧 Development Guidelines

### Code Style & Patterns

```javascript
// Modern React patterns used throughout
import { useState, useEffect, useContext } from 'react';

// Custom hooks for state management
const usePackages = () => {
  const context = useContext(PackagesContext);
  if (!context) {
    throw new Error('usePackages must be used within PackagesProvider');
  }
  return context;
};

// Consistent component structure
function Component({ prop1, prop2, onAction }) {
  const [localState, setLocalState] = useState(null);

  useEffect(() => {
    // Side effects
  }, []);

  return (
    <div className="responsive-container">
      {/* Component JSX */}
    </div>
  );
}
```

### State Management Strategy

```javascript
// Context providers for different domains
<AuthProvider>
  <PackagesProvider>
    <PreAlertProvider>
      <AdminProvider>
        <App />
      </AdminProvider>
    </PreAlertProvider>
  </PackagesProvider>
</AuthProvider>
```

### API Integration Pattern

```javascript
// Centralized API service with interceptors
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Automatic JWT token attachment
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Automatic error handling and logout on 401
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Clear session and redirect to login
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

## 📱 Mobile Responsiveness

### Enhanced Mobile Features
- **Fixed Height Modals**: Prevents content overflow on mobile
- **Touch-Friendly Buttons**: Minimum 44px tap targets
- **Optimized Navigation**: Thumb-friendly button placement
- **Responsive Typography**: Scales appropriately across devices
- **Progressive Disclosure**: Less important info hidden on small screens

### Breakpoint Strategy
```css
/* Mobile-first approach */
.component {
  @apply p-4 text-sm;           /* Mobile default */
  @apply sm:p-6 sm:text-base;   /* Small devices+ */
  @apply lg:p-8 lg:text-lg;     /* Large devices+ */
}
```

## 🔐 Authentication & Security

### JWT Token Management
```javascript
// Secure token handling with automatic refresh
const authFlow = {
  login: async (credentials) => {
    const response = await authAPI.login(credentials);
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }
};
```

### Route Protection
```javascript
// Role-based route protection
<Route
  path="/admin/*"
  element={
    <ProtectedRoute requiredRole="admin">
      <AdminDashboard />
    </ProtectedRoute>
  }
/>
```

## 🚀 Performance Optimizations

### Build Optimizations
- **Vite Fast Refresh**: Sub-second hot module replacement
- **Code Splitting**: Automatic route-based lazy loading
- **Tree Shaking**: Dead code elimination
- **Asset Optimization**: Automatic image compression and caching

### Runtime Performance
```javascript
// Optimized component patterns
const OptimizedComponent = React.memo(({ data }) => {
  const memoizedValue = useMemo(() => expensiveCalculation(data), [data]);

  return <div>{memoizedValue}</div>;
});

// Context optimization to prevent unnecessary re-renders
const PackagesProvider = ({ children }) => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);

  // Separate contexts for different update frequencies
  const value = useMemo(() => ({
    packages, setPackages, loading, setLoading
  }), [packages, loading]);

  return (
    <PackagesContext.Provider value={value}>
      {children}
    </PackagesContext.Provider>
  );
};
```

## 🎯 Recent Enhancements

### Package Management Improvements
- ✅ **Working Delete Functionality**: Proper API integration with state updates
- ✅ **Enhanced Modal UI**: Professional gradient design with improved UX
- ✅ **Mobile Responsiveness**: Fixed mobile button visibility issues
- ✅ **Confirmation Dialogs**: Safe destructive action handling
- ✅ **Notification System**: Success/error feedback with auto-dismiss

### UI/UX Enhancements
- ✅ **Color-Coded Information**: Each section has distinct, meaningful colors
- ✅ **Professional Typography**: Consistent heading hierarchy and spacing
- ✅ **Loading States**: Visual feedback during API operations
- ✅ **Error Handling**: Graceful error recovery and user feedback

## 📦 Build & Deployment

### Development Workflow
```bash
# Start development with hot reload
npm run dev
# App available at http://localhost:5173

# Build for production
npm run build
# Optimized files in 'dist' directory

# Preview production build
npm run preview
# Test production build locally
```

### Deployment Options

#### **Vercel** (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy with auto-detection
vercel --prod
```

#### **Netlify**
```bash
# Build command: npm run build
# Publish directory: dist
# Environment variables: VITE_API_URL, VITE_APP_NAME
```

## 🧪 Testing Strategy

### Testing Tools (Ready for Implementation)
```json
{
  "devDependencies": {
    "vitest": "^1.0.0",
    "@testing-library/react": "^13.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "cypress": "^13.0.0"
  }
}
```

### Test Examples
```javascript
// Component testing
import { render, screen } from '@testing-library/react';
import PackageDetailsModal from './PackageDetailsModal';

test('renders package details correctly', () => {
  const mockPackage = { tracking_number: 'TEST123', status: 'Processing' };
  render(<PackageDetailsModal package={mockPackage} />);

  expect(screen.getByText('TEST123')).toBeInTheDocument();
  expect(screen.getByText('Processing')).toBeInTheDocument();
});
```

## 🔧 Environment Configuration

```bash
# .env file configuration
VITE_API_URL=http://localhost:3000/api    # Backend API URL
VITE_APP_NAME=Pongs Shipping Company     # Application name

# Production example
VITE_API_URL=https://api.pongsshipping.com/api
VITE_APP_NAME=Pongs Shipping Company
```

## 🐛 Troubleshooting

### Common Issues & Solutions

#### **Vite Dev Server Issues**
```bash
# Port already in use
npm run dev -- --port 5174

# Clear Vite cache
rm -rf node_modules/.vite
npm run dev
```

#### **API Connection Problems**
```bash
# Check environment variables
echo $VITE_API_URL

# Verify backend connectivity
curl http://localhost:3000/api/health
```

#### **Build Optimization Issues**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Build with verbose output
npm run build -- --debug
```

## 📈 Performance Metrics

### Target Performance Goals
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms

### Bundle Size Analysis
```bash
# Analyze bundle composition
npm run build
npx vite-bundle-analyzer dist
```

## 🤝 Contributing

### Development Guidelines
1. **Follow Component Patterns**: Use established patterns for consistency
2. **Mobile-First Design**: Always test on mobile devices
3. **Accessibility**: Include proper ARIA labels and keyboard navigation
4. **Performance**: Consider bundle size impact of new dependencies

### Pull Request Checklist
- [ ] Mobile responsiveness verified
- [ ] Loading states implemented
- [ ] Error handling added
- [ ] TypeScript types (if applicable)
- [ ] Performance impact assessed
- [ ] Documentation updated

## 📞 Support & Contact

For questions, support, or contributions:

- **Email**: reuelrichards1@gmail.com
- **Phone**: (876) 573-8748
- **GitHub Issues**: [Report bugs or request features](https://github.com/Antonio313/pongs-shipping/issues)



## 🙏 Acknowledgments

- **React Team** for the incredible framework and ecosystem
- **Tailwind CSS** for the utility-first CSS approach
- **Vite Team** for the blazing-fast development experience
- **Open Source Community** for inspiration and best practices

---

<div align="center">

**🚢 Shipping the future, one package at a time**

[Live Demo](https://pongsshipping.com) • [Backend API](../pongs-shipping-api) • [Report Issues](https://github.com/Antonio313/pongs-shipping/issues)

</div>