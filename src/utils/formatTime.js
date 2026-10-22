export default function formatTime(user) {
    const minutes = Math.floor(user.time / 60);
    const seconds = String(Math.floor(user.time % 60)).padStart(2, "0");
    return {minutes, seconds}
}