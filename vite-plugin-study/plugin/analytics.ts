// vite-plugin-perf-analytics.js
import fs from 'fs';
import path from 'path';
import { performance } from 'perf_hooks';
import { createServer } from 'http';
import open from 'open';
import { visualizer } from 'rollup-plugin-visualizer';

export default function perfAnalyticsPlugin(options = {}) {
  const defaultOptions = {
    port: 5175,
    open: true,
    outputDir: '.vite-perf',
    bundleAnalysis: true
  };

  const finalOptions = { ...defaultOptions, ...options };
  const metrics = {
    buildStart: 0,
    buildEnd: 0,
    transformTimes: {},
    moduleSizes: {},
    dependencies: {}
  };

  return {
    name: 'vite-plugin-perf-analytics',

    // 集成可视化插件
    ...(finalOptions.bundleAnalysis ? {
      async config() {
        return {
          plugins: [visualizer({
            open: false,
            filename: path.join(finalOptions.outputDir, 'bundle-stats.html')
          })]
        };
      }
    } : {}),

    // 构建开始
    buildStart() {
      metrics.buildStart = performance.now();
      metrics.transformTimes = {};
    },

    // 模块加载
    load(id) {
      try {
        const stats = fs.statSync(id);
        metrics.moduleSizes[id] = stats.size;
      } catch (e) {
        metrics.moduleSizes[id] = 0;
      }
      return null;
    },

    // 模块转换
    transform(code, id) {
      const start = performance.now();

      // 返回一个transform函数
      return (code) => {
        const end = performance.now();
        metrics.transformTimes[id] = (metrics.transformTimes[id] || 0) + (end - start);
        return code;
      };
    },

    // 模块依赖
    moduleParsed(moduleInfo) {
      if (!metrics.dependencies[moduleInfo.id]) {
        metrics.dependencies[moduleInfo.id] = {
          imported: new Set(),
          importers: new Set()
        };
      }

      moduleInfo.importedIds.forEach(importedId => {
        metrics.dependencies[moduleInfo.id].imported.add(importedId);

        if (!metrics.dependencies[importedId]) {
          metrics.dependencies[importedId] = {
            imported: new Set(),
            importers: new Set()
          };
        }

        metrics.dependencies[importedId].importers.add(moduleInfo.id);
      });
    },

    // 构建结束
    buildEnd() {
      metrics.buildEnd = performance.now();
      generateReport();
      startServer();
    }
  };

  function generateReport() {
    // 确保输出目录存在
    if (!fs.existsSync(finalOptions.outputDir)) {
      fs.mkdirSync(finalOptions.outputDir, { recursive: true });
    }

    // 计算总构建时间
    const totalTime = metrics.buildEnd - metrics.buildStart;

    // 找出最耗时的转换
    const slowestTransforms = Object.entries(metrics.transformTimes)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([id, time]) => ({
        id,
        time: time.toFixed(2) + 'ms',
        size: (metrics.moduleSizes[id] / 1024).toFixed(2) + 'KB'
      }));

    // 找出最大的模块
    const largestModules = Object.entries(metrics.moduleSizes)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([id, size]) => ({
        id,
        size: (size / 1024).toFixed(2) + 'KB'
      }));

    // 生成关键路径
    const criticalPath = findCriticalPath();

    // 创建报告
    const report = {
      buildTime: totalTime.toFixed(2) + 'ms',
      moduleCount: Object.keys(metrics.moduleSizes).length,
      totalSize: (Object.values(metrics.moduleSizes).reduce((sum, size) => sum + size, 0) / 1024 / 1024).toFixed(2) + 'MB',
      slowestTransforms,
      largestModules,
      criticalPath
    };

    // 保存报告
    const reportPath = path.join(finalOptions.outputDir, 'performance-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    // 生成HTML报告
    const htmlReport = `
<!DOCTYPE html>
<html>
<head>
  <title>Vite Performance Report</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    .container { max-width: 1200px; margin: 0 auto; }
    .chart-container { height: 300px; margin-bottom: 40px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background-color: #f5f5f5; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Vite Performance Report</h1>

    <div class="summary">
      <p>Total Build Time: <strong>${report.buildTime}</strong></p>
      <p>Modules Processed: <strong>${report.moduleCount}</strong></p>
      <p>Total Bundle Size: <strong>${report.totalSize}</strong></p>
    </div>

    <h2>Slowest Transforms</h2>
    <div class="chart-container">
      <canvas id="transformChart"></canvas>
    </div>

    <h2>Largest Modules</h2>
    <div class="chart-container">
      <canvas id="sizeChart"></canvas>
    </div>

    <h2>Critical Path</h2>
    <table>
      <thead>
        <tr>
          <th>Module</th>
          <th>Processing Time</th>
          <th>Size</th>
        </tr>
      </thead>
      <tbody>
        ${report.criticalPath.map(module => `
          <tr>
            <td>${module.id}</td>
            <td>${module.time}</td>
            <td>${module.size}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <script>
      // Slowest transforms chart
      const transformCtx = document.getElementById('transformChart').getContext('2d');
      new Chart(transformCtx, {
        type: 'bar',
        data: {
          labels: ${JSON.stringify(report.slowestTransforms.map(m => m.id.split('/').pop()))},
          datasets: [{
            label: 'Processing Time (ms)',
            data: ${JSON.stringify(report.slowestTransforms.map(m => parseFloat(m.time.replace('ms', '')))},
            backgroundColor: 'rgba(255, 99, 132, 0.5)'
          }]
        }
      });

      // Largest modules chart
      const sizeCtx = document.getElementById('sizeChart').getContext('2d');
      new Chart(sizeCtx, {
        type: 'bar',
        data: {
          labels: ${JSON.stringify(report.largestModules.map(m => m.id.split('/').pop()))},
          datasets: [{
            label: 'Module Size (KB)',
            data: ${JSON.stringify(report.largestModules.map(m => parseFloat(m.size.replace('KB', '')))},
            backgroundColor: 'rgba(54, 162, 235, 0.5)'
          }]
        }
      });
    </script>
  </div>
</body>
</html>
    `;

    const htmlPath = path.join(finalOptions.outputDir, 'index.html');
    fs.writeFileSync(htmlPath, htmlReport);
  }

  function findCriticalPath() {
    // 简化版关键路径查找算法
    const processingTimes = {};

    // 计算每个模块的总处理时间（自身+依赖）
    const calculateTotalTime = (moduleId) => {
      if (processingTimes[moduleId]) return processingTimes[moduleId];

      const selfTime = metrics.transformTimes[moduleId] || 0;
      let maxDepTime = 0;

      const deps = metrics.dependencies[moduleId]?.imported || [];
      for (const dep of deps) {
        const depTime = calculateTotalTime(dep);
        if (depTime > maxDepTime) maxDepTime = depTime;
      }

      const total = selfTime + maxDepTime;
      processingTimes[moduleId] = total;
      return total;
    };

    // 计算所有模块的总处理时间
    Object.keys(metrics.dependencies).forEach(calculateTotalTime);

    // 找出关键路径
    let criticalPath = [];
    let currentId = Object.entries(processingTimes).sort((a, b) => b[1] - a[1])[0][0];

    while (currentId) {
      criticalPath.push({
        id: currentId,
        time: (metrics.transformTimes[currentId] || 0).toFixed(2) + 'ms',
        size: metrics.moduleSizes[currentId]
          ? (metrics.moduleSizes[currentId] / 1024).toFixed(2) + 'KB'
          : 'N/A'
      });

      const deps = [...(metrics.dependencies[currentId]?.imported || [])];
      if (deps.length === 0) break;

      // 找出最耗时的依赖
      currentId = deps.reduce((maxId, depId) => {
        return processingTimes[depId] > (processingTimes[maxId] || 0)
          ? depId
          : maxId;
      }, deps[0]);
    }

    return criticalPath;
  }

  function startServer() {
    const server = createServer((req, res) => {
      const filePath = path.join(
        finalOptions.outputDir,
        req.url === '/' ? 'index.html' : req.url
      );

      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath);
        const ext = path.extname(filePath);

        let contentType = 'text/html';
        if (ext === '.js') contentType = 'text/javascript';
        else if (ext === '.css') contentType = 'text/css';
        else if (ext === '.json') contentType = 'application/json';

        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
      } else {
        res.writeHead(404);
        res.end('Not found');
      }
    });

    server.listen(finalOptions.port, () => {
      console.log(`📊 Performance report server running at http://localhost:${finalOptions.port}`);

      if (finalOptions.open) {
        open(`http://localhost:${finalOptions.port}`);
      }
    });
  }
}
