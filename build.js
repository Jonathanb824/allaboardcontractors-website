// Builds the All Aboard Contractors site.
// Reads content/*.json (edited through /admin) and src/template.html,
// and writes the finished site to dist/. No packages needed.
const fs = require("fs");
const path = require("path");

const root = __dirname;
// Each file in content/ is one page of the editor (hero.json, faq.json, ...)
const c = {};
for (const f of fs.readdirSync(path.join(root, "content"))) {
  if (f.endsWith(".json")) c[f.slice(0, -5)] = JSON.parse(fs.readFileSync(path.join(root, "content", f), "utf8"));
}
let html = fs.readFileSync(path.join(root, "src", "template.html"), "utf8");

// ---------- helpers ----------
const esc = (v) =>
  String(v == null ? "" : v)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
const list = (v) => (Array.isArray(v) ? v : []);
const digits = (p) => String(p || "").replace(/\D/g, "");
const tel = (p) => {
  const d = digits(p);
  return "tel:+" + (d.length === 10 ? "1" + d : d);
};
const ld = (p) => {
  const d = digits(p).slice(-10);
  return d.length === 10 ? `+1-${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}` : esc(p);
};
const img = (src, alt, lazy = true) =>
  src ? `<img${lazy ? ' loading="lazy"' : ""} src="${esc(src)}" alt="${esc(alt)}" onerror="this.remove()">` : "";
const ICONS = ["land", "demo", "concrete", "fence", "tree", "property"];

const b = c.business || {};
const phone1 = b.phone_main || "";
const phone2 = b.phone_second || "";
const services = list(c.services && c.services.items);

// ---------- sections ----------
const hero = (h = c.hero || {}) => `  <!-- ============ HERO ============ -->
  <section class="hero" id="top">
    <svg class="topo" aria-hidden="true"><use href="#topo"/></svg>
    <div class="wrap">
      <div class="hero__grid">
        <div class="hero__inner">
          <h1 class="manifesto"><span class="lead">${esc(h.lead)}</span> ${esc(h.statement)}</h1>
          <div class="hero__cta">
            <a class="btn btn--blue" href="#contact">Request a free estimate</a>
            <a class="btn btn--line" href="#expertise">See what we do</a>
          </div>
        </div>
        <div class="hero__media">
          <div class="ph">${img(h.image, h.image_alt, false)}</div>
        </div>
      </div>
      <dl class="stats">
${list(h.stats).map((s) => `        <div><dt>${esc(s.number)}</dt><dd>${esc(s.label)}</dd></div>`).join("\n")}
      </dl>
    </div>
  </section>`;

const expertise = (e = c.expertise || {}) => `  <!-- ============ EXPERTISE ============ -->
  <section class="expertise" id="expertise">
    <div class="expertise__band">
      <div class="expertise__photo">
        ${img(e.background, "")}
      </div>
      <div class="wrap">
        <h2>${esc(e.heading)}</h2>
        <p>${esc(e.intro)}</p>
      </div>
    </div>
    <div class="wrap">
      <div class="cards">
${list(e.cards)
  .map(
    (k) => `        <article class="card">
          <div class="ph">${img(k.image, k.image_alt)}</div>
          <div class="card__body">
            <h3>${esc(k.title)}</h3>
            <p>${esc(k.text)}</p>
            <ul>
${list(k.points).map((p) => `              <li>${esc(p)}</li>`).join("\n")}
            </ul>
            <a class="textlink" href="#services">Explore ${esc(String(k.title || "").toLowerCase())}</a>
          </div>
        </article>`
  )
  .join("\n")}
      </div>

      <div class="index" id="services">
        <h3>${esc((c.services || {}).heading)}</h3>
        <ul class="index__list">
${services
  .map(
    (s) => `          <li class="index__row">
            <span class="index__icon"><svg aria-hidden="true"><use href="#i-${ICONS.includes(s.icon) ? s.icon : "property"}"/></svg></span>
            <span class="index__name">${esc(s.name)}</span>
            <span class="index__desc">${esc(s.description)}</span>
            <a class="textlink" href="#contact" data-service="${esc(s.name)}">Get an estimate</a>
          </li>`
  )
  .join("\n")}
        </ul>
      </div>
    </div>
  </section>`;

