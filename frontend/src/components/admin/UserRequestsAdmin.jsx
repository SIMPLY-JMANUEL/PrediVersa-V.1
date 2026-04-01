import { useState, useEffect } from 'react'
import { apiFetch } from '../../utils/api'
import { 
  UserCheck, 
  UserX, 
  Clock, 
  Mail, 
  Phone, 
  Calendar, 
  CheckCircle, 
  XCircle,
  Loader2,
  AlertCircle
} from 'lucide-react'

function UserRequestsAdmin() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionLoading, setActionLoading] = useState(null)

  const fetchRequests = async () => {
    setLoading(true)
    try {
      const data = await apiFetch('/api/auth/requests')
      if (data.success) {
        setRequests(data.data)
      } else {
        setError('No se pudieron cargar las solicitudes.')
      }
    } catch (err) {
      setError('Error al conectar con la API.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [])

  const handleAction = async (id, action) => {
    setActionLoading(id)
    try {
      const data = await apiFetch(`/api/auth/requests/${id}/${action}`, {
        method: 'POST'
      })
      if (data.success) {
        setRequests(requests.filter(r => r.id !== id))
      } else {
        alert(data.message || 'Error al procesar la acción.')
      }
    } catch (err) {
      alert('Error de conexión.')
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <Loader2 className="animate-spin text-primary mb-4" size={40} />
        <p className="text-slate-500 font-medium">Cargando solicitudes pendientes...</p>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <div className="mgmt-header-row border-b border-gray-100 mb-8 pb-6">
        <div>
          <h3 className="text-xl font-black text-slate-800">Solicitudes de Acceso</h3>
          <p className="text-slate-500 text-sm mt-1">Aprobar o rechazar nuevos registros institucionales.</p>
        </div>
        <div className="flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-lg border border-amber-100">
          <Clock size={16} className="text-amber-600" />
          <span className="text-amber-700 font-bold text-sm">{requests.length} Pendientes</span>
        </div>
      </div>

      {error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-3">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
          <CheckCircle className="mx-auto text-slate-300 mb-4" size={48} />
          <h4 className="text-slate-800 font-bold text-lg">¡Todo al día!</h4>
          <p className="text-slate-500">No hay nuevas solicitudes de acceso para revisar.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-wider font-bold">
                <th className="py-4 px-6 border-b">Usuario / Contacto</th>
                <th className="py-4 px-6 border-b">Documento / Rol</th>
                <th className="py-4 px-6 border-b">Fecha Solicitud</th>
                <th className="py-4 px-6 border-b text-right">Acciones de Control</th>
              </tr>
            </thead>
            <tbody>
              {requests.map(request => (
                <tr key={request.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="py-5 px-6 border-b">
                    <div className="font-bold text-slate-800 text-base">{request.name}</div>
                    <div className="flex flex-col gap-1 mt-1">
                      <div className="flex items-center text-xs text-slate-500 gap-1.5">
                        <Mail size={12} className="text-primary" /> {request.email}
                      </div>
                      {request.phone && (
                        <div className="flex items-center text-xs text-slate-500 gap-1.5">
                          <Phone size={12} className="text-primary" /> {request.phone}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-5 px-6 border-b text-sm">
                    <div className="text-slate-700 font-medium">{request.documentId || 'Sin Documento'}</div>
                    <div className="inline-block mt-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-black uppercase tracking-wider">
                      {request.role}
                    </div>
                  </td>
                  <td className="py-5 px-6 border-b text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={13} />
                      {new Date(request.createdAt).toLocaleDateString('es-CO', { 
                        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                      })}
                    </div>
                  </td>
                  <td className="py-5 px-6 border-b text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleAction(request.id, 'approve')}
                        disabled={actionLoading === request.id}
                        className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-600 hover:text-white transition-all shadow-sm flex items-center gap-2 text-xs font-bold"
                        title="Aprobar Usuario"
                      >
                        {actionLoading === request.id ? <Loader2 className="animate-spin" size={16} /> : <UserCheck size={18} />}
                        Aprobar
                      </button>
                      <button 
                        onClick={() => handleAction(request.id, 'reject')}
                        disabled={actionLoading === request.id}
                        className="p-2.5 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-600 hover:text-white transition-all shadow-sm flex items-center gap-2 text-xs font-bold"
                        title="Rechazar Solicitud"
                      >
                        {actionLoading === request.id ? <Loader2 className="animate-spin" size={16} /> : <UserX size={18} />}
                        Rechazar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default UserRequestsAdmin
