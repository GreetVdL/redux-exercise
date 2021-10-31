import * as redux from "redux";
import Song from "../components/song";

// Songs and their images

const changesSong = new URL(
  "../../sound/Black Sabbath-Changes.mp3",
  import.meta.url
);
const changesImg = new URL("../../images/blacksabbath.jpeg", import.meta.url);

const mosquitoesSong = new URL(
  "../../sound/Four Tet-No More Mosquitoes.mp3",
  import.meta.url
);
const mosquitoesImg = new URL("../../images/fourtet.jpg", import.meta.url);

const biscayaSong = new URL(
  "../../sound/James Last-Biscaya.mp3",
  import.meta.url
);
const biscayaImg = new URL("../../images/jameslast.jpg", import.meta.url);

const danceSong = new URL(
  "../../sound/JE Sunde-I Don't Care To Dance.mp3",
  import.meta.url
);
const danceImg = new URL("../../images/jesunde.jpg", import.meta.url);

/**
 * ACTIONTYPES
 */

const TOGGLESONG = "TOGGLESONG";

/**
 * ACTION CREATORS
 */

export const toggleSong = (obj) => ({
  type: TOGGLESONG,
  payload: obj,
});

/**
 * INITIAL DATA
 */

const initialState = [
  new Song(changesSong, "Changes", changesImg, "Black Sabbath"),
  new Song(mosquitoesSong, "No More Mosquitoes", mosquitoesImg, "Four Tet"),
  new Song(biscayaSong, "Biscaya", biscayaImg, "James Last"),
  new Song(danceSong, "I don't care to dance", danceImg, "J.E. Sunde"),
];

/**
 * REDUCER
 */
const musicReducer = (state = initialState, { type, payload }) => {
  switch (type) {
    case TOGGLESONG:
      return [...state].map((el) => {
        if (el === payload) {
          el.liked = !el.liked;
        }
        return el;
      });
    default:
      return state;
  }
};

export default musicReducer;
