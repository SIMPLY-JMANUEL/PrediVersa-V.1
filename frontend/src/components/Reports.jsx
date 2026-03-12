import { useState, useEffect } from 'react'
import { Doughnut, Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
} from 'chart.js'
import './Reports.css'

// Registrar componentes de Chart.js
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
)

function Reports({ onClose }) {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const baseUrl = 'http://localhost:5000'

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${baseUrl}/api/auth/stats`)
      const data = await response.json()
      
      if (data.success) {
        setStats(data.stats)
      } else {
        setError('Error al cargar estadísticas')
      }
    } catch (err) {
      setError('Error de conexión con el servidor')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Configuración del gráfico de roles
  const roleChartData = stats ? {
    labels: Object.keys(stats.usersByRole),
    datasets: [
      {
        data: Object.values(stats.usersByRole),
        backgroundColor: [
          '#2196f3', // Estudiante - Azul
          '#e91e63', // Administrador - Rosa
          '#4caf50', // Colaborador - Verde
        ],
        borderColor: [
          '#1976d2',
          '#c2185b',
          '#388e3c',
        ],
        borderWidth: 2,
      },
    ],
  } : null

  // Configuración del gráfico de estado
  const statusChartData = stats ? {
    labels: Object.keys(stats.usersByStatus),
    datasets: [
      {
        data: Object.values(stats.usersByStatus),
        backgroundColor: [
          '#4caf50', // Activo - Verde
          '#9e9e9e', // Inactivo - Gris
        ],
        borderColor: [
          '#388e3c',
          '#616161',
        ],
        borderWidth: 2,
      },
    ],
  } : null

  // Configuración del gráfico de usuarios por mes
  const monthChartData = stats ? {
    labels: Object.keys(stats.usersByMonth).sort(),
    datasets: [
      {
        label: 'Usuarios registrados',
        data: Object.keys(stats.usersByMonth).sort().map(month => stats.usersByMonth[month]),
        backgroundColor: '#2c5f6f',
        borderColor: '#1a3a44',
        borderWidth: 1,
      },
    ],
  } : null

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 15,
          font: {
            size: 12,
          },
        },
      },
    },
  }

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Usuarios registrados por mes',
        font: {
          size: 14,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  }

  return (
    <div className="reports-overlay" onClick={onClose}>
      <div className="reports-modal" onClick={(e) => e.stopPropagation()}>
        <div className="reports-header">
          <h2>📊 Reportes y Estadísticas</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading">Cargando estadísticas...</div>
        ) : stats ? (
          <div className="reports-content">
            {/* Estadísticas Generales */}
            <div className="stats-grid">
              <div className="stat-card total">
                <div className="stat-icon">👥</div>
                <div className="stat-info">
                  <h3>Total Usuarios</h3>
                  <p className="stat-number">{stats.totalUsers}</p>
                </div>
              </div>
              <div className="stat-card active">
                <div className="stat-icon">✅</div>
                <div className="stat-info">
                  <h3>Usuarios Activos</h3>
                  <p className="stat-number">{stats.activeUsers}</p>
                </div>
              </div>
              <div className="stat-card inactive">
                <div className="stat-icon">⏸️</div>
                <div className="stat-info">
                  <h3>Usuarios Inactivos</h3>
                  <p className="stat-number">{stats.inactiveUsers}</p>
                </div>
              </div>
            </div>

            {/* Gráficos */}
            <div className="charts-grid">
              <div className="chart-container">
                <h3>Usuarios por Rol</h3>
                <div className="chart-wrapper">
                  {roleChartData && <Doughnut data={roleChartData} options={chartOptions} />}
                </div>
              </div>
              <div className="chart-container">
                <h3>Usuarios por Estado</h3>
                <div className="chart-wrapper">
                  {statusChartData && <Doughnut data={statusChartData} options={chartOptions} />}
                </div>
              </div>
            </div>

            {/* Gráfico de barras */}
            <div className="chart-container full-width">
              <h3>Registro de Usuarios por Mes</h3>
              <div className="chart-wrapper bar-chart">
                {monthChartData && <Bar data={monthChartData} options={barChartOptions} />}
              </div>
            </div>

            {/* Tabla de usuarios recientes */}
            <div className="recent-users-section">
              <h3>👤 Usuarios Recientes</h3>
              <div className="recent-users-table-container">
                <table className="recent-users-table">
                  <thead>
                    <tr>
                      <th>Documento</th>
                      <th>Nombre</th>
                      <th>Email</th>
                      <th>Rol</th>
                      <th>Estado</th>
                      <th>Fecha de Registro</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentUsers.map(user => (
                      <tr key={user.id}>
                        <td>{user.documentId || 'N/A'}</td>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>
                          <span className={`role-badge role-${user.role.toLowerCase()}`}>
                            {user.role}
                          </span>
                        </td>
                        <td>
                          <span className={`status-badge status-${user.status?.toLowerCase() || 'activo'}`}>
                            {user.status || 'Activo'}
                          </span>
                        </td>
                        <td>{formatDate(user.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Resumen por rol */}
            <div className="role-summary">
              <h3>📋 Resumen por Rol</h3>
              <div className="role-cards">
                {Object.entries(stats.usersByRole).map(([role, count]) => (
                  <div key={role} className={`role-summary-card role-${role.toLowerCase()}`}>
                    <span className="role-name">{role}</span>
                    <span className="role-count">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="no-data">No hay datos disponibles</div>
        )}
      </div>
    </div>
  )
}

export default Reports