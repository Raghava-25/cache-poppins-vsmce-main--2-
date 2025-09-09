import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4 text-gradient">Cache 2025</h3>
            <p className="text-muted-foreground">
              VSM College of Engineering's premier tech festival bringing
              together innovation and competition.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Quick Links</h4>
            <div className="space-y-2">
              <Link
                to="/about"
                className="block text-muted-foreground hover:text-primary smooth-transition"
              >
                About Us
              </Link>
              <Link
                to="/organizers"
                className="block text-muted-foreground hover:text-primary smooth-transition"
              >
                Organizers
              </Link>
              <Link
                to="/rules"
                className="block text-muted-foreground hover:text-primary smooth-transition"
              >
                Rules
              </Link>
              <Link
                to="/registration"
                className="block text-muted-foreground hover:text-primary smooth-transition"
              >
                Registration
              </Link>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Contact Us</h4>
            <div className="space-y-2 text-muted-foreground">
              <p>raghavap1116@gmail.com</p>
              <p>VSM College of Engineering</p>
              <p>Ramachandrapuram, Andhra Pradesh</p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Developers</h4>
            <div className="space-y-3 text-muted-foreground">
              <div>
                <a
                  href="https://www.linkedin.com/in/karthikeya-r"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium underline hover:text-primary smooth-transition"
                >
                  Karthikeya Raparla
                </a>
                <p className="text-sm">CEO and Founder of UptoMo</p>
              </div>
              <div>
                <a
                  href="https://www.linkedin.com/in/pasupuleti-jaya-raghavendrra-swame"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium underline hover:text-primary smooth-transition"
                >
                  Raghavendrra pasupuleti
                </a>
                <p className="text-sm">Co-founder and Developer</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
          <p>
            &copy; Cache 2025, <a href="https://uptomo.vercel.app/" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">UptoMo Web Solutions</a>. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
