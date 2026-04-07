import { Link } from "react-router-dom";

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4.5 w-4.5 fill-none stroke-current">
    <rect x="3.5" y="3.5" width="17" height="17" rx="5" strokeWidth="1.8" />
    <circle cx="12" cy="12" r="4" strokeWidth="1.8" />
    <circle cx="17.4" cy="6.6" r="1" fill="currentColor" stroke="none" />
  </svg>
);

const GithubIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4.5 w-4.5 fill-current">
    <path d="M12 .7a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2.1c-3.4.8-4.1-1.4-4.1-1.4-.6-1.4-1.3-1.8-1.3-1.8-1.1-.7.1-.7.1-.7 1.2.1 1.9 1.3 1.9 1.3 1.1 1.9 2.8 1.4 3.5 1.1.1-.8.4-1.4.8-1.7-2.7-.3-5.5-1.3-5.5-6A4.7 4.7 0 0 1 6.4 9c-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.2 1.2a11 11 0 0 1 5.8 0c2.2-1.5 3.2-1.2 3.2-1.2.6 1.6.2 2.8.1 3.1a4.7 4.7 0 0 1 1.2 3.2c0 4.7-2.8 5.7-5.5 6 .4.3.9 1 .9 2.2v3.2c0 .3.2.7.8.6A12 12 0 0 0 12 .7Z" />
  </svg>
);

const LinkedinIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4.5 w-4.5 fill-current">
    <path d="M4.98 3.5a2.49 2.49 0 1 0 0 4.98 2.49 2.49 0 0 0 0-4.98ZM3 8.98h3.96V21H3zM10.2 8.98h3.8v1.64h.05c.53-1 1.82-2.06 3.74-2.06 4 0 4.74 2.63 4.74 6.06V21h-3.96v-5.69c0-1.36-.02-3.1-1.89-3.1-1.9 0-2.2 1.48-2.2 3V21H10.2z" />
  </svg>
);

const socialLinks = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/sagarssinghh?utm_source=qr",
    icon: InstagramIcon,
  },
  {
    label: "GitHub",
    href: "https://github.com/DevvSagar",
    icon: GithubIcon,
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/devvsag/",
    icon: LinkedinIcon,
  },
];

const Footer = () => {
  return (
    <footer className="border-t border-black/8 bg-[linear-gradient(180deg,#ffffff_0%,#fafafa_100%)] px-5 py-6 sm:px-8 lg:px-10 xl:px-12 xl:py-8 2xl:px-16">
      <div className="mx-auto w-full max-w-[1440px]">
        <div className="flex flex-col items-center gap-5 text-center md:grid md:grid-cols-[1fr_auto_1fr] md:items-center md:gap-6">
          <Link to="/" className="flex items-center gap-3.5 md:justify-self-start">
            <img
              src="/scribo-logo.png"
              alt="Scribo logo"
              className="h-10 w-10 rounded-2xl object-cover object-top ring-1 ring-black/8"
            />
            <p className="text-lg font-semibold text-[#1f1f1f]">Scribo</p>
          </Link>

          <p className="text-sm font-medium text-[#5f5f5f] md:justify-self-center">
            Built by <span className="text-[#1f1f1f]">Devvx</span>
          </p>

          <div className="flex items-center gap-2.5 md:justify-self-end">
            {socialLinks.map((item) => {
              const Icon = item.icon;

              return (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={item.label}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/8 bg-white text-[#5f5f5f] transition duration-300 hover:-translate-y-0.5 hover:border-black/14 hover:text-[#1f1f1f]"
                >
                  <Icon />
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
