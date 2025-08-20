
import Head from 'next/head';
import { useState, useEffect } from 'react';
import { Download, Upload, Trash2, Shield } from 'lucide-react';
import { getDB } from '@/lib/idb';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    timeFormat: 'AMPM',
    locale: 'en-IN',
    encryptBackup: false,
    autoBackupDays: 7
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const db = await getDB();
      const savedSettings = await db.get('settings', 'main');
      if (savedSettings) {
        setSettings(savedSettings);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const saveSettings = async (newSettings: typeof settings) => {
    try {
      const db = await getDB();
      await db.put('settings', newSettings, 'main');
      setSettings(newSettings);
      toast.success('Settings saved!');
    } catch (error) {
      toast.error('Failed to save settings');
    }
  };

  const exportAllData = async () => {
    try {
      const db = await getDB();
      const sessions = await db.getAll('sessions');
      const projects = await db.getAll('projects');
      
      const exportData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        sessions,
        projects,
        settings
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `time-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      toast.success('Data exported successfully!');
    } catch (error) {
      toast.error('Failed to export data');
    }
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const importData = JSON.parse(e.target?.result as string);
        
        // Basic validation
        if (!importData.sessions || !Array.isArray(importData.sessions)) {
          throw new Error('Invalid file format');
        }

        const db = await getDB();
        const tx = db.transaction(['sessions', 'projects', 'settings'], 'readwrite');
        
        // Import sessions
        for (const session of importData.sessions) {
          await tx.objectStore('sessions').put(session);
        }
        
        // Import projects if present
        if (importData.projects) {
          for (const project of importData.projects) {
            await tx.objectStore('projects').put(project);
          }
        }
        
        await tx.done;
        toast.success(`Imported ${importData.sessions.length} sessions!`);
        
      } catch (error) {
        toast.error('Failed to import data. Please check file format.');
      }
    };
    
    reader.readAsText(file);
    event.target.value = ''; // Reset input
  };

  const clearAllData = async () => {
    if (!confirm('⚠️ This will delete ALL your time tracking data. This cannot be undone.\n\nAre you absolutely sure?')) {
      return;
    }

    if (!confirm('Last chance! This will permanently delete everything. Continue?')) {
      return;
    }

    try {
      const db = await getDB();
      const tx = db.transaction(['sessions', 'projects', 'audit_log'], 'readwrite');
      
      await tx.objectStore('sessions').clear();
      await tx.objectStore('projects').clear();
      await tx.objectStore('audit_log').clear();
      
      await tx.done;
      toast.success('All data cleared');
    } catch (error) {
      toast.error('Failed to clear data');
    }
  };

  return (
    <>
      <Head>
        <title>Settings - Time Tracker</title>
      </Head>

      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

        {/* Data Management */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Shield size={20} />
            Data Management
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Export Data</div>
                <div className="text-sm text-gray-600">Download all your data as JSON</div>
              </div>
              <button
                onClick={exportAllData}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Download size={16} />
                Export
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Import Data</div>
                <div className="text-sm text-gray-600">Upload JSON backup file</div>
              </div>
              <label className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors cursor-pointer">
                <Upload size={16} />
                Import
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileImport}
                  className="hidden"
                />
              </label>
            </div>

            <hr className="my-4" />

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-red-600">Clear All Data</div>
                <div className="text-sm text-gray-600">Permanently delete everything</div>
              </div>
              <button
                onClick={clearAllData}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                <Trash2 size={16} />
                Clear All
              </button>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Preferences</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Time Format</div>
                <div className="text-sm text-gray-600">How times are displayed</div>
              </div>
              <select
                value={settings.timeFormat}
                onChange={(e) => saveSettings({ ...settings, timeFormat: e.target.value as 'AMPM' })}
                className="border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="AMPM">12-hour (AM/PM)</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Locale</div>
                <div className="text-sm text-gray-600">Language and region</div>
              </div>
              <select
                value={settings.locale}
                onChange={(e) => saveSettings({ ...settings, locale: e.target.value })}
                className="border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="en-IN">English (India)</option>
                <option value="en-US">English (US)</option>
                <option value="hi-IN">Hindi (India)</option>
              </select>
            </div>
          </div>
        </div>

        {/* App Info */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">About</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <div>Version: 1.0.0</div>
            <div>Storage: IndexedDB (Local)</div>
            <div>Privacy: All data stays on your device</div>
          </div>
        </div>
      </div>
    </>
  );
}
