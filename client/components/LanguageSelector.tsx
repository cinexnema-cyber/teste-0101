import React from 'react';
import { useLanguage, languages, Language } from '@/contexts/LanguageContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';

export function LanguageSelector() {
  const { language, setLanguage, isChanging } = useLanguage();

  const currentLanguage = languages.find(lang => lang.code === language);

  const handleLanguageChange = (langCode: Language) => {
    setLanguage(langCode);

    // Provide immediate visual feedback
    const event = new CustomEvent('languageChanged', {
      detail: { language: langCode }
    });
    window.dispatchEvent(event);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`h-9 px-3 gap-2 text-sm font-medium hover:bg-xnema-surface transition-all duration-200 ${
            isChanging ? 'scale-105 bg-xnema-orange/20' : ''
          }`}
        >
          <span className="text-lg">{currentLanguage?.flag}</span>
          <span className="hidden sm:inline">{currentLanguage?.name}</span>
          <span className="sr-only">Selecionar idioma</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 p-1">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code as Language)}
            className={`
              flex items-center gap-3 px-3 py-2 cursor-pointer rounded-md transition-all duration-200
              ${language === lang.code
                ? 'bg-xnema-orange text-white shadow-sm'
                : 'hover:bg-xnema-surface hover:scale-105'
              }
            `}
          >
            <span className="text-lg flex-shrink-0">{lang.flag}</span>
            <span className="font-medium">{lang.name}</span>
            {language === lang.code && (
              <span className="ml-auto text-xs opacity-75">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
