// Family Tree Application with Dynamic Content
class FamilyTreeApp {
    constructor() {
        this.apiBase = '/api';
        this.familyData = [];
        this.siteContent = {};
        this.selectedMember = null;
        this.isFullScreen = false;
        this.currentFilter = 'all';
        this.init();
    }

    async init() {
        await this.loadFamilyData();
        await this.loadSiteContent();
        this.setupEventListeners();
        this.renderFamilyTree();
        this.updateStats();
        this.updateSiteContent();
        this.checkMobileDevice();
        document.body.classList.add('fade-in');
    }

    // Check if mobile device and show warning
    checkMobileDevice() {
        const isMobile = window.innerWidth <= 768;
        const isPortrait = window.innerHeight > window.innerWidth;
        
        if (isMobile && isPortrait) {
            this.showMobileWarning();
        }
    }

    showMobileWarning() {
        const warning = document.getElementById('mobileWarning');
        if (warning) {
            warning.style.display = 'flex';
        }
    }

    // API Methods
    async apiCall(endpoint, options = {}) {
        try {
            const response = await fetch(`${this.apiBase}${endpoint}`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API call failed:', error);
            this.showNotification('Error: ' + error.message, 'error');
            throw error;
        }
    }

    async loadFamilyData() {
        try {
            const response = await this.apiCall('/family');
            this.familyData = response.data;
            
            // Identify first-born children after loading data
            this.identifyFirstBornChildren();
        } catch (error) {
            console.error('Failed to load family data:', error);
            this.familyData = [];
        }
    }

    async loadSiteContent() {
        try {
            const response = await this.apiCall('/site-content');
            this.siteContent = response.data;
        } catch (error) {
            console.error('Failed to load site content:', error);
            // Fallback to default content
            this.siteContent = this.getDefaultSiteContent();
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

    // Update all site content dynamically
    updateSiteContent() {
        this.updateHeader();
        this.updateFooter();
        this.updateHistory();
        this.updateTimeline();
        this.updateStatsContent();
    }

    updateHeader() {
        if (this.siteContent.header) {
            document.getElementById('page-title').textContent = this.siteContent.header.title;
            document.getElementById('main-heading').textContent = this.siteContent.header.title;
            document.getElementById('header-subtitle').textContent = this.siteContent.header.subtitle;
        }
    }

    updateFooter() {
        if (this.siteContent.footer) {
            document.getElementById('footer-copyright').textContent = this.siteContent.footer.copyright;
            document.getElementById('footer-tagline').textContent = this.siteContent.footer.tagline;
            
            const footerLinks = document.getElementById('footer-links');
            if (this.siteContent.footer.links) {
                footerLinks.innerHTML = this.siteContent.footer.links.map(link => 
                    `<a href="${link.url}" class="footer-link">${link.text}</a>`
                ).join('');
            }
        }
    }

    updateHistory() {
        if (this.siteContent.history) {
            document.getElementById('history-title').textContent = this.siteContent.history.title;
            document.getElementById('history-introduction').textContent = this.siteContent.history.introduction;
            document.getElementById('history-values').textContent = this.siteContent.history.values;
            document.getElementById('history-motto').textContent = this.siteContent.history.motto;
            document.getElementById('history-crest').textContent = this.siteContent.history.crestSymbolism;
            
            const achievementsList = document.getElementById('history-achievements');
            if (this.siteContent.history.achievements) {
                achievementsList.innerHTML = this.siteContent.history.achievements.map(achievement => 
                    `<li class="mb-2"><i class="fas fa-trophy me-2" style="color: var(--gold);"></i>${achievement}</li>`
                ).join('');
            }
        }
    }

    updateTimeline() {
        if (this.siteContent.timeline) {
            document.getElementById('timeline-title').textContent = this.siteContent.timeline.title;
            
            const timelineContainer = document.getElementById('timeline-events');
            if (this.siteContent.timeline.events) {
                timelineContainer.innerHTML = this.siteContent.timeline.events.map((event, index) => {
                    const position = index % 2 === 0 ? 'left' : 'right';
                    return `
                        <div class="timeline-item ${position}">
                            <div class="timeline-content">
                                <h4>${event.year}</h4>
                                <p>${event.description}</p>
                            </div>
                        </div>
                    `;
                }).join('');
            }
        }
    }

    updateStatsContent() {
        if (this.siteContent.stats && this.siteContent.stats.years_legacy) {
            document.getElementById('yearsLegacy').textContent = this.siteContent.stats.years_legacy;
        }
    }

    // Identify first-born children for each parent
    identifyFirstBornChildren() {
        const childrenByParent = {};
        
        this.familyData.forEach(member => {
            if (member.parent_id) {
                if (!childrenByParent[member.parent_id]) {
                    childrenByParent[member.parent_id] = [];
                }
                childrenByParent[member.parent_id].push(member);
            }
        });

        Object.keys(childrenByParent).forEach(parentId => {
            const children = childrenByParent[parentId];
            
            children.sort((a, b) => {
                const yearA = a.birth_year ? parseInt(a.birth_year) : 0;
                const yearB = b.birth_year ? parseInt(b.birth_year) : 0;
                return yearA - yearB;
            });

            if (children.length > 0) {
                const firstBorn = children[0];
                const memberIndex = this.familyData.findIndex(m => m.id === firstBorn.id);
                if (memberIndex !== -1) {
                    this.familyData[memberIndex].is_first_born = true;
                }
            }
        });

        this.familyData.forEach(member => {
            if (member.generation === 1) {
                member.is_first_born = true;
            }
        });
    }

    async loadStats() {
        try {
            const response = await this.apiCall('/family/stats');
            return response.data;
        } catch (error) {
            console.error('Failed to load stats:', error);
            return null;
        }
    }

    // UI Methods
    setupEventListeners() {
        document.getElementById('continueMobile')?.addEventListener('click', () => {
            document.getElementById('mobileWarning').style.display = 'none';
        });

        document.getElementById('closeDetails').addEventListener('click', () => this.closeMemberDetails());
        document.getElementById('overlay').addEventListener('click', () => this.closeMemberDetails());

        document.getElementById('searchBox').addEventListener('input', (e) => {
            this.filterMembers(e.target.value);
        });

        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                const generation = e.target.getAttribute('data-generation');
                this.currentFilter = generation;
                this.filterByGeneration(generation);
            });
        });

