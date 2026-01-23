const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-charcoal-light border-t border-border py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Victoria Braids" className="h-24 w-auto object-contain" />
          </div>

          {/* Copyright */}
          <p className="font-sans text-muted-foreground text-sm text-center">
            © {currentYear} Victoria Braids. All rights reserved.
          </p>

          {/* Quick Links */}
          <div className="flex gap-6">
            <a
              href="#services"
              className="font-sans text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Services
            </a>
            <a
              href="#gallery"
              className="font-sans text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Gallery
            </a>
            <a
              href="#contact"
              className="font-sans text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
