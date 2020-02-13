import { translations as EnglishAU } from './en_au';
import { translations as SimplifiedChinese } from './zh_cn';

export const enum Languages {
  ZH_CN = 'zh_cn',
  EN_AU = 'en_au',
}

type TranslationList = typeof SimplifiedChinese;
export type TranslationKeys = keyof TranslationList;

type TranslationsList = {
  [K in Languages]: TranslationList;
};

const allTranslations: TranslationsList = {
  [Languages.ZH_CN]: SimplifiedChinese,
  [Languages.EN_AU]: EnglishAU,
};

export const getLanguageDictionary = (lang: Languages) => {
  return allTranslations[lang];
};