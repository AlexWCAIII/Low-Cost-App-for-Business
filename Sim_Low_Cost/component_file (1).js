import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Calculator, DollarSign, TrendingUp, Download, Calendar, ArrowRight, Users, Target } from 'lucide-react';

const SmallBusinessCostSimulator = () => {
  const [inputs, setInputs] = useState({
    revenue: 20,
    opexPercent: 35,
    headcount: 85,
    techSpend: 8,
    aiReadiness: 'beginner',
    processMaturity: 60,
    outsourcingLevel: 'low',
    name: '',
    company: '',
    email: '',
    phone: ''
  });

  const [results, setResults] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [showParameters, setShowParameters] = useState(false);

  // Small business focused Monte Carlo simulation
  const runSimulation = () => {
    const numSimulations = 3000;
    const simResults = [];

    // Adjusted ranges for smaller businesses
    const aiSavingsRange = {
      beginner: [0.03, 0.08],
      learning: [0.06, 0.12],
      adopter: [0.10, 0.18]
    };

    const processSavingsRange = [0.05, 0.20]; // Higher potential for smaller businesses
    const outsourcingSavingsRange = {
      low: [0.02, 0.06],
      medium: [0.04, 0.10],
      high: [0.06, 0.15]
    };

    const changeSuccessRange = [0.65, 0.85]; // Smaller orgs can pivot faster
    const currentOpex = (inputs.revenue * inputs.opexPercent) / 100;

    for (let i = 0; i < numSimulations; i++) {
      // Random sampling within ranges
      const aiRange = aiSavingsRange[inputs.aiReadiness];
      const aiSavings = Math.random() * (aiRange[1] - aiRange[0]) + aiRange[0];
      
      const processSavings = Math.random() * (processSavingsRange[1] - processSavingsRange[0]) + processSavingsRange[0];
      
      const outsourcingRange = outsourcingSavingsRange[inputs.outsourcingLevel];
      const outsourcingSavings = Math.random() * (outsourcingRange[1] - outsourcingRange[0]) + outsourcingRange[0];
      
      const changeSuccess = Math.random() * (changeSuccessRange[1] - changeSuccessRange[0]) + changeSuccessRange[0];
      
      // Process maturity multiplier
      const maturityMultiplier = inputs.processMaturity / 100;
      
      // Tech efficiency multiplier (higher tech spend can enable more savings)
      const techMultiplier = Math.min(inputs.techSpend / 10, 1.2);
      
      // Calculate total savings with small business factors
      const totalSavingsPercent = (aiSavings + processSavings * maturityMultiplier + outsourcingSavings) * changeSuccess * techMultiplier;
      const savingsAmount = currentOpex * totalSavingsPercent;
      
      simResults.push({
        savingsPercent: totalSavingsPercent * 100,
        savingsAmount: savingsAmount
      });
    }

    // Calculate percentiles
    const sortedByPercent = [...simResults].sort((a, b) => a.savingsPercent - b.savingsPercent);
    const sortedByAmount = [...simResults].sort((a, b) => a.savingsAmount - b.savingsAmount);

    const p10Index = Math.floor(numSimulations * 0.1);
    const p50Index = Math.floor(numSimulations * 0.5);
    const p90Index = Math.floor(numSimulations * 0.9);

    const summary = {
      p10: {
        percent: sortedByPercent[p10Index].savingsPercent,
        amount: sortedByAmount[p10Index].savingsAmount
      },
      p50: {
        percent: sortedByPercent[p50Index].savingsPercent,
        amount: sortedByAmount[p50Index].savingsAmount
      },
      p90: {
        percent: sortedByPercent[p90Index].savingsPercent,
        amount: sortedByAmount[p90Index].savingsAmount
      },
      currentOpex: currentOpex,
      simulations: simResults,
      breakdownData: getBreakdownData()
    };

    setResults(summary);
    setShowResults(true);
  };

  // Generate cost breakdown for small businesses
  const getBreakdownData = () => {
    const currentOpex = (inputs.revenue * inputs.opexPercent) / 100;
    return [
      { name: 'Personnel', value: currentOpex * 0.65, color: '#3B82F6' },
      { name: 'Technology', value: currentOpex * (inputs.techSpend / 100), color: '#10B981' },
      { name: 'Operations', value: currentOpex * 0.15, color: '#F59E0B' },
      { name: 'Overhead', value: currentOpex * 0.12, color: '#EF4444' }
    ];
  };

  // Generate distribution data for chart
  const getDistributionData = () => {
    if (!results) return [];
    
    const buckets = Array(15).fill(0);
    const minPercent = 0;
    const maxPercent = 25;
    const bucketSize = (maxPercent - minPercent) / 15;

    results.simulations.forEach(sim => {
      const bucketIndex = Math.min(Math.floor(sim.savingsPercent / bucketSize), 14);
      buckets[bucketIndex]++;
    });

    return buckets.map((count, index) => ({
      range: `${(index * bucketSize).toFixed(1)}-${((index + 1) * bucketSize).toFixed(1)}%`,
      count: count,
      probability: (count / results.simulations.length) * 100
    }));
  };

  const handleInputChange = (field, value) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  const handleLeadCapture = () => {
    if (inputs.name && inputs.company && inputs.email) {
      setShowLeadForm(false);
      setShowParameters(true);
    }
  };

  const handleBookingClick = () => {
    window.open('tel:678-428-5997', '_self');
  };

  const handleDownloadReport = () => {
    // Create a simple text report
    const reportContent = `Small Business Cost-Saving Analysis Report
Company: ${inputs.company}
Contact: ${inputs.name}
Email: ${inputs.email}

Business Profile:
- Annual Revenue: $${inputs.revenue}M
- Operating Expenses: ${inputs.opexPercent}% of revenue ($${((inputs.revenue * inputs.opexPercent) / 100).toFixed(1)}M)
- Employee Count: ${inputs.headcount}
- Technology Spend: ${inputs.techSpend}% of OpEx
- AI/Automation Readiness: ${inputs.aiReadiness}
- Process Maturity: ${inputs.processMaturity}%
- Outsourcing Level: ${inputs.outsourcingLevel}

Cost-Saving Projections:
- Conservative (P10): ${results.p10.percent.toFixed(1)}% savings ($${(results.p10.amount / 1000).toFixed(0)}K/year)
- Most Likely (P50): ${results.p50.percent.toFixed(1)}% savings ($${(results.p50.amount / 1000).toFixed(0)}K/year)
- Best Case (P90): ${results.p90.percent.toFixed(1)}% savings ($${(results.p90.amount / 1000).toFixed(0)}K/year)

Next Steps:
1. Book a Small Business Cost-Optimization Session with Wilts Alexander
2. Call 678-428-5997 to discuss your specific situation
3. Develop a customized 30-day action plan

Generated by: Small Business Cost-Saving Simulator
Consultant: Wilts C. Alexander III
Date: ${new Date().toLocaleDateString()}`;

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${inputs.company}_cost_savings_analysis.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gradient-to-br from-green-50 to-blue-50 min-h-screen">
      {/* Header with Logo */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-6">
          <div className="bg-white p-4 rounded-xl shadow-md">
            <div className="flex items-center">
              <div className="text-4xl font-black text-blue-900 mr-4">WCA</div>
              <div className="border-l-2 border-blue-900 pl-4">
                <div className="text-xl font-bold text-blue-900">Wilts C.</div>
                <div className="text-xl font-bold text-blue-900">Alexander III</div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center mb-4">
          <Users className="mr-3 text-green-600" size={32} />
          <h1 className="text-4xl font-bold text-slate-800">
            Small Business Cost-Saving Simulator
          </h1>
        </div>
        <p className="text-xl text-slate-600 mb-2">
          For Growing Companies: $5M-$50M Revenue • 25-200 Employees
        </p>
        <p className="text-lg text-slate-500">
          Discover hidden savings opportunities without the enterprise consulting price tag
        </p>
      </div>

      {!showParameters && !showResults ? (
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-green-700 mb-4">Start Your Free Small Business Analysis</h2>
            <p className="text-gray-600">Complete the form below to run your personalized cost-saving simulation</p>
          </div>
          
          <div className="max-w-md mx-auto space-y-4">
            <input
              type="text"
              placeholder="Your Full Name *"
              value={inputs.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
            <input
              type="text"
              placeholder="Company Name *"
              value={inputs.company}
              onChange={(e) => handleInputChange('company', e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
            <input
              type="email"
              placeholder="Business Email Address *"
              value={inputs.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
            <input
              type="tel"
              placeholder="Phone Number"
              value={inputs.phone || ''}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            
            <div className="text-xs text-gray-500 p-3 bg-green-50 rounded">
              <p className="mb-2">By providing your information, you agree to receive:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Your personalized small business cost-saving analysis</li>
                <li>Growth strategies and operational efficiency tips</li>
                <li>Information about Wilts Alexander's business optimization services</li>
              </ul>
              <p className="mt-2">You can unsubscribe at any time. We respect your privacy.</p>
            </div>
            
            <button
              onClick={() => {
                if (inputs.name && inputs.company && inputs.email) {
                  setShowParameters(true);
                } else {
                  alert('Please fill in all required fields (marked with *)');
                }
              }}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg transition duration-200 flex items-center justify-center"
            >
              <ArrowRight className="mr-2" />
              Continue to Business Parameters
            </button>
            
            <div className="text-center text-sm text-gray-500">
              Questions? Call Wilts Alexander directly: <strong className="text-green-600">678-428-5997</strong>
            </div>
          </div>
        </div>
      ) : !showResults ? (
        <div className="grid md:grid-cols-2 gap-8">
          {/* Input Panel */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-6 flex items-center">
              <Calculator className="mr-3 text-green-600" />
              Your Business Profile
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Annual Revenue ($M): ${inputs.revenue}M
                </label>
                <input
                  type="range"
                  min="5"
                  max="50"
                  value={inputs.revenue}
                  onChange={(e) => handleInputChange('revenue', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Operating Expenses (% of Revenue): {inputs.opexPercent}%
                </label>
                <input
                  type="range"
                  min="25"
                  max="50"
                  value={inputs.opexPercent}
                  onChange={(e) => handleInputChange('opexPercent', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <p className="text-xs text-gray-500 mt-1">Small businesses typically run 30-45%</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Employee Count: {inputs.headcount}
                </label>
                <input
                  type="range"
                  min="25"
                  max="200"
                  step="5"
                  value={inputs.headcount}
                  onChange={(e) => handleInputChange('headcount', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Technology Spend (% of OpEx): {inputs.techSpend}%
                </label>
                <input
                  type="range"
                  min="3"
                  max="15"
                  value={inputs.techSpend}
                  onChange={(e) => handleInputChange('techSpend', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  AI/Automation Readiness
                </label>
                <select
                  value={inputs.aiReadiness}
                  onChange={(e) => handleInputChange('aiReadiness', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="beginner">Just Starting (3-8% potential savings)</option>
                  <option value="learning">Learning Phase (6-12% potential savings)</option>
                  <option value="adopter">Early Adopter (10-18% potential savings)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Process Maturity: {inputs.processMaturity}%
                </label>
                <input
                  type="range"
                  min="30"
                  max="80"
                  value={inputs.processMaturity}
                  onChange={(e) => handleInputChange('processMaturity', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <p className="text-xs text-gray-500 mt-1">How standardized are your core processes?</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Outsourcing Level
                </label>
                <select
                  value={inputs.outsourcingLevel}
                  onChange={(e) => handleInputChange('outsourcingLevel', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="low">Minimal (2-6% optimization potential)</option>
                  <option value="medium">Selective (4-10% optimization potential)</option>
                  <option value="high">Strategic (6-15% optimization potential)</option>
                </select>
              </div>

              <button
                onClick={runSimulation}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg transition duration-200 flex items-center justify-center"
              >
                <ArrowRight className="mr-2" />
                Run Small Business Simulation
              </button>
            </div>
          </div>

          {/* Value Proposition */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-6 flex items-center">
              <Target className="mr-3 text-blue-600" />
              Small Business Advantages
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <TrendingUp className="mr-3 mt-1 text-green-600" />
                <div>
                  <h3 className="font-semibold text-gray-800">Faster Implementation</h3>
                  <p className="text-gray-600">Small teams can pivot quickly - changes happen in weeks, not months</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <DollarSign className="mr-3 mt-1 text-blue-600" />
                <div>
                  <h3 className="font-semibold text-gray-800">Higher Impact Per Dollar</h3>
                  <p className="text-gray-600">Every dollar saved has bigger impact on cash flow and growth capacity</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Users className="mr-3 mt-1 text-purple-600" />
                <div>
                  <h3 className="font-semibold text-gray-800">Owner-Operator Advantage</h3>
                  <p className="text-gray-600">Direct decision-making authority means faster execution</p>
                </div>
              </div>

              <div className="flex items-start">
                <Calculator className="mr-3 mt-1 text-orange-600" />