import { useCallback } from 'react';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';

export const useChartExport = () => {
  
  const exportSingleChart = useCallback(async (chartId, fileName) => {
    try {
      const element = document.getElementById(chartId);
      if (!element) {
        throw new Error(`Élément ${chartId} non trouvé`);
      }

      const canvas = await html2canvas(element, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
        useCORS: true
      });

      const link = document.createElement('a');
      link.download = `${fileName}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      throw error;
    }
  }, []);

  const exportAllCharts = useCallback(async (graphsWithData) => {
    const results = [];
    
    for (const graph of graphsWithData) {
      try {
        const chartId = `chart-${graph.id}`;
        const fileName = `${graph.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}`;
        
        await exportSingleChart(chartId, fileName);
        results.push({ success: true, graphName: graph.name });
        
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch (error) {
        results.push({ success: false, graphName: graph.name, error: error.message });
      }
    }
    
    return results;
  }, [exportSingleChart]);

  const exportChartsAsZip = useCallback(async (graphsWithData) => {
    try {
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      
      for (const graph of graphsWithData) {
        const chartId = `chart-${graph.id}`;
        const element = document.getElementById(chartId);
        
        if (element) {
          const canvas = await html2canvas(element, {
            backgroundColor: '#ffffff',
            scale: 2,
            logging: false,
            useCORS: true
          });
          
          const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
          const fileName = `${graph.name.replace(/\s+/g, '_')}.png`;
          zip.file(fileName, blob);
        }
      }
      
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.download = `graphiques_${new Date().toISOString().split('T')[0]}.zip`;
      link.href = URL.createObjectURL(zipBlob);
      link.click();
      
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'export ZIP:', error);
      throw error;
    }
  }, []);

  // Export excel function
  const exportChartDataToExcel = useCallback((graph, chartData, graphType) => {
    try {
      // prepare data
      const worksheetData = [];
      
      // header
      const headers = ['Date'];
      const zones = new Set();
      
      chartData.forEach(row => {
        Object.keys(row).forEach(key => {
          if (key !== 'date' && key !== 'month') {
            zones.add(key);
          }
        });
      });
      
      headers.push(...Array.from(zones));
      worksheetData.push(headers);
      
      // data
      chartData.forEach(row => {
        const rowData = [row.date || row.month];
        Array.from(zones).forEach(zone => {
          rowData.push(row[zone] || 0);
        });
        worksheetData.push(rowData);
      });
      
      // Create workbook
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(worksheetData);
      
      const colWidths = [{ wch: 15 }, ...Array.from(zones).map(() => ({ wch: 12 }))];
      ws['!cols'] = colWidths;
      
      XLSX.utils.book_append_sheet(wb, ws, graph.name.substring(0, 31));
      
      // download
      const fileName = `${graph.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);
      
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'export Excel:', error);
      throw error;
    }
  }, []);

  // multiple graph Export (excel)
  const exportAllChartsToExcel = useCallback((graphsWithData, allChartData) => {
    try {
      const wb = XLSX.utils.book_new();
      
      graphsWithData.forEach((graph, index) => {
        const { chartData } = allChartData[index];
        
        if (!chartData || chartData.length === 0) return;
        
        const worksheetData = [];
        const headers = ['Date'];
        const zones = new Set();
        
        chartData.forEach(row => {
          Object.keys(row).forEach(key => {
            if (key !== 'date' && key !== 'month') {
              zones.add(key);
            }
          });
        });
        
        headers.push(...Array.from(zones));
        worksheetData.push(headers);
        
        chartData.forEach(row => {
          const rowData = [row.date || row.month];
          Array.from(zones).forEach(zone => {
            rowData.push(row[zone] || 0);
          });
          worksheetData.push(rowData);
        });
        
        const ws = XLSX.utils.aoa_to_sheet(worksheetData);
        const colWidths = [{ wch: 15 }, ...Array.from(zones).map(() => ({ wch: 12 }))];
        ws['!cols'] = colWidths;
        
        // sheet name
        const sheetName = graph.name.substring(0, 31);
        XLSX.utils.book_append_sheet(wb, ws, sheetName);
      });
      
      const fileName = `graphiques_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);
      
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'export Excel multiple:', error);
      throw error;
    }
  }, []);

  return {
    exportSingleChart,
    exportAllCharts,
    exportChartsAsZip,
    exportChartDataToExcel,
    exportAllChartsToExcel
  };
};