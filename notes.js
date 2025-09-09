// Notes Page JavaScript Functionality

class NotesManager {
    constructor() {
        this.notes = this.loadNotes();
        this.currentNoteId = null;
        this.isEditing = false;
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // New note button
        const newNoteBtn = document.getElementById('newNoteBtn');
        if (newNoteBtn) {
            newNoteBtn.addEventListener('click', () => this.createNewNote());
        }

        // Color palette event listeners
        this.setupColorPalettes();
        
        // Close modal on outside click
        const modal = document.getElementById('noteEditorModal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeNoteEditor();
                }
            });
        }

        // Auto-save functionality
        const noteEditor = document.getElementById('noteEditor');
        if (noteEditor) {
            const debouncedAutoSave = this.debounce(this.autoSave.bind(this), 1000);
            noteEditor.addEventListener('input', debouncedAutoSave);
        }
    }

    setupColorPalettes() {
        // Highlight palette
        const highlightOptions = document.querySelectorAll('#highlightPalette .color-option');
        highlightOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                const color = e.target.dataset.color;
                this.applyHighlight(color);
                this.closeColorPalettes();
            });
        });

        // Text color palette
        const textColorOptions = document.querySelectorAll('#textColorPalette .color-option');
        textColorOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                const color = e.target.dataset.color;
                this.applyTextColor(color);
                this.closeColorPalettes();
            });
        });

        // Close palettes when clicking elsewhere
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.toolbar-group')) {
                this.closeColorPalettes();
            }
        });
    }

    loadNotes() {
        const savedNotes = localStorage.getItem('lexio_notes');
        return savedNotes ? JSON.parse(savedNotes) : this.getDefaultNotes();
    }

    saveNotes() {
        localStorage.setItem('lexio_notes', JSON.stringify(this.notes));
    }

    getDefaultNotes() {
        return {
            'note1': {
                id: 'note1',
                title: 'Mathematics - Calculus',
                content: '<p>Integration by parts and substitution methods for solving complex integrals...</p><p><strong>Key Concepts:</strong></p><ul><li>Integration by parts: ∫u dv = uv - ∫v du</li><li>Substitution method for composite functions</li><li>Trigonometric substitutions</li></ul>',
                tags: ['Math', 'Calculus'],
                createdAt: Date.now() - 2 * 60 * 60 * 1000, // 2 hours ago
                updatedAt: Date.now() - 2 * 60 * 60 * 1000
            },
            'note2': {
                id: 'note2',
                title: 'Physics - Quantum Mechanics',
                content: '<p>Schrödinger equation and wave functions in quantum systems...</p><p><span class="highlight" style="background-color: #ffeb3b;">Wave-particle duality</span> is fundamental to quantum mechanics.</p>',
                tags: ['Physics', 'Quantum'],
                createdAt: Date.now() - 24 * 60 * 60 * 1000, // Yesterday
                updatedAt: Date.now() - 24 * 60 * 60 * 1000
            },
            'note3': {
                id: 'note3',
                title: 'Chemistry - Organic Compounds',
                content: '<p>Benzene ring structures and reactions in organic chemistry...</p><p><u>Important reactions:</u></p><ol><li>Electrophilic aromatic substitution</li><li>Nucleophilic addition</li></ol>',
                tags: ['Chemistry', 'Organic'],
                createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2 days ago
                updatedAt: Date.now() - 2 * 24 * 60 * 60 * 1000
            }
        };
    }

    createNewNote() {
        const noteId = 'note_' + Date.now();
        const newNote = {
            id: noteId,
            title: '',
            content: '',
            tags: [],
            createdAt: Date.now(),
            updatedAt: Date.now()
        };
        
        this.notes[noteId] = newNote;
        this.openNoteEditor(noteId, true);
    }

    openNoteEditor(noteId, isNew = false) {
        this.currentNoteId = noteId;
        this.isEditing = true;
        
        const note = this.notes[noteId];
        const modal = document.getElementById('noteEditorModal');
        const titleInput = document.getElementById('noteTitleInput');
        const editor = document.getElementById('noteEditor');
        
        if (modal && titleInput && editor) {
            titleInput.value = note.title;
            editor.innerHTML = note.content;
            modal.classList.add('active');
            
            if (isNew) {
                titleInput.focus();
            }
        }
    }

    closeNoteEditor() {
        const modal = document.getElementById('noteEditorModal');
        if (modal) {
            modal.classList.remove('active');
        }
        
        this.currentNoteId = null;
        this.isEditing = false;
        this.closeColorPalettes();
    }

    saveNote() {
        if (!this.currentNoteId) return;
        
        const titleInput = document.getElementById('noteTitleInput');
        const editor = document.getElementById('noteEditor');
        
        if (titleInput && editor) {
            const note = this.notes[this.currentNoteId];
            note.title = titleInput.value.trim() || 'Untitled Note';
            note.content = editor.innerHTML;
            note.updatedAt = Date.now();
            
            this.saveNotes();
            this.renderNotes();
            this.closeNoteEditor();
            
            // Show success message
            this.showMessage('Note saved successfully!', 'success');
        }
    }

    autoSave() {
        if (!this.currentNoteId || !this.isEditing) return;
        
        const titleInput = document.getElementById('noteTitleInput');
        const editor = document.getElementById('noteEditor');
        
        if (titleInput && editor) {
            const note = this.notes[this.currentNoteId];
            note.title = titleInput.value.trim() || 'Untitled Note';
            note.content = editor.innerHTML;
            note.updatedAt = Date.now();
            
            this.saveNotes();
        }
    }

    deleteNote(noteId) {
        if (confirm('Are you sure you want to delete this note?')) {
            delete this.notes[noteId];
            this.saveNotes();
            this.renderNotes();
            this.showMessage('Note deleted successfully!', 'success');
        }
    }

    formatText(command, value = null) {
        document.execCommand(command, false, value);
        
        // Update button states
        this.updateFormatButtonStates();
    }

    applyHighlight(color) {
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const span = document.createElement('span');
            span.className = 'highlight';
            span.style.backgroundColor = color;
            
            try {
                range.surroundContents(span);
            } catch (e) {
                // If surrounding fails, use execCommand
                document.execCommand('hiliteColor', false, color);
            }
        }
    }

    applyTextColor(color) {
        document.execCommand('foreColor', false, color);
    }

    toggleHighlightPalette() {
        const palette = document.getElementById('highlightPalette');
        const textPalette = document.getElementById('textColorPalette');
        
        if (palette) {
            palette.classList.toggle('active');
            if (textPalette) textPalette.classList.remove('active');
        }
    }

    toggleColorPalette() {
        const palette = document.getElementById('textColorPalette');
        const highlightPalette = document.getElementById('highlightPalette');
        
        if (palette) {
            palette.classList.toggle('active');
            if (highlightPalette) highlightPalette.classList.remove('active');
        }
    }

    closeColorPalettes() {
        const highlightPalette = document.getElementById('highlightPalette');
        const textPalette = document.getElementById('textColorPalette');
        
        if (highlightPalette) highlightPalette.classList.remove('active');
        if (textPalette) textPalette.classList.remove('active');
    }

    updateFormatButtonStates() {
        const commands = ['bold', 'italic', 'underline'];
        commands.forEach(command => {
            const button = document.querySelector(`[onclick="formatText('${command}')"]`);
            if (button) {
                if (document.queryCommandState(command)) {
                    button.classList.add('active');
                } else {
                    button.classList.remove('active');
                }
            }
        });
    }

    renderNotes() {
        const notesGrid = document.querySelector('.notes-grid');
        if (!notesGrid) return;
        
        const notesList = Object.values(this.notes).sort((a, b) => b.updatedAt - a.updatedAt);
        
        notesGrid.innerHTML = notesList.map(note => `
            <div class="note-card" onclick="openNote('${note.id}')">
                <div class="note-card-header">
                    <h3>${this.escapeHtml(note.title || 'Untitled Note')}</h3>
                    <div class="note-actions">
                        <button class="note-action-btn" onclick="event.stopPropagation(); editNote('${note.id}')">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" stroke-width="2"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" stroke-width="2"/>
                            </svg>
                        </button>
                        <button class="note-action-btn" onclick="event.stopPropagation(); deleteNote('${note.id}')">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <polyline points="3,6 5,6 21,6" stroke="currentColor" stroke-width="2"/>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" stroke-width="2"/>
                            </svg>
                        </button>
                    </div>
                </div>
                <p class="note-preview">${this.getTextPreview(note.content)}</p>
                <div class="note-meta">
                    <span class="note-date">${this.formatDate(note.updatedAt)}</span>
                    <div class="note-tags">
                        ${note.tags.map(tag => `<span class="tag">${this.escapeHtml(tag)}</span>`).join('')}
                    </div>
                </div>
            </div>
        `).join('');
    }

    getTextPreview(htmlContent) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlContent;
        const text = tempDiv.textContent || tempDiv.innerText || '';
        return this.escapeHtml(text.substring(0, 150) + (text.length > 150 ? '...' : ''));
    }

    formatDate(timestamp) {
        const now = Date.now();
        const diff = now - timestamp;
        
        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        
        if (minutes < 60) {
            return `${minutes} minutes ago`;
        } else if (hours < 24) {
            return `${hours} hours ago`;
        } else if (days === 1) {
            return 'Yesterday';
        } else {
            return `${days} days ago`;
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    debounce(func, wait) {
        let timeout;
        const context = this;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func.apply(context, args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    showMessage(message, type = 'info') {
        // Create message element
        const messageEl = document.createElement('div');
        messageEl.className = `message-alert ${type}`;
        messageEl.textContent = message;
        messageEl.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? 'rgba(76, 175, 80, 0.9)' : 'rgba(244, 67, 54, 0.9)'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 10000;
            font-family: 'Poppins', sans-serif;
            font-weight: 500;
            backdrop-filter: blur(10px);
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        
        document.body.appendChild(messageEl);
        
        // Animate in
        setTimeout(() => {
            messageEl.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            messageEl.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (messageEl.parentNode) {
                    messageEl.parentNode.removeChild(messageEl);
                }
            }, 300);
        }, 3000);
    }
}

// Global functions for HTML onclick handlers
let notesManager;

function openNote(noteId) {
    if (notesManager) {
        notesManager.openNoteEditor(noteId);
    }
}

function editNote(noteId) {
    if (notesManager) {
        notesManager.openNoteEditor(noteId);
    }
}

function deleteNote(noteId) {
    if (notesManager) {
        notesManager.deleteNote(noteId);
    }
}

function saveNote() {
    if (notesManager) {
        notesManager.saveNote();
    }
}

function closeNoteEditor() {
    if (notesManager) {
        notesManager.closeNoteEditor();
    }
}

function formatText(command, value = null) {
    if (notesManager) {
        notesManager.formatText(command, value);
    }
}

function toggleHighlightPalette() {
    if (notesManager) {
        notesManager.toggleHighlightPalette();
    }
}

function toggleColorPalette() {
    if (notesManager) {
        notesManager.toggleColorPalette();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    try {
        notesManager = new NotesManager();
        notesManager.renderNotes();
    } catch (error) {
        console.error('Error initializing notes manager:', error);
        // Fallback: show basic notes grid
        const notesGrid = document.querySelector('.notes-grid');
        if (notesGrid) {
            notesGrid.innerHTML = '<p style="color: white; text-align: center; grid-column: 1/-1;">Loading notes...</p>';
        }
    }
    
    // Initialize sidebar toggle functionality
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    
    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('collapsed');
        });
    }
});
