const socialLinks = [
  {
    label: "Instagram",
    href: "https://instagram.com",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current">
        <path d="M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9a5.5 5.5 0 0 1-5.5 5.5h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2Zm0 1.8A3.7 3.7 0 0 0 3.8 7.5v9a3.7 3.7 0 0 0 3.7 3.7h9a3.7 3.7 0 0 0 3.7-3.7v-9a3.7 3.7 0 0 0-3.7-3.7h-9Zm9.8 1.4a1.1 1.1 0 1 1 0 2.2a1.1 1.1 0 0 1 0-2.2ZM12 7a5 5 0 1 1 0 10a5 5 0 0 1 0-10Zm0 1.8A3.2 3.2 0 1 0 12 15.2A3.2 3.2 0 0 0 12 8.8Z" />
      </svg>
    ),
  },
  {
    label: "Discord",
    href: "https://discord.com",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current">
        <path d="M19.5 5.6a15 15 0 0 0-3.7-1.2l-.2.4c1.4.4 2 .8 2.8 1.3a12 12 0 0 0-6.4-1.7A12 12 0 0 0 5.6 6c.7-.5 1.4-.9 2.8-1.3l-.2-.4a15 15 0 0 0-3.7 1.2C2.1 9 1.5 12.3 1.8 15.6a15 15 0 0 0 4.5 2.3l1.1-1.8c-.6-.2-1.2-.5-1.8-.8l.4-.3c3.4 1.6 7.1 1.6 10.4 0l.4.3c-.6.3-1.2.6-1.8.8l1.1 1.8a15 15 0 0 0 4.5-2.3c.5-3.8-.8-7.1-3.1-10ZM9.5 13.7c-.9 0-1.6-.8-1.6-1.8S8.6 10 9.5 10s1.6.8 1.6 1.8-.7 1.9-1.6 1.9Zm5 0c-.9 0-1.6-.8-1.6-1.8s.7-1.8 1.6-1.8 1.6.8 1.6 1.8-.7 1.9-1.6 1.9Z" />
      </svg>
    ),
  },
  {
    label: "GitHub",
    href: "https://github.com",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current">
        <path d="M12 .7a12 12 0 0 0-3.8 23.4c.6.1.8-.2.8-.6v-2.1c-3.3.7-4-1.4-4-1.4-.5-1.3-1.3-1.7-1.3-1.7-1-.7.1-.7.1-.7 1.1.1 1.8 1.1 1.8 1.1 1 .1 1.9.7 2.3 1.8.9.4 1.8.4 2.7.1.1-.7.4-1.4.8-1.9-2.6-.3-5.4-1.3-5.4-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.6.1-3.2 0 0 1-.3 3.3 1.2a11.3 11.3 0 0 1 6 0C18.8 4 19.8 4.3 19.8 4.3c.6 1.6.2 2.9.1 3.2.8.8 1.2 1.8 1.2 3.2 0 4.6-2.8 5.6-5.4 5.9.4.4.9 1.2.9 2.4v3.5c0 .4.2.7.8.6A12 12 0 0 0 12 .7Z" />
      </svg>
    ),
  },
];

const Footer = () => {
  return (
    <footer className="border-t border-white/10 bg-slate-950/80">
      <div className="flex w-full flex-col gap-5 px-6 py-6 text-slate-400 sm:px-8 lg:flex-row lg:items-end lg:justify-between lg:px-10 xl:px-12 xl:py-7 2xl:px-16">
        <div className="flex flex-col items-center gap-3 lg:items-start">
          <div className="flex items-center gap-3">
            <img
              src="/scribo-logo.png"
              alt="Scribo logo"
              className="h-11 w-11 rounded-2xl object-cover object-top ring-1 ring-white/10 xl:h-12 xl:w-12"
            />
            <div>
              <p className="bg-gradient-to-r from-blue-300 via-sky-400 to-violet-400 bg-clip-text text-lg font-semibold text-transparent xl:text-xl">
                Scribo
              </p>
              <p className="text-[0.7rem] uppercase tracking-[0.32em] text-slate-500 xl:text-xs">
                Smart meeting notes
              </p>
            </div>
          </div>
          <p className="text-center text-base leading-6 sm:text-lg lg:text-left">
            &copy; Built and Developed by Sagar Singh (DevvSagar)
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 text-slate-300 lg:justify-end xl:gap-4">
          {socialLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              aria-label={link.label}
              className="rounded-full border border-white/10 bg-white/5 p-2.5 transition duration-300 hover:-translate-y-1 hover:border-blue-400 hover:text-white xl:p-3"
            >
              {link.icon}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
