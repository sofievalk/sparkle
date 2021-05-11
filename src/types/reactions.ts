import { ChatMessage } from "types/chat";
import { isTruthy } from "utils/types";

export enum EmojiReactionType {
  clap = "clap",
  yes  = "yes",
  no   = "no",
  brainheart = "brainheart",
  question = "question",
  magnet = "magnet",
  monkey = "monkey",
  mindblown = "mindblown",
  octopus = "octopus",
  robot = "robot",
  buzz = "buzz"
}

export const TextReactionType = "messageToTheBand" as const;
// eslint-disable-next-line @typescript-eslint/no-redeclare -- intentionally naming the type the same as the const
export type TextReactionType = typeof TextReactionType;

export type ReactionType = EmojiReactionType | TextReactionType;

interface BaseReaction {
  created_at: number;
  created_by: string;
  reaction: unknown;
}

export interface EmojiReaction extends BaseReaction {
  reaction: EmojiReactionType;
}

export interface TextReaction extends BaseReaction {
  reaction: TextReactionType;
  text: string;
}

export type Reaction = EmojiReaction | TextReaction;

export type ReactionData<T extends ReactionType = ReactionType> = {
  type: T;
  name: string;
  text: string;
  ariaLabel: string;
  audioPath: string;
};

export const EmojiReactions: ReactionData<EmojiReactionType>[] = [
  {
    type: EmojiReactionType.clap,
    name: "clap",
    text: "👏",
    ariaLabel: "clap-emoji",
    audioPath: "/sounds/clap.mp3",
  },
  {
    type: EmojiReactionType.wolf,
    name: "yes",
    text: "👍",
    ariaLabel: "thumbsup-emoji",
    audioPath: "/sounds/wolf.mp3",
  },
  {
    type: EmojiReactionType.laugh,
    name: "no",
    text: "👎",
    ariaLabel: "thumbsdown-emoji",
    audioPath: "/sounds/laugh.mp3",
  },
  {
    type: EmojiReactionType.heart,
    name: "brainheart",
    text: "🧠💗",
    ariaLabel: "brain-emoji"+"heartpulse-emoji",
    audioPath: "/sounds/woo.mp3",
  },
  {
    type: EmojiReactionType.thatsjazz,
    name: "question",
    text: "❔",
    ariaLabel: "grey_question-emoji",
    audioPath: "/sounds/thatsjazz.mp3",
  },
  {
    type: EmojiReactionType.boo,
    name: "magnet",
    text: "🧲",
    ariaLabel: "magnet-emoji",
    audioPath: "/sounds/boo.mp3",
  },
  {
    type: EmojiReactionType.burn,
    name: "monkey",
    text: "🐒",
    ariaLabel: "monkey-emoji",
    audioPath: "/sounds/burn.mpeg",
  },
  {
    type: EmojiReactionType.sparkle,
    name: "mindblown",
    text: "🤯",
    ariaLabel: "exploding_head-emoji",
    audioPath: "/sounds/sparkle.mpeg",
  },
  {
    type: EmojiReactionType.sparkle,
    name: "octopus",
    text: "🐙",
    ariaLabel: "octopus-emoji",
    audioPath: "/sounds/sparkle.mpeg",
  },
  {
    type: EmojiReactionType.sparkle,
    name: "robot",
    text: "🤖",
    ariaLabel: "robot-emoji",
    audioPath: "/sounds/sparkle.mpeg",
  },
  {
    type: EmojiReactionType.sparkle,
    name: "buzz",
    text: "🐝",
    ariaLabel: "honeybee-emoji",
    audioPath: "/sounds/sparkle.mpeg",
  },
];

export const reactionsDataMapReducer = <T extends ReactionType = ReactionType>(
  acc: Map<T, ReactionData<T>>,
  reactionData: ReactionData<T>
) => acc.set(reactionData.type, reactionData);

export const EmojiReactionsMap: Map<
  EmojiReactionType,
  ReactionData<EmojiReactionType>
> = EmojiReactions.reduce(reactionsDataMapReducer, new Map());

export const isReactionCreatedBy = (userId: string) => (reaction: Reaction) =>
  reaction.created_by === userId;

export const isBaseReaction = (r: unknown): r is BaseReaction =>
  typeof r === "object" && isTruthy(r) && r.hasOwnProperty("reaction");

export const isEmojiReaction = (r: unknown): r is EmojiReaction => {
  if (!isBaseReaction(r)) return false;

  return EmojiReactionType[r.reaction as EmojiReactionType] !== undefined;
};

export const isTextReaction = (r: unknown): r is TextReaction => {
  if (!isBaseReaction(r)) return false;

  return r.reaction === TextReactionType;
};

export const isReaction = (r: unknown): r is Reaction =>
  isEmojiReaction(r) || isTextReaction(r);

export const chatMessageAsTextReaction = (chat: ChatMessage): TextReaction => ({
  created_at: chat.ts_utc.toMillis() / 1000,
  created_by: chat.from,
  reaction: TextReactionType,
  text: chat.text,
});
