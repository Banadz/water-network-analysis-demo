import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, FileDown, FileSpreadsheet, Image } from 'lucide-react';
import { 
  LineChart, 
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend 
} from 'recharts';
import { useChartExport } from '../../hooks/chart/useChartExport';
import PropTypes from 'prop-types';

const RightSidebar = ({ 
  isOpen, 
  setIsOpen, 
  graphs, 
  graphElements,
  graphsData
}) => {
  const [viewModes, setViewModes] = useState({});
  const [exporting, setExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  
  const { 
    exportSingleChart, 
    exportChartsAsZip, 
    exportChartDataToExcel, 
    exportAllChartsToExcel 
  } = useChartExport();

  const toggleViewMode = (graphId) => {
    setViewModes(prev => ({
      ...prev,
      [graphId]: prev[graphId] === 'monthly' ? 'daily' : 'monthly'
    }));
  };

  const getViewMode = (graphId) => viewModes[graphId] || 'monthly';

  const getGraphType = (graph) => {
    const data = graphsData?.[graph.id];
    if (!data) return null;

    const hasProduction = data.production && data.production.length > 0;
    const hasConsumption = data.consumption && data.consumption.length > 0;

    if (hasProduction && hasConsumption) return 'comparaison';
    if (hasProduction) return 'production';
    if (hasConsumption) return 'consumption';
    return null;
  };

  const prepareChartData = (graph) => {
    const data = graphsData?.[graph.id];
    if (!data) return { chartData: [], uniqueZones: [] };

    const viewMode = getViewMode(graph.id);
    const graphType = getGraphType(graph);

    const allData = [];
    if (data.production) {
      allData.push(...data.production.map(item => ({ ...item, type: 'production' })));
    }
    if (data.consumption) {
      allData.push(...data.consumption.map(item => ({ ...item, type: 'consumption' })));
    }

    if (allData.length === 0) return { chartData: [], uniqueZones: [] };

    const zones = new Set();
    allData.forEach(item => {
      if (item && item.zoneId) {
        const zoneKey = graphType === 'comparaison' 
          ? `${item.zoneId}_${item.type}`
          : item.zoneId;
        zones.add(zoneKey);
      }
    });

    let chartData = [];

    if (viewMode === 'daily') {
      const dailyData = {};
      
      allData.forEach(item => {
        if (!item || !item.date || item.quantite == null || !item.zoneId) return;
        
        const dataKey = graphType === 'comparaison' 
          ? `${item.zoneId}_${item.type}` 
          : item.zoneId;
        
        if (!dailyData[item.date]) {
          dailyData[item.date] = { date: item.date };
        }

        if (dailyData[item.date][dataKey]) {
          dailyData[item.date][dataKey] += item.quantite;
        } else {
          dailyData[item.date][dataKey] = item.quantite;
        }
      });

      chartData = Object.values(dailyData).sort((a, b) => a.date.localeCompare(b.date));
    } else {
      const monthlyData = {};
      
      allData.forEach(item => {
        if (!item || !item.date || item.quantite == null || !item.zoneId) return;
        
        let date;
        try {
          date = new Date(item.date);
          if (isNaN(date.getTime())) return;
        } catch (e) {
          return;
        }
        
        const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        const dataKey = graphType === 'comparaison' 
          ? `${item.zoneId}_${item.type}` 
          : item.zoneId;
        
        if (!monthlyData[monthYear]) {
          monthlyData[monthYear] = {
            month: monthYear,
            counts: {},
            totals: {}
          };
        }
        
        if (!monthlyData[monthYear].totals[dataKey]) {
          monthlyData[monthYear].totals[dataKey] = 0;
          monthlyData[monthYear].counts[dataKey] = 0;
        }
        
        monthlyData[monthYear].totals[dataKey] += item.quantite;
        monthlyData[monthYear].counts[dataKey] += 1;
      });

      chartData = Object.values(monthlyData).map(month => {
        const dataPoint = { month: month.month };
        
        Object.keys(month.totals).forEach(dataKey => {
          const count = month.counts[dataKey];
          dataPoint[dataKey] = count > 0 ? month.totals[dataKey] : 0;
        });
        
        return dataPoint;
      }).sort((a, b) => a.month.localeCompare(b.month));
    }

    return { chartData, uniqueZones: Array.from(zones) };
  };

  const getColors = (type) => {
    const typeColors = {
      production: ["#82ca9d", "#8884d8", "#ff7300", "#d62728", "#2ca02c"],
      consumption: ["#ff6b6b", "#4ecdc4", "#45b7d1", "#f9c74f", "#f9844a"],
      comparaison: ["#82ca9d", "#ff6b6b", "#8884d8", "#4ecdc4", "#ff7300", "#45b7d1"]
    };
    return typeColors[type] || typeColors.consumption;
  };

  // PNG format export function
  const handleExportPNG = async () => {
    setExporting(true);
    setExportSuccess(null);
    setShowExportMenu(false);
    
    try {
      if (graphsWithData.length === 1) {
        const graph = graphsWithData[0];
        const fileName = `${graph.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}`;
        await exportSingleChart(`chart-${graph.id}`, fileName);
        setExportSuccess(`Graphique "${graph.name}" exporté en PNG`);
      } else {
        await exportChartsAsZip(graphsWithData);
        setExportSuccess(`${graphsWithData.length} graphiques exportés en PNG (ZIP)`);
      }
      
      setTimeout(() => setExportSuccess(null), 3000);
    } catch (error) {
      console.error('Erreur d\'export PNG:', error);
      alert('Erreur lors de l\'export PNG');
    } finally {
      setExporting(false);
    }
  };

  // excel (.xlsx) format export function
  const handleExportExcel = async () => {
    setExporting(true);
    setExportSuccess(null);
    setShowExportMenu(false);
    
    try {
      if (graphsWithData.length === 1) {
        const graph = graphsWithData[0];
        const graphType = getGraphType(graph);
        const { chartData } = prepareChartData(graph);
        
        await exportChartDataToExcel(graph, chartData, graphType);
        setExportSuccess(`Données du graphique "${graph.name}" exportées en Excel`);
      } else {
        // prepare all Data
        const allChartData = graphsWithData.map(graph => {
          return prepareChartData(graph);
        });
        
        await exportAllChartsToExcel(graphsWithData, allChartData);
        setExportSuccess(`${graphsWithData.length} graphiques exportés en Excel`);
      }
      
      setTimeout(() => setExportSuccess(null), 3000);
    } catch (error) {
      console.error('Erreur d\'export Excel:', error);
      alert('Erreur lors de l\'export Excel');
    } finally {
      setExporting(false);
    }
  };

  const visibleGraphs = graphs.filter(g => g.status === "afficher");
  const graphsWithData = visibleGraphs.filter(g => graphsData?.[g.id]);

  return (
    <aside className={`bg-gray-50 border-l border-gray-200 transition-all duration-300 ${
      isOpen ? 'w-72' : 'w-10'
    }`}>
      <div className="p-3 h-full overflow-y-auto">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 rounded hover:bg-gray-200 transition-colors"
          >
            {isOpen ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
          </button>
          {isOpen && <h2 className="text-md font-semibold text-gray-800">Statistiques</h2>}
        </div>

        {isOpen && (
          <div className="space-y-3">
            {/* export successfull message */}
            {exportSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-600 px-3 py-2 rounded text-xs animate-fade-in">
                <p className="font-semibold">{exportSuccess}</p>
              </div>
            )}

            {visibleGraphs.map(graph => {
              const elementsInGraph = graphElements.filter(e => graph.elements.includes(e.id));
              const hasData = graphsData?.[graph.id];
              const graphType = getGraphType(graph);
              const { chartData, uniqueZones } = prepareChartData(graph);
              const viewMode = getViewMode(graph.id);
              const colors = getColors(graphType);
              
              return (
                <div 
                  key={graph.id} 
                  id={`chart-${graph.id}`}
                  className="bg-white p-2 rounded shadow border border-gray-200 text-xs"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-700">{graph.name}</h3>
                    
                    <div className="flex items-center space-x-2">
                      {hasData && chartData.length > 0 && (
                        <div className="flex items-center space-x-1">
                          <span className="text-[9px] text-gray-500">D</span>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={viewMode === 'monthly'}
                              onChange={() => toggleViewMode(graph.id)}
                            />
                            <div className="w-7 h-4 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-3 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                          <span className="text-[9px] text-gray-500">M</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {graph.dateDebut && graph.dateFin && (
                    <div className="text-[10px] text-gray-500 mb-2">
                      📅 {graph.dateDebut} → {graph.dateFin}
                    </div>
                  )}

                  {hasData && chartData.length > 0 ? (
                    <div className="h-40 mb-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          
                          {viewMode === 'monthly' ? (
                            <XAxis 
                              dataKey="month" 
                              tick={{ fontSize: 9 }}
                              tickFormatter={(value) => {
                                const [year, month] = value.split('-');
                                return `${month}/${year.slice(2)}`;
                              }}
                            />
                          ) : (
                            <XAxis 
                              dataKey="date" 
                              tick={{ fontSize: 9 }}
                              tickFormatter={(value) => {
                                try {
                                  const d = new Date(value);
                                  return `${d.getDate()}/${d.getMonth() + 1}`;
                                } catch (e) {
                                  return value;
                                }
                              }}
                              interval="preserveStartEnd"
                            />
                          )}
                          
                          <YAxis tick={{ fontSize: 9 }} width={35} />
                          
                          <Tooltip 
                            contentStyle={{ fontSize: '10px' }}
                            formatter={(value) => `${Number(value).toFixed(2)} m³`}
                            labelFormatter={(value) => {
                              if (viewMode === 'monthly') {
                                const [year, month] = value.split('-');
                                return `${month}/${year}`;
                              } else {
                                try {
                                  return new Date(value).toLocaleDateString();
                                } catch (e) {
                                  return value;
                                }
                              }
                            }}
                          />

                          <Legend 
                            wrapperStyle={{ fontSize: '9px' }}
                            formatter={(value) => {
                              if (graphType === 'comparaison') {
                                const [zoneId, dataType] = value.split('_');
                                return `${zoneId} ${dataType === 'production' ? '(P)' : '(C)'}`;
                              }
                              return value;
                            }}
                          />

                          {uniqueZones.map((zoneId, idx) => (
                            <Line
                              key={zoneId}
                              type="monotone"
                              dataKey={`${zoneId}`}
                              name={`${zoneId}`}
                              stroke={colors[idx % colors.length]}
                              strokeWidth={1.5}
                              dot={{ r: viewMode === 'daily' ? 0 : 2 }}
                              activeDot={{ r: 3 }}
                              connectNulls
                            />
                          ))}
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-20 bg-gradient-to-r from-gray-100 to-gray-200 rounded flex items-center justify-center mb-2">
                      <div className="text-center text-gray-500">
                        <div className="text-xs">{elementsInGraph.length} élément(s)</div>
                        <div className="text-[10px] mt-0.5">
                          {hasData ? 'Pas de données' : 'En attente'}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-1 text-[10px] border-t border-gray-200 pt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-green-600 flex items-center">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        Production
                      </span>
                      <span className="font-medium">
                        {elementsInGraph.filter(e => 
                          (graph.elementSettings[e.id]?.showProduction ?? true)
                        ).length} zone(s)
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-red-600 flex items-center">
                        <TrendingDown className="w-3 h-3 mr-1" />
                        Consommation
                      </span>
                      <span className="font-medium">
                        {elementsInGraph.filter(e => 
                          (graph.elementSettings[e.id]?.showConsommation ?? true)
                        ).length} zone(s)
                      </span>
                    </div>
                  </div>

                  {hasData && (
                    <div className="mt-2 bg-green-50 border border-green-200 text-green-700 px-2 py-1 rounded text-[10px] text-center">
                      ✓ Données chargées ({chartData.length} points)
                    </div>
                  )}
                </div>
              );
            })}

            {visibleGraphs.length === 0 && (
              <div className="text-gray-500 text-sm">
                Aucun graphique à afficher. Activez un graphique dans le panneau de gauche.
              </div>
            )}

            {/* export menu */}
            {graphsWithData.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  disabled={exporting}
                  className={`w-full p-2 rounded shadow-sm transition-shadow border text-xs ${
                    exporting
                      ? 'bg-gray-400 cursor-not-allowed border-gray-500'
                      : 'bg-green-500 hover:bg-green-600 border-gray-300 cursor-pointer'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-1 text-white">
                    {exporting ? (
                      <>
                        <div className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full"></div>
                        <span className="font-medium">Export en cours...</span>
                      </>
                    ) : (
                      <>
                        <FileDown className="w-3 h-3" />
                        <span className="font-medium">
                          Exporter {graphsWithData.length > 1 ? `(${graphsWithData.length})` : ''}
                        </span>
                      </>
                    )}
                  </div>
                </button>

                {/* Dropdown menu */}
                {showExportMenu && !exporting && (
                  <div className="absolute bottom-full mb-1 left-0 right-0 bg-white border border-gray-200 rounded shadow-lg z-10">
                    <button
                      onClick={handleExportPNG}
                      className="w-full px-3 py-2 text-left hover:bg-gray-100 flex items-center space-x-2 text-xs border-b border-gray-100"
                    >
                      <Image className="w-4 h-4 text-blue-600" />
                      <span>Exporter en PNG</span>
                    </button>
                    <button
                      onClick={handleExportExcel}
                      className="w-full px-3 py-2 text-left hover:bg-gray-100 flex items-center space-x-2 text-xs"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-green-600" />
                      <span>Exporter en Excel</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};

RightSidebar.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  setIsOpen: PropTypes.func.isRequired,
  graphs: PropTypes.array.isRequired,
  graphElements: PropTypes.array.isRequired,
  graphsData: PropTypes.object
};

export default RightSidebar;