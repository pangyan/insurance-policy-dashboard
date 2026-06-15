import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:8080/api/policies';
const MOCK_STORAGE_KEY = 'policy-dashboard-mock-policies';
const INITIAL_MOCK_POLICIES = [
  { id: 1, policyNumber: 'P-1001', holderName: 'Alice Tan', type: 'Health', premium: '180' },
  { id: 2, policyNumber: 'P-1002', holderName: 'Ben Wong', type: 'Motor', premium: '95' },
  { id: 3, policyNumber: 'P-1003', holderName: 'Chris Lim', type: 'Travel', premium: '45' }
];

function loadMockPolicies() {
  const raw = localStorage.getItem(MOCK_STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(INITIAL_MOCK_POLICIES));
    return INITIAL_MOCK_POLICIES;
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_MOCK_POLICIES;
  } catch {
    localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(INITIAL_MOCK_POLICIES));
    return INITIAL_MOCK_POLICIES;
  }
}

function saveMockPolicies(nextPolicies) {
  localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(nextPolicies));
}

function PolicyDashboard() {
  const [policies, setPolicies] = useState([]);
  const [form, setForm] = useState({ policyNumber: '', holderName: '', type: '', premium: '' });
  const [editingId, setEditingId] = useState(null);
  const [useMockMode, setUseMockMode] = useState(false);

  useEffect(() => { fetchPolicies(); }, []);

  const fetchPolicies = async () => {
    if (useMockMode) {
      setPolicies(loadMockPolicies());
      return;
    }

    try {
      const res = await axios.get(API_URL);
      setPolicies(res.data);
    } catch (error) {
      console.warn('API unavailable, switching to mock mode.', error);
      setUseMockMode(true);
      setPolicies(loadMockPolicies());
    }
  };

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const switchToMockMode = () => {
    setUseMockMode(true);
    setEditingId(null);
    setPolicies(loadMockPolicies());
  };

  const switchToLiveMode = async () => {
    try {
      const res = await axios.get(API_URL);
      setUseMockMode(false);
      setEditingId(null);
      setPolicies(res.data);
    } catch (error) {
      console.warn('Unable to reach API, staying in mock mode.', error);
      setUseMockMode(true);
      setPolicies(loadMockPolicies());
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (useMockMode) {
      const current = loadMockPolicies();
      let next;

      if (editingId) {
        next = current.map(policy => (policy.id === editingId ? { ...policy, ...form, id: editingId } : policy));
        setEditingId(null);
      } else {
        const maxId = current.reduce((max, policy) => Math.max(max, Number(policy.id) || 0), 0);
        next = [...current, { ...form, id: maxId + 1 }];
      }

      saveMockPolicies(next);
      setPolicies(next);
    } else {
      if (editingId) {
        await axios.put(`${API_URL}/${editingId}`, form);
        setEditingId(null);
      } else {
        await axios.post(API_URL, form);
      }
      fetchPolicies();
    }

    setForm({ policyNumber: '', holderName: '', type: '', premium: '' });
  };

  const handleEdit = policy => {
    setForm(policy);
    setEditingId(policy.id);
  };

  const handleDelete = async id => {
    if (useMockMode) {
      const next = loadMockPolicies().filter(policy => policy.id !== id);
      saveMockPolicies(next);
      setPolicies(next);
      return;
    }

    await axios.delete(`${API_URL}/${id}`);
    fetchPolicies();
  };

  return (
    <div>
      <h2>Insurance Policy Dashboard</h2>
      <div>
        <button type="button" onClick={switchToLiveMode}>
          Use Live API
        </button>
        <button type="button" onClick={switchToMockMode}>
          Use Mock Data
        </button>
      </div>
      {useMockMode ? (
        <p>Mock mode is active. Data is loaded from browser storage.</p>
      ) : (
        <p>Live mode is active. Data is loaded from API.</p>
      )}
      <form onSubmit={handleSubmit}>
        <input name="policyNumber" placeholder="Policy Number" value={form.policyNumber} onChange={handleChange} required />
        <input name="holderName" placeholder="Holder Name" value={form.holderName} onChange={handleChange} required />
        <input name="type" placeholder="Type" value={form.type} onChange={handleChange} required />
        <input name="premium" placeholder="Premium" value={form.premium} onChange={handleChange} required />
        <button type="submit">{editingId ? 'Update' : 'Create'}</button>
      </form>
      <ul>
        {policies.map(policy => (
          <li key={policy.id}>
            {policy.policyNumber} | {policy.holderName} | {policy.type} | ${policy.premium}
            <button onClick={() => handleEdit(policy)}>Edit</button>
            <button onClick={() => handleDelete(policy.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default PolicyDashboard;
