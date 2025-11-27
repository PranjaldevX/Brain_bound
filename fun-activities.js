/**
 * FunActivities Compatibility Layer
 *
 * Some older code or integrations expected a global `FunActivities` function/object
 * that provided a few helper methods (mini-games, safari, customization). Recent
 * refactors split these into `SimpleMiniGames`, `SimpleSafariMode`, and
 * `SimpleCustomization`. This file restores the commonly-expected API and
 * exposes a few backward-compatible global helpers.
 */

(function (window) {
    const FunActivities = {
        // Opens the activities menu (mini-games)
        showMenu() {
            if (typeof SimpleMiniGames !== 'undefined' && typeof SimpleMiniGames.showMenu === 'function') {
                SimpleMiniGames.showMenu();
            } else {
                console.warn('SimpleMiniGames.showMenu not available');
            }
        },

        // Alias: opens mini-games
        openMiniGames() {
            return this.showMenu();
        },

        // Start safari mode (default to photo)
        startSafari(mode = 'photo') {
            if (typeof SimpleSafariMode !== 'undefined' && typeof SimpleSafariMode.start === 'function') {
                SimpleSafariMode.start(mode);
            } else {
                console.warn('SimpleSafariMode.start not available');
            }
        },

        // Open customization menu
        startCustomization() {
            if (typeof SimpleCustomization !== 'undefined' && typeof SimpleCustomization.showMenu === 'function') {
                SimpleCustomization.showMenu();
            } else {
                console.warn('SimpleCustomization.showMenu not available');
            }
        },

        // Initialize and add a few backward-compatible globals
        init() {
            // Attach to window for old call sites
            try {
                window.FunActivities = this;
                window.showFunActivities = this.showMenu.bind(this);
                window.openMiniGames = this.openMiniGames.bind(this);
                window.startSafariMode = this.startSafari.bind(this);
                window.openCustomization = this.startCustomization.bind(this);
                console.log('✅ FunActivities compatibility loaded');

                // Ensure the Activities UI exists and is usable in case older markup was removed
                // This will inject three buttons (Mini-Games, Safari, Customize) into
                // the `.activities-grid` if it looks empty or missing.
                this._ensureActivitiesUI();
            } catch (e) {
                console.warn('Could not attach FunActivities globals', e);
            }
        }
    };

    FunActivities.init();
    /**
     * If the `.activities-grid` area is missing or empty, inject a compatible UI
     * so users still see and can click the Mini-Games / Safari / Customize buttons.
     */
    FunActivities._ensureActivitiesUI = function () {
        try {
            const section = document.querySelector('.activities-section');
            if (!section) return;

            let grid = section.querySelector('.activities-grid');
            if (!grid) {
                grid = document.createElement('div');
                grid.className = 'activities-grid';
                section.appendChild(grid);
            }

            // If there are already 3 or more children, assume UI present
            if (grid.children.length >= 3) return;

            // Helper to create a button
            const createBtn = (icon, label, onClick) => {
                const btn = document.createElement('button');
                btn.className = 'activity-btn';
                btn.style.cssText = 'display:flex;flex-direction:column;align-items:center;justify-content:center;padding:30px 20px;min-height:150px;background:linear-gradient(135deg, rgba(37,42,72,0.9) 0%, rgba(30,33,57,0.9) 100%);border:2px solid rgba(99,102,241,0.3);border-radius:16px;cursor:pointer;transition:all 0.3s ease;box-shadow:0 4px 16px rgba(0,0,0,0.4);';
                btn.innerHTML = `<span class="activity-icon" style="font-size:3.5rem;display:block;line-height:1;margin-bottom:10px;">${icon}</span><span class="activity-label" style="font-size:1.1rem;font-weight:600;color:#F9FAFB;display:block;text-align:center;">${label}</span>`;
                btn.addEventListener('click', onClick);
                return btn;
            };

            // Mini-Games
            grid.appendChild(createBtn('🎮', 'Mini-Games', () => {
                if (typeof SimpleMiniGames !== 'undefined' && typeof SimpleMiniGames.showMenu === 'function') {
                    SimpleMiniGames.showMenu();
                } else {
                    alert('Mini-Games unavailable');
                }
            }));

            // Safari Mode
            grid.appendChild(createBtn('📸', 'Safari Mode', () => {
                if (typeof SimpleSafariMode !== 'undefined' && typeof SimpleSafariMode.start === 'function') {
                    SimpleSafariMode.start('photo');
                } else {
                    alert('Safari Mode unavailable');
                }
            }));

            // Customize
            grid.appendChild(createBtn('🎨', 'Customize', () => {
                if (typeof SimpleCustomization !== 'undefined' && typeof SimpleCustomization.showMenu === 'function') {
                    SimpleCustomization.showMenu();
                } else {
                    alert('Customization unavailable');
                }
            }));

            console.log('ℹ️ Injected Fun Activities UI for compatibility');
        } catch (e) {
            console.warn('Error ensuring activities UI', e);
        }
    };

    // Inject a small diagnostics panel inside the activities section so users
    // can see whether level packs were loaded and what keys are available.
    FunActivities._injectDiagnosticsPanel = function () {
        try {
            const section = document.querySelector('.activities-section');
            if (!section) return;

            // Don't duplicate
            if (document.getElementById('activitiesDiagnostics')) return;

            const panel = document.createElement('div');
            panel.id = 'activitiesDiagnostics';
            panel.style.cssText = 'margin-top:12px;color:#cbd5e1;font-size:0.95rem;text-align:center;';
            panel.innerHTML = `
                <div id="diagStatus">Loading status: <span id="loadStatus">(unknown)</span> • AI: <span id="aiStatus">(unknown)</span></div>
                <div style="margin-top:8px;"><button id="diagRefresh" style="padding:6px 10px;border-radius:8px;border:1px solid #334155;background:#0f172a;color:#fff;cursor:pointer;">Refresh Packs</button> <button id="diagList" style="padding:6px 10px;border-radius:8px;border:1px solid #334155;background:#0f172a;color:#fff;cursor:pointer;">Show Packs</button></div>
                <div id="diagPacks" style="margin-top:8px;color:#94a3b8;"></div>
            `;

            section.appendChild(panel);

            document.getElementById('diagRefresh').addEventListener('click', () => {
                if (typeof loadGameData === 'function') {
                    loadGameData().then(() => {
                        if (typeof updateLoadStatus === 'function') updateLoadStatus();
                        FunActivities._updateDiagPacks();
                    });
                } else {
                    alert('loadGameData not available');
                }
            });

            document.getElementById('diagList').addEventListener('click', () => {
                FunActivities._updateDiagPacks(true);
            });

            // Initial update after short delay to allow game-core to load packs
            setTimeout(() => FunActivities._updateDiagPacks(), 1200);
        } catch (e) {
            console.warn('Could not inject diagnostics panel', e);
        }
    };

    FunActivities._updateDiagPacks = function (showAlert = false) {
        try {
            const packsEl = document.getElementById('diagPacks');
            const loadStatusEl = document.getElementById('loadStatus');
            const aiStatusEl = document.getElementById('aiStatus');

            const keys = (typeof levelPacks !== 'undefined') ? Object.keys(levelPacks) : [];
            if (packsEl) packsEl.textContent = keys.length ? keys.join(', ') : '(none)';
            if (loadStatusEl) loadStatusEl.textContent = `${keys.length} packs loaded`;
            if (aiStatusEl) {
                aiStatusEl.textContent = (typeof AI_CONFIG !== 'undefined' && AI_CONFIG.enabled) ? 'Enabled' : 'Disabled';
            }

            if (showAlert) alert(`Loaded packs: ${keys.length ? keys.join(', ') : '(none)'}`);
        } catch (e) {
            console.warn('Error updating diagnostics', e);
        }
    };

    // Run diagnostics injection on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => FunActivities._injectDiagnosticsPanel());
    } else {
        FunActivities._injectDiagnosticsPanel();
    }

    /*
     * Create safe fallback wrappers for legacy onclick handlers so that
     * `onclick="SimpleMiniGames.showMenu()"` (and similar) never throws
     * even if the original modules are not loaded. These will NOT overwrite
     * existing implementations.
     */
    try {
        // SimpleMiniGames.showMenu fallback
        if (typeof window.SimpleMiniGames === 'undefined' || typeof window.SimpleMiniGames.showMenu !== 'function') {
            window.SimpleMiniGames = window.SimpleMiniGames || {};
            window.SimpleMiniGames.showMenu = function () {
                console.warn('Fallback: SimpleMiniGames.showMenu called but implementation missing');
                if (window.FunActivities && typeof window.FunActivities.showMenu === 'function') {
                    window.FunActivities.showMenu();
                    return;
                }
                alert('Mini-Games are currently unavailable. Please refresh or check your installation.');
            };
        }

        // SimpleSafariMode.start fallback
        if (typeof window.SimpleSafariMode === 'undefined' || typeof window.SimpleSafariMode.start !== 'function') {
            window.SimpleSafariMode = window.SimpleSafariMode || {};
            window.SimpleSafariMode.start = function (mode) {
                console.warn('Fallback: SimpleSafariMode.start called but implementation missing');
                if (window.FunActivities && typeof window.FunActivities.startSafari === 'function') {
                    window.FunActivities.startSafari(mode || 'photo');
                    return;
                }
                alert('Safari Mode is currently unavailable. Please refresh or check your installation.');
            };
        }

        // SimpleCustomization.showMenu fallback
        if (typeof window.SimpleCustomization === 'undefined' || typeof window.SimpleCustomization.showMenu !== 'function') {
            window.SimpleCustomization = window.SimpleCustomization || {};
            window.SimpleCustomization.showMenu = function () {
                console.warn('Fallback: SimpleCustomization.showMenu called but implementation missing');
                if (window.FunActivities && typeof window.FunActivities.startCustomization === 'function') {
                    window.FunActivities.startCustomization();
                    return;
                }
                alert('Customization is currently unavailable. Please refresh or check your installation.');
            };
        }

        // Small availability log
        console.log('ℹ️ Activity wrappers: MiniGames=', typeof window.SimpleMiniGames.showMenu === 'function', 'Safari=', typeof window.SimpleSafariMode.start === 'function', 'Customization=', typeof window.SimpleCustomization.showMenu === 'function');
    } catch (e) {
        console.warn('Error setting up fallback wrappers for activity functions', e);
    }

})(window);
