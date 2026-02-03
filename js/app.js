const CONFIG = {
    githubUsername: 'andknownmaly',
    cvDownloadUrl: 'https://github.com/andknownmaly/andknownmaly.github.io/releases/download/cv-1/Danang.Tri.Atmaja_CV.pdf',
    featuredRepos: [
        'tiktok-sentiment-analysis',
        'OpenVPN-GUI',
        'student-picts',
        'CVE-2019-16278',
        'ShellPhant0m',
        'packettracer',
        'cupang',
        'EncryptDecrypt',
        'malware-detector',
        'google-dork',
        'guidork',
        'ReverseShellBuilder'
    ]
};

let currentLang = 'en';
let currentTheme = 'dark';
let allProjects = [];

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initLanguage();
    initNavigation();
    initScrollEffects();
    fetchGitHubProjects();
    initProjectFilters();
    initCVDownload();
});

function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    currentTheme = savedTheme;
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon();
    
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
}

function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('theme', currentTheme);
    updateThemeIcon();
}

function updateThemeIcon() {
    const icon = document.querySelector('#themeToggle i');
    if (icon) {
        icon.className = currentTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
    }
}

function initLanguage() {
    const savedLang = localStorage.getItem('language') || 'en';
    currentLang = savedLang;
    updateLanguage();
    
    const langToggle = document.getElementById('langToggle');
    if (langToggle) {
        langToggle.addEventListener('click', toggleLanguage);
    }
}

function toggleLanguage() {
    currentLang = currentLang === 'en' ? 'id' : 'en';
    localStorage.setItem('language', currentLang);
    updateLanguage();
}

function updateLanguage() {
    const langToggle = document.getElementById('langToggle');
    if (langToggle) {
        langToggle.querySelector('.lang-text').textContent = currentLang.toUpperCase();
    }
    
    document.querySelectorAll('[data-en]').forEach(element => {
        const text = element.getAttribute(`data-${currentLang}`);
        if (text) {
            element.textContent = text;
        }
    });
}

function initNavigation() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
        });
        
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            });
        });
    }
    
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            if (window.scrollY > 50) {
                navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
            } else {
                navbar.style.boxShadow = 'none';
            }
        }
    });
}

function initScrollEffects() {
    const sections = document.querySelectorAll('section');
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(section);
    });
}

