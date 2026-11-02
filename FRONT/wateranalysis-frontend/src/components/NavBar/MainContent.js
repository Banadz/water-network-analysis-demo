import React, { useState, useEffect } from 'react';
import MapLegend from '../../features/map/components/MapLegend';
import MapView from '../../features/map/MapView';
import { LAYER_TYPES } from '../../config/mapConfig';
import { 
  TrendingUp, 
  Calendar, 
  Users, 
  Activity,
  FileText,
  BarChart2,
  PieChart,
  Download
} from 'lucide-react';

const MainContent = ({
    mapViewRef,
    activeLayers,
    handleFeatureClick,
    handleZoneClick,
    activeView = 'map'
}) => {
    const [heatmapInfo, setHeatmapInfo] = useState({
        data: [],
        loading: false,
        error: null,
        maxConsumption: 1000,
        averageConsumption: 5000,
        dateRange: null
    });

    const calculateDaysInPeriod = () => {
        if (!heatmapInfo.dateRange?.startDate || !heatmapInfo.dateRange?.endDate) return 31;
        
        const start = new Date(heatmapInfo.dateRange.startDate);
        const end = new Date(heatmapInfo.dateRange.endDate);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        
        return diffDays;
    };

    const daysInPeriod = calculateDaysInPeriod();

    useEffect(() => {
        const interval = setInterval(() => {
            if (mapViewRef.current) {
                const heatmapData = mapViewRef.current.getHeatmapData();
                if (heatmapData) {
                    setHeatmapInfo(heatmapData);
                }
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [mapViewRef]);

    const isHeatmapActive = activeLayers.some(layer => layer.layerKey === LAYER_TYPES.HEATMAP);

    // Composants pour différentes vues
    const DashboardView = () => (
        <div className="p-6 space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Tableau de bord</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Consommation totale", value: "1,234,567 L", icon: Activity, color: "blue" },
                    { label: "Zones actives", value: "156", icon: Users, color: "green" },
                    { label: "Alertes", value: "12", icon: Calendar, color: "red" },
                    { label: "Tendance", value: "+12.5%", icon: TrendingUp, color: "purple" }
                ].map((stat, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-lg shadow border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">{stat.label}</p>
                                <p className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</p>
                            </div>
                            <div className={`bg-${stat.color}-100 p-3 rounded-full`}>
                                <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                <h3 className="text-lg font-semibold mb-4">Activité récente</h3>
                <div className="space-y-3">
                    {["Nouvelle zone ajoutée", "Rapport généré", "Mise à jour de couche"].map((activity, idx) => (
                        <div key={idx} className="flex items-center space-x-3 p-3 bg-gray-50 rounded">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="text-gray-700">{activity}</span>
                            <span className="text-sm text-gray-400 ml-auto">Il y a {idx + 1}h</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const OverviewView = () => (
        <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Vue d'ensemble</h2>
            <div className="bg-white p-8 rounded-lg shadow border border-gray-200">
                <div className="text-center max-w-2xl mx-auto space-y-4">
                    <Activity className="w-16 h-16 mx-auto text-blue-500" />
                    <h3 className="text-xl font-semibold">Réseau d'eau intelligent</h3>
                    <p className="text-gray-600">
                        Plateforme de gestion et d'analyse du réseau d'approvisionnement en eau.
                        Suivez la consommation, analysez les tendances et optimisez la distribution.
                    </p>
                    <div className="grid grid-cols-3 gap-4 mt-6">
                        <div className="p-4 bg-blue-50 rounded">
                            <p className="text-3xl font-bold text-blue-600">24/7</p>
                            <p className="text-sm text-gray-600">Surveillance</p>
                        </div>
                        <div className="p-4 bg-green-50 rounded">
                            <p className="text-3xl font-bold text-green-600">98%</p>
                            <p className="text-sm text-gray-600">Précision</p>
                        </div>
                        <div className="p-4 bg-purple-50 rounded">
                            <p className="text-3xl font-bold text-purple-600">150+</p>
                            <p className="text-sm text-gray-600">Zones</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const NewsView = () => (
        <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Actualités</h2>
            <div className="space-y-4">
                {[
                    { title: "Nouvelle fonctionnalité : Prévisions IA", date: "09 Déc 2025", category: "Mise à jour" },
                    { title: "Maintenance planifiée du système", date: "08 Déc 2025", category: "Info" },
                    { title: "Rapport mensuel disponible", date: "07 Déc 2025", category: "Rapport" }
                ].map((news, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-lg shadow border border-gray-200 hover:shadow-lg transition-shadow">
                        <div className="flex items-start justify-between">
                            <div>
                                <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">{news.category}</span>
                                <h3 className="text-lg font-semibold mt-2">{news.title}</h3>
                                <p className="text-sm text-gray-500 mt-1">{news.date}</p>
                            </div>
                            <FileText className="w-5 h-5 text-gray-400" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const ReportsView = () => (
        <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Rapports</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                    { title: "Rapport mensuel", type: "PDF", size: "2.4 MB" },
                    { title: "Analyse trimestrielle", type: "Excel", size: "1.8 MB" },
                    { title: "Statistiques annuelles", type: "PDF", size: "3.1 MB" },
                    { title: "Données brutes", type: "CSV", size: "5.2 MB" }
                ].map((report, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-lg shadow border border-gray-200 hover:shadow-lg transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold text-gray-800">{report.title}</h3>
                                <p className="text-sm text-gray-500 mt-1">{report.type} • {report.size}</p>
                            </div>
                            <button className="p-2 hover:bg-gray-100 rounded">
                                <Download className="w-5 h-5 text-blue-600" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const TrendsView = () => (
        <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Tendances</h2>
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <BarChart2 className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500">Graphiques de tendances à venir</p>
                    </div>
                </div>
            </div>
        </div>
    );

    const StatsView = () => (
        <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Statistiques</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                    <div className="flex items-center justify-center h-48">
                        <PieChart className="w-16 h-16 text-gray-300" />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                    <div className="flex items-center justify-center h-48">
                        <BarChart2 className="w-16 h-16 text-gray-300" />
                    </div>
                </div>
            </div>
        </div>
    );

    const GenericView = ({ title }) => (
        <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">{title}</h2>
            <div className="bg-white p-12 rounded-lg shadow border border-gray-200">
                <div className="text-center text-gray-500">
                    <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p>Contenu à venir pour : {title}</p>
                </div>
            </div>
        </div>
    );

    // Rendu conditionnel selon activeView
    const renderContent = () => {
        switch (activeView) {
            case 'dashboard':
                return <DashboardView />;
            case 'overview':
                return <OverviewView />;
            case 'news':
                return <NewsView />;
            case 'reports':
                return <ReportsView />;
            case 'trends':
                return <TrendsView />;
            case 'realtime-stats':
            case 'historical-stats':
            case 'forecasts':
                return <StatsView />;
            case 'layer-management':
                return <GenericView title="Gestion des couches" />;
            case 'import-export':
                return <GenericView title="Import/Export" />;
            case 'comparisons':
                return <GenericView title="Comparaisons" />;
            case 'map':
            default:
                return (
                    <>
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-green-50 z-0" />
                        <div className="relative z-10 h-full" id="map-capture-zone">
                            <MapView
                                ref={mapViewRef}
                                activeLayers={activeLayers}
                                onFeatureClick={handleFeatureClick}
                                onZoneClick={handleZoneClick}
                            />
                        </div>
                        {isHeatmapActive && heatmapInfo.data.length > 0 && (
                            <div className="absolute w-80 bottom-4 left-4 z-20">
                                <MapLegend 
                                    maxConsumption={heatmapInfo.maxConsumption}
                                    averageConsumption={heatmapInfo.averageConsumption}
                                    unit="L"
                                    daysInPeriod={daysInPeriod}
                                    dateRange={heatmapInfo.dateRange}
                                />
                            </div>
                        )}
                        {heatmapInfo.loading && (
                            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 bg-white px-4 py-2 rounded-lg shadow-lg border">
                                <div className="flex items-center space-x-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                                    <span className="text-sm text-gray-600">Chargement heatmap...</span>
                                </div>
                            </div>
                        )}
                        {heatmapInfo.error && (
                            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 bg-red-50 px-4 py-2 rounded-lg shadow-lg border border-red-200">
                                <span className="text-sm text-red-600">Erreur: {heatmapInfo.error}</span>
                            </div>
                        )}
                    </>
                );
        }
    };

    return (
        <main className="flex-1 p-4 bg-gray-50">
            <div className="h-full bg-white rounded shadow border border-gray-200 relative overflow-hidden">
                {activeView === 'map' ? (
                    renderContent()
                ) : (
                    <div className="h-full overflow-y-auto">
                        {renderContent()}
                    </div>
                )}
            </div>
        </main>
    );
};

export default MainContent;