#!/bin/bash

# Script para criar toda a estrutura do projeto ReactTS

echo "🚀 Criando estrutura completa do projeto..."

# Criar estrutura de pastas
mkdir -p src/{components/{ui,layout,features/{dashboard/components}},features/{api-explorer,documentation,dashboard},services,hooks,types,utils}

echo "📁 Estrutura de pastas criada!"

# 1. Criar arquivos de tipos
cat > src/types/index.ts << 'EOF'
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  status: number;
}

export interface CustomRequest {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  endpoint: string;
  data?: any;
  params?: Record<string, any>;
  headers?: Record<string, string>;
}

export interface SwaggerDoc {
  openapi: string;
  info: {
    title: string;
    version: string;
    description?: string;
  };
  servers: Array<{
    url: string;
    description?: string;
  }>;
  paths: Record<string, any>;
}

export interface ServerMetrics {
  uptime: number;
  memoryUsage: number;
  cpuUsage: number;
  activeConnections: number;
}
EOF

# 2. Criar serviços
cat > src/services/api.ts << 'EOF'
import { ApiResponse, CustomRequest } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

class ApiService {
  private baseUrl = API_BASE_URL;

  async request<T>(config: CustomRequest): Promise<ApiResponse<T>> {
    const { method, endpoint, data, params, headers } = config;
    
    try {
      const url = new URL(endpoint, this.baseUrl);
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          url.searchParams.append(key, String(value));
        });
      }

      const response = await fetch(url.toString(), {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: data ? JSON.stringify(data) : undefined,
      });

      const result = await response.json();
      
      return {
        success: response.ok,
        data: result,
        status: response.status,
        message: result.message || response.statusText,
      };
    } catch (error) {
      return {
        success: false,
        status: 500,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Métodos específicos
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    return this.request<T>({ method: 'GET', endpoint, params });
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>({ method: 'POST', endpoint, data });
  }

  async getHealth(): Promise<ApiResponse<{status: string}>> {
    return this.get('/health');
  }

  async getMetrics(): Promise<ApiResponse<any>> {
    return this.get('/metrics');
  }
}

export const apiService = new ApiService();
EOF

cat > src/services/index.ts << 'EOF'
export * from './api';
EOF

# 3. Criar hooks
cat > src/hooks/useServerStatus.ts << 'EOF'
import { useState, useEffect, useCallback } from "react";
import { apiService } from "../services";

export const useServerStatus = () => {
  const [status, setStatus] = useState("checking");
  const [isLoading, setIsLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkStatus = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await apiService.getHealth();
      setStatus(response.success ? "online" : "offline");
      setLastChecked(new Date());
    } catch (error) {
      setStatus("offline");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, [checkStatus]);

  return { status, isLoading, lastChecked, refetch: checkStatus };
};
EOF

# 4. Criar componentes UI
cat > src/components/ui/Button.tsx << 'EOF'
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  className = '',
  ...props 
}) => {
  const baseClasses = 'rounded font-medium transition-colors focus:outline-none focus:ring-2';
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
EOF

cat > src/components/ui/Card.tsx << 'EOF'
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '', title }) => {
  return (
    <div className={`bg-white rounded-lg shadow-md border border-gray-200 p-6 ${className}`}>
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
      {children}
    </div>
  );
};
EOF

cat > src/components/ui/Input.tsx << 'EOF'
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ 
  label, 
  error, 
  className = '', 
  ...props 
}) => {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <input
        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
          error ? 'border-red-500' : ''
        } ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};
EOF

cat > src/components/ui/index.ts << 'EOF'
export * from './Button';
export * from './Card';
export * from './Input';
EOF

# 5. Criar componentes de layout
cat > src/components/layout/Header.tsx << 'EOF'
import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900">
              API Explorer
            </h1>
          </div>
          <nav className="flex space-x-8">
            <a href="#dashboard" className="text-gray-600 hover:text-gray-900">
              Dashboard
            </a>
            <a href="#explorer" className="text-gray-600 hover:text-gray-900">
              API Explorer
            </a>
            <a href="#docs" className="text-gray-600 hover:text-gray-900">
              Documentation
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
};
EOF

cat > src/components/layout/Navigation.tsx << 'EOF'
import React from 'react';

export const Navigation: React.FC = () => {
  return (
    <nav className="bg-gray-50 border-r border-gray-200 w-64 min-h-screen">
      <div className="p-4">
        <ul className="space-y-2">
          <li>
            <a href="#dashboard" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded">
              Dashboard
            </a>
          </li>
          <li>
            <a href="#api-explorer" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded">
              API Explorer
            </a>
          </li>
          <li>
            <a href="#documentation" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded">
              Documentation
            </a>
          </li>
        </ul>
      </div>
    </nav>
  );
};
EOF

cat > src/components/layout/index.ts << 'EOF'
export * from './Header';
export * from './Navigation';
EOF

# 6. Criar componentes de dashboard
cat > src/components/features/dashboard/components/ServerStatus.tsx << 'EOF'
import React from 'react';
import { useServerStatus } from '../../../../hooks/useServerStatus';
import { Card } from '../../../ui/Card';

