export default function getEmbLinksIfExist(message) {
  const imageRegex =
    /(https?:\/\/[^\s]+?\.(?:png|jpg|jpeg|gif|webp)(?:\?[^\s]*)?)/gi;
  return message.match(imageRegex);
}
