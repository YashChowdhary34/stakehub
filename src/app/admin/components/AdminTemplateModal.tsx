"use client";

import React, { useState, useEffect } from "react";
import { X, Plus, Trash2, MessageSquare, Edit3, Check } from "lucide-react";

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendTemplate: (template: string) => void; // Changed from onSelectTemplate
}

interface Template {
  id: string;
  text: string;
  isEditing?: boolean;
}

const TemplateModal: React.FC<TemplateModalProps> = ({
  isOpen,
  onClose,
  onSendTemplate, // Changed from onSelectTemplate
}) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newTemplate, setNewTemplate] = useState("");
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [error, setError] = useState("");
  const [sendingTemplate, setSendingTemplate] = useState<string | null>(null); // New state for tracking sending

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      fetchTemplates();
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const fetchTemplates = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch("/api/template/admin");
      if (!response.ok) {
        throw new Error("Failed to fetch templates");
      }
      const data = await response.json();
      const templatesWithIds = data.templates.map(
        (text: string, index: number) => ({
          id: `template-${index}`,
          text,
        })
      );
      setTemplates(templatesWithIds);
    } catch (err) {
      setError("Failed to load templates");
      console.error("Error fetching templates:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTemplate = async () => {
    if (!newTemplate.trim()) return;

    try {
      const response = await fetch("/api/template/admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "add",
          template: newTemplate.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add template");
      }

      setNewTemplate("");
      setIsAddingNew(false);
      fetchTemplates();
    } catch (err) {
      setError("Failed to add template");
      console.error("Error adding template:", err);
    }
  };

  const handleEditTemplate = async (templateId: string) => {
    if (!editText.trim()) return;

    try {
      const templateIndex = parseInt(templateId.split("-")[1]);
      const response = await fetch("/api/template/admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "edit",
          index: templateIndex,
          template: editText.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to edit template");
      }

      setEditingTemplate(null);
      setEditText("");
      fetchTemplates();
    } catch (err) {
      setError("Failed to edit template");
      console.error("Error editing template:", err);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    try {
      const templateIndex = parseInt(templateId.split("-")[1]);
      const response = await fetch("/api/template/admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "delete",
          index: templateIndex,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete template");
      }

      fetchTemplates();
    } catch (err) {
      setError("Failed to delete template");
      console.error("Error deleting template:", err);
    }
  };

  const handleSendTemplate = async (template: string) => {
    setSendingTemplate(template);
    try {
      await onSendTemplate(template);
      onClose();
    } catch (err) {
      console.error("Error sending template:", err);
      setError("Failed to send template");
    } finally {
      setSendingTemplate(null);
    }
  };

  const handleClose = () => {
    if (!isLoading && !sendingTemplate) {
      setIsAddingNew(false);
      setNewTemplate("");
      setEditingTemplate(null);
      setEditText("");
      setError("");
      onClose();
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const startEditing = (template: Template) => {
    setEditingTemplate(template.id);
    setEditText(template.text);
  };

  const cancelEditing = () => {
    setEditingTemplate(null);
    setEditText("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={handleBackdropClick}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-2xl mx-4 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-400/10 border border-yellow-400/20">
              <MessageSquare className="h-5 w-5 text-yellow-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-zinc-100">
                Message Templates
              </h2>
              <p className="text-sm text-zinc-400">
                Click any template to send it instantly
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isLoading || !!sendingTemplate}
            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="h-5 w-5 text-zinc-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {error && (
            <div className="mx-6 mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Templates List */}
          <div className="flex-1 overflow-y-auto p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
              </div>
            ) : (
              <div className="space-y-3">
                {templates.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800/50 mx-auto">
                      <MessageSquare className="h-8 w-8 text-zinc-500" />
                    </div>
                    <h3 className="text-lg font-medium text-zinc-300 mb-2">
                      No templates yet
                    </h3>
                    <p className="text-sm text-zinc-500">
                      Create your first template to get started
                    </p>
                  </div>
                ) : (
                  templates.map((template) => (
                    <div
                      key={template.id}
                      className="group p-4 bg-zinc-800/50 border border-zinc-700 rounded-lg hover:bg-zinc-800/70 transition-colors"
                    >
                      {editingTemplate === template.id ? (
                        <div className="space-y-3">
                          <textarea
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-600 rounded-lg text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/20 focus:border-yellow-400/50 resize-none"
                            rows={3}
                            placeholder="Enter template text..."
                          />
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleEditTemplate(template.id)}
                              disabled={!editText.trim()}
                              className="flex items-center space-x-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:bg-zinc-700 disabled:cursor-not-allowed rounded-md text-xs font-medium text-white transition-colors"
                            >
                              <Check className="h-3 w-3" />
                              <span>Save</span>
                            </button>
                            <button
                              onClick={cancelEditing}
                              className="flex items-center space-x-1 px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 rounded-md text-xs font-medium text-zinc-300 transition-colors"
                            >
                              <X className="h-3 w-3" />
                              <span>Cancel</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start justify-between">
                          <div
                            className="flex-1 cursor-pointer"
                            onClick={() => handleSendTemplate(template.text)}
                          >
                            <div className="flex items-start space-x-3">
                              {sendingTemplate === template.text && (
                                <div className="mt-1">
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-400"></div>
                                </div>
                              )}
                              <p
                                className={`text-sm text-zinc-200 leading-relaxed ${
                                  sendingTemplate === template.text
                                    ? "opacity-50"
                                    : ""
                                }`}
                              >
                                {template.text}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1 ml-3 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => startEditing(template)}
                              disabled={!!sendingTemplate}
                              className="p-1.5 hover:bg-zinc-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Edit template"
                            >
                              <Edit3 className="h-3 w-3 text-zinc-400" />
                            </button>
                            <button
                              onClick={() => handleDeleteTemplate(template.id)}
                              disabled={!!sendingTemplate}
                              className="p-1.5 hover:bg-zinc-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Delete template"
                            >
                              <Trash2 className="h-3 w-3 text-red-400" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}

                {/* Add New Template */}
                {isAddingNew ? (
                  <div className="p-4 bg-zinc-800/50 border border-zinc-700 rounded-lg">
                    <div className="space-y-3">
                      <textarea
                        value={newTemplate}
                        onChange={(e) => setNewTemplate(e.target.value)}
                        className="w-full px-3 py-2 bg-zinc-800 border border-zinc-600 rounded-lg text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/20 focus:border-yellow-400/50 resize-none"
                        rows={3}
                        placeholder="Enter new template text..."
                        autoFocus
                      />
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={handleAddTemplate}
                          disabled={!newTemplate.trim()}
                          className="flex items-center space-x-1 px-3 py-1.5 bg-yellow-500 hover:bg-yellow-600 disabled:bg-zinc-700 disabled:cursor-not-allowed rounded-md text-xs font-medium text-zinc-900 transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                          <span>Add Template</span>
                        </button>
                        <button
                          onClick={() => {
                            setIsAddingNew(false);
                            setNewTemplate("");
                          }}
                          className="flex items-center space-x-1 px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 rounded-md text-xs font-medium text-zinc-300 transition-colors"
                        >
                          <X className="h-3 w-3" />
                          <span>Cancel</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsAddingNew(true)}
                    disabled={!!sendingTemplate}
                    className="w-full p-4 border-2 border-dashed border-zinc-700 rounded-lg hover:border-zinc-600 hover:bg-zinc-800/30 transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center justify-center space-x-2 text-zinc-500 group-hover:text-zinc-400">
                      <Plus className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        Add New Template
                      </span>
                    </div>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-zinc-800">
          <div className="flex items-center justify-between">
            <p className="text-xs text-zinc-500">
              Click on any template to send it instantly
            </p>
            <button
              onClick={handleClose}
              disabled={isLoading || !!sendingTemplate}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg transition-colors text-zinc-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateModal;
