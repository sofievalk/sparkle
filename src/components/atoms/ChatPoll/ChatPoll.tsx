import React, { useCallback, useMemo } from "react";
import classNames from "classnames";
import dayjs from "dayjs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPoll } from "@fortawesome/free-solid-svg-icons";

import { WithId } from "utils/id";
import { User } from "types/User";
import { useProfileModalControls } from "hooks/useProfileModalControls";

import { UserAvatar } from "components/atoms/UserAvatar";
import { PollValues, Question } from "components/molecules/PollBox/PollBox";

import "./ChatPoll.scss";

export interface ChatProps {
  pollData: {
    poll: PollValues;
    ts_utc: number;
    isMine: boolean;
    author: WithId<User>;
    canBeDeleted: boolean;
    votes: number;
  };
  deletePoll: () => void;
}

export const ChatPoll: React.FC<ChatProps> = ({ pollData, deletePoll }) => {
  const { poll, ts_utc, isMine, author, canBeDeleted, votes } = pollData;
  const { questions, topic } = poll;

  const { openUserProfileModal } = useProfileModalControls();

  const containerStyles = classNames("ChatPoll", {
    "ChatPoll--me": isMine,
  });

  const renderQuestions = useMemo(
    () =>
      questions.map((question: Question) => (
        <button
          key={question.name}
          className="ChatPoll__question"
          onClick={() => console.log(question)}
        >
          {question.name}
        </button>
      )),
    [questions]
  );

  const renderTexts = useMemo(
    () =>
      questions.map((question: Question) => (
        <div key={question.name} className="ChatPoll__question">
          {question.name}
        </div>
      )),
    [questions]
  );

  const openAuthorProfile = useCallback(() => {
    openUserProfileModal(author);
  }, [openUserProfileModal, author]);

  return (
    <div className={containerStyles}>
      <div className="ChatPoll__container">
        <FontAwesomeIcon className="ChatPoll__icon" icon={faPoll} size="lg" />
        <div className="ChatPoll__topic">{topic}</div>
        {isMine ? renderTexts : renderQuestions}
        <div className="ChatPoll__details">
          <p className="ChatPoll__votes">{`${votes} votes`}</p>
          {canBeDeleted && (
            <>
              -
              <button onClick={deletePoll} className="ChatPoll__delete-button">
                Delete Poll
              </button>
            </>
          )}
        </div>
      </div>
      <div className="ChatPoll__info" onClick={openAuthorProfile}>
        <UserAvatar user={author} />
        <span className="ChatPoll__author">{author.partyName}</span>
        <span className="ChatPoll__time">{dayjs(ts_utc).format("h:mm A")}</span>
      </div>
    </div>
  );
};