async function fetchGitHubProjects() {
    const projectsGrid = document.getElementById('projectsGrid');
    
    if (!projectsGrid) {
        console.error('Projects grid not found');
        return;
    }
    
    projectsGrid.innerHTML = '<div class="loading"><i class="fas fa-spinner"></i><p>Loading projects...</p></div>';
    
    try {
        const response = await fetch(`https://api.github.com/users/${CONFIG.githubUsername}/repos?per_page=100&sort=updated`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const repos = await response.json();
        
        allProjects = repos
            .filter(repo => !repo.private && !repo.fork)
            .sort((a, b) => b.stargazers_count - a.stargazers_count);
        
        updateStats(allProjects);
        
        const featuredProjects = allProjects.filter(repo => CONFIG.featuredRepos.includes(repo.name));
        displayProjects(featuredProjects);
        
    } catch (error) {
        console.error('Error fetching GitHub projects:', error);
        projectsGrid.innerHTML = `
            <div class="loading">
                <i class="fas fa-exclamation-circle"></i>
                <p>Failed to load projects. Please check back later.</p>
            </div>
        `;
    }
}

function updateStats(projects) {
    const totalProjects = projects.length;
    const totalStars = projects.reduce((sum, repo) => sum + repo.stargazers_count, 0);
    
    const languages = new Set();
    projects.forEach(repo => {
        if (repo.language) {
            languages.add(repo.language);
        }
    });
    
    const statNumbers = document.querySelectorAll('.stat-number');
    if (statNumbers[0]) statNumbers[0].textContent = `${totalProjects}+`;
    if (statNumbers[1]) statNumbers[1].textContent = `${totalStars}+`;
    if (statNumbers[2]) statNumbers[2].textContent = `${languages.size}+`;
}

function displayProjects(projects) {
    const projectsGrid = document.getElementById('projectsGrid');
    
    if (!projectsGrid) {
        console.error('Projects grid not found');
        return;
    }
    
    projectsGrid.innerHTML = '';
    
    if (projects.length === 0) {
        projectsGrid.innerHTML = '<div class="loading"><p>No projects found.</p></div>';
        return;
    }
    
    projects.forEach(project => {
        const card = createProjectCard(project);
        projectsGrid.appendChild(card);
    });
}

function createProjectCard(project) {
    const card = document.createElement('div');
    card.className = 'project-card show';
    
    const icon = getProjectIcon(project);
    const topics = project.topics ? project.topics.slice(0, 5).map(topic => 
        `<span class="topic-tag">${topic}</span>`
    ).join('') : '';
    
    const description = project.description || 'No description available';
    const stars = project.stargazers_count || 0;
    const language = project.language || 'Unknown';
    
    card.innerHTML = `
        <div class="project-icon">
            <i class="${icon}"></i>
        </div>
        <div class="project-header">
            <div class="project-language">
                <i class="fas fa-code"></i>
                <span>${language}</span>
            </div>
        </div>
        <h3>${project.name}</h3>
        <p>${description}</p>
        ${topics ? `<div class="project-topics">${topics}</div>` : ''}
        <div class="project-stats">
            <div class="project-stars">
                <i class="fas fa-star"></i>
                <span>${stars}</span>
            </div>
        </div>
        <div class="project-links">
            <a href="${project.html_url}" target="_blank" class="btn btn-primary">
                <i class="fab fa-github"></i>
                <span data-en="View Code" data-id="Lihat Kode">View Code</span>
            </a>
            ${project.homepage ? `
                <a href="${project.homepage}" target="_blank" class="btn btn-secondary">
                    <i class="fas fa-external-link-alt"></i>
                    <span data-en="Demo" data-id="Demo">Demo</span>
                </a>
            ` : ''}
        </div>
    `;
    
    updateLanguage();
    
    return card;
}

function getProjectIcon(project) {
    const name = project.name.toLowerCase();
    const topics = project.topics || [];
    const language = project.language ? project.language.toLowerCase() : '';
    
    if (topics.includes('security') || topics.includes('penetration') || name.includes('cve')) {
        return 'fas fa-shield-alt';
    } else if (language === 'python') {
        return 'fab fa-python';
    } else if (language === 'javascript' || language === 'html' || language === 'css') {
        return 'fab fa-js';
    } else if (language === 'shell') {
        return 'fas fa-terminal';
    } else if (language === 'php') {
        return 'fab fa-php';
    } else if (language === 'go') {
        return 'fab fa-golang';
    } else {
        return 'fas fa-code';
    }
}

function initProjectFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.getAttribute('data-filter');
            
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            filterProjects(filter);
        });
    });
}

function filterProjects(filter) {
    let filteredProjects = [];
    
    if (filter === 'all') {
        filteredProjects = allProjects.filter(repo => CONFIG.featuredRepos.includes(repo.name));
    } else if (filter === 'python') {
        filteredProjects = allProjects.filter(repo => repo.language === 'Python');
    } else if (filter === 'shell') {
        filteredProjects = allProjects.filter(repo => repo.language === 'Shell');
    } else if (filter === 'web') {
        filteredProjects = allProjects.filter(repo => 
            repo.language === 'HTML' || 
            repo.language === 'JavaScript' || 
            repo.language === 'CSS' ||
            repo.language === 'PHP'
        );
    } else if (filter === 'security') {
        filteredProjects = allProjects.filter(repo => {
            const topics = repo.topics || [];
            return topics.some(topic => 
                topic.includes('security') || 
                topic.includes('penetration') || 
                topic.includes('exploit') ||
                topic.includes('vulnerability')
            ) || 
            repo.name.toLowerCase().includes('cve') ||
            repo.name.toLowerCase().includes('exploit');
        });
    }
    
    displayProjects(filteredProjects.slice(0, 12));
}

function initCVDownload() {
    const downloadBtn = document.getElementById('downloadCV');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.open(CONFIG.cvDownloadUrl, '_blank');
        });
    }
}

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});
