import React, { useState, useEffect } from 'react'
import './App.css'
import StorageDeviceTable from './components/StorageDeviceTable'
import SustainabilityTable from './components/SustainabilityTable'
import PerformanceTable from './components/PerformanceTable'
import FeatureTable from './components/FeatureTable'
import SystemDetailPage from './components/SystemDetailPage'

const API_URL = 'http://localhost:4000/api/devices'

function App() {
  const [hpeStorageData, setHpeStorageData] = useState([])
  const [sortConfig, setSortConfig] = useState({ key: 'deviceScore', direction: 'desc' })
  const [selectedSystem, setSelectedSystem] = useState(null)

  // Fetch device data from API every 10 minutes
  useEffect(() => {
    let intervalId

    const fetchData = async () => {
      try {
        const response = await fetch(API_URL)
        const data = await response.json()
        // Calculate deviceScore for each device
        const enrichedData = data.map(device => ({
          ...device,
          deviceScore: Math.round((device.score + device.greenScore + device.featureScore) / 3)
        }))
        setHpeStorageData(enrichedData)
      } catch (error) {
        console.error('Error fetching device data:', error)
      }
    }

    fetchData()
    intervalId = setInterval(fetchData, 600000) // 10 minutes

    return () => clearInterval(intervalId)
  }, [])

  // Calculate averages from the mock data
  const calculateAverages = (data) => {
    const totals = data.reduce((acc, device) => {
      acc.deviceScore += device.deviceScore;
      acc.score += device.score;
      acc.greenScore += device.greenScore;
      acc.featureScore += device.featureScore;
      acc.readSpeed += device.readSpeed;
      acc.writeSpeed += device.writeSpeed;
      acc.iops += device.iops;
      acc.latency += device.latency;
      acc.powerEfficiency += device.sustainability.powerEfficiency;
      acc.carbonReduction += device.sustainability.carbonReduction;
      return acc;
    }, {
      deviceScore: 0, score: 0, greenScore: 0, featureScore: 0,
      readSpeed: 0, writeSpeed: 0, iops: 0, latency: 0,
      powerEfficiency: 0, carbonReduction: 0
    });

    const count = data.length;
    return {
      deviceScore: Math.round(totals.deviceScore / count),
      score: Math.round(totals.score / count),
      greenScore: Math.round(totals.greenScore / count),
      featureScore: Math.round(totals.featureScore / count),
      readSpeed: Math.round(totals.readSpeed / count),
      writeSpeed: Math.round(totals.writeSpeed / count),
      iops: Math.round(totals.iops / count),
      latency: Number((totals.latency / count).toFixed(2)),
      sustainability: {
        powerEfficiency: Math.round(totals.powerEfficiency / count),
        carbonReduction: Math.round(totals.carbonReduction / count)
      }
    };
  };

  const averageData = calculateAverages(hpeStorageData);
  
  const [insightsView, setInsightsView] = useState(null);
  const [insightsData, setInsightsData] = useState(null);

  // Sort the data based on current sort configuration
  const sortedData = React.useMemo(() => {
    let sortableData = [...hpeStorageData];
    if (sortConfig.key) {
      sortableData.sort((a, b) => {
        // Handle nested properties like sustainability.powerEfficiency
        const getNestedValue = (obj, path) => {
          return path.split('.').reduce((value, key) => value && value[key], obj);
        };
        
        const aValue = getNestedValue(a, sortConfig.key);
        const bValue = getNestedValue(b, sortConfig.key);
        
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          if (sortConfig.direction === 'asc') {
            return aValue - bValue;
          }
          return bValue - aValue;
        }
        
        if (sortConfig.direction === 'asc') {
          return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        }
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      });
    }
    return sortableData;
  }, [hpeStorageData, sortConfig]);

  const handleSort = (key) => {
    let direction = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  const handleViewDetails = (system) => {
    setSelectedSystem(system);
  };

  const handleBackToList = () => {
    setSelectedSystem(null);
  };

  const handleViewInsights = (tableType) => {
    const avgData = calculateTableAverages(sortedData);
    const metrics = getMetricsForTable(tableType);
    
    setInsightsView(tableType);
    setInsightsData({
      averageData: avgData,
      hpeBenchmark: hpeBenchmarkData[tableType],
      metrics: metrics
    });
  };

  const handleCloseInsights = () => {
    setInsightsView(null);
    setInsightsData(null);
  };

  const calculateTableAverages = (data) => {
    const totals = data.reduce((acc, device) => {
      acc.deviceScore += device.deviceScore;
      acc.score += device.score;
      acc.greenScore += device.greenScore;
      acc.featureScore += device.featureScore;
      acc.readSpeed += device.readSpeed;
      acc.writeSpeed += device.writeSpeed;
      acc.iops += device.iops;
      acc.latency += device.latency;
      acc.powerEfficiency += device.sustainability.powerEfficiency;
      acc.carbonReduction += device.sustainability.carbonReduction;
      return acc;
    }, {
      deviceScore: 0, score: 0, greenScore: 0, featureScore: 0,
      readSpeed: 0, writeSpeed: 0, iops: 0, latency: 0,
      powerEfficiency: 0, carbonReduction: 0
    });

    const count = data.length;
    return {
      deviceScore: Math.round(totals.deviceScore / count),
      score: Math.round(totals.score / count),
      greenScore: Math.round(totals.greenScore / count),
      featureScore: Math.round(totals.featureScore / count),
      readSpeed: Math.round(totals.readSpeed / count),
      writeSpeed: Math.round(totals.writeSpeed / count),
      iops: Math.round(totals.iops / count),
      latency: (totals.latency / count).toFixed(2),
      sustainability: {
        powerEfficiency: Math.round(totals.powerEfficiency / count),
        carbonReduction: Math.round(totals.carbonReduction / count)
      }
    };
  };

  const getMetricsForTable = (tableType) => {
    switch (tableType) {
      case 'overview':
        return [
          { label: 'Device Score', getValue: (data) => data.deviceScore, unit: '/100' },
          { label: 'Performance Score', getValue: (data) => data.score, unit: '/100' },
          { label: 'HPE Performance Score', getValue: (data) => data.hpePerformanceScore || data.score, unit: '/100' }
        ];
      case 'sustainability':
        return [
          { label: 'Green Score', getValue: (data) => data.greenScore, unit: '/100' },
          { label: 'Power Efficiency', getValue: (data) => data.powerEfficiency || data.sustainability?.powerEfficiency, unit: '/100' },
          { label: 'Carbon Reduction', getValue: (data) => data.carbonReduction || data.sustainability?.carbonReduction, unit: '%' }
        ];
      case 'performance':
        return [
          { label: 'Performance Score', getValue: (data) => data.score, unit: '/100' },
          { label: 'Read Speed', getValue: (data) => data.readSpeed, unit: ' MB/s' },
          { label: 'Write Speed', getValue: (data) => data.writeSpeed, unit: ' MB/s' },
          { label: 'IOPS', getValue: (data) => data.iops, unit: '' },
          { label: 'Latency', getValue: (data) => parseFloat(data.latency), unit: ' ms', inverted: true }
        ];
      case 'features':
        return [
          { label: 'Feature Score', getValue: (data) => data.featureScore, unit: '/100' },
          { label: 'Data Reduction', getValue: (data) => data.dataReductionRatio || 3.5, unit: ':1' },
          { label: 'Protocols Supported', getValue: (data) => data.protocolsSupported || 3.2, unit: '' }
        ];
      default:
        return [];
    }
  };

  // If a system is selected, show the detail page
  if (selectedSystem) {
    return (
      <div className="app">
        <header className="app-header">
          <div className="header-content">
            <div className="hpe-branding">
              <span className="hpe-logo">HPE</span>
              <div className="header-text">
                <h1 className="header-title">HPE Storage Performance Dashboard</h1>
                <p className="header-subtitle">Detailed analysis of {selectedSystem.name}</p>
              </div>
            </div>
          </div>
        </header>
        
        <main className="app-main">
          <SystemDetailPage 
            system={selectedSystem} 
            onBack={handleBackToList}
          />
        </main>
      </div>
    );
  }

  if (hpeStorageData.length === 0) {
    return (
      <div className="app">
        <header className="app-header">
          <div className="header-content">
            <div className="hpe-branding">
              <div className="header-text">
                <h1 className="header-title">HPE Storage Performance Dashboard</h1>
                <p className="header-subtitle">Comprehensive analysis and comparison of HPE storage solutions</p>
              </div>
            </div>
          </div>
        </header>
        <main className="app-main">
          <div className="loading-spinner">
            <p>Loading data...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="hpe-branding">
            <span className="hpe-logo">HPE</span>
            <div className="header-text">
              <h1 className="header-title">HPE Storage Performance Dashboard</h1>
              <p className="header-subtitle">Comprehensive analysis and comparison of HPE storage solutions</p>
            </div>
          </div>
        </div>
      </header>
      
      <main className="app-main">
        <StorageDeviceTable 
          devices={sortedData}
          onSort={handleSort}
          sortConfig={sortConfig}
          onViewDetails={handleViewDetails}
          averageData={averageData}
        />
        
        <SustainabilityTable 
          devices={sortedData}
          onSort={handleSort}
          sortConfig={sortConfig}
          onViewDetails={handleViewDetails}
          averageData={averageData}
        />
        
        <PerformanceTable 
          devices={sortedData}
          onSort={handleSort}
          sortConfig={sortConfig}
          onViewDetails={handleViewDetails}
          averageData={averageData}
        />
        
        <FeatureTable 
          devices={sortedData}
          onSort={handleSort}
          sortConfig={sortConfig}
          onViewDetails={handleViewDetails}
          averageData={averageData}
        />
      </main>
    </div>
  )
}

export default App
