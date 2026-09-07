import React from 'react';
import {
  // Dashboard
  LayoutDashboard,
  TrendingUp,
  Activity,
  Award,
  
  // Territórios
  MapPin,
  Map,
  Globe,
  Navigation,
  Crosshair,
  Home,
  Building,
  Store,
  
  // Designações
  ClipboardList,
  Calendar,
  CheckCircle,
  Clock,
  RefreshCw,
  FileCheck,
  AlertCircle,
  
  // Congregação
  Users,
  User,
  UserPlus,
  UserCheck,
  UserX,
  UserCog,
  Shield,
  BadgeCheck,
  
  // Relatórios
  BarChart3,
  BarChart2,
  LineChart,
  PieChart,
  FileText,
  FileSpreadsheet,
  Download,
  Upload,
  Printer,
  
  // Ações
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Filter,
  Settings,
  LogOut,
  
  // Navegação
  Menu,
  X,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  
  // Tema
  Sun,
  Moon,
  
  // Sistema
  BookOpen,
  Info,
  Bell,
  Mail,
  Lock,
  Shield as ShieldIcon,
  HelpCircle,
  
  // Status
  Check,
  X as XIcon,
  AlertTriangle,
  Info as InfoIcon
} from 'lucide-react';

// Exportar todos os ícones como um objeto para fácil acesso
export const Icons = {
  // Dashboard
  LayoutDashboard,
  TrendingUp,
  Activity,
  Award,
  
  // Territórios
  MapPin,
  Map,
  Globe,
  Navigation,
  Crosshair,
  Home,
  Building,
  Store,
  
  // Designações
  ClipboardList,
  Calendar,
  CheckCircle,
  Clock,
  RefreshCw,
  FileCheck,
  AlertCircle,
  
  // Congregação
  Users,
  User,
  UserPlus,
  UserCheck,
  UserX,
  UserCog,
  Shield,
  BadgeCheck,
  
  // Relatórios
  BarChart3,
  BarChart2,
  LineChart,
  PieChart,
  FileText,
  FileSpreadsheet,
  Download,
  Upload,
  Printer,
  
  // Ações
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Filter,
  Settings,
  LogOut,
  
  // Navegação
  Menu,
  X,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  
  // Tema
  Sun,
  Moon,
  
  // Sistema
  BookOpen,
  Info,
  Bell,
  Mail,
  Lock,
  ShieldIcon,
  HelpCircle,
  
  // Status
  Check,
  XIcon,
  AlertTriangle,
  InfoIcon
};

// Padrões de cores para ícones
export const IconColors = {
  primary: 'text-[#1a3c6e] dark:text-blue-400',
  success: 'text-green-600 dark:text-green-400',
  warning: 'text-yellow-600 dark:text-yellow-400',
  danger: 'text-red-600 dark:text-red-400',
  info: 'text-blue-600 dark:text-blue-400',
  purple: 'text-purple-600 dark:text-purple-400',
  gray: 'text-gray-600 dark:text-gray-400',
  white: 'text-white',
  muted: 'text-[#64748b] dark:text-gray-400'
};

// Tamanhos padrão
export const IconSizes = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-8 h-8',
  '2xl': 'w-10 h-10',
  '3xl': 'w-12 h-12'
};

// Interface para as props do componente Icon
interface IconProps {
  icon: React.ElementType;
  size?: keyof typeof IconSizes;
  color?: keyof typeof IconColors;
  className?: string;
  onClick?: () => void;
}

// Componente de ícone padronizado
export const Icon: React.FC<IconProps> = ({
  icon: IconComponent,
  size = 'md',
  color = 'primary',
  className = '',
  onClick
}) => {
  const sizeClass = IconSizes[size] || IconSizes.md;
  const colorClass = IconColors[color] || IconColors.primary;
  
  return React.createElement(IconComponent, {
    className: `${sizeClass} ${colorClass} ${className} ${onClick ? 'cursor-pointer hover:opacity-70' : ''}`,
    onClick: onClick
  });
};

export default Icons;