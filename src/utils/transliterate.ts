import Sanscript from '@indic-transliteration/sanscript';
import i18n from '@/i18n';
import { useState, useEffect, useMemo } from 'react';

export const transliterateText = (text: string, lang: string): string => {
    if (!text) return '';
    if (lang === 'en') return text;

    // Map app language codes to Sanscript scheme names
    const targetScheme = lang === 'hi' ? 'devanagari' : (lang === 'gu' ? 'gujarati' : null);

    if (!targetScheme) return text;

    try {
        // We lowercase the text because ITRANS is case-sensitive (e.g. 'A' = 'aa'), 
        // but typical English input for names is Capitalized (e.g. 'Akshay').
        // Converting to lowercase usually yields better 'default' results for names.
        // We also handle some common English-to-Indic phonetic quirks if needed,
        // but for now relying on strict ITRANS integration.
        const input = text.toLowerCase();

        // Using 'itrans' as the source scheme for English input
        return Sanscript.t(input, 'itrans', targetScheme);
    } catch (error) {
        console.warn('Transliteration failed:', error);
        return text;
    }
};

export const useTransliteration = (text: string | null | undefined) => {
    const [translated, setTranslated] = useState<string>(text || '');
    const [currentLang, setCurrentLang] = useState(i18n.language);

    useEffect(() => {
        const handleLangChange = () => {
            setCurrentLang(i18n.language);
        };

        i18n.on('languageChanged', handleLangChange);
        return () => {
            i18n.off('languageChanged', handleLangChange);
        };
    }, []);

    const result = useMemo(() => {
        if (!text) return '';
        return transliterateText(text, currentLang);
    }, [text, currentLang]);

    return result;
};
