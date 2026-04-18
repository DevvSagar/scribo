import { Link } from "react-router-dom";

const GithubIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4.5 w-4.5 fill-current">
    <path d="M12 .7a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2.1c-3.4.8-4.1-1.4-4.1-1.4-.6-1.4-1.3-1.8-1.3-1.8-1.1-.7.1-.7.1-.7 1.2.1 1.9 1.3 1.9 1.3 1.1 1.9 2.8 1.4 3.5 1.1.1-.8.4-1.4.8-1.7-2.7-.3-5.5-1.3-5.5-6A4.7 4.7 0 0 1 6.4 9c-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.2 1.2a11 11 0 0 1 5.8 0c2.2-1.5 3.2-1.2 3.2-1.2.6 1.6.2 2.8.1 3.1a4.7 4.7 0 0 1 1.2 3.2c0 4.7-2.8 5.7-5.5 6 .4.3.9 1 .9 2.2v3.2c0 .3.2.7.8.6A12 12 0 0 0 12 .7Z" />
  </svg>
);

const Footer = () => {
  return (
    <footer className="border-t border-black/8 bg-white/82 backdrop-blur-xl">
      <div className="mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-10 xl:px-12 2xl:px-16">
        <div className="grid min-h-[76px] grid-cols-[1fr_auto_1fr] items-center gap-4">
          <Link to="/" className="flex items-center gap-3 justify-self-start">
            <img
              src="/scribo-logo.png"
              alt="Scribo logo"
              className="h-10 w-10 rounded-2xl object-cover object-top ring-1 ring-black/8"
            />
            <div className="min-w-0">
              <p className="text-base font-semibold tracking-[0.01em] text-[#1f1f1f] sm:text-[1.05rem]">Scribo</p>
              <p className="hidden text-[0.68rem] uppercase tracking-[0.22em] text-[#8a8a8a] sm:block">
                AI Meeting Workspace
              </p>
            </div>
          </Link>

          <p className="justify-self-center text-sm font-medium text-[#5f5f5f]">
            Built by <span className="text-[#1f1f1f]">Sagar Pratap Singh (Devvx)</span>
          </p>

          <a
            href="https://github.com/DevvSagar"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            className="inline-flex items-center gap-2.5 justify-self-end rounded-full border border-black/10 bg-white px-4 py-2.5 text-sm font-medium text-[#1f1f1f] transition duration-300 hover:-translate-y-0.5 hover:border-black/16 hover:bg-[#fafafa]"
          >
            <GithubIcon />
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
