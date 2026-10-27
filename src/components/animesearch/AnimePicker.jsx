import { useEffect, useState } from "react";
import searchAnime from "../../services/searchapi";
import "./AnimePicker.css";
import "../../globals.css";

function AnimePicker({
  MALidRef,
  epNumRef,
  selectedId,
  setSelectedId,
  setUsername,
  setEpNum,
  epNum,
  fetchEpisode,
}) {
  const [searchText, setSearchText] = useState("");
  const [search, setSearch] = useState([]);

  useEffect(() => {
    // 250ms search debounce effect
    if (!searchText.trim()) return;
    const timer = setTimeout(async () => {
      const results = await searchAnime(searchText);
      setSearch(results);
    }, 250);

    return () => clearTimeout(timer);
  }, [searchText]);

  return (
    <>
      <div className="input-container">
        <input
          type="text"
          className="input-box"
          placeholder="username"
          onChange={(e) => {
            setUsername(e.target.value);
          }}
        />
        <input
          type="text"
          className="input-box"
          onChange={(e) => {
            setSearchText(e.target.value);
          }}
          placeholder="search"
        />
        <input
          type="text"
          className="input-box"
          placeholder="ep"
          onChange={(e) => {
            setEpNum(e.target.value);
            epNumRef.current = e.target.value;
          }}
        />
        <button
          className="input-button"
          onClick={async () => {
            try {
              await fetchEpisode(selectedId, epNum);
            } catch (error) {
              console.error("couldn't load episode, error: ", error);
            }
          }}
        >
          go
        </button>
      </div>
      <div className="search-items">
        {search.map((item) => {
          var clicked = false;
          if (selectedId === item.id) {
            clicked = true;
          }

          return (
            <div
              key={item.id}
              className={clicked ? "search-item-clicked" : "search-item"}
              onClick={() => {
                if (selectedId === item.id) {
                  setSelectedId(null);
                  MALidRef.current = null;
                } else {
                  setSelectedId(item.id);
                  MALidRef.current = item.id;
                }
              }}
            >
              <div className="search-picture">
                <img src={item.image_url} />
              </div>
              <div className="search-name">
                <h2>{item.name}</h2>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

export default AnimePicker;
