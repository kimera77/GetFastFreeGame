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
    <header className="absolute top-4 right-4 z-40">
      <Select
        value={language}
        onValueChange={(value) => setLanguage(value as Language)}
      >
        <SelectTrigger className="w-auto bg-transparent border-0 gap-2">
          <Globe className="h-4 w-4 text-muted-foreground" />
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
    </header>
  );
}
