// ── State ──
let resumeData = null;

// ── DOM refs ──
const inputPanel   = document.getElementById('inputPanel');
const loadingPanel = document.getElementById('loadingPanel');
const resultPanel  = document.getElementById('resultPanel');
const generateBtn  = document.getElementById('generateBtn');
const backBtn      = document.getElementById('backBtn');
const copyBtn      = document.getElementById('copyBtn');
const downloadBtn  = document.getElementById('downloadBtn');
const errorMsg     = document.getElementById('errorMsg');
const loadingText  = document.getElementById('loadingText');
const resumeFileInput = document.getElementById('resumeFile');
const fileNameSpan    = document.getElementById('fileName');

// Loading messages to cycle through
const loadingMessages = [
  'Parsing your resume...',
  'Enhancing bullet points...',
  'Polishing your summary...',
  'Almost there...'
];

// ── PDF file selection ──
resumeFileInput.addEventListener('change', () => {
  const file = resumeFileInput.files[0];
  fileNameSpan.textContent = file ? file.name : '';
  if (file) document.getElementById('resumeText').value = '';
});

// ── Generate ──
generateBtn.addEventListener('click', async () => {
  const resumeText = document.getElementById('resumeText').value.trim();
  const jobDesc    = document.getElementById('jobDesc').value.trim();
  const file       = resumeFileInput.files[0];

  if (!resumeText && !file) {
    showError('Please paste your resume text or upload a PDF.');
    return;
  }

  hideError();
  showPanel('loading');
  generateBtn.disabled = true;

  // Cycle loading messages
  let msgIdx = 0;
  const msgInterval = setInterval(() => {
    msgIdx = (msgIdx + 1) % loadingMessages.length;
    loadingText.textContent = loadingMessages[msgIdx];
  }, 2200);

  try {
    let response;

    if (file) {
      // PDF upload via multipart
      const formData = new FormData();
      formData.append('resume', file);
      if (jobDesc) formData.append('jobDescription', jobDesc);
      response = await fetch('/generate', { method: 'POST', body: formData });
    } else {
      // Plain text via JSON
      response = await fetch('/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText, jobDescription: jobDesc }),
      });
    }

    const data = await response.json();

    if (!response.ok || data.error) {
      throw new Error(data.error || 'Server error');
    }

    resumeData = data.result;
    renderResume(resumeData);
    showPanel('result');

  } catch (err) {
    console.error(err);
    showPanel('input');
    showError('Something went wrong: ' + err.message);
  } finally {
    clearInterval(msgInterval);
    generateBtn.disabled = false;
  }
});

// ── Back button ──
backBtn.addEventListener('click', () => {
  showPanel('input');
});

// ── Copy as plain text ──
copyBtn.addEventListener('click', () => {
  if (!resumeData) return;
  const text = buildPlainText(resumeData);
  navigator.clipboard.writeText(text).then(() => {
    copyBtn.textContent = '✅ Copied!';
    setTimeout(() => copyBtn.textContent = '📋 Copy Text', 2000);
  });
});

// ── Download PDF ──
downloadBtn.addEventListener('click', () => {
  window.print();
});

// ── Render resume into template ──
function renderResume(d) {
  setEditable('rName',     d.name);
  setEditable('rEmail',    d.email);
  setEditable('rPhone',    d.phone);
  setEditable('rLinkedin', d.linkedin);
  setEditable('rGithub',   d.github);
  setEditable('rSummary',  d.summary);

  // Skills
  const skillsWrap = document.getElementById('rSkills');
  skillsWrap.innerHTML = '';
  (d.skills || []).forEach(skill => {
    const tag = document.createElement('span');
    tag.className = 'skill-tag';
    tag.contentEditable = 'true';
    tag.textContent = skill;
    skillsWrap.appendChild(tag);
  });
  toggleSection('sectionSkills', d.skills?.length > 0);

  // Experience
  const expContainer = document.getElementById('rExperience');
  expContainer.innerHTML = '';
  (d.experience || []).forEach(exp => {
    expContainer.appendChild(buildEntry({
      title: exp.role,
      sub:   exp.company,
      duration: exp.duration,
      bullets: exp.bullets,
    }));
  });
  toggleSection('sectionExperience', d.experience?.length > 0);

  // Projects
  const projContainer = document.getElementById('rProjects');
  projContainer.innerHTML = '';
  (d.projects || []).forEach(proj => {
    const entry = buildEntry({
      title: proj.name,
      sub:   proj.tech,
      duration: '',
      bullets: proj.bullets,
      links: [
        { label: 'GitHub', url: proj.githubLink },
        { label: 'Live', url: proj.liveLink },
      ],
    });
    projContainer.appendChild(entry);
  });
  toggleSection('sectionProjects', d.projects?.length > 0);

  // Achievements
  const achContainer = document.getElementById('rAchievements');
  achContainer.innerHTML = '';
  (d.achievements || []).forEach(ach => {
    const div = document.createElement('div');
    div.className = 'achievement-row';

    const title = document.createElement('span');
    title.className = 'achievement-title';
    title.contentEditable = 'true';
    title.textContent = ach.title || '';

    const detail = document.createElement('span');
    detail.className = 'achievement-detail';
    detail.contentEditable = 'true';
    detail.textContent = ach.detail || '';

    div.appendChild(title);
    div.appendChild(detail);
    achContainer.appendChild(div);
  });
  toggleSection('sectionAchievements', d.achievements?.length > 0);

  // Education
  const eduContainer = document.getElementById('rEducation');
  eduContainer.innerHTML = '';
  (d.education || []).forEach(edu => {
    const entry = buildEntry({
      title: edu.degree,
      sub:   edu.institution,
      duration: edu.duration,
      bullets: edu.details ? [edu.details] : [],
    });
    eduContainer.appendChild(entry);
  });
  toggleSection('sectionEducation', d.education?.length > 0);

  // Certifications
  const certsList = document.getElementById('rCerts');
  certsList.innerHTML = '';
  (d.certifications || []).forEach(cert => {
    const li = document.createElement('li');
    li.contentEditable = 'true';
    li.textContent = cert;
    certsList.appendChild(li);
  });
  toggleSection('sectionCerts', d.certifications?.length > 0);
}

