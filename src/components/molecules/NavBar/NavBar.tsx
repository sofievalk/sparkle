import React, { useState } from "react";
import firebase from "firebase/app";
import "./NavBar.scss";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { faCommentAlt, faTicketAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { isChatValid } from "validation";
import { OverlayTrigger, Popover } from "react-bootstrap";
import PrivateChatModal from "components/organisms/PrivateChatModal";
import ProfileModal from "components/organisms/ProfileModal";
import { UpcomingEvent } from "types/UpcomingEvent";
import UpcomingTickets from "components/molecules/UpcomingTickets";
import AuthenticationModal from "components/organisms/AuthenticationModal";

interface PropsType {
  redirectionUrl?: string;
}

const NavBar: React.FunctionComponent<PropsType> = ({ redirectionUrl }) => {
  const { user, users, venue, privateChats } = useSelector((state: any) => ({
    user: state.user,
    users: state.firestore.data.users,
    venue: state.firestore.data.currentVenue,
    privateChats: state.firestore.ordered.privatechats,
  }));

  const now = firebase.firestore.Timestamp.fromDate(new Date());
  const futureUpcoming = venue?.events?.filter(
    (e: UpcomingEvent) => e?.ts_utc?.valueOf() > now.valueOf()
  );

  const hasUpcomingEvents = futureUpcoming && futureUpcoming.length > 0;

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isAuthenticationModalOpen, setIsAuthenticationModalOpen] = useState(
    false
  );

  const ticketsPopover = (
    <Popover id="popover-basic">
      <Popover.Content>
        <UpcomingTickets events={futureUpcoming} />
      </Popover.Content>
    </Popover>
  );

  const chatPopover = (
    <Popover id="popover-basic">
      <Popover.Content>
        <PrivateChatModal />
      </Popover.Content>
    </Popover>
  );

  const numberOfUnreadMessages =
    privateChats &&
    user &&
    privateChats
      .filter(isChatValid)
      .filter((chat: any) => chat.to === user.uid && chat.isRead === false)
      .length;

  return (
    <>
      <header>
        <nav className="navbar fixed-top navbar-expand-lg navbar-dark navbar-container">
          <Link to={redirectionUrl || "/"}>
            <span className="navbar-brand title">
              <img
                className="sparkle-navbar-icon"
                src="/sparkle-header.png"
                alt="Sparkle collective"
              />
            </span>
          </Link>
          {user ? (
            <div className="icons-container">
              {hasUpcomingEvents && (
                <OverlayTrigger
                  trigger="click"
                  placement="bottom-end"
                  overlay={ticketsPopover}
                  rootClose={true}
                >
                  <span className="tickets-icon">
                    <FontAwesomeIcon icon={faTicketAlt} />
                  </span>
                </OverlayTrigger>
              )}
              {users && users[user.uid] && (
                <OverlayTrigger
                  trigger="click"
                  placement="bottom-end"
                  overlay={chatPopover}
                  rootClose={true}
                >
                  <span className="private-chat-icon">
                    {!!numberOfUnreadMessages && numberOfUnreadMessages > 0 && (
                      <div className="notification-card">
                        {numberOfUnreadMessages}
                      </div>
                    )}
                    <FontAwesomeIcon icon={faCommentAlt} />
                  </span>
                </OverlayTrigger>
              )}
              <div
                className="profile-icon-container"
                onClick={() => setIsProfileModalOpen(true)}
              >
                <img
                  src={
                    users?.[user.uid]?.pictureUrl ||
                    "/anonymous-profile-icon.jpeg"
                  }
                  className="profile-icon"
                  alt="avatar"
                  width="40"
                  height="40"
                />
              </div>
            </div>
          ) : (
            <div
              className="log-in-button"
              onClick={() => setIsAuthenticationModalOpen(true)}
            >
              Log in
            </div>
          )}
        </nav>
      </header>
      <ProfileModal
        show={isProfileModalOpen}
        onHide={() => setIsProfileModalOpen(false)}
      />
      <AuthenticationModal
        show={isAuthenticationModalOpen}
        onHide={() => setIsAuthenticationModalOpen(false)}
      />
    </>
  );
};

export default NavBar;
