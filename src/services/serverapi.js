import axios from "axios";

async function getserver(selectedId, epNum) {
  const payload = {
    MALid: selectedId,
    epnum: epNum,
  };
  const src = await axios.post(
    `https://backend-rge1.onrender.com/anime/watch`,
    payload,
  );

  return src.data;
}

export default getserver;
