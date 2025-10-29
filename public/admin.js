class AdminPanel {
    constructor() {
        this.apiBase = '/api';
        this.isAuthenticated = false;
        this.currentEditingId = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkAuthStatus();
    }

    async loadSiteContent() {
        try {
            const response = await this.apiCall('/site-content');
            this.siteContent = response.data;
            this.renderSiteContentForm();
        } catch (error) {
            console.error('Failed to load site content:', error);
            this.siteContent = this.getDefaultSiteContent();
            this.renderSiteContentForm();
        }
    }

    getDefaultSiteContent() {
        return {
            header: {
                title: "RAO FAMILY DYNASTY",
                subtitle: "Established 1895 • Honoring Our Heritage"
            },
            footer: {
                copyright: "© 2025 Rao Family. All Rights Reserved.",
                tagline: "Preserving our legacy for future generations",
                links: [
                    { text: "Admin Login", url: "/admin" },
                    { text: "Privacy Policy", url: "#" },
                    { text: "Terms of Use", url: "#" }
                ]
            },
            history: {
                title: "Family History",
                introduction: "The Rao family traces its lineage back to the late 19th century, with Nana / Nanha establishing the family dynasty in 1895. Through generations, the family has maintained its traditions while adapting to modern times.",
                achievements: [
                    "Establishment of the family business empire in the early 20th century",
                    "Philanthropic contributions to education and healthcare",
                    "Preservation of family heritage and traditions across generations",
                    "Expansion of family influence across regions"
                ],
                values: "The Rao family is built on principles of integrity, respect for elders, commitment to education, and dedication to community service. These values have been passed down through generations, forming the foundation of the family's enduring legacy.",
                motto: "Honor the past, serve the present, build the future.",
                crestSymbolism: "The crown represents leadership and nobility, while the golden background symbolizes prosperity and the enduring legacy of the family."
            },
            timeline: {
                title: "Family Timeline",
                events: [
                    { year: "1895", description: "Nana / Nanha establishes the Rao family dynasty, laying the foundation for future generations." },
                    { year: "1910", description: "Kabeer (Kabeera) expands family influence in the region and strengthens business connections." },
                    { year: "1940", description: "Mubarak becomes known for philanthropic work and community leadership during challenging times." },
                    { year: "1970", description: "Ashraf Rao modernizes family business ventures while preserving traditional values." },
                    { year: "2000", description: "Muhammad Bin Ashraf Rao becomes head of family enterprises, focusing on global expansion." },
                    { year: "2023", description: "Khizar Bin Muhammad Rao emerges as the next generation leader with interests in technology and sustainability." }
                ]
            },
            stats: {
                years_legacy: "127"
            }
        };
    }

    renderSiteContentForm() {
        // Header
        document.getElementById('siteTitle').value = this.siteContent.header?.title || '';
        document.getElementById('siteSubtitle').value = this.siteContent.header?.subtitle || '';

        // Footer
        document.getElementById('footerCopyright').value = this.siteContent.footer?.copyright || '';
        document.getElementById('footerTagline').value = this.siteContent.footer?.tagline || '';
        this.renderFooterLinks();

        // History
        document.getElementById('historyTitle').value = this.siteContent.history?.title || '';
        document.getElementById('historyIntroduction').value = this.siteContent.history?.introduction || '';
        document.getElementById('historyValues').value = this.siteContent.history?.values || '';
        document.getElementById('historyMotto').value = this.siteContent.history?.motto || '';
        document.getElementById('historyCrest').value = this.siteContent.history?.crestSymbolism || '';
        this.renderAchievements();

        // Timeline
        document.getElementById('timelineTitle').value = this.siteContent.timeline?.title || '';
        this.renderTimelineEvents();

        // Stats
        document.getElementById('yearsLegacy').value = this.siteContent.stats?.years_legacy || '';
    }

    renderFooterLinks() {
        const container = document.getElementById('footerLinksContainer');
        const links = this.siteContent.footer?.links || [];
        
        container.innerHTML = links.map((link, index) => `
            <div class="row mb-2 footer-link-item" data-index="${index}">
                <div class="col-md-5">
                    <input type="text" class="form-control form-control-sm" value="${link.text}" placeholder="Link Text">
                </div>
                <div class="col-md-5">
                    <input type="text" class="form-control form-control-sm" value="${link.url}" placeholder="Link URL">
                </div>
                <div class="col-md-2">
                    <button type="button" class="btn btn-sm btn-outline-danger remove-footer-link">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `).join('');

        this.attachFooterLinkEvents();
    }

    renderAchievements() {
        const container = document.getElementById('achievementsContainer');
        const achievements = this.siteContent.history?.achievements || [];
        
        container.innerHTML = achievements.map((achievement, index) => `
            <div class="input-group mb-2 achievement-item" data-index="${index}">
                <input type="text" class="form-control" value="${achievement}" placeholder="Achievement description">
                <button class="btn btn-outline-danger remove-achievement" type="button">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');

        this.attachAchievementEvents();
    }

    renderTimelineEvents() {
        const container = document.getElementById('timelineEventsContainer');
        const events = this.siteContent.timeline?.events || [];
        
        container.innerHTML = events.map((event, index) => `
            <div class="card mb-3 timeline-event-item" data-index="${index}">
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-3">
                            <input type="text" class="form-control" value="${event.year}" placeholder="Year">
                        </div>
                        <div class="col-md-8">
                            <textarea class="form-control" rows="2" placeholder="Event description">${event.description}</textarea>
                        </div>
                        <div class="col-md-1">
                            <button type="button" class="btn btn-outline-danger remove-timeline-event">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

        this.attachTimelineEventEvents();
    }

    // Add event listeners for dynamic forms
    attachFooterLinkEvents() {
        document.getElementById('addFooterLink').addEventListener('click', () => {
            this.addFooterLink();
        });

        document.querySelectorAll('.remove-footer-link').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const item = e.target.closest('.footer-link-item');
                this.removeFooterLink(parseInt(item.getAttribute('data-index')));
            });
        });
    }

    attachAchievementEvents() {
        document.getElementById('addAchievement').addEventListener('click', () => {
            this.addAchievement();
        });

        document.querySelectorAll('.remove-achievement').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const item = e.target.closest('.achievement-item');
                this.removeAchievement(parseInt(item.getAttribute('data-index')));
            });
        });
    }

    attachTimelineEventEvents() {
        document.getElementById('addTimelineEvent').addEventListener('click', () => {
            this.addTimelineEvent();
        });

        document.querySelectorAll('.remove-timeline-event').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const item = e.target.closest('.timeline-event-item');
                this.removeTimelineEvent(parseInt(item.getAttribute('data-index')));
            });
        });
    }

    // Dynamic form management methods
    addFooterLink() {
        if (!this.siteContent.footer.links) {
            this.siteContent.footer.links = [];
        }
        this.siteContent.footer.links.push({ text: '', url: '' });
        this.renderFooterLinks();
    }

    removeFooterLink(index) {
        this.siteContent.footer.links.splice(index, 1);
        this.renderFooterLinks();
    }

    addAchievement() {
        if (!this.siteContent.history.achievements) {
            this.siteContent.history.achievements = [];
        }
        this.siteContent.history.achievements.push('');
        this.renderAchievements();
    }

    removeAchievement(index) {
        this.siteContent.history.achievements.splice(index, 1);
        this.renderAchievements();
    }

    addTimelineEvent() {
        if (!this.siteContent.timeline.events) {
            this.siteContent.timeline.events = [];
        }
        this.siteContent.timeline.events.push({ year: '', description: '' });
        this.renderTimelineEvents();
    }

    removeTimelineEvent(index) {
        this.siteContent.timeline.events.splice(index, 1);
        this.renderTimelineEvents();
    }

    async saveSiteContent() {
        // Gather data from form
        const siteContent = {
            header: {
                title: document.getElementById('siteTitle').value,
                subtitle: document.getElementById('siteSubtitle').value
            },
            footer: {
                copyright: document.getElementById('footerCopyright').value,
                tagline: document.getElementById('footerTagline').value,
                links: this.gatherFooterLinks()
            },
            history: {
                title: document.getElementById('historyTitle').value,
                introduction: document.getElementById('historyIntroduction').value,
                achievements: this.gatherAchievements(),
                values: document.getElementById('historyValues').value,
                motto: document.getElementById('historyMotto').value,
                crestSymbolism: document.getElementById('historyCrest').value
            },
            timeline: {
                title: document.getElementById('timelineTitle').value,
                events: this.gatherTimelineEvents()
            },
            stats: {
                years_legacy: document.getElementById('yearsLegacy').value
            }
        };

        try {
            const response = await this.apiCall('/site-content', {
                method: 'POST',
                body: JSON.stringify(siteContent)
            });

            this.siteContent = siteContent;
            this.showNotification('Site content saved successfully!', 'success');
        } catch (error) {
            console.error('Failed to save site content:', error);
        }
    }

    gatherFooterLinks() {
        const links = [];
        document.querySelectorAll('.footer-link-item').forEach(item => {
            const inputs = item.querySelectorAll('input');
            if (inputs[0].value.trim() && inputs[1].value.trim()) {
                links.push({
                    text: inputs[0].value.trim(),
                    url: inputs[1].value.trim()
                });
            }
        });
        return links;
    }

    gatherAchievements() {
        const achievements = [];
        document.querySelectorAll('.achievement-item input').forEach(input => {
            if (input.value.trim()) {
                achievements.push(input.value.trim());
            }
        });
        return achievements;
    }

    gatherTimelineEvents() {
        const events = [];
        document.querySelectorAll('.timeline-event-item').forEach(item => {
            const year = item.querySelector('input[type="text"]').value.trim();
            const description = item.querySelector('textarea').value.trim();
            if (year && description) {
                events.push({ year, description });
            }
        });
        return events;
    }
    
    setupEventListeners() {
         document.getElementById('saveSiteContent').addEventListener('click', () => {
        this.saveSiteContent();
    });

    document.getElementById('resetSiteContent').addEventListener('click', () => {
        if (confirm('Are you sure you want to reset all site content to defaults? This cannot be undone.')) {
            this.siteContent = this.getDefaultSiteContent();
            this.renderSiteContentForm();
            this.showNotification('Site content reset to defaults.', 'info');
        }
    });

    // Handle tab change for site content
    this.handleTabChange = this.handleTabChange.bind(this);

        // Login form
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.login();
        });

        // Logout button
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.logout();
        });

        // Tab navigation
        document.querySelectorAll('.nav-link[data-tab]').forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                const tabName = e.target.getAttribute('data-tab');
                this.showTab(tabName);
            });
        });

        
        // Quick action buttons
        document.getElementById('addMemberBtn').addEventListener('click', () => {
            this.showTab('familyManagement');
            this.openMemberModal();
        });

        document.getElementById('viewDatabaseBtn').addEventListener('click', () => {
            this.showTab('databaseViewer');
        });

        document.getElementById('exportDataBtn').addEventListener('click', () => {
            this.showTab('databaseExport');
        });

        // Family management buttons
        document.getElementById('addMemberHeaderBtn').addEventListener('click', () => {
            this.openMemberModal();
        });

        document.getElementById('saveMemberBtn').addEventListener('click', () => {
            this.saveMember();
        });

        // Export buttons
        document.getElementById('exportJsonBtn').addEventListener('click', () => {
            this.exportAsJSON();
        });

        document.getElementById('viewRawDataBtn').addEventListener('click', () => {
            this.viewRawData();
        });

        // Modal close event
        const memberModal = document.getElementById('memberModal');
        memberModal.addEventListener('hidden.bs.modal', () => {
            this.currentEditingId = null;
        });
    }

    async apiCall(endpoint, options = {}) {
        try {
            const response = await fetch(`${this.apiBase}${endpoint}`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                credentials: 'include',
                ...options
            });

            if (response.status === 401) {
                this.handleUnauthorized();
                throw new Error('Unauthorized');
            }

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API call failed:', error);
            this.showNotification(error.message, 'error');
            throw error;
        }
    }

    async checkAuthStatus() {
        try {
            const response = await this.apiCall('/admin/check-auth');
            if (response.authenticated) {
                this.isAuthenticated = true;
                this.showAdminPanel();
                this.loadDashboard();
            }
        } catch (error) {
            // Not authenticated, stay on login screen
        }
    }

    async login() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            const response = await this.apiCall('/admin/login', {
                method: 'POST',
                body: JSON.stringify({ username, password })
            });

            if (response.success) {
                this.isAuthenticated = true;
                this.showAdminPanel();
                this.loadDashboard();
                this.showNotification('Login successful!', 'success');
            }
        } catch (error) {
            document.getElementById('loginMessage').innerHTML = `
                <div class="alert alert-danger">Login failed. Please check your credentials.</div>
            `;
        }
    }

    async logout() {
        try {
            await this.apiCall('/admin/logout', {
                method: 'POST'
            });
        } catch (error) {
            // Ignore errors during logout
        } finally {
            this.isAuthenticated = false;
            this.showLoginScreen();
        }
    }

    handleUnauthorized() {
        this.isAuthenticated = false;
        this.showLoginScreen();
        this.showNotification('Session expired. Please login again.', 'error');
    }

    showLoginScreen() {
        document.getElementById('loginScreen').style.display = 'block';
        document.getElementById('adminPanel').style.display = 'none';
        document.getElementById('loginForm').reset();
        document.getElementById('loginMessage').innerHTML = '';
    }

    showAdminPanel() {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('adminPanel').style.display = 'block';
        document.getElementById('adminWelcome').textContent = `Welcome, ${document.getElementById('username').value || 'Admin'}`;
    }

    showNotification(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show position-fixed`;
        toast.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        toast.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, 5000);
    }

    // Tab Management
    showTab(tabName) {
        // Update active tab in sidebar
        document.querySelectorAll('.nav-link').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update active tab content
        document.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.remove('show', 'active');
        });
        document.getElementById(tabName).classList.add('show', 'active');

        // Load tab content
        this.handleTabChange(tabName);
    }

   handleTabChange(tab) {
    switch (tab) {
        case 'dashboard':
            this.loadDashboard();
            break;
        case 'familyManagement':
            this.loadFamilyManagement();
            break;
        case 'databaseViewer':
            this.loadDatabaseViewer();
            break;
        case 'databaseExport':
            this.loadDatabaseExport();
            break;
        case 'siteContent':
            this.loadSiteContent();
            break;
    }
}

    // Dashboard
    async loadDashboard() {
        try {
            const [familyResponse, databaseResponse] = await Promise.all([
                this.apiCall('/family'),
                this.apiCall('/admin/database')
            ]);

            this.updateDashboardStats(familyResponse.data, databaseResponse.data);
        } catch (error) {
            console.error('Failed to load dashboard:', error);
        }
    }

    updateDashboardStats(familyData, databaseData) {
        const totalMembers = familyData.length;
        const livingMembers = familyData.filter(m => m.is_alive).length;
        const generations = Math.max(...familyData.map(m => m.generation));

        document.getElementById('totalMembers').textContent = totalMembers;
        document.getElementById('livingMembers').textContent = livingMembers;
        document.getElementById('totalGenerations').textContent = generations;
        document.getElementById('databaseSize').textContent = databaseData.totalRecords;

        // Update recent activity
        const recentActivity = document.getElementById('recentActivity');
        if (familyData.length > 0) {
            const recentMembers = familyData
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                .slice(0, 5);
            
            recentActivity.innerHTML = recentMembers.map(member => `
                <div class="d-flex justify-content-between align-items-center border-bottom pb-2 mb-2">
                    <div>
                        <strong>${member.first_name} ${member.last_name}</strong>
                        <br><small class="text-muted">Generation ${member.generation}</small>
                    </div>
                    <small class="text-muted">${new Date(member.created_at).toLocaleDateString()}</small>
                </div>
            `).join('');
        }
    }

    // Family Management
    async loadFamilyManagement() {
        try {
            const response = await this.apiCall('/family');
            this.renderFamilyTable(response.data);
        } catch (error) {
            console.error('Failed to load family data:', error);
        }
    }

    renderFamilyTable(members) {
        const tbody = document.getElementById('familyTableBody');
        
        if (members.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">No family members found</td></tr>';
            return;
        }

        tbody.innerHTML = members.map(member => {
            const parent = members.find(m => m.id === member.parent_id);
            const status = member.is_alive ? '<span class="badge bg-success">Living</span>' : '<span class="badge bg-secondary">Deceased</span>';
            
            return `
                <tr>
                    <td>${member.id}</td>
                    <td>
                        <strong>${member.first_name} ${member.last_name}</strong>
                        ${member.photo_url ? `<br><small><i class="fas fa-image text-muted"></i> Has photo</small>` : ''}
                    </td>
                    <td>${member.generation}</td>
                    <td>${member.birth_year || 'N/A'}</td>
                    <td>${status}</td>
                    <td>${parent ? `${parent.first_name} ${parent.last_name}` : 'Founder'}</td>
                    <td class="action-buttons">
                        <button class="btn btn-sm btn-outline-primary me-1 edit-member-btn" data-id="${member.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger delete-member-btn" data-id="${member.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');

        // Add event listeners to dynamically created buttons
        tbody.querySelectorAll('.edit-member-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const memberId = e.target.closest('button').getAttribute('data-id');
                this.editMember(parseInt(memberId));
            });
        });

        tbody.querySelectorAll('.delete-member-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const memberId = e.target.closest('button').getAttribute('data-id');
                this.deleteMember(parseInt(memberId));
            });
        });
    }

    async editMember(id) {
        try {
            const response = await this.apiCall('/family');
            const member = response.data.find(m => m.id === id);
            
            if (member) {
                this.openMemberModal(member);
            }
        } catch (error) {
            console.error('Failed to load member:', error);
        }
    }

    openMemberModal(member = null) {
        const modal = new bootstrap.Modal(document.getElementById('memberModal'));
        const title = document.getElementById('modalTitle');
        const form = document.getElementById('memberForm');
        
        if (member) {
            // Edit mode
            title.textContent = 'Edit Family Member';
            document.getElementById('memberId').value = member.id;
            document.getElementById('firstName').value = member.first_name;
            document.getElementById('lastName').value = member.last_name;
            document.getElementById('birthYear').value = member.birth_year || '';
            document.getElementById('deathYear').value = member.death_year || '';
            document.getElementById('generation').value = member.generation;
            document.getElementById('photo').value = member.photo_url || '';
            document.getElementById('biography').value = member.biography || '';
            this.currentEditingId = member.id;
            
            // Populate parent select
            this.populateParentSelect(member.parent_id);
        } else {
            // Add mode
            title.textContent = 'Add Family Member';
            form.reset();
            document.getElementById('memberId').value = '';
            this.currentEditingId = null;
            this.populateParentSelect();
        }
        
        modal.show();
    }

    async populateParentSelect(selectedId = null) {
        const select = document.getElementById('parent');
        
        try {
            const response = await this.apiCall('/family');
            const members = response.data;
            
            select.innerHTML = '<option value="">Select Parent (Optional)</option>';
            
            members.forEach(member => {
                const option = document.createElement('option');
                option.value = member.id;
                option.textContent = `${member.first_name} ${member.last_name} (Generation ${member.generation})`;
                
                if (selectedId && member.id === selectedId) {
                    option.selected = true;
                }
                
                select.appendChild(option);
            });
        } catch (error) {
            console.error('Failed to load parents:', error);
        }
    }

    async saveMember() {
        const formData = {
            first_name: document.getElementById('firstName').value.trim(),
            last_name: document.getElementById('lastName').value.trim(),
            birth_year: document.getElementById('birthYear').value ? parseInt(document.getElementById('birthYear').value) : null,
            death_year: document.getElementById('deathYear').value ? parseInt(document.getElementById('deathYear').value) : null,
            generation: parseInt(document.getElementById('generation').value),
            parent_id: document.getElementById('parent').value ? parseInt(document.getElementById('parent').value) : null,
            photo_url: document.getElementById('photo').value.trim() || null,
            biography: document.getElementById('biography').value.trim() || null
        };

        try {
            let response;
            if (this.currentEditingId) {
                // Update existing member
                response = await this.apiCall(`/family/${this.currentEditingId}`, {
                    method: 'PUT',
                    body: JSON.stringify(formData)
                });
                this.showNotification('Member updated successfully!', 'success');
            } else {
                // Create new member
                response = await this.apiCall('/family', {
                    method: 'POST',
                    body: JSON.stringify(formData)
                });
                this.showNotification('Member added successfully!', 'success');
            }

            // Reload data and close modal
            this.loadFamilyManagement();
            this.loadDashboard();
            bootstrap.Modal.getInstance(document.getElementById('memberModal')).hide();
        } catch (error) {
            console.error('Failed to save member:', error);
        }
    }

    async deleteMember(id) {
        if (!confirm('Are you sure you want to delete this family member? This action cannot be undone.')) {
            return;
        }

        try {
            await this.apiCall(`/family/${id}`, {
                method: 'DELETE'
            });
            
            this.showNotification('Member deleted successfully!', 'success');
            this.loadFamilyManagement();
            this.loadDashboard();
        } catch (error) {
            console.error('Failed to delete member:', error);
        }
    }

    // Database Viewer
    async loadDatabaseViewer() {
        try {
            const response = await this.apiCall('/admin/database');
            this.renderDatabaseTables(response.data);
        } catch (error) {
            console.error('Failed to load database info:', error);
        }
    }

    renderDatabaseTables(databaseInfo) {
        const container = document.getElementById('databaseTables');
        
        container.innerHTML = `
            <div class="row">
                ${databaseInfo.tables.map(table => `
                    <div class="col-md-6 mb-3">
                        <div class="card">
                            <div class="card-body">
                                <h6 class="card-title">
                                    <i class="fas fa-table me-2"></i>${table.name}
                                </h6>
                                <p class="card-text">
                                    <small class="text-muted">
                                        ${table.rowCount} records<br>
                                        ${table.schema.length} columns
                                    </small>
                                </p>
                                <button class="btn btn-sm btn-outline-primary view-table-btn" data-table="${table.name}">
                                    View Data
                                </button>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        // Add event listeners to table buttons
        container.querySelectorAll('.view-table-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tableName = e.target.getAttribute('data-table');
                this.loadTableData(tableName);
            });
        });
    }

    async loadTableData(tableName) {
        try {
            const response = await this.apiCall(`/admin/database/${tableName}?limit=50`);
            this.renderTableData(response.data);
        } catch (error) {
            console.error('Failed to load table data:', error);
        }
    }

    renderTableData(tableData) {
        const container = document.getElementById('tableData');
        const { table, schema, data, pagination } = tableData;

        if (data.length === 0) {
            container.innerHTML = `<p class="text-muted">No data found in table "${table}"</p>`;
            return;
        }

        // Create table header
        const headers = schema.map(col => `<th>${col.name}</th>`).join('');
        
        // Create table rows
        const rows = data.map(row => `
            <tr>
                ${schema.map(col => `<td>${this.formatCellValue(row[col.name])}</td>`).join('')}
            </tr>
        `).join('');

        container.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h6>Table: ${table} (${pagination.total} records)</h6>
                <small class="text-muted">Showing ${data.length} of ${pagination.total} records</small>
            </div>
            <div class="table-responsive">
                <table class="table table-sm table-striped database-table">
                    <thead>
                        <tr>${headers}</tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
            ${pagination.totalPages > 1 ? `
                <nav>
                    <ul class="pagination pagination-sm justify-content-center">
                        <li class="page-item ${pagination.page === 1 ? 'disabled' : ''}">
                            <a class="page-link pagination-link" href="#" data-table="${table}" data-page="${pagination.page - 1}">Previous</a>
                        </li>
                        ${Array.from({length: Math.min(5, pagination.totalPages)}, (_, i) => {
                            const pageNum = i + 1;
                            return `
                                <li class="page-item ${pageNum === pagination.page ? 'active' : ''}">
                                    <a class="page-link pagination-link" href="#" data-table="${table}" data-page="${pageNum}">${pageNum}</a>
                                </li>
                            `;
                        }).join('')}
                        <li class="page-item ${pagination.page === pagination.totalPages ? 'disabled' : ''}">
                            <a class="page-link pagination-link" href="#" data-table="${table}" data-page="${pagination.page + 1}">Next</a>
                        </li>
                    </ul>
                </nav>
            ` : ''}
        `;

        // Add event listeners to pagination links
        container.querySelectorAll('.pagination-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const tableName = e.target.getAttribute('data-table');
                const page = parseInt(e.target.getAttribute('data-page'));
                this.loadTablePage(tableName, page);
            });
        });
    }

    async loadTablePage(tableName, page) {
        try {
            const response = await this.apiCall(`/admin/database/${tableName}?page=${page}&limit=50`);
            this.renderTableData(response.data);
        } catch (error) {
            console.error('Failed to load table page:', error);
        }
    }

    formatCellValue(value) {
        if (value === null || value === undefined) {
            return '<span class="text-muted">NULL</span>';
        }
        
        if (typeof value === 'boolean') {
            return value ? '<span class="badge bg-success">true</span>' : '<span class="badge bg-secondary">false</span>';
        }
        
        if (typeof value === 'number') {
            return value;
        }
        
        if (typeof value === 'string') {
            if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
                return new Date(value).toLocaleString();
            }
            
            if (value.length > 100) {
                return value.substring(0, 100) + '...';
            }
            
            return value;
        }
        
        return JSON.stringify(value);
    }

    // Database Export
    async loadDatabaseExport() {
        // This tab doesn't need initial loading
    }

    async exportAsJSON() {
        try {
            const response = await this.apiCall('/admin/database-export');
            const dataStr = JSON.stringify(response.data, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `rao-family-database-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            this.showNotification('Database exported successfully!', 'success');
        } catch (error) {
            console.error('Export failed:', error);
        }
    }

    async viewRawData() {
        try {
            const response = await this.apiCall('/admin/database-export');
            const container = document.getElementById('exportResult');
            
            container.innerHTML = `
                <h6>Raw Database Export</h6>
                <div class="json-viewer">
                    <pre>${JSON.stringify(response.data, null, 2)}</pre>
                </div>
                <small class="text-muted">Exported on: ${new Date(response.exportedAt).toLocaleString()}</small>
            `;
        } catch (error) {
            console.error('Failed to load raw data:', error);
        }
    }
}

// Initialize admin panel when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.adminPanel = new AdminPanel();
});