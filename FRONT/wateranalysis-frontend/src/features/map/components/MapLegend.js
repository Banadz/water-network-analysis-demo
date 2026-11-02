const MapLegend = ({ maxConsumption, averageConsumption, unit = "L", daysInPeriod = 31, dateRange }) => {
  // daily max consumption
  const maxDailyConsumption = maxConsumption / daysInPeriod;
  
  // moy daily max consumption
  const averageDailyConsumption = averageConsumption / daysInPeriod;

  const heatmapItems = [
    { color: 'bg-[#2c7bb6]', value: 'Faible', percentage: '0-20%' },
    { color: 'bg-[#00a6ca]', value: 'Modérée', percentage: '20-40%' },
    { color: 'bg-[#00ccbc]', value: 'Moyenne', percentage: '40-60%' },
    { color: 'bg-[#ffff8c]', value: 'Élevée', percentage: '60-80%' },
    { color: 'bg-[#ff0000]', value: 'Très élevée', percentage: '80-100%' }
  ];

  // format Date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  // daily values
  const getActualValues = () => {
    return heatmapItems.map((item, index) => {
      const minValue = Math.round((index / heatmapItems.length) * maxDailyConsumption);
      const maxValue = Math.round(((index + 1) / heatmapItems.length) * maxDailyConsumption);
      return {
        ...item,
        actualValue: `${minValue} - ${maxValue} ${unit}/jour`
      };
    });
  };

  const legendItems = getActualValues();

  return (
    <div className="absolute bottom-3 left-5 bg-white rounded-lg shadow-lg p-3 min-w-[220px] border border-gray-200 z-1000">
      <h4 className="text-sm font-semibold text-gray-800 mb-2 border-b pb-1">
        💧 Consommation journalière par habitant
      </h4>
      {dateRange && (
        <div className="mb-2 text-xs text-gray-600 bg-gray-50 p-2 rounded">
          <div className="font-medium">Période :</div>
          <div>{formatDate(dateRange.startDate)} - {formatDate(dateRange.endDate)}</div>
        </div>
      )}
      
      <div className="space-y-1.5 text-xs">
        {legendItems.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center space-x-2 flex-1">
              <div 
                className={`w-4 h-3 ${item.color} rounded-sm border border-gray-300`}
                title={`${item.value} consommation`}
              ></div>
              <span className="text-gray-600 font-medium min-w-[70px]">
                {item.value}
              </span>
            </div>
            <span className="text-gray-500 text-xs font-mono">
              {item.actualValue}
            </span>
          </div>
        ))}
      </div>
      
      <div className="mt-2 pt-2 border-t border-gray-200">
        <div className="flex justify-between text-xs text-gray-500">
          <span> Moyenne : {averageDailyConsumption.toFixed(0)} {unit}/jour</span>
          <span>{daysInPeriod} jours</span>
        </div>
      </div>
    </div>
  );
};

export default MapLegend;