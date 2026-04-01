import { useState, useEffect, useMemo } from 'react';
import { BASE_URL } from '../utils/api';

export const useUsers = (token) => {
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  const [realStats, setRealStats] = useState(null);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const respUsers = await fetch(`${BASE_URL}/api/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const dataUsers = await respUsers.json();
      if (dataUsers.success) setUsers(dataUsers.users);

      const respStats = await fetch(`${BASE_URL}/api/users/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const dataStats = await respStats.json();
      if (dataStats.success) setRealStats(dataStats.stats);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const filteredUsers = useMemo(() => {
    let result = [...users];
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      result = result.filter(u => 
        (u.name?.toLowerCase().includes(term)) ||
        (u.email?.toLowerCase().includes(term)) ||
        (u.documentId?.toLowerCase().includes(term)) ||
        (u.role?.toLowerCase().includes(term))
      );
    }
    result.sort((a, b) => {
      let aVal = a[sortField] || '';
      let bVal = b[sortField] || '';
      if (sortField === 'createdAt') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      }
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    return result;
  }, [users, searchTerm, sortField, sortDirection]);

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * usersPerPage;
    return filteredUsers.slice(startIndex, startIndex + usersPerPage);
  }, [filteredUsers, currentPage]);

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const stats = useMemo(() => {
    if (realStats) return realStats;
    
    const total = users.length;
    const activos = users.filter(u => u.status === 'Activo').length;
    const inactivos = total - activos;
    const porRol = {
      Estudiante: users.filter(u => u.role === 'Estudiante').length,
      Colaboradores: users.filter(u => u.role === 'Colaboradores').length,
      Psicología: users.filter(u => u.role === 'Psicología').length,
      Administrador: users.filter(u => u.role === 'Administrador').length
    };
    return { 
      totalUsers: total, 
      activeUsers: activos, 
      inactiveUsers: inactivos, 
      usersByRole: porRol,
      dbConnected: true 
    };
  }, [users, realStats]);

  return {
    users,
    loadingUsers,
    searchTerm,
    setSearchTerm,
    sortField,
    setSortField,
    sortDirection,
    setSortDirection,
    currentPage,
    setCurrentPage,
    paginatedUsers,
    totalPages,
    stats,
    fetchUsers,
    filteredUsers
  };
};
