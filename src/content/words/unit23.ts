import type { Word } from '../../types/content';

// Unit 23 – Negation: Present Tense
// Grammar focus: negative subject prefixes (si/hu/ha/hatu/ham/hawa) + verb stem + -i ending
export const unit23Words: Word[] = [
  { id: 441, swahili: 'sisomi',     english: 'I do not read',           audio_file: '', unit_id: 23, pos: 'verb', example_sw: 'Sisomi magazeti.',              example_en: 'I do not read newspapers.' },
  { id: 442, swahili: 'husomi',     english: 'you do not read',         audio_file: '', unit_id: 23, pos: 'verb', example_sw: 'Husomi vitabu vya historia?',   example_en: 'You do not read history books?' },
  { id: 443, swahili: 'hasomi',     english: 'he / she does not read',  audio_file: '', unit_id: 23, pos: 'verb', example_sw: 'Hasomi Kiingereza.',            example_en: 'He/She does not read English.' },
  { id: 444, swahili: 'hatusomi',   english: 'we do not read',          audio_file: '', unit_id: 23, pos: 'verb', example_sw: 'Hatusomi usiku wa manane.',     example_en: 'We do not read in the middle of the night.' },
  { id: 445, swahili: 'sipendi',    english: 'I do not like',           audio_file: '', unit_id: 23, pos: 'verb', example_sw: 'Sipendi baridi ya maji.',       example_en: 'I do not like cold water.' },
  { id: 446, swahili: 'hupendi',    english: 'you do not like',         audio_file: '', unit_id: 23, pos: 'verb', example_sw: 'Hupendi chai yenye sukari?',    example_en: 'You do not like tea with sugar?' },
  { id: 447, swahili: 'hapendi',    english: 'he / she does not like',  audio_file: '', unit_id: 23, pos: 'verb', example_sw: 'Hapendi nyama kabisa.',         example_en: 'He/She does not like meat at all.' },
  { id: 448, swahili: 'hatupendi',  english: 'we do not like',          audio_file: '', unit_id: 23, pos: 'verb', example_sw: 'Hatupendi kelele wakati wa usiku.', example_en: 'We do not like noise at night.' },
  { id: 449, swahili: 'siendi',     english: 'I do not go',             audio_file: '', unit_id: 23, pos: 'verb', example_sw: 'Siendi shuleni leo.',           example_en: 'I do not go to school today.' },
  { id: 450, swahili: 'haendi',     english: 'he / she does not go',    audio_file: '', unit_id: 23, pos: 'verb', example_sw: 'Haendi kazini Jumapili.',       example_en: 'He/She does not go to work on Sundays.' },
  { id: 451, swahili: 'sifanyi',    english: 'I do not do',             audio_file: '', unit_id: 23, pos: 'verb', example_sw: 'Sifanyi kazi Jumamosi.',        example_en: 'I do not work on Saturdays.' },
  { id: 452, swahili: 'hafanyi',    english: 'he / she does not do',    audio_file: '', unit_id: 23, pos: 'verb', example_sw: 'Hafanyi mazoezi ya mwili.',     example_en: 'He/She does not exercise.' },
  { id: 453, swahili: 'sikuli',     english: 'I do not eat',            audio_file: '', unit_id: 23, pos: 'verb', example_sw: 'Sikuli nyama kabisa.',          example_en: 'I do not eat meat at all.' },
  { id: 454, swahili: 'hakunywi',   english: 'he / she does not drink', audio_file: '', unit_id: 23, pos: 'verb', example_sw: 'Hakunywi kahawa kamwe.',        example_en: 'He/She never drinks coffee.' },
  { id: 455, swahili: 'sitaki',     english: 'I do not want',           audio_file: '', unit_id: 23, pos: 'verb', example_sw: 'Sitaki msaada wako.',           example_en: 'I do not want your help.' },
  { id: 456, swahili: 'hataki',     english: 'he / she does not want',  audio_file: '', unit_id: 23, pos: 'verb', example_sw: 'Hataki kwenda hospitali.',      example_en: 'He/She does not want to go to the hospital.' },
  { id: 457, swahili: 'sijui',      english: 'I do not know',           audio_file: '', unit_id: 23, pos: 'verb', example_sw: 'Sijui jibu la swali hilo.',     example_en: 'I do not know the answer to that question.' },
  { id: 458, swahili: 'hajui',      english: 'he / she does not know',  audio_file: '', unit_id: 23, pos: 'verb', example_sw: 'Hajui Kiingereza hata kidogo.', example_en: 'He/She does not know English at all.' },
  { id: 459, swahili: 'siwezi',     english: 'I cannot',                audio_file: '', unit_id: 23, pos: 'verb', example_sw: 'Siwezi kwenda leo.',            example_en: 'I cannot go today.' },
  { id: 460, swahili: 'hawezi',     english: 'he / she cannot',         audio_file: '', unit_id: 23, pos: 'verb', example_sw: 'Hawezi kusaidia sasa hivi.',    example_en: 'He/She cannot help right now.' },
];

export const unit23Lessons = [
  { id: 89, unit_id: 23, title: "Don't Read / Don't Like", lesson_index: 0, exercise_count: 10 },
  { id: 90, unit_id: 23, title: "Don't Go / Don't Do",     lesson_index: 1, exercise_count: 10 },
  { id: 91, unit_id: 23, title: "Don't Eat / Don't Want",  lesson_index: 2, exercise_count: 10 },
  { id: 92, unit_id: 23, title: "Don't Know / Cannot",     lesson_index: 3, exercise_count: 10 },
];
