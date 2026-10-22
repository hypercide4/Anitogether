import formatTime from "../../utils/formatTime";
import "./ParticipantList.css";

export default function ParticipantList({ showChat, users, uuid }) {
  return (
    <div className="display-time-users">
      {showChat &&
        users?.map((user) => {
          const { minutes, seconds } = formatTime(user);

          return (
            <div className="display-time-user" key={user.id}>
              <p>
                {user.username}
                {user.id === uuid && " (You) "}: {minutes}:{seconds}
              </p>
            </div>
          );
        })}
    </div>
  );
}