function buildEntry({ title, sub, duration, bullets, links = [] }) {
  const div = document.createElement('div');
  div.className = 'entry';

  const header = document.createElement('div');
  header.className = 'entry-header';

  const titleEl = document.createElement('span');
  titleEl.className = 'entry-title';
  titleEl.contentEditable = 'true';
  titleEl.textContent = title || '';

  const durEl = document.createElement('span');
  durEl.className = 'entry-duration';
  durEl.contentEditable = 'true';
  durEl.textContent = duration || '';

  header.appendChild(titleEl);
  header.appendChild(durEl);

  const subEl = document.createElement('div');
  subEl.className = 'entry-sub';
  subEl.contentEditable = 'true';
  subEl.textContent = sub || '';

  // Project links (GitHub / Live)
  const validLinks = links.filter(l => l.url && l.url.trim());
  if (validLinks.length > 0) {
    const linkRow = document.createElement('div');
    linkRow.className = 'entry-links';
    validLinks.forEach(l => {
      const a = document.createElement('a');
      a.href = l.url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.className = 'entry-link';
      a.textContent = l.label;
      linkRow.appendChild(a);
    });
    header.appendChild(linkRow);
  }

  const ul = document.createElement('ul');
  ul.className = 'bullet-list';
  (bullets || []).forEach(b => {
    const li = document.createElement('li');
    li.contentEditable = 'true';
    li.textContent = b;
    ul.appendChild(li);
  });

  div.appendChild(header);
  div.appendChild(subEl);
  div.appendChild(ul);
  return div;
}

function setEditable(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value || '';
}

function toggleSection(id, show) {
  const el = document.getElementById(id);
  if (el) el.style.display = show ? '' : 'none';
}

// ── Build plain text copy ──
function buildPlainText(d) {
  const lines = [];
  if (d.name)     lines.push(d.name);
  const contact = [d.email, d.phone, d.linkedin, d.github].filter(Boolean).join(' | ');
  if (contact)    lines.push(contact);
  lines.push('');

  if (d.summary)  { lines.push('SUMMARY'); lines.push(d.summary); lines.push(''); }

  if (d.skills?.length) {
    lines.push('SKILLS');
    lines.push(d.skills.join(', '));
    lines.push('');
  }

  if (d.experience?.length) {
    lines.push('EXPERIENCE');
    d.experience.forEach(e => {
      lines.push(`${e.role} — ${e.company}  (${e.duration})`);
      (e.bullets || []).forEach(b => lines.push('  • ' + b));
    });
    lines.push('');
  }

  if (d.projects?.length) {
    lines.push('PROJECTS');
    d.projects.forEach(p => {
      lines.push(`${p.name}  [${p.tech}]`);
      (p.bullets || []).forEach(b => lines.push('  • ' + b));
    });
    lines.push('');
  }

  if (d.education?.length) {
    lines.push('EDUCATION');
    d.education.forEach(e => {
      lines.push(`${e.degree} — ${e.institution}  (${e.duration})`);
      if (e.details) lines.push('  ' + e.details);
    });
    lines.push('');
  }

  if (d.achievements?.length) {
    lines.push('ACHIEVEMENTS');
    d.achievements.forEach(a => lines.push(`  • ${a.title} — ${a.detail}`));
    lines.push('');
  }

  if (d.certifications?.length) {
    lines.push('CERTIFICATIONS');
    d.certifications.forEach(c => lines.push('  • ' + c));
  }

  return lines.join('\n');
}

// ── Panel helpers ──
function showPanel(name) {
  inputPanel.classList.add('hidden');
  loadingPanel.classList.add('hidden');
  resultPanel.classList.add('hidden');
  if (name === 'input')   inputPanel.classList.remove('hidden');
  if (name === 'loading') loadingPanel.classList.remove('hidden');
  if (name === 'result')  resultPanel.classList.remove('hidden');
}

function showError(msg) {
  errorMsg.textContent = msg;
  errorMsg.classList.remove('hidden');
}
function hideError() {
  errorMsg.classList.add('hidden');
}