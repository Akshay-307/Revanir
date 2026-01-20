import { format } from 'date-fns';
import { enUS, hi, gu } from 'date-fns/locale';
import i18n from '@/i18n';

const locales: Record<string, any> = {
    en: enUS,
    hi: hi,
    gu: gu,
};

export const getLocale = () => {
    return locales[i18n.language] || enUS;
};

export const formatDate = (date: Date | string | number, formatStr: string) => {
    return format(new Date(date), formatStr, { locale: getLocale() });
};
