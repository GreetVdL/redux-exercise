import "../css/style.scss";

import store from "./data";
import { likesStore } from "./data";
import { darkmodeStore } from "./data";
import { filterStore } from "./data";
import { togglePhoto } from "./data/photos";
import { toggleNews } from "./data/news";
import { toggleSong } from "./data/music";
import { add, remove } from "./data/likes";
import { toggleDarkmode } from "./data/darkmode";
import {
  toggleNewsHide,
  toggleMusicHide,
  togglePhotosHide,
} from "./data/filter";

import "animate.css";

// Save all stores to local storage

const saveStore = () => {
  window.localStorage.setItem("store", JSON.stringify(store.getState()));
};
const saveLikesStore = () => {
  window.localStorage.setItem(
    "likesStore",
    JSON.stringify(likesStore.getState())
  );
};

const saveDarkmodeStore = () => {
  window.localStorage.setItem(
    "darkmode",
    JSON.stringify(darkmodeStore.getState())
  );
};

const saveFilterStore = () => {
  window.localStorage.setItem("filter", JSON.stringify(filterStore.getState()));
};

// when the stores' state changes

store.subscribe(saveStore);
likesStore.subscribe(saveLikesStore);
darkmodeStore.subscribe(saveDarkmodeStore);
filterStore.subscribe(saveFilterStore);

// and save stores for initial browser session

if (!window.localStorage.getItem("store")) {
  saveStore();
}
if (!window.localStorage.getItem("likesStore")) {
  saveLikesStore();
}
if (!window.localStorage.getItem("darkmode")) {
  saveDarkmodeStore();
}
if (!window.localStorage.getItem("filter")) {
  saveFilterStore();
}

//  Function to update stars' color

const likesChanged = (obj) => {
  // if the card was liked
  if (obj.liked) {
    // make the star yellow
    document
      .querySelectorAll(`div[data-id="${obj.id}"] .like`)
      .forEach((el) => {
        el.classList.add("like--active");
      });
    // ik the card was unliked
  } else {
    // make the star white again
    document
      .querySelectorAll(`div[data-id="${obj.id}"] .like`)
      .forEach((el) => {
        el.classList.remove("like--active");
      });
  }
};

// Function to handle left side cards being clicked: change the data

const handleCardsClick = (event, className, reducer, action) => {
  // if the card is of a certain type (newsitem, song or photo)
  if (event.target.parentElement.classList.contains(`${className}`)) {
    // get the corresponding object from the store
    const targetObject = store
      .getState()
      [reducer].filter(
        (item) => item.id === event.target.parentElement.dataset.id
      )[0];
    // toggle whether it was liked
    store.dispatch(action(targetObject));
    // if the card was liked
    if (targetObject.liked) {
      // add the card to the likesStore
      likesStore.dispatch(add(targetObject));
      // and render it in the likes zone after the star stops rotating
      setTimeout(() => {
        targetObject.render(targetObject.likesHolder);
        // with the right color: yellow
        likesChanged(targetObject);
        //  and filter
        filterLikeZone();
      }, 500);
      // ik the card was unliked
    } else {
      // remove the card from the likesStore
      likesStore.dispatch(remove(targetObject));
      // and remove it from the likes zone
      removeDislike(targetObject);
      // and handle the star's color
      likesChanged(targetObject);
    }
  }
};

// Click event listener for cards on the left side of the UI

document.querySelectorAll(".like").forEach((card) => {
  card.addEventListener("click", (event) => {
    handleCardsClick(event, "photo", "photosReducer", togglePhoto);
    handleCardsClick(event, "post", "newsReducer", toggleNews);
    handleCardsClick(event, "song", "musicReducer", toggleSong);
  });
});

// Function to render all liked cards in the "liked" zone

const renderAllLikes = () => {
  // then render each card from the likesStore
  likesStore.getState().forEach((obj) => {
    obj.render(obj.likesHolder);
    // and color its star yellow
    document
      .querySelector(`.likes__main div[data-id="${obj.id}"] .like`)
      .classList.add("like--active");
  });
  // and filter
  filterLikeZone();
};

// Function to remove a disliked card in the "liked" zone

const removeDislike = (tar) => {
  const el = document.querySelector(`.likes div[data-id="${tar.id}"]`);
  const elStar = document.querySelector(
    `.likes div[data-id="${tar.id}"] .like`
  );
  // If the hide filter is on, remove the element immediately
  if (el.classList.contains("post") && filterStore.getState().newsHide) {
    el.remove();
  }
  if (el.classList.contains("song") && filterStore.getState().musicHide) {
    el.remove();
  }
  if (el.classList.contains("photo") && filterStore.getState().photosHide) {
    el.remove();
  }
  // else, remove it after the star animation has finished
  elStar.style.animation = "rotate-center-once 0.5s ease-in-out both";
  elStar.addEventListener("animationend", () => {
    elStar.style.animation = "none";
    el.remove();
  });
};

