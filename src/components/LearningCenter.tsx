import React from 'react';
import Markdown from 'react-markdown';
import { Shield, Lock, Globe, RefreshCw, Key, Server, Terminal, Database, Eye, Search, GraduationCap, Zap } from 'lucide-react';

const LearningCenter: React.FC = () => {
  const securityContent = `
# Securing Your Financial Accounts: A Defense-in-Depth Strategy

Making your website secure is a continuous process rather than a one-time setup. It requires a "defense-in-depth" strategy, which involves layering multiple security measures so that if one fails, others are in place to protect your data.

## Foundational Security Steps

* **Use HTTPS and SSL Certificates**: Encrypting data between the user's browser and your server is essential. This protects sensitive information like login credentials and payment details and is a key ranking factor for Google SEO.
* **Keep Everything Updated**: Outdated CMS platforms (like WordPress), plugins, and themes are the most common entry points for hackers. Enable automatic updates whenever possible.
* **Choose a Secure Hosting Provider**: Your host is your first line of defense. Look for providers that offer built-in firewalls, DDoS protection, malware scanning, and automatic backups.
* **Enforce Strong Passwords and 2FA**: Weak passwords cause the majority of data breaches. Require long, complex, and unique passwords, and implement Two-Factor Authentication (2FA) for all admin accounts.

## Technical Hardening

* **Install a Web Application Firewall (WAF)**: A WAF acts as a "bouncer," filtering out malicious traffic and blocking common attacks like SQL injection and Cross-Site Scripting (XSS) before they reach your site.
* **Sanitize User Input**: Never trust data from users. Thoroughly validate and sanitize all form inputs to prevent attackers from executing harmful code or manipulating your database.
* **Implement Secure HTTP Headers**: Configure headers like Content-Security-Policy (CSP) to control what content is safe to load and X-Frame-Options to prevent clickjacking.
* **Use SFTP Instead of FTP**: Standard FTP transfers data in cleartext, making it vulnerable to interception. Secure File Transfer Protocol (SFTP) encrypts both commands and data.

## DDoS Resilience: Multi-Layered Defense

For handling **DDoS attacks (Distributed Denial of Service)**, defense must shift from simple limits to a strategy that protects different levels of your stack:

### 1. The "Shock Absorber" (Nginx/Server Level)
Nginx filters out "bad" traffic before it reaches your application, preserving CPU and memory.
* **Limit Concurrent Connections**: Stop a single IP from opening hundreds of parallel connections to exhaust server resources.
* **Close "Slow" Connections**: Mitigate Slowloris attacks that try to keep connections open as long as possible.
* **Buffer Control**: Prevent large-scale volumetric request floods from overwhelming your backend.
* **IP Denylisting**: Block specific ranges of attacking IPs immediately.

### 2. Intelligent Application Defense (Next.js/Express Level)
Modern application security includes protecting against logic-based DoS attacks targeting expensive SSR or API routes.
* **Sliding Window Rate Limiting**: Tracks requests over a rolling timeframe to prevent "burst" bypasses.
* **Identify Costly Endpoints**: Apply stricter limits to endpoints performing heavy database queries or AI tasks.
* **Patch Vulnerabilities**: Ensure you are running the latest versions to patch known memory exhaustion vulnerabilities.

### 3. The "Edge": Your First Line of Defense
For massive attacks that saturate network bandwidth, software-level limits are not enough. Edge providers like Cloudflare or Vercel "scrub" traffic before it reaches your server.
* **"I'm Under Attack" Mode**: Forces visitors to pass a JavaScript or Captcha challenge, filtering out 99% of botnets.
* **Global CDN Caching**: Serves cached versions of your site, absorbing the traffic surge instead of hitting your backend.
* **Geo-Blocking**: Block entire regions where you don't have customers if an attack originates there.

## Step-by-Step: Hardening TradeLab

### 1. Configuring Security Headers (Express + Helmet)
We use the \`helmet\` library to automatically set secure HTTP headers.
1. **Install**: \`npm install helmet\`
2. **Implement**: Add \`app.use(helmet())\` to your Express server.
3. **Customize CSP**: Define a Content Security Policy to restrict where scripts and images can be loaded from, preventing XSS attacks.

### 2. Enabling Multi-Factor Authentication (Firebase)
Since TradeLab uses Firebase Auth, MFA can be enabled via the Firebase Console:
1. **Go to Console**: Navigate to the Authentication section.
2. **Settings**: Click on the 'Settings' tab and then 'Phone numbers' or 'MFA'.
3. **Enrollment**: Implement the \`multiFactor\` property in the frontend code to prompt users for a second factor during login.

## Access and Data Management

* **Principle of Least Privilege**: Grant users only the minimum access necessary for their role. Regularly review and remove inactive or unnecessary accounts.
* **Automated Off-site Backups**: Follow the 3-2-1 rule: keep 3 copies of your data on 2 different media types, with 1 copy stored off-site. Regularly test these backups to ensure they actually work for restoration.
* **Limit Data Collection**: Only store the sensitive information you absolutely need. Encrypt data at rest and in transit to minimize the impact of a potential breach.

## Ongoing Vigilance

* **Monitor Activity Logs**: Regularly review logs to spot unusual traffic spikes or unauthorized login attempts.
* **Conduct Regular Security Audits**: Periodically scan for malware and vulnerabilities. Consider hiring professionals for penetration testing to find hidden risks.
* **Train Your Team**: Since human error causes up to 80% of breaches, educate everyone on identifying phishing scams and maintaining good "cyber hygiene".

> “Cybersecurity shouldn't be scary, it should become second nature. I firmly believe that even the best technology is useless without trained, confident and empowered users.”
`;

  const sections = [
    { icon: Globe, label: 'HTTPS & SSL' },
    { icon: RefreshCw, label: 'Updates' },
    { icon: Server, label: 'Hosting' },
    { icon: Key, label: '2FA' },
    { icon: Shield, label: 'WAF' },
    { icon: Terminal, label: 'Sanitization' },
    { icon: Lock, label: 'Headers' },
    { icon: Zap, label: 'DDoS' },
  ];

  return (
    <div className="max-w-4xl mx-auto py-8 md:py-12 px-4 md:px-6">
      <div className="flex items-center gap-4 md:gap-5 mb-10 md:mb-12">
        <div className="w-12 h-12 md:w-14 md:h-14 bg-brand-primary rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg shadow-brand-primary/10">
          <GraduationCap className="text-white w-6 h-6 md:w-7 md:h-7" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-main">Learning Center</h1>
          <p className="text-muted text-xs md:text-sm font-medium">Master the fundamentals of financial security</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-10 md:mb-12">
        {sections.map((s) => (
          <div key={s.label} className="card-base p-4 md:p-5 flex flex-col items-center gap-2 md:gap-3 group hover:bg-surface-hover transition-all cursor-pointer">
            <s.icon className="w-4 h-4 md:w-5 md:h-5 text-muted group-hover:text-brand-primary transition-colors" />
            <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.1em] text-muted group-hover:text-main transition-colors text-center">{s.label}</span>
          </div>
        ))}
      </div>

      <div className="card-base p-6 md:p-16 relative overflow-hidden">
        <div className="markdown-body prose prose-invert max-w-none">
          <Markdown
            components={{
              h1: ({ children }) => <h1 className="text-2xl md:text-3xl font-bold mb-8 md:mb-10 text-main">{children}</h1>,
              h2: ({ children }) => <h2 className="text-base md:text-lg font-bold mt-10 md:mt-14 mb-4 md:mb-6 flex items-center gap-3 text-main">
                <Shield className="w-4 h-4 md:w-4.5 md:h-4.5 text-brand-primary" />
                {children}
              </h2>,
              h3: ({ children }) => <h3 className="text-sm md:text-base font-bold mt-6 md:mt-8 mb-3 md:mb-4 text-main">{children}</h3>,
              p: ({ children }) => <p className="text-muted leading-relaxed mb-4 md:mb-6 text-xs md:text-sm">{children}</p>,
              ul: ({ children }) => <ul className="space-y-3 md:space-y-4 mb-8 md:mb-10">{children}</ul>,
              li: ({ children }) => <li className="flex items-start gap-3 md:gap-4 text-muted text-xs md:text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-primary mt-1.5 md:mt-2 shrink-0" />
                <span>{children}</span>
              </li>,
              blockquote: ({ children }) => (
                <div className="my-10 md:my-14 p-6 md:p-8 bg-surface-hover border-l-4 border-brand-primary rounded-r-xl italic text-muted text-xs md:text-sm leading-relaxed">
                  {children}
                </div>
              ),
              strong: ({ children }) => <strong className="text-main font-bold">{children}</strong>,
              code: ({ children }) => <code className="bg-surface-hover px-1.5 py-0.5 rounded text-brand-primary text-[10px] md:text-xs font-mono">{children}</code>,
            }}
          >
            {securityContent}
          </Markdown>
        </div>

        <div className="mt-12 md:mt-16 pt-8 md:pt-10 border-t border-border flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 md:w-11 md:h-11 rounded-full bg-surface-hover flex items-center justify-center border border-border">
              <Eye className="w-4 h-4 md:w-4.5 md:h-4.5 text-muted" />
            </div>
            <div>
              <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.1em] text-muted">Verification Source</p>
              <p className="text-[10px] md:text-xs text-muted font-medium">Security Audit · March 2026</p>
            </div>
          </div>
          <button className="btn-primary w-full md:w-auto px-8 py-3 text-sm">
            Take Security Quiz
          </button>
        </div>
      </div>
    </div>
  );
};

export default LearningCenter;
