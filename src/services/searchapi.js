import axios from "axios";

async function searchAnime(current_anime_input) {
  const base_url = "backend-xte1.onrender.com";
  const current_search_object = {
    current_anime_input: current_anime_input,
  };
  const response = await axios.post(
    `${base_url}/anime/search`,
    current_search_object,
  );
  return response.data;
}

export default searchAnime;
