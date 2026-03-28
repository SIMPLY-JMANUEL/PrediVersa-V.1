import { useState } from 'react';
import { apiFetch } from '../utils/api';

/**
 * Hook personalizado para manejar la creación, edición y eliminación de usuarios
 */
export const useUserManagement = (fetchUsers) => {
  const [editingUser, setEditingUser] = useState(null);
  const [saveMessage, setSaveMessage] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [userForm, setUserForm] = useState({
    nombres: '', apellidos: '', id: '', edad: '', fechaNacimiento: '', lugarNacimiento: '',
    telefono: '', direccion: '', nombreMadre: '', nombrePadre: '', email: '', grado: '', rol: 'Estudiante',
    repName: '', repDocType: 'CC', repDocId: '', repRelationship: '', repPhone: '', repEmail: '', repAddress: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserForm(prev => ({ ...prev, [name]: value }));
  };

  const handleClear = () => {
    setEditingUser(null);
    setSaveMessage('');
    setUserForm({ 
      nombres: '', apellidos: '', id: '', edad: '', fechaNacimiento: '', lugarNacimiento: '', 
      telefono: '', direccion: '', nombreMadre: '', nombrePadre: '', email: '', grado: '', rol: 'Estudiante',
      repName: '', repDocType: 'CC', repDocId: '', repRelationship: '', repPhone: '', repEmail: '', repAddress: ''
    });
    setFormErrors({});
  };

  const handleEdit = (u) => {
    setEditingUser(u);
    const parts = u.name?.split(' ') || ['', ''];
    setUserForm({
      nombres: parts[0], 
      apellidos: parts.slice(1).join(' '), 
      id: u.documentId, 
      edad: u.edad || '',
      fechaNacimiento: u.birthDate?.split('T')[0] || '', 
      lugarNacimiento: u.lugarNacimiento || '',
      telefono: u.phone || '', 
      direccion: u.address || '', 
      nombreMadre: u.nombreMadre || '',
      nombrePadre: u.nombrePadre || '', 
      email: u.email, 
      grado: u.grado || '', 
      rol: u.role,
      repName: u.repName || '', 
      repDocType: u.repDocType || 'CC', 
      repDocId: u.repDocId || '',
      repRelationship: u.repRelationship || '', 
      repPhone: u.repPhone || '',
      repEmail: u.repEmail || '', 
      repAddress: u.repAddress || ''
    });
  };

  const handleSave = async () => {
    try {
      if (!userForm.nombres || !userForm.id) {
        setSaveMessage('❌ Nombres y N° Documento son obligatorios');
        return;
      }

      const randomPass = Math.random().toString(36).slice(-8) + 'P!';
      setSaveMessage('⏳ Guardando identidad...');
      
      const payload = {
        documentId: userForm.id, 
        email: userForm.email || `${userForm.nombres.split(' ')[0].toLowerCase()}.${userForm.id.slice(-4)}@prediversa.edu.co`, 
        name: `${userForm.nombres} ${userForm.apellidos}`,
        role: userForm.rol, 
        password: randomPass,
        ...userForm 
      };

      const response = await apiFetch('/api/users', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      if (response.success) {
        setSaveMessage(`✅ Usuario creado. Clave: ${randomPass}`);
        fetchUsers();
        handleClear();
      } else {
        setSaveMessage('❌ ' + (response.message || 'Error al guardar'));
      }
    } catch (error) { 
      setSaveMessage('❌ Error de comunicación con el servidor');
    }
    setTimeout(() => setSaveMessage(''), 6000);
  };

  const handleUpdate = async () => {
    if (!editingUser) return;
    try {
      setSaveMessage('⏳ Actualizando...');
      const response = await apiFetch(`/api/users/${editingUser.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          documentId: userForm.id, email: userForm.email, name: `${userForm.nombres} ${userForm.apellidos}`,
          role: userForm.rol, phone: userForm.telefono, address: userForm.direccion,
          birthDate: userForm.fechaNacimiento || null, edad: userForm.edad, grado: userForm.grado,
          repName: userForm.repName, repDocType: userForm.repDocType, repDocId: userForm.repDocId,
          repRelationship: userForm.repRelationship, repPhone: userForm.repPhone,
          repEmail: userForm.repEmail, repAddress: userForm.repAddress
        })
      });

      if (response.success) {
        setSaveMessage('✅ Actualizado con éxito');
        setEditingUser(null);
        fetchUsers();
        handleClear();
      }
    } catch (error) { 
      setSaveMessage('❌ Error de conexión');
    }
    setTimeout(() => setSaveMessage(''), 4000);
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Seguro que desea eliminar esta identidad de PrediVersa?')) return;
    try {
      const response = await apiFetch(`/api/users/${id}`, { method: 'DELETE' });
      if (response.success) fetchUsers();
    } catch (error) { console.error(error); }
  };

  return {
    userForm, editingUser, saveMessage, formErrors,
    handleInputChange, handleSave, handleUpdate, handleDelete, handleEdit, handleClear
  };
};