        document.getElementById('printTree').addEventListener('click', () => {
            window.print();
        });

        document.getElementById('refreshTree').addEventListener('click', async () => {
            await this.refreshData();
        });

        document.getElementById('fullScreenBtn').addEventListener('click', () => {
            this.toggleFullScreen();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isFullScreen) {
                this.exitFullScreen();
            }
        });

        window.addEventListener('resize', () => {
            this.checkMobileDevice();
        });
    }

    async refreshData() {
        await this.loadFamilyData();
        await this.loadSiteContent();
        this.renderFamilyTree();
        this.updateStats();
        this.updateSiteContent();
    }

    // Hierarchical Family Tree Rendering
    renderFamilyTree() {
        const treeContainer = document.getElementById('familyTree');
        
        if (this.familyData.length === 0) {
            treeContainer.innerHTML = `
                <div class="text-center py-5">
                    <i class="fas fa-tree fa-3x text-gold mb-3"></i>
                    <p>No family members found.</p>
                </div>
            `;
            return;
        }

        treeContainer.innerHTML = '';
        
        const rootMembers = this.familyData.filter(member => 
            member.generation === 1 || member.parent_id === null
        );
        
        if (rootMembers.length === 0) {
            const minGeneration = Math.min(...this.familyData.map(m => m.generation));
            const earliestMembers = this.familyData.filter(member => member.generation === minGeneration);
            
            const treeList = this.buildTreeList(earliestMembers);
            treeContainer.appendChild(treeList);
        } else {
            const treeList = this.buildTreeList(rootMembers);
            treeContainer.appendChild(treeList);
        }
    }

    buildTreeList(members) {
        const ul = document.createElement('ul');
        
        members.forEach(member => {
            const li = document.createElement('li');
            
            const memberElement = this.createMemberElement(member);
            li.appendChild(memberElement);
            
            const children = this.familyData.filter(m => m.parent_id === member.id);
            if (children.length > 0) {
                const childrenList = this.buildTreeList(children);
                li.appendChild(childrenList);
            }
            
            ul.appendChild(li);
        });
        
        return ul;
    }

    createMemberElement(member) {
        const memberDiv = document.createElement('div');
        memberDiv.className = 'member';
        memberDiv.setAttribute('data-id', member.id);
        memberDiv.setAttribute('data-generation', member.generation);

        const fullName = `${member.first_name} ${member.last_name}`;
        const years = `${member.birth_year || '?'} - ${member.death_year || 'Present'}`;
        const status = member.is_alive ? 'Living' : 'Deceased';
        const statusClass = member.is_alive ? 'status-living' : 'status-deceased';
        
        let icon = 'fas fa-user';
        if (member.generation === 1 || member.is_first_born) {
            icon = 'fas fa-crown';
            memberDiv.classList.add('first-born');
        } else if (member.generation <= 3) {
            icon = 'fas fa-user-tie';
        }

        memberDiv.innerHTML = `
            <div class="member-content">
                <i class="${icon} member-icon"></i>
                <div class="member-name">${fullName}</div>
                <div class="member-years">${years}</div>
                <div class="member-status ${statusClass}">${status}</div>
                ${member.is_first_born ? '<div class="first-born-badge">First Born</div>' : ''}
                <div class="generation-label">${member.generation}${this.getOrdinalSuffix(member.generation)} Generation</div>
            </div>
        `;

        memberDiv.addEventListener('click', (e) => {
            e.stopPropagation();
            this.showMemberDetails(member);
        });

        return memberDiv;
    }

    // Enhanced Member Details Modal
    showMemberDetails(member) {
        this.selectedMember = member;
        
        let fullName = `${member.first_name} ${member.last_name}`;
        
        if (member.is_first_born) {
            fullName = `Kunwar/कुँवर/کُنوَر ${fullName}`;
        }
        
        document.getElementById('detailName').textContent = fullName;
        document.getElementById('detailGeneration').textContent = `${member.generation}${this.getOrdinalSuffix(member.generation)} Generation`;
        document.getElementById('detailBirthYear').textContent = member.birth_year || 'Unknown';
        
        const status = member.is_alive ? 
            '<span style="color: green;">Living</span>' : 
            `<span style="color: var(--burgundy);">Deceased ${member.death_year ? `(${member.death_year})` : ''}</span>`;
        document.getElementById('detailStatus').innerHTML = status;
        
        const parent = this.familyData.find(p => p.id === member.parent_id);
        document.getElementById('detailParent').textContent = parent ? 
            `${parent.first_name} ${parent.last_name}` : 'Founding Member';
        
        document.getElementById('detailSpouse').textContent = member.spouse_name || 'Not specified';
        
        const children = this.familyData.filter(m => m.parent_id === member.id);
        const childrenHTML = children.length > 0 ? 
            children.map(child => `${child.first_name} ${child.last_name}`).join(', ') : 
            'None';
        document.getElementById('detailChildren').textContent = childrenHTML;
        
        const siblings = this.familyData.filter(m => 
            m.parent_id === member.parent_id && m.id !== member.id
        );
        const siblingsHTML = siblings.length > 0 ? 
            siblings.map(sibling => `${sibling.first_name} ${sibling.last_name}`).join(', ') : 
            'None';
        document.getElementById('detailSiblings').textContent = siblingsHTML;
        
        let firstBornElement = document.querySelector('.detail-item-firstborn');
        if (!firstBornElement) {
            firstBornElement = document.createElement('div');
            firstBornElement.className = 'detail-item detail-item-firstborn';
            document.getElementById('detailSiblings').parentNode.after(firstBornElement);
        }
        firstBornElement.innerHTML = `<strong>First Born:</strong> <span>${member.is_first_born ? 'Yes - Kunwar/कुँवर/کُنوَر' : 'No'}</span>`;
        
        document.getElementById('detailNotes').textContent = member.biography || member.notes || 'No biography available.';
        
        document.getElementById('memberDetails').style.display = 'block';
        document.getElementById('overlay').style.display = 'block';
    }

    closeMemberDetails() {
        document.getElementById('memberDetails').style.display = 'none';
        document.getElementById('overlay').style.display = 'none';
        this.selectedMember = null;
    }

    // Filtering Methods
    filterMembers(searchTerm) {
        const memberElements = document.querySelectorAll('.member');
        const searchLower = searchTerm.toLowerCase().trim();
        
        if (searchLower === '') {
            this.filterByGeneration(this.currentFilter);
            return;
        }
        
        let hasMatches = false;
        
        memberElements.forEach(element => {
            const name = element.querySelector('.member-name').textContent.toLowerCase();
            
            if (name.includes(searchLower)) {
                element.style.display = 'block';
                this.showAncestors(element);
                this.showDescendants(element);
                hasMatches = true;
            } else {
                element.style.display = 'none';
            }
        });
        
        if (!hasMatches) {
            this.showNotification('No family members found matching your search.', 'info');
        }
    }

    showAncestors(element) {
        let current = element;
        while (current.parentElement && current.parentElement.tagName === 'LI') {
            current = current.parentElement;
            const memberDiv = current.querySelector('.member');
            if (memberDiv) {
                memberDiv.style.display = 'block';
            }
        }
    }

    showDescendants(element) {
        const listItem = element.closest('li');
        if (listItem) {
            const descendants = listItem.querySelectorAll('.member');
            descendants.forEach(descendant => {
                descendant.style.display = 'block';
            });
        }
    }

    filterByGeneration(generation) {
        const memberElements = document.querySelectorAll('.member');
        
        if (generation === 'all') {
            memberElements.forEach(element => {
                element.style.display = 'block';
                this.showAncestors(element);
                this.showDescendants(element);
            });
        } else {
            memberElements.forEach(element => {
                const elementGeneration = element.getAttribute('data-generation');
                if (elementGeneration === generation) {
                    element.style.display = 'block';
                    this.showAncestors(element);
                    this.showDescendants(element);
                } else {
                    element.style.display = 'none';
                }
            });
        }
    }

    // Stats Update
    async updateStats() {
        try {
            const stats = await this.loadStats();
            if (stats) {
                document.getElementById('totalMembers').textContent = stats.total_members;
                document.getElementById('totalGenerations').textContent = stats.total_generations;
                document.getElementById('livingMembers').textContent = stats.living_members;
            }
        } catch (error) {
            console.error('Failed to update stats:', error);
        }
    }

    // Full Screen Functionality
    toggleFullScreen() {
        if (!this.isFullScreen) {
            this.enterFullScreen();
        } else {
            this.exitFullScreen();
        }
    }

    enterFullScreen() {
        const treeContainer = document.querySelector('.tree-container');
        
        if (treeContainer.requestFullscreen) {
            treeContainer.requestFullscreen();
        } else if (treeContainer.webkitRequestFullscreen) {
            treeContainer.webkitRequestFullscreen();
        } else if (treeContainer.msRequestFullscreen) {
            treeContainer.msRequestFullscreen();
        }

        treeContainer.classList.add('full-screen');
        document.getElementById('fullScreenBtn').innerHTML = '<i class="fas fa-compress me-2"></i>Exit Full Screen';
        this.isFullScreen = true;
        
        const mobileWarning = document.getElementById('mobileWarning');
        if (mobileWarning) {
            mobileWarning.style.display = 'none';
        }
    }

    exitFullScreen() {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }

        const treeContainer = document.querySelector('.tree-container');
        treeContainer.classList.remove('full-screen');
        document.getElementById('fullScreenBtn').innerHTML = '<i class="fas fa-expand me-2"></i>Full Screen';
        this.isFullScreen = false;
    }

    // Utility Methods
    getOrdinalSuffix(i) {
        const j = i % 10;
        const k = i % 100;
        
        if (j === 1 && k !== 11) return 'st';
        if (j === 2 && k !== 12) return 'nd';
        if (j === 3 && k !== 13) return 'rd';
        return 'th';
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show position-fixed`;
        notification.style.cssText = 'top: 20px; right: 20px; z-index: 1100; min-width: 300px;';
        notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    window.familyApp = new FamilyTreeApp();
});

// Handle full screen change events
document.addEventListener('fullscreenchange', handleFullScreenChange);
document.addEventListener('webkitfullscreenchange', handleFullScreenChange);
document.addEventListener('mozfullscreenchange', handleFullScreenChange);
document.addEventListener('MSFullscreenChange', handleFullScreenChange);

function handleFullScreenChange() {
    if (!document.fullscreenElement && !document.webkitFullscreenElement && 
        !document.mozFullScreenElement && !document.msFullscreenElement) {
        if (window.familyApp) {
            window.familyApp.exitFullScreen();
        }
    }
}