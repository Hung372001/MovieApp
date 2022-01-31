import React, { useState, useEffect, useRef } from "react";

import SwiperCore, { Autoplay } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";

import Button, { OutlineButton } from "../button/Button";
import Modal, { ModalContent } from "../modal/Modal";

import tmdbApi, { category, movieType } from "../../api/tmdbApi";
import apiConfig from "../../api/apiConfig";

import "./hero-slide.scss";
import { useHistory } from "react-router";

const HeroSlide = () => {
  SwiperCore.use([Autoplay]);

  const [movieItems, setMovieItems] = useState([]);

  useEffect(() => {
    const getMovies = async () => {
      const params = { page: 1 };
      try {
        const response = await tmdbApi.getMoviesList(movieType.popular, {
          params,
        });
        setMovieItems(response.results);
        console.log(response);
      } catch {
        console.log("error");
      }
    };
    getMovies();
  }, []);
  console.log(movieItems);
  return (
    <div className="hero-slide">
      <Swiper
        modules={[Autoplay]}
        grabCursor={true}
        spaceBetween={0}
        slidesPerView={1}
        autoplay={{ delay: 3000 }}
      >
        {movieItems.map((item, i) => (
          <SwiperSlide key={i}>
            {({ isActive }) => (
              <HeroSlideItem
                item={item}
                className={`${isActive ? "active" : ""}`}
              />
            )}
          </SwiperSlide>
        ))}
      </Swiper>
      {movieItems.map((item, i) => (
        <TrailerModel key={i} item={item} />
      ))}
    </div>
  );
};
const HeroSlideItem = (props) => {
  let history = useHistory();
  const item = props.item;
  const background = apiConfig.originalImage(
    item.backdrop_path ? item.backdrop_path : item.poster_path
  );
  const SetModelActive = async () => {
    const modal = document.querySelector(`#modal_${item.id}`);
    const video = await tmdbApi.getVideos(category.movie, item.id);
    if (video.results.length > 0) {
      const videoSrc = `https://www.youtube.com/embed/` + video.results[0].key;
      modal
        .querySelector(".modal__content > iframe ")
        .setAttribute("src", videoSrc);
    } else {
      modal.querySelector(`.modal__content`).innerHTML = "No Trailer";
    }
    modal.classList.toggle("active");
  };
  return (
    <div
      className={`hero-slide__item ${props.className}`}
      style={{ backgroundImage: `url(${background})` }}
    >
      <div className="hero-slide__item__content container">
        <div className="hero-slide__item__content__info">
          <h2 className="title">{item.title}</h2>
          <div className="overview">{item.overview}</div>
          <div className="btns">
            <Button onClick={() => history.push("/movies/" + item.id)}>
              Watch Now
            </Button>
            <OutlineButton onClick={SetModelActive}>
              Watch Trailer
            </OutlineButton>
          </div>
        </div>
        <div className="hero-slide__item__content__poster">
          <img src={apiConfig.w500Image(item.poster_path)} />
        </div>
      </div>
    </div>
  );
};
const TrailerModel = (props) => {
  const item = props.item;
  const iframeRef = useRef(null);
  const onclose = () => iframeRef.current.setAttribute("src", "");
  return (
    <Modal active={false} id={`modal_${item.id}`}>
      <ModalContent onClose={onclose}>
        <iframe
          ref={iframeRef}
          width="100%"
          height="500px"
          title="trailler"
        ></iframe>
      </ModalContent>
    </Modal>
  );
};

export default HeroSlide;