export const ServerStatus: React.FC = () => {
  const { status, isLoading, lastChecked } = useServerStatus();

  const statusColors = {
    online: 'text-green-600 bg-green-100',
    offline: 'text-red-600 bg-red-100',
    checking: 'text-yellow-600 bg-yellow-100',
  };

  return (
    <Card title="Server Status">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[status as keyof typeof statusColors]}`}>
            {isLoading ? 'Checking...' : status.toUpperCase()}
          </div>
        </div>
        {lastChecked && (
          <span className="text-sm text-gray-500">
            Last checked: {lastChecked.toLocaleTimeString()}
          </span>
        )}
      </div>
    </Card>
  );
};
EOF

cat > src/components/features/dashboard/components/MetricsCard.tsx << 'EOF'
import React from 'react';
import { Card } from '../../../ui/Card';

interface MetricsCardProps {
  title: string;
  value: string | number;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
}

export const MetricsCard: React.FC<MetricsCardProps> = ({ 
  title, 
  value, 
  unit, 
  trend 
}) => {
  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    stable: 'text-gray-600',
  };

  return (
    <Card>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">
            {value}
            {unit && <span className="text-sm text-gray-500 ml-1">{unit}</span>}
          </p>
        </div>
        {trend && (
          <div className={`text-sm ${trendColors[trend]}`}>
            {trend === 'up' && '↗'}
            {trend === 'down' && '↘'}
            {trend === 'stable' && '→'}
          </div>
        )}
      </div>
    </Card>
  );
};
EOF

cat > src/components/features/dashboard/components/EndpointTester.tsx << 'EOF'
import React, { useState } from 'react';
import { Card } from '../../../ui/Card';
import { Button } from '../../../ui/Button';
import { Input } from '../../../ui/Input';
import { apiService } from '../../../../services';

export const EndpointTester: React.FC = () => {
  const [endpoint, setEndpoint] = useState('/health');
  const [method, setMethod] = useState<'GET' | 'POST' | 'PUT' | 'DELETE'>('GET');
  const [response, setResponse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleTest = async () => {
    setIsLoading(true);
    try {
      const result = await apiService.request({
        method,
        endpoint,
      });
      setResponse(result);
    } catch (error) {
      setResponse({ error: 'Failed to make request' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card title="Endpoint Tester">
      <div className="space-y-4">
        <div className="flex space-x-2">
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
          </select>
          <Input
            value={endpoint}
            onChange={(e) => setEndpoint(e.target.value)}
            placeholder="/api/endpoint"
            className="flex-1"
          />
          <Button onClick={handleTest} disabled={isLoading}>
            {isLoading ? 'Testing...' : 'Test'}
          </Button>
        </div>
        
        {response && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Response:</h4>
            <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
              {JSON.stringify(response, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </Card>
  );
};
EOF

cat > src/components/features/dashboard/Dashboard.tsx << 'EOF'
import React from "react";
import { ServerStatus } from "./components/ServerStatus";
import { MetricsCard } from "./components/MetricsCard";
import { EndpointTester } from "./components/EndpointTester";

export const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricsCard title="Response Time" value={45} unit="ms" trend="down" />
        <MetricsCard title="Success Rate" value={99.9} unit="%" trend="stable" />
        <MetricsCard title="Active Users" value={1247} trend="up" />
        <MetricsCard title="Total Requests" value="125k" trend="up" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ServerStatus />
        <EndpointTester />
      </div>
    </div>
  );
};
EOF

# 7. Criar features
cat > src/features/dashboard/index.ts << 'EOF'
export { Dashboard } from '../../components/features/dashboard/Dashboard';
EOF

cat > src/features/api-explorer/ApiExplorer.tsx << 'EOF'
import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export const ApiExplorer: React.FC = () => {
  const [selectedEndpoint, setSelectedEndpoint] = useState('');
  
  const endpoints = [
    { path: '/health', method: 'GET', description: 'Health check' },
    { path: '/users', method: 'GET', description: 'Get all users' },
    { path: '/users/{id}', method: 'GET', description: 'Get user by ID' },
    { path: '/users', method: 'POST', description: 'Create new user' },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">API Explorer</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Available Endpoints">
          <div className="space-y-2">
            {endpoints.map((endpoint, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border rounded hover:bg-gray-50 cursor-pointer"
                onClick={() => setSelectedEndpoint(endpoint.path)}
              >
                <div>
                  <span className={`px-2 py-1 text-xs rounded font-medium mr-2 ${
                    endpoint.method === 'GET' ? 'bg-green-100 text-green-800' :
                    endpoint.method === 'POST' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {endpoint.method}
                  </span>
                  <span className="font-mono text-sm">{endpoint.path}</span>
                </div>
                <span className="text-sm text-gray-500">{endpoint.description}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Test Endpoint">
          <div className="space-y-4">
            <Input
              label="Endpoint"
              value={selectedEndpoint}
              onChange={(e) => setSelectedEndpoint(e.target.value)}
              placeholder="/api/endpoint"
            />
            <Button>Send Request</Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
EOF

cat > src/features/api-explorer/index.ts << 'EOF'
export { ApiExplorer } from './ApiExplorer';
EOF

cat > src/features/documentation/Documentation.tsx << 'EOF'
import React from 'react';
import { Card } from '../../components/ui/Card';

export const Documentation: React.FC = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">API Documentation</h2>
      
      <div className="space-y-6">
        <Card title="Getting Started">
          <div className="prose">
            <p className="text-gray-600 mb-4">
              Welcome to the API Explorer! This tool helps you interact with and test your Java API endpoints.
            </p>
            <h4 className="font-semibold mb-2">Base URL</h4>
            <code className="bg-gray-100 px-2 py-1 rounded">http://localhost:8080</code>
          </div>
        </Card>

        <Card title="Authentication">
          <div className="prose">
            <p className="text-gray-600 mb-4">
              This API uses standard HTTP authentication methods. Include your token in the Authorization header:
            </p>
            <pre className="bg-gray-100 p-3 rounded text-sm">
              Authorization: Bearer your-token-here
            </pre>
          </div>
        </Card>

        <Card title="Common Endpoints">
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold">Health Check</h4>
              <p className="text-gray-600 text-sm">GET /health</p>
              <p className="text-gray-500 text-sm">Returns the current status of the API server.</p>
            </div>
            
            <div>
              <h4 className="font-semibold">Get Metrics</h4>
              <p className="text-gray-600 text-sm">GET /metrics</p>
              <p className="text-gray-500 text-sm">Returns performance and usage metrics.</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
EOF

cat > src/features/documentation/index.ts << 'EOF'
export { Documentation } from './Documentation';
EOF

# 8. Criar App.tsx atualizado
cat > src/App.tsx << 'EOF'
import React, { useState } from "react";
import { Header } from "./components/layout";
import { Dashboard } from "./features/dashboard";
import { ApiExplorer } from "./features/api-explorer";
import { Documentation } from "./features/documentation";
import styles from "./App.module.css";

export const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'api-explorer':
        return <ApiExplorer />;
      case 'documentation':
        return <Documentation />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className={styles.app}>
      <Header />
      
      <div className={styles.container}>
        <nav className={styles.sidebar}>
          <ul className={styles.navList}>
            <li>
              <button
                className={`${styles.navButton} ${activeTab === 'dashboard' ? styles.active : ''}`}
                onClick={() => setActiveTab('dashboard')}
              >
                Dashboard
              </button>
            </li>
            <li>
              <button
                className={`${styles.navButton} ${activeTab === 'api-explorer' ? styles.active : ''}`}
                onClick={() => setActiveTab('api-explorer')}
              >
                API Explorer
              </button>
            </li>
            <li>
              <button
                className={`${styles.navButton} ${activeTab === 'documentation' ? styles.active : ''}`}
                onClick={() => setActiveTab('documentation')}
              >
                Documentation
              </button>
            </li>
          </ul>
        </nav>

        <main className={styles.main}>
          {renderContent()}
        </main>
      </div>
    </div>
  );
};
EOF

