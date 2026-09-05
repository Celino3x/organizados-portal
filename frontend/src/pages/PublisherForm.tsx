import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, User, Mail, Phone, MapPin, Calendar, 
  Users, Shield, Key, Save, X, Camera, 
  Upload, Eye, EyeOff, CheckCircle, AlertCircle,
  UserCircle, Home, Briefcase, Award, Lock,
  Mic, BookOpen, Globe, FileText, Loader2
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface Publisher {
  id?: string;
  name: string;
  email: string;
  phone: string;
  cellphone: string;
  address: string;
  birthDate: string;
  baptismDate: string;
  gender: 'male' | 'female';
  class: 'other_sheep' | 'anointed';
  privileges: string[];
  accessLevel: 'viewer' | 'support' | 'admin';
  permissions: {
    canMakePublicTalk: boolean;
    canMakeMeetingParts: boolean;
    canManageTerritories: boolean;
    canManageDesignations: boolean;
    canManagePublishers: boolean;
    canViewReports: boolean;
  };
  congregation: string;
  group: string;
  isActive: boolean;
  photo?: string;
}

const PublisherForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<Publisher>({
    name: '',
    email: '',
    phone: '',
    cellphone: '',
    address: '',
    birthDate: '',
    baptismDate: '',
    gender: 'male',
    class: 'other_sheep',
    privileges: ['publisher'],
    accessLevel: 'viewer',
    permissions: {
      canMakePublicTalk: false,
      canMakeMeetingParts: false,
      canManageTerritories: false,
      canManageDesignations: false,
      canManagePublishers: false,
      canViewReports: false
    },
    congregation: 'Vilar Guanabara',
    group: '',
    isActive: true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Verificar se é admin
  const isAdmin = currentUser?.accessLevel === 'admin';
  const isEditingSelf = id === currentUser?.id;
  const isEditing = !!id;

  // Carregar dados se for edição
  useEffect(() => {
    if (id) {
      loadPublisher();
    } else {
      setLoadingData(false);
    }
  }, [id]);

  const loadPublisher = async () => {
    try {
      const response = await api.get(`/users/${id}`);
      const user = response.data.user;
      setFormData({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        cellphone: user.cellphone || '',
        address: user.address || '',
        birthDate: user.birthDate ? new Date(user.birthDate).toISOString().split('T')[0] : '',
        baptismDate: user.baptismDate ? new Date(user.baptismDate).toISOString().split('T')[0] : '',
        gender: user.gender || 'male',
        class: user.class || 'other_sheep',
        privileges: user.privileges || ['publisher'],
        accessLevel: user.accessLevel || 'viewer',
        permissions: user.permissions || {
          canMakePublicTalk: false,
          canMakeMeetingParts: false,
          canManageTerritories: false,
          canManageDesignations: false,
          canManagePublishers: false,
          canViewReports: false
        },
        congregation: user.congregation || 'Vilar Guanabara',
        group: user.group || '',
        isActive: user.isActive !== undefined ? user.isActive : true,
        photo: user.photo
      });
    } catch (error) {
      console.error('Erro ao carregar publicador:', error);
      alert('Erro ao carregar dados do publicador');
    } finally {
      setLoadingData(false);
    }
  };

  // Verificar permissões de edição
  const canEdit = () => {
    if (isAdmin) return true; // Admin pode editar tudo
    if (isEditing && isEditingSelf) return true; // Usuário pode editar o próprio perfil
    return false;
  };

  // Verificar se pode editar campos sensíveis
  const canEditSensitiveFields = () => {
    return isAdmin; // Apenas admin pode editar nível de acesso, permissões, status
  };

  const privilegesOptions = [
    { value: 'publisher', label: 'Publicador' },
    { value: 'pioneer', label: 'Pioneiro' },
    { value: 'ministerial_servant', label: 'Servo Ministerial' },
    { value: 'elder', label: 'Ancião' },
  ];

  const accessLevelOptions = [
    { value: 'viewer', label: 'Visualizar', description: 'Apenas visualização' },
    { value: 'support', label: 'Apoio', description: 'Edita apenas o próprio perfil' },
    { value: 'admin', label: 'Administrador', description: 'Acesso total' },
  ];

  const classOptions = [
    { value: 'other_sheep', label: 'Outras Ovelhas' },
    { value: 'anointed', label: 'Ungidos' },
  ];

  const genderOptions = [
    { value: 'male', label: 'Masculino' },
    { value: 'female', label: 'Feminino' },
  ];

  const permissionOptions = [
    { key: 'canMakePublicTalk', label: 'Pode fazer discurso público', icon: <Globe className="w-4 h-4" /> },
    { key: 'canMakeMeetingParts', label: 'Pode fazer partes na Reunião', icon: <BookOpen className="w-4 h-4" /> },
    { key: 'canManageTerritories', label: 'Gerenciar Territórios', icon: <MapPin className="w-4 h-4" /> },
    { key: 'canManageDesignations', label: 'Gerenciar Designações', icon: <FileText className="w-4 h-4" /> },
    { key: 'canManagePublishers', label: 'Gerenciar Publicadores', icon: <Users className="w-4 h-4" /> },
    { key: 'canViewReports', label: 'Visualizar Relatórios', icon: <Award className="w-4 h-4" /> },
  ];

  const handleChange = (field: keyof Publisher, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handlePermissionChange = (key: string, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [key]: value
      }
    }));
  };

  const handlePrivilegeToggle = (privilege: string) => {
    setFormData(prev => {
      const current = prev.privileges || [];
      const updated = current.includes(privilege)
        ? current.filter(p => p !== privilege)
        : [...current, privilege];
      
      if (updated.length === 0) {
        updated.push('publisher');
      }
      
      return { ...prev, privileges: updated };
    });
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) newErrors.name = 'Nome é obrigatório';
    if (!formData.email.trim()) newErrors.email = 'E-mail é obrigatório';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    // Verificar permissão de edição
    if (!canEdit()) {
      alert('❌ Você não tem permissão para editar este perfil.');
      return;
    }
    
    setLoading(true);
    try {
      const data: any = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        cellphone: formData.cellphone,
        address: formData.address,
        congregation: formData.congregation,
        group: formData.group,
      };

      // Apenas admin pode editar campos sensíveis
      if (canEditSensitiveFields()) {
        data.accessLevel = formData.accessLevel;
        data.permissions = formData.permissions;
        data.isActive = formData.isActive;
        data.privileges = formData.privileges;
        data.gender = formData.gender;
        data.class = formData.class;
        data.birthDate = formData.birthDate ? new Date(formData.birthDate) : null;
        data.baptismDate = formData.baptismDate ? new Date(formData.baptismDate) : null;
      }

      if (id) {
        await api.put(`/users/${id}`, data);
        alert('✅ Perfil atualizado com sucesso!');
      } else {
        // Para novo usuário, precisa de senha (apenas admin)
        if (!isAdmin) {
          alert('❌ Apenas administradores podem criar novos usuários.');
          setLoading(false);
          return;
        }
        const password = prompt('Digite uma senha para o novo usuário (mínimo 6 caracteres):');
        if (!password || password.length < 6) {
          alert('❌ Senha inválida. Mínimo 6 caracteres.');
          setLoading(false);
          return;
        }
        data.password = password;
        data.accessLevel = formData.accessLevel || 'viewer';
        await api.post('/users', data);
        alert('✅ Publicador cadastrado com sucesso!');
      }
      navigate('/congregation');
    } catch (error: any) {
      alert(error.response?.data?.message || '❌ Erro ao salvar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Verificar permissão de acesso à página
  if (!canEdit() && isEditing) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Shield className="w-16 h-16 text-red-500" />
        <h2 className="text-xl font-bold text-[rgb(var(--foreground))]">Acesso Negado</h2>
        <p className="text-[rgb(var(--foreground))] opacity-70">Você não tem permissão para editar este perfil.</p>
        <button
          onClick={() => navigate('/congregation')}
          className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all"
        >
          Voltar
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/congregation')}
          className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-all"
        >
          <ArrowLeft className="w-5 h-5 text-[rgb(var(--foreground))] opacity-70" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-[rgb(var(--foreground))]">
            {id ? (isEditingSelf ? 'Meu Perfil' : 'Editar Publicador') : 'Novo Publicador'}
          </h1>
          <p className="text-sm text-[rgb(var(--foreground))] opacity-70">
            {isEditingSelf ? 'Atualize suas informações pessoais' : 'Informações pessoais, permissões e segurança'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Aviso de permissão */}
        {!isAdmin && isEditingSelf && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
            <p className="text-sm text-blue-700 dark:text-blue-300 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Você está editando seu próprio perfil. Apenas suas informações pessoais e senha podem ser alteradas.
            </p>
          </div>
        )}

        {/* Nível de Acesso - Apenas Admin */}
        {canEditSensitiveFields() && (
          <div className="bg-[rgb(var(--card))] rounded-2xl shadow-sm border border-[rgb(var(--border))] p-6">
            <h3 className="text-sm font-semibold text-[rgb(var(--foreground))] flex items-center gap-2 mb-4">
              <Shield className="w-4 h-4 text-blue-600" />
              Nível de Acesso
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {accessLevelOptions.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleChange('accessLevel', opt.value)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    formData.accessLevel === opt.value
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-[rgb(var(--border))] hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      formData.accessLevel === opt.value ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                    }`} />
                    <span className="font-medium text-[rgb(var(--foreground))]">{opt.label}</span>
                  </div>
                  <p className="text-xs text-[rgb(var(--foreground))] opacity-60 mt-1">{opt.description}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Permissões - Apenas Admin */}
        {canEditSensitiveFields() && formData.accessLevel === 'support' && (
          <div className="bg-[rgb(var(--card))] rounded-2xl shadow-sm border border-[rgb(var(--border))] p-6">
            <h3 className="text-sm font-semibold text-[rgb(var(--foreground))] flex items-center gap-2 mb-4">
              <Award className="w-4 h-4 text-blue-600" />
              Permissões Específicas
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {permissionOptions.map(opt => (
                <label
                  key={opt.key}
                  className="flex items-center gap-3 p-3 bg-[rgb(var(--background))] rounded-xl border border-[rgb(var(--border))] cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all"
                >
                  <input
                    type="checkbox"
                    checked={formData.permissions[opt.key as keyof typeof formData.permissions] || false}
                    onChange={(e) => handlePermissionChange(opt.key, e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    disabled={!canEditSensitiveFields()}
                  />
                  <span className="flex items-center gap-2 text-sm text-[rgb(var(--foreground))]">
                    {opt.icon}
                    {opt.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Privilégios - Apenas Admin */}
        {canEditSensitiveFields() && (
          <div className="bg-[rgb(var(--card))] rounded-2xl shadow-sm border border-[rgb(var(--border))] p-6">
            <h3 className="text-sm font-semibold text-[rgb(var(--foreground))] flex items-center gap-2 mb-4">
              <Briefcase className="w-4 h-4 text-blue-600" />
              Privilégios
            </h3>
            <div className="flex flex-wrap gap-2">
              {privilegesOptions.map(privilege => {
                const isSelected = formData.privileges?.includes(privilege.value) || false;
                const isDisabled = formData.gender === 'female' && 
                  (privilege.value === 'elder' || privilege.value === 'ministerial_servant');
                
                return (
                  <button
                    key={privilege.value}
                    type="button"
                    onClick={() => !isDisabled && handlePrivilegeToggle(privilege.value)}
                    disabled={isDisabled || !canEditSensitiveFields()}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white'
                        : isDisabled
                        ? 'bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                        : 'bg-gray-100 dark:bg-slate-700 text-[rgb(var(--foreground))] opacity-70 hover:opacity-100'
                    }`}
                  >
                    {privilege.label}
                    {isDisabled && ' (Não permitido)'}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-[rgb(var(--foreground))] opacity-50 mt-2">
              Observação: Selecione todos os privilégios aplicáveis. Mulheres não podem ser designadas como Anciãos ou Servos Ministeriais.
            </p>
          </div>
        )}

        {/* Permissões de Discurso - Apenas Admin */}
        {canEditSensitiveFields() && (formData.privileges?.includes('elder') || formData.privileges?.includes('ministerial_servant')) && (
          <div className="bg-[rgb(var(--card))] rounded-2xl shadow-sm border border-[rgb(var(--border))] p-6">
            <h3 className="text-sm font-semibold text-[rgb(var(--foreground))] flex items-center gap-2 mb-4">
              <Mic className="w-4 h-4 text-blue-600" />
              Permissões de Discurso
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="flex items-center gap-3 p-3 bg-[rgb(var(--background))] rounded-xl border border-[rgb(var(--border))] cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all">
                <input
                  type="checkbox"
                  checked={formData.permissions.canMakePublicTalk || false}
                  onChange={(e) => handlePermissionChange('canMakePublicTalk', e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  disabled={!canEditSensitiveFields()}
                />
                <span className="flex items-center gap-2 text-sm text-[rgb(var(--foreground))]">
                  <Globe className="w-4 h-4" />
                  Pode fazer discurso público
                </span>
              </label>
              <label className="flex items-center gap-3 p-3 bg-[rgb(var(--background))] rounded-xl border border-[rgb(var(--border))] cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all">
                <input
                  type="checkbox"
                  checked={formData.permissions.canMakeMeetingParts || false}
                  onChange={(e) => handlePermissionChange('canMakeMeetingParts', e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  disabled={!canEditSensitiveFields()}
                />
                <span className="flex items-center gap-2 text-sm text-[rgb(var(--foreground))]">
                  <BookOpen className="w-4 h-4" />
                  Pode fazer partes na Reunião Vida e Ministério
                </span>
              </label>
            </div>
          </div>
        )}

        {/* Dados Pessoais - Todos podem editar (seu próprio perfil) */}
        <div className="bg-[rgb(var(--card))] rounded-2xl shadow-sm border border-[rgb(var(--border))] p-6">
          <h3 className="text-sm font-semibold text-[rgb(var(--foreground))] flex items-center gap-2 mb-4">
            <User className="w-4 h-4 text-blue-600" />
            Dados Pessoais
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-1">
                Nome Completo <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className={`w-full px-4 py-2.5 bg-[rgb(var(--background))] border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-[rgb(var(--foreground))] ${
                  errors.name ? 'border-red-500' : 'border-[rgb(var(--border))]'
                }`}
                placeholder="Nome completo"
                disabled={!canEdit()}
              />
              {errors.name && (
                <p className="text-xs text-red-500 mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-1">
                E-mail <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className={`w-full px-4 py-2.5 bg-[rgb(var(--background))] border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-[rgb(var(--foreground))] ${
                  errors.email ? 'border-red-500' : 'border-[rgb(var(--border))]'
                }`}
                placeholder="email@congregacao.com"
                disabled={!canEdit()}
              />
              {errors.email && (
                <p className="text-xs text-red-500 mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-1">
                Telefone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full px-4 py-2.5 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-[rgb(var(--foreground))]"
                placeholder="(00) 0000-0000"
                disabled={!canEdit()}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-1">
                Celular
              </label>
              <input
                type="tel"
                value={formData.cellphone}
                onChange={(e) => handleChange('cellphone', e.target.value)}
                className="w-full px-4 py-2.5 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-[rgb(var(--foreground))]"
                placeholder="(21) 99999-9999"
                disabled={!canEdit()}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-1">
                Endereço
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                className="w-full px-4 py-2.5 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-[rgb(var(--foreground))]"
                placeholder="Rua, número, bairro"
                disabled={!canEdit()}
              />
            </div>
          </div>
        </div>

        {/* Campos Administrativos - Apenas Admin */}
        {canEditSensitiveFields() && (
          <div className="bg-[rgb(var(--card))] rounded-2xl shadow-sm border border-[rgb(var(--border))] p-6">
            <h3 className="text-sm font-semibold text-[rgb(var(--foreground))] flex items-center gap-2 mb-4">
              <Users className="w-4 h-4 text-blue-600" />
              Informações Administrativas
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-1">
                  Data de Nascimento
                </label>
                <input
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => handleChange('birthDate', e.target.value)}
                  className="w-full px-4 py-2.5 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-[rgb(var(--foreground))]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-1">
                  Data de Batismo
                </label>
                <input
                  type="date"
                  value={formData.baptismDate}
                  onChange={(e) => handleChange('baptismDate', e.target.value)}
                  className="w-full px-4 py-2.5 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-[rgb(var(--foreground))]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-1">
                  Classe
                </label>
                <select
                  value={formData.class}
                  onChange={(e) => handleChange('class', e.target.value as 'other_sheep' | 'anointed')}
                  className="w-full px-4 py-2.5 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-[rgb(var(--foreground))]"
                >
                  {classOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-1">
                  Sexo
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => handleChange('gender', e.target.value as 'male' | 'female')}
                  className="w-full px-4 py-2.5 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-[rgb(var(--foreground))]"
                >
                  {genderOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-1">
                  Grupo
                </label>
                <select
                  value={formData.group}
                  onChange={(e) => handleChange('group', e.target.value)}
                  className="w-full px-4 py-2.5 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-[rgb(var(--foreground))]"
                >
                  <option value="">Selecione um grupo</option>
                  <option value="Cosmos 1">Cosmos 1</option>
                  <option value="Cosmos 2">Cosmos 2</option>
                  <option value="Cosmos 3">Cosmos 3</option>
                  <option value="Cosmos 4">Cosmos 4</option>
                  <option value="Icurana 1">Icurana 1</option>
                  <option value="Icurana 2">Icurana 2</option>
                  <option value="Vilar Guanabara 1">Vilar Guanabara 1</option>
                  <option value="Vilar Guanabara 2">Vilar Guanabara 2</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-1">
                  Status
                </label>
                <select
                  value={formData.isActive ? 'active' : 'inactive'}
                  onChange={(e) => handleChange('isActive', e.target.value === 'active')}
                  className="w-full px-4 py-2.5 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-[rgb(var(--foreground))]"
                >
                  <option value="active">Ativo</option>
                  <option value="inactive">Inativo</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Segurança - Todos podem editar a própria senha */}
        <div className="bg-[rgb(var(--card))] rounded-2xl shadow-sm border border-[rgb(var(--border))] p-6">
          <h3 className="text-sm font-semibold text-[rgb(var(--foreground))] flex items-center gap-2 mb-4">
            <Lock className="w-4 h-4 text-blue-600" />
            Segurança
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-1">
                {id ? 'Nova Senha' : 'Senha'}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="w-full px-4 py-2.5 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-[rgb(var(--foreground))] pr-10"
                  placeholder={id ? 'Deixe em branco para manter' : 'Mínimo 6 caracteres'}
                  disabled={!canEdit()}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[rgb(var(--foreground))] opacity-50 hover:opacity-100 transition-all"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-1">
                Confirmar Senha
              </label>
              <input
                type="password"
                className="w-full px-4 py-2.5 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-[rgb(var(--foreground))]"
                placeholder="Digite a senha novamente"
                disabled={!canEdit()}
              />
            </div>
          </div>
        </div>

        {/* Botões */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <button
            type="submit"
            disabled={loading || !canEdit()}
            className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4" />
                {id ? 'Atualizar' : 'Cadastrar'}
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => navigate('/congregation')}
            className="px-6 py-3 border border-[rgb(var(--border))] text-[rgb(var(--foreground))] rounded-xl font-medium hover:bg-[rgb(var(--background))] transition-all flex items-center justify-center gap-2"
          >
            <X className="w-4 h-4" />
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default PublisherForm;