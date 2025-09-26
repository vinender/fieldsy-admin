import { useState } from 'react';
import axios from 'axios';

export default function TestLogin() {
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>('');

  const testLogin = async () => {
    try {
      setError('');
      setResult(null);
      
      const response = await axios.post('http://localhost:5000/api/admin/login', {
        email: 'admin@fieldsy.com',
        password: 'admin123'
      });
      
      setResult(response.data);
      
      // Test storing token
      if (response.data.token) {
        localStorage.setItem('adminToken', response.data.token);
        console.log('Token stored successfully');
      }
      
    } catch (err: any) {
      setError(err.response?.data?.error || err.message);
      console.error('Login failed:', err.response?.data || err.message);
    }
  };

  const testVerify = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        setError('No token found in localStorage');
        return;
      }
      
      const response = await axios.get('http://localhost:5000/api/admin/verify', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setResult(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Admin Login Test</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-4">
          <h2 className="text-lg font-semibold mb-4">Test Credentials</h2>
          <p>Email: admin@fieldsy.com</p>
          <p>Password: admin123</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 mb-4">
          <div className="flex gap-4 mb-4">
            <button
              onClick={testLogin}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Test Login
            </button>
            <button
              onClick={testVerify}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Test Verify
            </button>
            <button
              onClick={() => {
                localStorage.removeItem('adminToken');
                setResult(null);
                setError('Token cleared');
              }}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Clear Token
            </button>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
              <p className="text-red-600">Error: {error}</p>
            </div>
          )}
          
          {result && (
            <div className="bg-green-50 border border-green-200 rounded p-3">
              <p className="text-green-600 font-semibold mb-2">Success!</p>
              <pre className="text-xs overflow-auto">{JSON.stringify(result, null, 2)}</pre>
            </div>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Navigation</h2>
          <div className="flex gap-4">
            <a href="/login" className="text-blue-500 hover:underline">Go to Login Page</a>
            <a href="/dashboard" className="text-blue-500 hover:underline">Go to Dashboard</a>
          </div>
        </div>
      </div>
    </div>
  );
}