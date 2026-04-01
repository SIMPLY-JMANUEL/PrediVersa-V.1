/**
 * Utilidad para exportar datos de usuarios a formato CSV
 */
export const exportToCSV = (users, filename = 'usuarios_prediversa.csv') => {
  if (!users || users.length === 0) return;
  
  const headers = ['Nombre', 'Email', 'Rol', 'Estado', 'Teléfono', 'Dirección', 'Grado', 'Fecha Creación'];
  
  const csvContent = [
    headers.join(','),
    ...users.map(u => [
      `"${u.name || ''}"`, 
      `"${u.email || ''}"`, 
      `"${u.role || ''}"`, 
      `"${u.status || ''}"`,
      `"${u.phone || ''}"`, 
      `"${u.address || ''}"`, 
      `"${u.grado || ''}"`,
      `"${u.createdAt ? new Date(u.createdAt).toLocaleDateString() : ''}"`
    ].join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
