export default function getEmbLinksIfExist(message) {
  const imageRegex = /(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp))/gi;
  return message.match(imageRegex);
}
