export default function Footer() {
    return (
      <footer className="border-t py-6 md:py-8">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built with Next.js, Tailwind CSS, and OpenAI API. 
            <span className="ml-1">© {new Date().getFullYear()} AI Writing Assistant.</span>
          </p>
          <div className="flex items-center gap-4">
            <a 
              href="https://www.linkedin.com/in/pranav-vp-3636b825a/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              LinkedIn
            </a>
            <a 
              href="https://github.com/VPPranav" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    )
  }
  