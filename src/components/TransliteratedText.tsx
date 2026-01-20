import { useTransliteration } from '@/utils/transliterate';

export const TransliteratedText = ({ text, className }: { text: string | undefined, className?: string }) => {
    const translated = useTransliteration(text);
    return <span className={className}>{translated}</span>;
};
