    // ---- Section reveal on scroll ----
    document.addEventListener('DOMContentLoaded', () => {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (window.gsap && window.ScrollTrigger) {
        gsap.registerPlugin(ScrollTrigger);

        document.querySelectorAll('section').forEach(sec => {
          if (sec.id === 'hero') return;
          gsap.from(sec.querySelectorAll('.eyebrow, h2, .lede, .about-grid, .project, .skills-grid, .exp-block, .now-grid, .contact-grid'), {
            y: reduced ? 0 : 24,
            opacity: 0,
            duration: 0.7,
            stagger: 0.08,
            ease: 'power2.out',
            scrollTrigger: { trigger: sec, start: 'top 78%' }
          });
        });

        if (!reduced) {
          gsap.from('.headline, .hero-sub, .hero-cta, .hero-tag', {
            y: 20, opacity: 0, duration: 0.8, stagger: 0.12, ease: 'power2.out', delay: 0.1
          });

          gsap.from('.hero-image-inner', {
            scale: 0.85, opacity: 0, rotationY: -15, rotationX: 10, duration: 1.2, ease: 'power3.out', delay: 0.3
          });

          // signal trace draws in as you scroll
          const path = document.getElementById('tracepath');
          const len = path.getTotalLength();
          path.style.strokeDasharray = len;
          path.style.strokeDashoffset = len;
          gsap.to(path, {
            strokeDashoffset: 0,
            ease: 'none',
            scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 0.6 }
          });
        }
      }

      // ---- Project accordion ----
      document.querySelectorAll('.project-head').forEach(head => {
        const toggle = () => {
          const proj = head.closest('.project');
          const isOpen = proj.classList.toggle('open');
          head.setAttribute('aria-expanded', isOpen);
        };
        head.addEventListener('click', toggle);
        head.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
      });

      // ---- Command palette ----
      const overlay = document.getElementById('palette-overlay');
      const input = document.getElementById('paletteInput');
      const results = document.getElementById('palette-results');
      const items = [
        { label: 'About', href: '#about' },
        { label: 'Selected Work', href: '#work' },
        { label: 'Skills', href: '#skills' },
        { label: 'Experience', href: '#experience' },
        { label: 'Open Source / Now', href: '#now' },
        { label: 'Contact', href: '#contact' },
        { label: 'Email me', href: 'mailto:chiru8939@gmail.com' },
        { label: 'GitHub profile', href: 'https://github.com/chiranjeevigoli' },
      ];
      function renderResults(filter = '') {
        results.innerHTML = '';
        items.filter(i => i.label.toLowerCase().includes(filter.toLowerCase())).forEach((i, idx) => {
          const btn = document.createElement('button');
          btn.textContent = i.label;
          if (idx === 0) btn.classList.add('active');
          btn.addEventListener('click', () => { window.location.href = i.href; closePalette(); });
          results.appendChild(btn);
        });
      }
      function openPalette() { overlay.classList.add('active'); input.value = ''; renderResults(); input.focus(); }
      function closePalette() { overlay.classList.remove('active'); }
      document.getElementById('paletteHint').addEventListener('click', openPalette);
      input?.addEventListener('input', e => renderResults(e.target.value));
      overlay.addEventListener('click', e => { if (e.target === overlay) closePalette(); });
      document.addEventListener('keydown', e => {
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); openPalette(); }
        if (e.key === 'Escape') closePalette();
      });

      // ---- Live GitHub stats (real API call, graceful fallback) ----
      fetch('https://api.github.com/users/chiranjeevigoli')
        .then(r => r.ok ? r.json() : Promise.reject())
        .then(data => {
          document.getElementById('statRepos').textContent = data.public_repos ?? '—';
          document.getElementById('statFollowers').textContent = data.followers ?? '—';
        })
        .catch(() => {
          document.getElementById('statRepos').textContent = '↗';
          document.getElementById('statFollowers').textContent = '↗';
        });

      fetch('https://api.github.com/users/chiranjeevigoli/repos?sort=updated&per_page=5')
        .then(r => r.ok ? r.json() : Promise.reject())
        .then(repos => {
          const list = document.getElementById('repoList');
          if (!Array.isArray(repos) || repos.length === 0) throw new Error('empty');
          list.innerHTML = '';
          repos.forEach(repo => {
            const li = document.createElement('li');
            li.innerHTML = `<a href="${repo.html_url}" target="_blank" rel="noopener">${repo.name}</a><span class="repo-lang">${repo.language || '—'}</span>`;
            list.appendChild(li);
          });
        })
        .catch(() => {
          document.getElementById('repoList').innerHTML =
            '<li>Live repo list unavailable right now — <a href="https://github.com/chiranjeevigoli" target="_blank" rel="noopener">view on GitHub →</a></li>';
        });
    });