# 9. Criar App.module.css
cat > src/App.module.css << 'EOF'
.app {
  min-height: 100vh;
  background-color: #f8fafc;
}

.container {
  display: flex;
  min-height: calc(100vh - 64px);
}

.sidebar {
  width: 256px;
  background-color: white;
  border-right: 1px solid #e5e7eb;
  padding: 1.5rem;
}

.navList {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.navButton {
  width: 100%;
  text-align: left;
  padding: 0.75rem 1rem;
  border: none;
  background: none;
  border-radius: 0.5rem;
  color: #6b7280;
  transition: all 0.2s;
  cursor: pointer;
}

.navButton:hover {
  background-color: #f3f4f6;
  color: #374151;
}

.navButton.active {
  background-color: #dbeafe;
  color: #1d4ed8;
  font-weight: 500;
}

.main {
  flex: 1;
  padding: 2rem;
  overflow-auto;
}

@media (max-width: 768px) {
  .container {
    flex-direction: column;
  }
  
  .sidebar {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid #e5e7eb;
    padding: 1rem;
  }
  
  .navList {
    flex-direction: row;
    overflow-x: auto;
  }
  
  .navButton {
    white-space: nowrap;
    min-width: fit-content;
  }
}
EOF

# 10. Atualizar main.tsx
cat > src/main.tsx << 'EOF'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
EOF

# 11. Criar index.css com Tailwind
cat > src/index.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
}
EOF

echo "✅ Estrutura completa criada!"
echo ""
echo "📋 Arquivos criados:"
echo "  - Tipos TypeScript"
echo "  - Serviços de API"
echo "  - Hooks personalizados"
echo "  - Componentes UI (Button, Card, Input)"
echo "  - Layout (Header, Navigation)"
echo "  - Features (Dashboard, API Explorer, Documentation)"
echo "  - Estilos CSS"
echo ""
echo "🚀 Para instalar dependências necessárias:"
echo "npm install tailwindcss postcss autoprefixer @types/react @types/react-dom"
echo "npx tailwindcss init -p"
echo ""
echo "📱 Execute 'npm run dev' para iniciar o projeto!"
