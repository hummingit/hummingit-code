import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { Moon, Sun } from 'lucide-react';

const Index = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-secondary/30">
      <header className="p-4 flex justify-between items-center">
        <Logo size="md" />
        <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full">
          {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </Button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="animate-fade-in space-y-8 max-w-lg">
          <Logo size="xl" showText={false} className="justify-center animate-float" />
          <h1 className="text-5xl md:text-6xl font-display font-bold text-foreground">
            Hummingit
          </h1>
          <p className="text-xl text-muted-foreground italic">
            "Humm your message"
          </p>
          <p className="text-muted-foreground">
            Send voice messages that matter. Limited to 5 per day, so make each one count.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="btn-honey w-full sm:w-auto">
                Get Started
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="rounded-xl w-full sm:w-auto">
                Log In
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <footer className="p-4 text-center text-sm text-muted-foreground">
        © 2026 Hummingit. Messages auto-delete after 3 days.
      </footer>
    </div>
  );
};

export default Index;
