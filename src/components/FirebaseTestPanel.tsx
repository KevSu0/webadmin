import React, { useState } from 'react';
import { AlertCircle, CheckCircle, Wifi, Database, Shield, RefreshCw } from 'lucide-react';
import { runComprehensiveTest, testFirebaseConnection, testNetworkConnectivity } from '../utils/firebaseTest';

interface TestResult {
  network: boolean;
  firebase: {
    auth: boolean;
    firestore: boolean;
    overall: boolean;
    errors: string[];
  };
  overall: boolean;
}

const FirebaseTestPanel: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<TestResult | null>(null);
  const [lastTestTime, setLastTestTime] = useState<Date | null>(null);

  const runTests = async () => {
    setIsLoading(true);
    try {
      const results = await runComprehensiveTest();
      setTestResults(results);
      setLastTestTime(new Date());
    } catch (error) {
      console.error('Test execution failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const runIndividualTest = async (testType: 'network' | 'firebase') => {
    setIsLoading(true);
    try {
      if (testType === 'network') {
        const networkResult = await testNetworkConnectivity();
        console.log('Network test result:', networkResult);
      } else {
        const firebaseResult = await testFirebaseConnection();
        console.log('Firebase test result:', firebaseResult);
      }
    } catch (error) {
      console.error(`${testType} test failed:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <AlertCircle className="h-4 w-4 text-red-500" />
    );
  };



  return (
    <div className="w-full max-w-4xl mx-auto bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
          <Database className="h-5 w-5" />
          Firebase Connection Test Panel
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Test Firebase services connectivity and diagnose connection issues
        </p>
      </div>
      <div className="px-6 py-4 space-y-6">
        {/* Test Controls */}
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={runTests} 
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
            Run All Tests
          </button>
          
          <button 
            onClick={() => runIndividualTest('network')} 
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Wifi className="h-4 w-4" />
            Test Network
          </button>
          
          <button 
            onClick={() => runIndividualTest('firebase')} 
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Shield className="h-4 w-4" />
            Test Firebase
          </button>
        </div>

        {/* Last Test Time */}
        {lastTestTime && (
          <div className="text-sm text-gray-500">
            Last tested: {lastTestTime.toLocaleString()}
          </div>
        )}

        {/* Test Results */}
        {testResults && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Test Results</h3>
            
            {/* Overall Status */}
            <div className="flex items-center gap-2">
              <span className="font-medium">Overall Status:</span>
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                testResults.overall 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {getStatusIcon(testResults.overall)}
                {testResults.overall ? 'All Connected' : 'Issues Detected'}
              </span>
            </div>

            {/* Individual Service Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Network Status */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-3 border-b border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                    <Wifi className="h-4 w-4" />
                    Network
                  </h4>
                </div>
                <div className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    testResults.network 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {getStatusIcon(testResults.network)}
                    {testResults.network ? 'Connected' : 'Failed'}
                  </span>
                </div>
              </div>

              {/* Firebase Auth Status */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-3 border-b border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Authentication
                  </h4>
                </div>
                <div className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    testResults.firebase.auth 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {getStatusIcon(testResults.firebase.auth)}
                    {testResults.firebase.auth ? 'Connected' : 'Failed'}
                  </span>
                </div>
              </div>

              {/* Firestore Status */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-3 border-b border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    Firestore
                  </h4>
                </div>
                <div className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    testResults.firebase.firestore 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {getStatusIcon(testResults.firebase.firestore)}
                    {testResults.firebase.firestore ? 'Connected' : 'Failed'}
                  </span>
                </div>
              </div>
            </div>

            {/* Error Details */}
            {testResults.firebase.errors.length > 0 && (
              <div className="bg-white shadow rounded-lg border border-red-200">
                <div className="px-4 py-3 border-b border-red-200">
                  <h4 className="text-sm font-medium text-red-600 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Error Details
                  </h4>
                </div>
                <div className="px-4 py-3">
                  <ul className="space-y-1 text-sm">
                    {testResults.firebase.errors.map((error, index) => (
                      <li key={index} className="text-red-600">
                        • {error}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg">
          <div className="px-4 py-3 border-b border-blue-200">
            <h4 className="text-sm font-medium text-blue-800">Instructions</h4>
          </div>
          <div className="px-4 py-3 text-sm text-blue-700">
            <ul className="space-y-1">
              <li>• Click "Run All Tests" to perform a comprehensive connectivity check</li>
              <li>• Use individual test buttons to diagnose specific services</li>
              <li>• Check the browser console for detailed logs</li>
              <li>• If tests fail, verify your Firebase configuration and internet connection</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FirebaseTestPanel;