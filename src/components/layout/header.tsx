'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { translations, type Language } from '@/lib/translations';
import { Globe } from 'lucide-react';

type HeaderProps = {
  language: Language;
  setLanguage: (language: Language) => void;
};

export function Header({ language, setLanguage }: HeaderProps) {
  return (
    <header className="py-4 px-4 sm:px-6 lg:px-8 bg-background/80 backdrop-blur-sm sticky top-0 z-40 border-b border-border">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2">
           <Globe className="h-6 w-6 text-primary" />
           <p className="font-headline font-bold text-lg">Daily Game Drop</p>
        </div>
        
        <Select
          value={language}
          onValueChange={(value) => setLanguage(value as Language)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Language" />
          </SelectTrigger>
          <SelectContent>
            {Object.keys(translations).map((lang) => (
              <SelectItem key={lang} value={lang}>
                {
                  {
                    en: 'English',
                    es: 'Español',
                    de: 'Deutsch',
                    fr: 'Français',
                    pt: 'Português',
                    it: 'Italiano',
                  }[lang as Language]
                }
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </header>
  );
}
