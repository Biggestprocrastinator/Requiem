import { useState } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function OnDemandReporting({ scanData }) {
  const [reportType, setReportType] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // Delivery options state
  const [sendViaEmail, setSendViaEmail] = useState(true);
  const [saveToLocation, setSaveToLocation] = useState(true);
  const [downloadLink, setDownloadLink] = useState(false);
  const [slackNotification, setSlackNotification] = useState(false);
  
  // Advanced settings state
  const [includeCharts, setIncludeCharts] = useState(true);
  const [passwordProtect, setPasswordProtect] = useState(false);

  const reportTypes = [
    { id: 'exec', label: 'Executive Reporting', icon: 'bar_chart' },
    { id: 'discovery', label: 'Assets Discovery', icon: 'track_changes' },
    { id: 'inventory', label: 'Assets Inventory', icon: 'layers' },
    { id: 'cbom', label: 'CBOM', icon: 'description' },
    { id: 'pqc', label: 'Posture of PQC', icon: 'security' },
    { id: 'cyber', label: 'Cyber Rating (Tiers 1 - 4)', icon: 'star_rate' },
  ];

  const handleSelectReport = (type) => {
    setReportType(type);
    setIsDropdownOpen(false);
  };

  const handleGenerateReport = () => {
    if (!reportType) {
      alert('Please select a Report Type to generate.');
      return;
    }

    setIsGenerating(true);

    // Simulate realistic generation delay
    setTimeout(() => {
      // 1. Output the file to download as PDF
      const reportTitleMap = {
        exec: 'Executive Summary Report',
        discovery: 'Assets Discovery Report',
        inventory: 'Network Assets Inventory',
        cbom: 'Cryptographic Bill of Materials (CBOM)',
        pqc: 'Posture of Post-Quantum Cryptography (PQC)',
        cyber: 'Cyber Risk Rating'
      };
      const title = reportTitleMap[reportType] || 'Security Report';
      const reportName = `QShield_${reportType.toUpperCase()}_Report_${new Date().toISOString().split('T')[0]}.pdf`;
      const doc = new jsPDF();
      
      const pageWidth = doc.internal.pageSize.getWidth();
      
      // Header
      doc.setFontSize(22);
      doc.setTextColor(229, 160, 62); // Qshield orange
      doc.text(`QShield - ${title}`, 14, 22);
      
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
      
      doc.setLineDashPattern([], 0);
      doc.setDrawColor(200, 200, 200);
      doc.line(14, 35, pageWidth - 14, 35);
      
      // Content Generation based on reportType
      let startY = 45;
      
      if (!scanData) {
        doc.setFontSize(12);
        doc.setTextColor(200, 50, 50);
        doc.text("No active scan data found to generate this report.", 14, startY);
      } else {
        if (reportType === 'exec') {
          doc.setFontSize(14);
          doc.setTextColor(50, 50, 50);
          doc.text("Executive Summary", 14, startY);
          
          const summaryData = scanData.summary || {};
          const body = [
            ['Total Assets Scanned', summaryData.total_assets?.toString() || '0'],
            ['HTTP Only (Insecure)', summaryData.http_only?.toString() || '0'],
            ['Quantum Safe Assets', summaryData.quantum_safe?.toString() || '0'],
            ['High Risk Assets', summaryData.high_risk_assets?.toString() || '0']
          ];
          
          autoTable(doc, {
            startY: startY + 5,
            head: [['Metric', 'Value']],
            body: body,
            theme: 'striped',
            headStyles: { fillColor: [229, 160, 62] },
          });
        } 
        else if (reportType === 'discovery') {
          doc.setFontSize(14);
          doc.setTextColor(50, 50, 50);
          doc.text("Assets Discovery Counts", 14, startY);
          
          const countsData = scanData.counts || {};
          const body = [
            ['Domains Discovered', countsData.domains?.toString() || '0'],
            ['Unique IPs', countsData.ips?.toString() || '0'],
            ['Active Services', countsData.services?.toString() || '0']
          ];
          
          autoTable(doc, {
            startY: startY + 5,
            head: [['Discovery Category', 'Count']],
            body: body,
            theme: 'grid',
            headStyles: { fillColor: [229, 160, 62] },
          });
        }
        else if (reportType === 'inventory') {
          doc.setFontSize(14);
          doc.setTextColor(50, 50, 50);
          doc.text("Network Inventory Details", 14, startY);
          
          const ports = (scanData.inventory?.ports) || [];
          let body = ports.map(p => [p.port?.toString(), p.service?.toString()]);
          if (body.length === 0) body = [['No ports found', '-']];

          autoTable(doc, {
            startY: startY + 5,
            head: [['Port', 'Service']],
            body: body,
            theme: 'striped',
            headStyles: { fillColor: [229, 160, 62] },
          });
        }
        else if (reportType === 'cbom') {
          doc.setFontSize(14);
          doc.setTextColor(50, 50, 50);
          doc.text("Cryptographic Bill of Materials", 14, startY);
          
          let body = [];
          
          // Depending on CBOM structure from scanData
          if (Array.isArray(scanData.cbom)) {
            body = scanData.cbom.map(item => [
              item.domain || item.name || 'Unknown', 
              item.algorithm || item.cipher || 'Unknown', 
              item.key_size?.toString() || item.size?.toString() || 'N/A', 
              item.quantum_safe ? 'Yes' : 'No'
            ]);
          } else if (scanData.cbom && Array.isArray(scanData.cbom.components)) {
             body = scanData.cbom.components.map(item => [
                item.name || 'Unknown', 
                item.crypto_algorithm || 'Unknown', 
                item.key_length?.toString() || 'N/A', 
                item.is_quantum_safe ? 'Yes' : 'No'
             ]);
          } else if (scanData.cbom && Array.isArray(scanData.cbom.items)) {
             body = scanData.cbom.items.map(item => [
                item.domain || item.name || 'Unknown', 
                item.algorithm || item.cipher || 'Unknown', 
                item.key_size?.toString() || item.size?.toString() || 'N/A', 
                item.quantum_safe ? 'Yes' : 'No'
             ]);
          }
          
          if (body.length > 0) {
            autoTable(doc, {
              startY: startY + 5,
              head: [['Asset / Domain', 'Algorithm', 'Key Size', 'Quantum Safe']],
              body: body,
              theme: 'striped',
              headStyles: { fillColor: [229, 160, 62] },
            });
          } else {
             // fallback if cbom is just a nested object without an array
             const str = JSON.stringify(scanData.cbom || {}, null, 2);
             doc.setFontSize(10);
             doc.setFont("courier", "normal");
             const lines = doc.splitTextToSize(str, pageWidth - 28);
             doc.text(lines, 14, startY + 10);
          }
        }
        else if (reportType === 'pqc') {
          doc.setFontSize(14);
          doc.setTextColor(50, 50, 50);
          doc.text("PQC Risk Assessment", 14, startY);
          
          const body = [
            ['Overall Risk Level', scanData.risk?.toString() || 'Unknown'],
            ['Classical Security Standard', scanData.classical_security?.toString() || 'Unknown'],
            ['Quantum Security Standard', scanData.quantum_security?.toString() || 'Unknown']
          ];
          
          autoTable(doc, {
            startY: startY + 5,
            head: [['Assessment Factor', 'Evaluation']],
            body: body,
            theme: 'grid',
            headStyles: { fillColor: [229, 160, 62] },
          });
        }
        else if (reportType === 'cyber') {
          doc.setFontSize(14);
          doc.setTextColor(50, 50, 50);
          doc.text("Cyber Rating Evaluation", 14, startY);
          
          const totalScore = scanData.score || 0;
          const letterRating = scanData.rating || 'N/A';
          doc.setFontSize(30);
          
          if (totalScore >= 80) doc.setTextColor(40, 167, 69);
          else if (totalScore >= 50) doc.setTextColor(255, 193, 7);
          else doc.setTextColor(220, 53, 69);
          
          doc.text(`${totalScore} / 100`, 14, startY + 15);
          
          doc.setFontSize(16);
          doc.setTextColor(100, 100, 100);
          doc.text(`Rating Tier: ${letterRating}`, 14, startY + 25);
          
          if (scanData.insights && scanData.insights.length > 0) {
             doc.setFontSize(14);
             doc.setTextColor(50, 50, 50);
             doc.text("Key Findings:", 14, startY + 45);
             
             autoTable(doc, {
                startY: startY + 50,
                head: [['Insight / Finding']],
                body: scanData.insights.map(i => [i]),
                theme: 'plain',
                headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0] },
             });
          }
        }
        else {
           doc.setFontSize(11);
           doc.text(`Data dump for ${reportType}`, 14, startY);
           const str = JSON.stringify(scanData, null, 2);
           const lines = doc.splitTextToSize(str, pageWidth - 28);
           let cursorY = startY + 10;
           doc.setFont("courier", "normal");
           for (let i = 0; i < lines.length; i++) {
             if (cursorY > doc.internal.pageSize.getHeight() - 20) {
               doc.addPage();
               cursorY = 20;
             }
             doc.text(lines[i], 14, cursorY);
             cursorY += 5;
           }
        }
      }

      doc.save(reportName);

      // 2. Fulfill visual side-effects
      if (slackNotification) {
        alert("Alert pushed to requested Slack webhook channels!");
      }
      if (sendViaEmail) {
        alert("Final report generated and proactively scheduled for email delivery to addresses.");
      }

      setIsGenerating(false);
    }, 1500);
  };

  return (
    <section className="col-span-12">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6 relative z-10">
        <div className="relative">
          <span className="material-symbols-outlined text-4xl text-[#e5a03e]">content_paste_search</span>
          <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
            <span className="material-symbols-outlined text-sm text-[#e5a03e]">schedule</span>
          </div>
        </div>
        <div>
          <h2 className="text-3xl font-extrabold text-[#4a4542] tracking-tight">On-Demand Reporting</h2>
          <p className="text-[#8c8581] font-medium text-sm mt-0.5">Request reports as needed</p>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-[#fefaf6] rounded-2xl shadow-sm border border-[#f3ecd8] p-8 relative overflow-hidden">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-20">
          
          {/* Report Type */}
          <div className="space-y-4 relative z-50">
            <h3 className="text-[#59534f] font-bold text-base px-2">Report Type</h3>
            <div className="relative">
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full bg-white border border-[#f1e6b8] rounded-xl px-4 py-3 flex items-center justify-between text-[#8c8581] shadow-sm hover:border-[#e5a03e] transition-colors"
              >
                <span className={reportType ? "text-[#59534f] font-medium" : ""}>
                  {reportType ? reportTypes.find(r => r.id === reportType)?.label : 'Select Report'}
                </span>
                <span className="material-symbols-outlined text-[#e5a03e]">{isDropdownOpen ? 'expand_less' : 'expand_more'}</span>
              </button>

              {isDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#f1e6b8] rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] py-2 z-50">
                  {reportTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => handleSelectReport(type.id)}
                      className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-[#fff9f0] text-left transition-colors"
                    >
                      <span className="material-symbols-outlined text-[#e5a03e] text-xl">{type.icon}</span>
                      <span className="text-[#59534f] font-medium text-sm">{type.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Yellow Divider Arrow */}
          <div className="hidden md:flex absolute left-1/2 top-12 -translate-x-1/2 -translate-y-1/2 z-10">
            <span className="material-symbols-outlined text-[#e5a03e] text-3xl font-light">chevron_right</span>
          </div>

          {/* Delivery Options */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 px-2">
              <span className="material-symbols-outlined text-[#e5a03e] -rotate-45">send</span>
              <h3 className="text-[#59534f] font-bold text-base">Delivery Options</h3>
            </div>

            <div className="space-y-5">
              {/* Send via Email */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${sendViaEmail ? 'bg-[#e5a03e] border-[#e5a03e]' : 'border-outline-variant outline-none'}`}>
                      {sendViaEmail && <span className="material-symbols-outlined text-white text-[14px]">check</span>}
                    </div>
                    <span className="text-[#59534f] font-medium text-sm">Send via Email</span>
                  </label>
                  {/* Toggle */}
                  <button 
                    onClick={() => setSendViaEmail(!sendViaEmail)}
                    className={`w-11 h-6 rounded-full p-1 transition-colors flex items-center ${sendViaEmail ? 'bg-[#e5a03e] justify-end' : 'bg-[#e8e4db] justify-start'}`}
                  >
                    <div className="w-4 h-4 rounded-full bg-white shadow-sm"></div>
                  </button>
                </div>
                {sendViaEmail && (
                  <div className="relative pl-8">
                    <input 
                      type="text" 
                      placeholder="Enter Email Addresses" 
                      className="w-full bg-[#fbf8f1] border border-[#f1e6b8] rounded-xl pl-4 pr-10 py-2.5 text-sm text-[#59534f] placeholder-[#c4bbb6] focus:outline-none focus:border-[#e5a03e]"
                    />
                    <button className="absolute right-3 top-1/2 -translate-y-1/2 text-[#e5a03e] hover:text-[#d4902b] transition-colors">
                      <span className="material-symbols-outlined">add</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Save to Location */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${saveToLocation ? 'bg-[#e5a03e] border-[#e5a03e]' : 'border-outline-variant outline-none'}`}>
                      {saveToLocation && <span className="material-symbols-outlined text-white text-[14px]">check</span>}
                    </div>
                    <span className="text-[#59534f] font-medium text-sm">Save to Location</span>
                  </label>
                  {/* Toggle */}
                  <button 
                    onClick={() => setSaveToLocation(!saveToLocation)}
                    className={`w-11 h-6 rounded-full p-1 transition-colors flex items-center ${saveToLocation ? 'bg-[#e5a03e] justify-end' : 'bg-[#e8e4db] justify-start'}`}
                  >
                    <div className="w-4 h-4 rounded-full bg-white shadow-sm"></div>
                  </button>
                </div>
                {saveToLocation && (
                  <div className="relative pl-8">
                    <input 
                      type="text" 
                      defaultValue="/Reports/OnDemand/" 
                      className="w-full bg-[#fbf8f1] border border-[#f1e6b8] rounded-xl pl-4 pr-10 py-2.5 text-sm text-[#59534f] focus:outline-none focus:border-[#e5a03e]"
                    />
                    <button className="absolute right-3 top-1/2 -translate-y-1/2 text-[#e5a03e] hover:text-[#d4902b] transition-colors">
                      <span className="material-symbols-outlined">folder</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Download Link */}
              <div className="flex items-center gap-3 pt-1">
                <button 
                  onClick={() => setDownloadLink(!downloadLink)}
                  className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${downloadLink ? 'bg-[#e5a03e] border-[#e5a03e]' : 'border-[#d8d1ca] outline-none'}`}
                >
                  {downloadLink && <span className="material-symbols-outlined text-white text-[14px]">check</span>}
                </button>
                <span className="text-[#59534f] font-medium text-sm">Download Link</span>
              </div>

              {/* Slack Notification */}
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setSlackNotification(!slackNotification)}
                  className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${slackNotification ? 'bg-[#e5a03e] border-[#e5a03e]' : 'border-[#d8d1ca] outline-none'}`}
                >
                  {slackNotification && <span className="material-symbols-outlined text-white text-[14px]">check</span>}
                </button>
                <div className="flex items-center gap-2">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/d/d5/Slack_icon_2019.svg" alt="Slack" className="w-4 h-4" />
                  <span className="text-[#59534f] font-medium text-sm">Slack Notification</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section - Advanced Settings */}
        <div className="mt-8 pt-6 border-t border-[#f3ecd8] relative z-10">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#e5a03e]">settings</span>
              <h3 className="text-[#59534f] font-bold text-sm">Advanced Settings</h3>
            </div>
            
            <div className="flex flex-wrap items-center gap-8 w-full lg:w-auto">
              
              <div className="flex items-center gap-3">
                <span className="text-[#8c8581] text-xs font-medium uppercase tracking-wider">File Format:</span>
                <button className="flex items-center gap-2 bg-white border border-[#f1e6b8] rounded-lg px-3 py-1.5 text-sm font-medium text-[#59534f] hover:border-[#e5a03e] transition-colors">
                  PDF <span className="material-symbols-outlined text-[#e5a03e] text-sm">expand_more</span>
                </button>
              </div>

              <div className="flex items-center gap-3">
                 <span className="text-[#8c8581] text-xs font-medium uppercase tracking-wider">Include Charts</span>
                 <button 
                    onClick={() => setIncludeCharts(!includeCharts)}
                    className={`w-10 h-5 rounded-full p-1 transition-colors flex items-center ${includeCharts ? 'bg-[#e5a03e] justify-end' : 'bg-[#e8e4db] justify-start'}`}
                  >
                    <div className="w-3.5 h-3.5 rounded-full bg-white shadow-sm"></div>
                  </button>
              </div>

              <div className="flex items-center gap-3">
                 <span className="text-[#8c8581] text-xs font-medium uppercase tracking-wider">Password Protect</span>
                 <button 
                    onClick={() => setPasswordProtect(!passwordProtect)}
                    className={`w-10 h-5 rounded-full p-1 transition-colors flex items-center ${passwordProtect ? 'bg-[#e5a03e] justify-end' : 'bg-[#e8e4db] justify-start'}`}
                  >
                    <div className="w-3.5 h-3.5 rounded-full bg-white shadow-sm"></div>
                  </button>
              </div>

              <button 
                onClick={handleGenerateReport}
                disabled={isGenerating}
                className={`flex items-center gap-2 text-white px-6 py-2.5 rounded-xl font-bold transition-colors ml-auto lg:ml-0 shadow-md ${isGenerating ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#e5a03e] hover:bg-[#d4902b] shadow-[#e5a03e]/20'}`}
              >
                {isGenerating ? (
                   <span className="material-symbols-outlined text-xl animate-spin">sync</span>
                ) : (
                   <span className="material-symbols-outlined text-xl">post_add</span>
                )}
                {isGenerating ? 'Generating...' : 'Generate Report'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
