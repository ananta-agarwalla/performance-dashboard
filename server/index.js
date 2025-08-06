import express from 'express';
import cors from 'cors';
const app = express();
app.use(cors());
const PORT = 4000;

// Example device templates
const deviceTemplates = [
  {
    id: 1,
    name: "HPE GreenLake for File Storage - Enterprise",
    productLine: "HPE GreenLake",
    type: "File Storage",
    tier: "Enterprise",
    capacity: "100TB",
    protocols: ["NFS", "SMB", "S3"],
    deployment: "Cloud-managed"
  },
  {
    id: 2,
    name: "HPE GreenLake for Block Storage - Performance",
    productLine: "HPE GreenLake",
    type: "Block Storage",
    tier: "Performance",
    capacity: "50TB",
    protocols: ["iSCSI", "FC"],
    deployment: "Cloud-managed"
  },
  {
    id: 3,
    name: "HPE Alletra 6000",
    productLine: "Alletra",
    type: "NVMe SSD",
    tier: "Enterprise",
    capacity: "24TB",
    protocols: ["NVMe", "SAS"],
    deployment: "On-premises"
  },
  {
    id: 4,
    name: "HPE Nimble Storage Adaptive Flash",
    productLine: "Nimble",
    type: "Hybrid SSD/HDD",
    tier: "Midrange",
    capacity: "48TB",
    protocols: ["iSCSI", "FC"],
    deployment: "On-premises"
  },
  {
    id: 5,
    name: "HPE StoreEasy 1660",
    productLine: "StoreEasy",
    type: "File Storage",
    tier: "Entry",
    capacity: "16TB",
    protocols: ["NFS", "SMB"],
    deployment: "On-premises"
  },
  {
    id: 6,
    name: "HPE MSA 2062",
    productLine: "MSA",
    type: "SATA SSD",
    tier: "Entry",
    capacity: "8TB",
    protocols: ["SAS", "iSCSI"],
    deployment: "On-premises"
  }
];

// Helper to generate random metrics
function generateMetrics() {
  return {
    readSpeed: Math.floor(Math.random() * 10000) + 2000,
    writeSpeed: Math.floor(Math.random() * 8000) + 1500,
    iops: Math.floor(Math.random() * 2000000) + 400000,
    latency: +(Math.random() * 0.3).toFixed(2),
    price: Math.floor(Math.random() * 120000) + 4000,
    score: Math.floor(Math.random() * 21) + 79, // 79-99
    greenScore: Math.floor(Math.random() * 21) + 79,
    featureScore: Math.floor(Math.random() * 21) + 79,
    dataReduction: `${Math.floor(Math.random() * 8) + 3}:1`,
    snapshots: "Yes",
    replication: "Yes",
    sustainability: {
      powerEfficiency: Math.floor(Math.random() * 25) + 75,
      carbonReduction: Math.floor(Math.random() * 26) + 25
    }
  };
}

// Endpoint to get devices with generated metrics
app.get('/api/devices', (req, res) => {
  const devices = deviceTemplates.map(template => ({
    ...template,
    ...generateMetrics()
  }));
  res.json(devices);
});

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});