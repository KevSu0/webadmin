import React, { useState } from 'react';
import { AlertCircle, CheckCircle, Shield, Play, Loader2 } from 'lucide-react';
import { 
  runSecurityRulesTest, 
  quickSecurityCheck, 
  displaySecurityTestResults 
} from '../services/securityRulesTest';
import { toast } from 'sonner';

interface SecurityTestResult {
  operation: string;
  success: boolean;
  error?: string;
  authenticated: boolean;
}

interface TestResults {
  passed: number;
  failed: number;
  results: SecurityTestResult[];
  recommendations: string[];
}

const SecurityRulesTest: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<TestResults | null>(null);
  const [quickCheckResult, setQuickCheckResult] = useState<boolean | null>(null);

  const handleQuickCheck = async () => {
    setIsRunning(true);
    try {
      const result = await quickSecurityCheck();
      setQuickCheckResult(result);
      
      if (result) {
        toast.success('Quick security check passed!');
      } else {
        toast.error('Quick security check failed - check console for details');
      }
    } catch (error) {
      console.error('Quick check error:', error);
      toast.error('Quick security check failed');
      setQuickCheckResult(false);
    } finally {
      setIsRunning(false);
    }
  };

  const handleFullTest = async () => {
    setIsRunning(true);
    setTestResults(null);
    
    try {
      const results = await runSecurityRulesTest();
      setTestResults(results);
      displaySecurityTestResults(results);
      
      if (results.failed === 0) {
        toast.success('All security tests passed!');
      } else {
        toast.warning(`Security test completed with ${results.failed} issues`);
      }
    } catch (error) {
      console.error('Security test error:', error);
      toast.error('Security rules test failed - check console for details');
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (success: boolean) => {
    return success ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <AlertCircle className="h-4 w-4 text-red-500" />
    );
  };

  const getStatusBadge = (success: boolean) => {
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        success 
          ? 'bg-green-100 text-green-800' 
          : 'bg-red-100 text-red-800'
      }`}>
        {success ? 'Pass' : 'Fail'}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Firestore Security Rules Test
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Test Firestore security rules to ensure they're not blocking legitimate connections.
            This helps diagnose permission-related connection issues.
          </p>
        </div>
        <div className="px-6 py-4 space-y-4">
          <div className="flex gap-3">
            <button 
              onClick={handleQuickCheck} 
              disabled={isRunning}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRunning ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              Quick Check
            </button>
            
            <button 
              onClick={handleFullTest} 
              disabled={isRunning}
              className="flex items-center gap-2 px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRunning ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Shield className="h-4 w-4" />
              )}
              Full Security Test
            </button>
          </div>

          {/* Quick Check Result */}
          {quickCheckResult !== null && (
            <div className="bg-white border border-gray-200 rounded-lg border-l-4 border-l-blue-500">
              <div className="px-4 py-3 border-b border-gray-200">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  {getStatusIcon(quickCheckResult)}
                  Quick Security Check
                </h4>
              </div>
              <div className="px-4 py-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    Basic read access to public collections
                  </span>
                  {getStatusBadge(quickCheckResult)}
                </div>
                {!quickCheckResult && (
                  <p className="text-sm text-red-600 mt-2">
                    ⚠️ Basic read access failed. Check Firestore security rules and network connection.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Full Test Results */}
          {testResults && (
            <div className="space-y-4">
              <div className="bg-white border border-gray-200 rounded-lg">
                <div className="px-4 py-3 border-b border-gray-200">
                  <h4 className="text-lg font-medium">Test Summary</h4>
                </div>
                <div className="px-4 py-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        {testResults.passed}
                      </div>
                      <div className="text-sm text-gray-500">Passed</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-red-600">
                        {testResults.failed}
                      </div>
                      <div className="text-sm text-gray-500">Failed</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">
                        {testResults.results.length}
                      </div>
                      <div className="text-sm text-gray-500">Total</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detailed Results */}
              <div className="bg-white border border-gray-200 rounded-lg">
                <div className="px-4 py-3 border-b border-gray-200">
                  <h4 className="text-lg font-medium">Detailed Results</h4>
                </div>
                <div className="px-4 py-4">
                  <div className="space-y-2">
                    {testResults.results.map((result, index) => (
                      <div 
                        key={index} 
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          {getStatusIcon(result.success)}
                          <div>
                            <div className="font-medium text-sm">
                              {result.operation}
                            </div>
                            {result.error && (
                              <div className="text-xs text-red-600 mt-1">
                                {result.error}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border border-gray-300 text-gray-700">
                            {result.authenticated ? 'Auth' : 'Anon'}
                          </span>
                          {getStatusBadge(result.success)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              {testResults.recommendations.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg border-l-4 border-l-yellow-500">
                  <div className="px-4 py-3 border-b border-gray-200">
                    <h4 className="text-lg font-medium flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-yellow-500" />
                      Recommendations
                    </h4>
                  </div>
                  <div className="px-4 py-4">
                    <ul className="space-y-2">
                      {testResults.recommendations.map((rec, index) => (
                        <li key={index} className="text-sm flex items-start gap-2">
                          <span className="text-yellow-500 mt-1">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SecurityRulesTest;