// Function to handle cards in the "liked zone" being clicked

const handleLikedCardsClick = (event, className, reducer, action) => {
  // if the star is being clicked and the card is of a certain type (newsitem, song or photo)
  if (
    event.target.classList.contains("like") &&
    event.target.parentElement.classList.contains(`${className}`)
  ) {
    // get the corresponding object from the store
    const targetObject = store
      .getState()
      [reducer].filter(
        (item) => item.id === event.target.parentElement.dataset.id
      )[0];
    // toggle whether it was liked
    store.dispatch(action(targetObject));
    // remove the card from the likesStore
    likesStore.dispatch(remove(targetObject));
    //  update the star's color
    likesChanged(targetObject);
    // and remove it from the likes zone
    removeDislike(targetObject);
  }
};

// Click event listener for cards in the "liked" zone

document.querySelector(".likes__main").addEventListener("click", (event) => {
  handleLikedCardsClick(event, "photo", "photosReducer", togglePhoto);
  handleLikedCardsClick(event, "post", "newsReducer", toggleNews);
  handleLikedCardsClick(event, "song", "musicReducer", toggleSong);
});

// Show and hide likes zone when heart icon gets clicked on small screens

document.querySelector(".heart").addEventListener("click", (event) => {
  const heart = event.currentTarget;
  // toggle active class on heart icon
  heart.classList.toggle("heart--active");
  // rotate the heart on click
  heart.style.animation = "heartbeat 1.5s ease-in-out infinite both";
  setTimeout(() => {
    heart.style.animation = "none";
  }, 1500);
  // capture the likes zone
  const rightEl = document.querySelector(".likes");
  // if the heart icon is activated
  if (event.currentTarget.classList.contains("heart--active")) {
    // reset this property that was set to 200% so that the likes zone wouldn't be visible on page load
    rightEl.style.left = "15px";
    // make sure the likes zone appears within the current screen view
    rightEl.style.top = `${window.scrollY + 8}px`;
    // animate the sliding of the likes zone
    rightEl.classList.remove("animate__backOutRight");
    rightEl.classList.add("animate__backInRight");
    // if the heart icon is deactivated
  } else {
    // reverse the animation
    rightEl.classList.remove("animate__backInRight");
    rightEl.classList.add("animate__backOutRight");
  }
});

// Rotating animation for star icons

document.querySelectorAll(".like").forEach((star) => {
  star.addEventListener("click", (event) => {
    event.currentTarget.style.animation =
      "rotate-center-once 0.5s ease-in-out both";
  });
  star.addEventListener("animationend", (event) => {
    event.currentTarget.style.animation = "none";
  });
});

// Emoji render function

const renderEmoji = () => {
  const amountLikes = likesStore.getState().length;

  const emojis = [
    { amount: 0, emoji: "👀" },
    { amount: 1, emoji: "🙂" },
    { amount: 2, emoji: "😃" },
    { amount: 3, emoji: "😍" },
    { amount: 4, emoji: "🥳" },
    { amount: 5, emoji: "🤪" },
  ];

  let emojiToRender = "";

  switch (amountLikes) {
    case 0:
      emojiToRender = emojis[0].emoji;
      break;
    case 1:
      emojiToRender = emojis[1].emoji;
      break;
    case 2:
      emojiToRender = emojis[2].emoji;
      break;
    case 3:
      emojiToRender = emojis[3].emoji;
      break;
    case 4:
      emojiToRender = emojis[4].emoji;
      break;
    case 5: /* intended fallthrough */
    default:
      emojiToRender = emojis[5].emoji;
  }

  document.querySelector("#emoji").textContent = emojiToRender;
};

likesStore.subscribe(renderEmoji);

// Counter and filter functionality

const newsButton = document.querySelector(".filter__news");
const musicButton = document.querySelector(".filter__music");
const photosButton = document.querySelector(".filter__photos");

const renderCounter = () => {
  newsButton.textContent = likesStore
    .getState()
    .filter((obj) => obj.category === "news").length;
  musicButton.textContent = likesStore
    .getState()
    .filter((obj) => obj.category === "music").length;
  photosButton.textContent = likesStore
    .getState()
    .filter((obj) => obj.category === "photos").length;
};

likesStore.subscribe(renderCounter);

const filterLikeZone = () => {
  const filterState = filterStore.getState();
  const posts = document.querySelectorAll("aside main .post");
  const songs = document.querySelectorAll("aside main .song");
  const photos = document.querySelectorAll("aside main .photo");
  if (filterState.newsHide) {
    posts.forEach((post) => {
      post.style.display = "none";
    });
  } else {
    posts.forEach((post) => {
      post.style.display = "block";
    });
  }
  if (filterState.musicHide) {
    songs.forEach((song) => {
      song.style.display = "none";
    });
  } else {
    songs.forEach((song) => {
      song.style.display = "block";
    });
  }
  if (filterState.photosHide) {
    photos.forEach((photo) => {
      photo.style.display = "none";
    });
  } else {
    photos.forEach((photo) => {
      photo.style.display = "block";
    });
  }
};

