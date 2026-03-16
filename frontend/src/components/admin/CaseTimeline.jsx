import React, { useState, useEffect } from 'react';
import { useCaseTracking } from '../../hooks/useCaseTracking';
import { Clock, CheckCircle, AlertTriangle, Send } from 'lucide-react';

const CaseTimeline = ({ alertId, token }) => {
  const [actions, setActions] = useState([]);
  const { fetchActions, loadingActions } = useCaseTracking(token);

  useEffect(() => {
    if (alertId) loadActions();
  }, [alertId]);

  const loadActions = async () => {
    const data = await fetchActions(alertId);
    setActions(data);
  };

  if (loadingActions && actions.length === 0) return <div className="p-4 text-center">Cargando línea de tiempo...</div>;

  return (
    <div className="case-timeline p-4">
      <h4 className="text-lg font-bold mb-4 flex items-center gap-2" style={{color: '#2A4E5F'}}>
        <Clock size={20} /> Historial de Gestiones
      </h4>
      
      {actions.length === 0 ? (
        <div className="text-gray-400 italic text-center py-8">No hay acciones registradas para este caso aún.</div>
      ) : (
        <div className="relative">
          {/* Línea vertical central */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
          
          <div className="space-y-6">
            {actions.map((action, index) => (
              <div key={action.id} className="relative pl-10">
                {/* Icono del nodo */}
                <div className={`absolute left-0 w-8 h-8 rounded-full border-2 bg-white flex items-center justify-center z-10 ${
                  action.category === 'Remision' ? 'border-blue-400 text-blue-500' : 
                  action.actionType.includes('Cierre') ? 'border-green-400 text-green-500' : 'border-amber-400 text-amber-500'
                }`}>
                  {action.category === 'Remision' ? <Send size={14} /> : 
                   action.actionType.includes('Cierre') ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}
                </div>
                
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-bold text-sm" style={{color: '#3A6F85'}}>{action.actionType}</span>
                    <span className="text-xs text-gray-500">{new Date(action.actionDate).toLocaleString()}</span>
                  </div>
                  <div className="text-sm text-gray-700 mb-2">{action.description}</div>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>👤 {action.collaboratorName || 'Sistema'}</span>
                    {action.area && <span className="px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full font-semibold">{action.area}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CaseTimeline;