const work = (w = c.projects || {}) => `  <!-- ============ FEATURED WORK ============ -->
  <section class="section work" id="work" aria-labelledby="work-title">
    <div class="wrap">
      <div class="work__head">
        <div>
          <h2 id="work-title">${esc(w.heading)}</h2>
          <p>${esc(w.intro)}</p>
        </div>
        <div class="work__controls">
          <button type="button" id="work-prev" aria-label="Previous project" disabled><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg></button>
          <button type="button" id="work-next" aria-label="Next project"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg></button>
        </div>
      </div>
    </div>
    <ul class="track" id="work-track" tabindex="0" aria-label="${esc(w.heading)}">
${list(w.items)
  .map(
    (p) => `      <li class="slide ph ph--dark">
        ${img(p.image, p.image_alt)}
        <div class="slide__text"><span class="slide__tag">${esc(p.tag)}</span><h3>${esc(p.title)}</h3><p>${esc(p.text)}</p></div>
      </li>`
  )
  .join("\n")}
    </ul>
  </section>`;

const company = (m = c.company || {}) => `  <!-- ============ COMPANY ============ -->
  <section class="section" id="company">
    <div class="wrap">
      <div class="company">
        <div class="company__media">
          <div class="ph">${img(m.image, m.image_alt)}</div>
        </div>
        <div>
          <h2>${esc(m.heading)}</h2>
${list(m.paragraphs).map((p) => `          <p>${esc(p)}</p>`).join("\n")}
          <dl class="certs">
${list(m.certifications).map((x) => `            <div><dt>${esc(x.code)}</dt><dd>${esc(x.name)}</dd></div>`).join("\n")}
          </dl>
        </div>
      </div>
    </div>
  </section>`;

const processSection = (p = c.process || {}) => `  <!-- ============ PROCESS ============ -->
  <section class="section section--tint" id="process">
    <div class="wrap">
      <div class="section-head">
        <h2>${esc(p.heading)}</h2>
        <p>${esc(p.intro)}</p>
      </div>
      <ol class="rail">
${list(p.steps)
  .map(
    (s, i) => `        <li>
          <span class="rail__n">Step ${i + 1}</span>
          <h3>${esc(s.title)}</h3>
          <p>${esc(s.text)}</p>
        </li>`
  )
  .join("\n")}
      </ol>
    </div>
  </section>`;

const next = (a = c.agencies || {}) => `  <!-- ============ NEXT STEPS ============ -->
  <section class="section" aria-labelledby="next-title">
    <div class="wrap">
      <div class="next">
        <div class="next__body">
          <svg class="topo" aria-hidden="true"><use href="#topo"/></svg>
          <h2 id="next-title">${esc(a.heading)}</h2>
          <p>${esc(a.text)}</p>
          <div class="next__cta">
${a.capability_statement ? `            <a class="btn btn--yellow" href="${esc(a.capability_statement)}" target="_blank" rel="noopener">View our capability statement</a>\n` : ""}            <a class="btn btn--ghost" href="${tel(phone1)}">Call ${esc(phone1)}</a>
          </div>
        </div>
        <div class="ph ph--dark">${img(a.image, a.image_alt)}</div>
      </div>
    </div>
  </section>`;

const faq = (f = c.faq || {}) => `  <!-- ============ FAQ ============ -->
  <section class="section" id="faq" style="padding-top:0">
    <div class="wrap">
      <div class="faq">
        <div class="faq__intro">
          <h2>${esc(f.heading)}</h2>
          <p>${esc(f.intro)}</p>
        </div>
        <div>
${list(f.items)
  .map(
    (q, i) => `          <details${i === 0 ? " open" : ""}>
            <summary>${esc(q.question)}</summary>
            <p>${esc(q.answer)}</p>
          </details>`
  )
  .join("\n")}
        </div>
      </div>
    </div>
  </section>`;

const contactRows = () =>
  [
    phone1 && `            <li><small>Phone</small><a href="${tel(phone1)}">${esc(phone1)}</a></li>`,
    phone2 && `            <li><small>Phone</small><a href="${tel(phone2)}">${esc(phone2)}</a></li>`,
    b.email && `            <li><small>Email</small><a href="mailto:${esc(b.email)}">${esc(b.email)}</a></li>`,
    (b.street || b.city_line) && `            <li><small>Office</small><address>${esc(b.street)}<br>${esc(b.city_line)}</address></li>`,
  ]
    .filter(Boolean)
    .join("\n");

