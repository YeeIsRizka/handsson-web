import { buildWord } from "../../gameplay/utils/localWords";

const LEVEL_1_WORDS = [
  buildWord("l1-1", "CERI"),
  buildWord("l1-2", "VOLI"),
  buildWord("l1-3", "LORI"),
  buildWord("l1-4", "JUICE"),
  buildWord("l1-5", "ZERO"),
];

const LEVEL_2_WORDS = [
  buildWord("l2-1", "STAG"),
  buildWord("l2-2", "WHAT"),
  buildWord("l2-3", "WASH"),
  buildWord("l2-4", "SWAT"),
  buildWord("l2-5", "WAX"),
];

const LEVEL_3_WORDS = [
  buildWord("l3-1", "BOOK"),
  buildWord("l3-2", "DUMP"),
  buildWord("l3-3", "FIND"),
  buildWord("l3-4", "YANK"),
  buildWord("l3-5", "FAQS"),
];

/**
 * Campaign level definitions.
 * Level 4 & 5 use localWords — handled dynamically by useCampaign hook.
 */
export const CAMPAIGN_LEVELS = [
  {
    level: 1,
    timer: 60,
    words: LEVEL_1_WORDS,
    wordCount: 3,
    useLocalWords: false,
    useHint: true,
  },
  {
    level: 2,
    timer: 60,
    words: LEVEL_2_WORDS,
    wordCount: 3,
    useLocalWords: false,
    useHint: true,
  },
  {
    level: 3,
    timer: 55,
    words: LEVEL_3_WORDS,
    wordCount: 3,
    useLocalWords: false,
    useHint: true,
  },
  {
    level: 4,
    timer: 55,
    words: null,
    wordCount: 3,
    useLocalWords: true,
    useHint: true,
  },
  {
    level: 5,
    timer: 50,
    words: null,
    wordCount: 3,
    useLocalWords: true,
    useLocalWordsRemainder: true,
    useHint: false,
  },
];

export const TOTAL_LEVELS = CAMPAIGN_LEVELS.length;

/** Points per correctly recognized letter */
export const POINTS_PER_LETTER = 10;
