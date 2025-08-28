import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { templateService, SavedTemplate } from '../services/templateService';
import { CardTemplate } from '../types';
import { Save, Folder, Trash2, Edit3, Clock, Eye } from 'lucide-react';

interface TemplateManagerProps {
  currentTemplate: CardTemplate | null;
  onTemplateLoad: (template: CardTemplate) => void;
}

export const TemplateManager: React.FC<TemplateManagerProps> = ({
  currentTemplate,
  onTemplateLoad
}) => {
  const { currentUser } = useAuth();
  const [savedTemplates, setSavedTemplates] = useState<SavedTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<SavedTemplate | null>(null);

  useEffect(() => {
    if (currentUser) {
      loadUserTemplates();
    }
  }, [currentUser]);

  const loadUserTemplates = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    try {
      const templates = await templateService.getUserTemplates(currentUser.uid);
      setSavedTemplates(templates);
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTemplate = async () => {
    if (!currentTemplate || !currentUser || !templateName.trim()) return;

    setSaving(true);
    try {
      await templateService.saveTemplate(
        currentTemplate,
        currentUser.uid,
        templateDescription
      );
      
      setShowSaveDialog(false);
      setTemplateName('');
      setTemplateDescription('');
      await loadUserTemplates();
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Failed to save template. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleLoadTemplate = (template: SavedTemplate) => {
    // Convert SavedTemplate back to CardTemplate by removing database-specific fields
    const { userId, createdAt, updatedAt, isPublic, description, ...cardTemplate } = template;
    onTemplateLoad(cardTemplate);
    setSelectedTemplate(null);
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!currentUser) return;
    
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      await templateService.deleteTemplate(templateId, currentUser.uid);
      await loadUserTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      alert('Failed to delete template. Please try again.');
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString();
  };

  if (!currentUser) {
    return (
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
        <Folder className="h-12 w-12 text-blue-400 mx-auto mb-3" />
        <p className="text-blue-800 font-medium">Sign in to save and manage templates</p>
        <p className="text-blue-600 text-sm mt-1">
          Create an account to save your custom templates and access them from any device.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Save Current Template */}
      {currentTemplate && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-green-800">Current Template</h3>
            <button
              onClick={() => setShowSaveDialog(true)}
              className="flex items-center gap-2 px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
            >
              <Save className="h-4 w-4" />
              Save Template
            </button>
          </div>
          <p className="text-sm text-green-600">
            {currentTemplate.name || 'Untitled Template'} - {currentTemplate.width}x{currentTemplate.height}px
          </p>
        </div>
      )}

      {/* Saved Templates List */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Folder className="h-5 w-5 text-gray-500" />
            <h3 className="text-lg font-medium text-gray-900">My Templates</h3>
            {loading && <div className="ml-2 text-sm text-gray-500">Loading...</div>}
          </div>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {savedTemplates.length === 0 ? (
            <div className="p-6 text-center">
              <Folder className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No saved templates yet</p>
              <p className="text-sm text-gray-400 mt-1">
                Create and save templates to access them later
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {savedTemplates.map((template) => (
                <div key={template.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{template.name}</h4>
                      {template.description && (
                        <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span>{template.width}x{template.height}px</span>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(template.updatedAt)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => handleLoadTemplate(template)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        title="Load Template"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteTemplate(template.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        title="Delete Template"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Save Template Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Save Template</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Template Name *
                </label>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Employee ID Card Template"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={templateDescription}
                  onChange={(e) => setTemplateDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Optional description for this template"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowSaveDialog(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTemplate}
                disabled={saving || !templateName.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? 'Saving...' : 'Save Template'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};