const contact = (k = c.contact || {}) => `  <!-- ============ CONTACT ============ -->
  <section class="section section--tint" id="contact">
    <div class="wrap">
      <div class="contact">
        <div>
          <h2>${esc(k.heading)}</h2>
          <p class="contact__lead">${esc(k.intro)}</p>
          <ul class="contact__list">
${contactRows()}
          </ul>
        </div>

        <form class="form" id="estimate-form" novalidate>
          <div class="form__grid">
            <div class="field">
              <label for="f-name">Name</label>
              <input id="f-name" name="name" autocomplete="name" required>
            </div>
            <div class="field">
              <label for="f-phone">Phone</label>
              <input id="f-phone" name="phone" type="tel" autocomplete="tel" inputmode="tel" required>
            </div>
            <div class="field">
              <label for="f-email">Email (optional)</label>
              <input id="f-email" name="email" type="email" autocomplete="email">
            </div>
            <div class="field">
              <label for="f-service">Service</label>
              <select id="f-service" name="service">
${services.map((s) => `                <option>${esc(s.name)}</option>`).join("\n")}
                <option>Something else</option>
              </select>
            </div>
            <div class="field field--full">
              <label for="f-where">Project address or ZIP code</label>
              <input id="f-where" name="where" autocomplete="street-address">
            </div>
            <div class="field field--full">
              <label for="f-details">What do you need done?</label>
              <textarea id="f-details" name="details" placeholder="Size of the lot, length of fence, what needs to be removed, your timeline"></textarea>
            </div>
          </div>
          <button class="btn btn--blue" type="submit">Email my request</button>
          <p class="form__note">This opens your email app with your request filled in, ready to send.</p>
          <p class="form__status" id="form-status" role="status" hidden></p>
        </form>
      </div>
    </div>
  </section>`;

const footerLead = (f = c.footer || {}) => `    <div class="footer-lead">
      <div>
        <h2>${esc(f.heading)}</h2>
        <p>${esc(f.text)}</p>
      </div>
      <div class="footer-lead__cta">
        <a class="btn btn--yellow" href="#contact">Request a free estimate</a>
        <a class="btn btn--ghost" href="${tel(phone1)}">Call ${esc(phone1)}</a>
      </div>
    </div>`;

const footerContact = () =>
  [
    phone1 && `          <li><a href="${tel(phone1)}">${esc(phone1)}</a></li>`,
    phone2 && `          <li><a href="${tel(phone2)}">${esc(phone2)}</a></li>`,
    b.email && `          <li><a href="mailto:${esc(b.email)}">Email us</a></li>`,
    (b.street || b.city_line) && `          <li>${esc(b.street)}<br>${esc(b.city_line)}</li>`,
  ]
    .filter(Boolean)
    .join("\n");

const socials = [
  ["Facebook", b.facebook],
  ["Instagram", b.instagram],
  ["LinkedIn", b.linkedin],
].filter((x) => x[1]);

// ---------- fill the template ----------
const values = {
  SECTION_HERO: hero(),
  SECTION_EXPERTISE: expertise(),
  SECTION_WORK: work(),
  SECTION_COMPANY: company(),
  SECTION_PROCESS: processSection(),
  SECTION_NEXT: next(),
  SECTION_FAQ: faq(),
  SECTION_CONTACT: contact(),
  FOOTER_LEAD: footerLead(),
  FOOTER_TAG: esc(b.tagline),
  FOOTER_CONTACT: footerContact(),
  FOOTER_SOCIAL: socials.map(([n, u]) => `          <li><a href="${esc(u)}" rel="noopener">${n}</a></li>`).join("\n"),
  PHONE1: esc(phone1),
  PHONE1_TEL: tel(phone1),
  PHONE1_LD: ld(phone1),
  EMAIL: esc(b.email),
  STREET: esc(b.street),
  SAMEAS: JSON.stringify(socials.map((x) => x[1])),
};
html = html.replace(/\{\{([A-Z0-9_]+)\}\}/g, (m, k) => {
  if (!(k in values)) throw new Error("No value for " + k);
  return values[k];
});

// ---------- write dist ----------
const dist = path.join(root, "dist");
fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });
fs.writeFileSync(path.join(dist, "index.html"), html);
for (const dir of ["images", "admin"]) {
  const from = path.join(root, dir);
  if (fs.existsSync(from)) fs.cpSync(from, path.join(dist, dir), { recursive: true });
}
console.log("Built dist/index.html (" + Math.round(html.length / 1024) + " KB)");
