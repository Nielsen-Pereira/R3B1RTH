/**
 * Mods Manager Component - R3B-88 to R3B-94
 * UI for managing ReBirth RB-338 Mods
 */

import React, { useState, useCallback, useEffect } from 'react';
import { useMods } from '../hooks/useMods';
import type { Mod } from '../types/mods';
import './ModsManager.css';

interface ModsManagerProps {
  onModActivated?: (mod: Mod) => void;
  onModCreated?: (mod: Mod) => void;
  onModDeleted?: (modId: string) => void;
}

export const ModsManager: React.FC<ModsManagerProps> = ({
  onModActivated,
  onModCreated,
  onModDeleted,
}) => {
  const {
    mods,
    currentModId,
    currentMod,
    isLoading,
    error,
    loadMods,
    activateMod,
    deactivateMod,
    addMod,
    deleteMod,
    getNonStandardMods,
  } = useMods();

  const [isOpen, setIsOpen] = useState(false);
  const [showNewModForm, setShowNewModForm] = useState(false);
  const [newModName, setNewModName] = useState('');
  const [newModDescription, setNewModDescription] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<ModId | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadMods();
    }
  }, [isOpen, loadMods]);

  const handleOpen = useCallback(() => {
    setIsOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setShowNewModForm(false);
    setConfirmDelete(null);
  }, []);

  const handleActivateMod = useCallback((mod: Mod) => {
    activateMod(mod.id);
    onModActivated?.(mod);
  }, [activateMod, onModActivated]);

  const handleDeactivateMod = useCallback(() => {
    deactivateMod();
  }, [deactivateMod]);

  const handleNewMod = useCallback(() => {
    setShowNewModForm(true);
    setNewModName('');
    setNewModDescription('');
  }, []);

  const handleCreateMod = useCallback(async () => {
    if (!newModName.trim()) return;

    const newMod = await addMod({
      name: newModName.trim(),
      description: newModDescription.trim(),
      version: '1.0.0',
      sections: [],
      isStandard: false,
    });

    onModCreated?.(newMod);
    setShowNewModForm(false);
    setNewModName('');
    setNewModDescription('');
  }, [newModName, newModDescription, addMod, onModCreated]);

  const handleDeleteMod = useCallback(async (modId: ModId) => {
    if (confirmDelete !== modId) {
      setConfirmDelete(modId);
      return;
    }

    const success = await deleteMod(modId);
    if (success) {
      onModDeleted?.(modId);
      setConfirmDelete(null);
    }
  }, [confirmDelete, deleteMod, onModDeleted]);

  const handleCancelDelete = useCallback(() => {
    setConfirmDelete(null);
  }, []);

  if (!isOpen) {
    return null;
  }

  const nonStandardMods = getNonStandardMods();

  return (
    <div className="mods-manager-overlay" onClick={handleClose}>
      <div className="mods-manager" onClick={(e) => e.stopPropagation()}>
        <div className="mods-manager-header">
          <h2>Mods Manager</h2>
          <button className="close-button" onClick={handleClose}>
            &times;
          </button>
        </div>

        <div className="mods-manager-content">
          {error && (
            <div className="mods-error">{error}</div>
          )}

          <div className="mods-info">
            <p>
              Mods allow you to customize the control layout and appearance of ReBirth RB-338.
              The standard mod provides the default ReBirth experience.
            </p>
          </div>

          <div className="current-mod">
            <h3>Current Mod</h3>
            {currentMod && (
              <div className="mod-card active">
                <div className="mod-header">
                  <span className="mod-name">{currentMod.name}</span>
                  {currentMod.isStandard && (
                    <span className="mod-badge standard">Standard</span>
                  )}
                </div>
                <div className="mod-description">{currentMod.description}</div>
                <div className="mod-meta">
                  <span>Version: {currentMod.version}</span>
                  {currentMod.author && (
                    <span> | Author: {currentMod.author}</span>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="available-mods">
            <h3>Available Mods</h3>
            <div className="mods-list">
              {mods.map((mod) => (
                <div
                  key={mod.id}
                  className={"mod-card" + (mod.id === currentModId ? " active" : "")}
                  onClick={() => handleActivateMod(mod)}
                >
                  <div className="mod-header">
                    <span className="mod-name">{mod.name}</span>
                    {mod.isStandard ? (
                      <span className="mod-badge standard">Standard</span>
                    ) : (
                      <button
                        className="mod-delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteMod(mod.id);
                        }}
                        disabled={mod.isStandard}
                      >
                        &times;
                      </button>
                    )}
                  </div>
                  <div className="mod-description">{mod.description}</div>
                  <div className="mod-meta">
                    <span>v{mod.version}</span>
                    {mod.author && <span> by {mod.author}</span>}
                  </div>
                  
                  {confirmDelete === mod.id && (
                    <div className="delete-confirmation">
                      <p>Delete "{mod.name}"?</p>
                      <div className="confirmation-buttons">
                        <button
                          className="confirm-delete"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteMod(mod.id);
                          }}
                        >
                          Yes
                        </button>
                        <button
                          className="cancel-delete"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCancelDelete();
                          }}
                        >
                          No
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {!showNewModForm ? (
            <button className="mods-action-button new" onClick={handleNewMod}>
              Create New Mod
            </button>
          ) : (
            <div className="new-mod-form">
              <h3>Create New Mod</h3>
              <div className="form-group">
                <label htmlFor="mod-name">Name:</label>
                <input
                  id="mod-name"
                  type="text"
                  value={newModName}
                  onChange={(e) => setNewModName(e.target.value)}
                  placeholder="My Custom Mod"
                />
              </div>
              <div className="form-group">
                <label htmlFor="mod-description">Description:</label>
                <textarea
                  id="mod-description"
                  value={newModDescription}
                  onChange={(e) => setNewModDescription(e.target.value)}
                  placeholder="Custom mod description"
                  rows={3}
                />
              </div>
              <div className="form-actions">
                <button className="create-button" onClick={handleCreateMod}>
                  Create
                </button>
                <button className="cancel-button" onClick={() => setShowNewModForm(false)}>
                  Cancel
                </button>
              </div>
            </div>
          )}

          {isLoading && (
            <div className="mods-loading">Loading mods...</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModsManager;