newsButton.onclick = (event) => {
  event.target.classList.toggle("filter__news--hide");
  filterStore.dispatch(toggleNewsHide());
  filterLikeZone();
};
musicButton.onclick = (event) => {
  event.target.classList.toggle("filter__music--hide");
  filterStore.dispatch(toggleMusicHide());
  filterLikeZone();
};
photosButton.onclick = (event) => {
  event.target.classList.toggle("filter__photos--hide");
  filterStore.dispatch(togglePhotosHide());
  filterLikeZone();
};

// Sync application with local storage

// Sync store

const lsStore = JSON.parse(window.localStorage.getItem("store"));

const reduxStore = store.getState();

const syncStore = (reducer, action) => {
  // get the matching liked card from the store
  lsStore[reducer].forEach((object) => {
    if (object.liked) {
      const targetObject = reduxStore[reducer].filter(
        (obj) => obj.name === object.name
      )[0];
      // toggle whether it was liked
      store.dispatch(action(targetObject));
      //  set its star's color
      likesChanged(targetObject);
    }
  });
};

syncStore("newsReducer", toggleNews);
syncStore("musicReducer", toggleSong);
syncStore("photosReducer", togglePhoto);

// Sync filterStore

const lsFilterStore = JSON.parse(window.localStorage.getItem("filter"));

if (lsFilterStore.newsHide) {
  filterStore.dispatch(toggleNewsHide());
  newsButton.classList.add("filter__news--hide");
}
if (lsFilterStore.musicHide) {
  filterStore.dispatch(toggleMusicHide());
  musicButton.classList.add("filter__music--hide");
}
if (lsFilterStore.photosHide) {
  filterStore.dispatch(togglePhotosHide());
  photosButton.classList.add("filter__photos--hide");
}

// Sync likesStore
// the likesStore needs to be synced separately so that the liked cards get rendered in the right order

const lsLikesStore = JSON.parse(window.localStorage.getItem("likesStore"));

const syncLikesStore = () => {
  // find the liked cards
  lsLikesStore.forEach((obj) => {
    const storeNews = store.getState().newsReducer;
    const storeSongs = store.getState().musicReducer;
    const storePhotos = store.getState().photosReducer;
    let targetObject;
    storeNews.forEach((object) => {
      if (obj.name === object.name) {
        targetObject = object;
      }
    });
    storeSongs.forEach((object) => {
      if (obj.name === object.name) {
        targetObject = object;
      }
    });
    storePhotos.forEach((object) => {
      if (obj.name === object.name) {
        targetObject = object;
      }
    });
    // and add them to the likesStore
    likesStore.dispatch(add(targetObject));
  });
  // and render them all
  renderAllLikes();
  // and render initial emoji if nothing has changed in the likesStore
  if (!lsLikesStore.length) {
    renderEmoji();
  }
  // and render initial counter if nothing has changed in the likesStore
  if (!lsLikesStore.length) {
    renderCounter();
  }
};

syncLikesStore();

// Darkmode

// Sync darkmodeStore

const sunglasses = document.querySelector("main h1 span");

const root = document.querySelector("#root");
const title = document.querySelector("main h1");
const aside = document.querySelector("aside");
const likesHeader = document.querySelector(".likes__header");
const likesMain = document.querySelector(".likes__main");
let stars = document.querySelectorAll(".like");

const lsDarkmode = JSON.parse(window.localStorage.getItem("darkmode"));
if (lsDarkmode.darkmode) {
  darkmodeStore.dispatch(toggleDarkmode());
  sunglasses.classList.add("darkmode");
  document.body.classList.add("darkmode");
  root.classList.add("darkmode");
  title.classList.add("darkmode");
  aside.classList.add("darkmode");
  likesHeader.classList.add("darkmode");
  likesMain.classList.add("darkmode");
  stars.forEach((star) => {
    star.classList.add("darkmode");
  });
}

// Click event listener on sunglasses

sunglasses.addEventListener("click", (event) => {
  darkmodeStore.dispatch(toggleDarkmode());
  event.target.classList.toggle("darkmode");
  stars = document.querySelectorAll(".like");
  if (event.target.classList.contains("darkmode")) {
    document.body.classList.add("darkmode");
    root.classList.add("darkmode");
    title.classList.add("darkmode");
    aside.classList.add("darkmode");
    likesHeader.classList.add("darkmode");
    likesMain.classList.add("darkmode");
    stars.forEach((star) => {
      star.classList.add("darkmode");
    });
  } else {
    document.body.classList.remove("darkmode");
    root.classList.remove("darkmode");
    title.classList.remove("darkmode");
    aside.classList.remove("darkmode");
    likesHeader.classList.remove("darkmode");
    likesMain.classList.remove("darkmode");
    stars.forEach((star) => {
      star.classList.remove("darkmode");
    });
  }
});
