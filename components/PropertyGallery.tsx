'use client';

import { useState } from 'react';
import { FaChevronLeft, FaChevronRight, FaPlay, FaTimes } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './PropertyGallery.module.css';

interface PropertyGalleryProps {
  media: string[];
}

export default function PropertyGallery({ media }: PropertyGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalIndex, setModalIndex] = useState(0);

  const isVideo = (url: string) => {
    return url.match(/\.(mp4|webm|ogg)$/i) || url.includes('youtube.com') || url.includes('youtu.be') || url.includes('vimeo.com');
  };

  const getEmbedUrl = (url: string) => {
    if (url.includes('youtube.com/watch')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes('youtu.be')) {
      const videoId = url.split('/').pop();
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes('vimeo.com')) {
      const videoId = url.split('/').pop();
      return `https://player.vimeo.com/video/${videoId}`;
    }
    return url;
  };

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % media.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + media.length) % media.length);
  };

  const openModal = (index: number) => {
    setModalIndex(index);
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setIsModalOpen(false);
    document.body.style.overflow = 'unset';
  };

  if (!media || media.length === 0) {
    return (
      <div className={styles.gallery}>
        <div className={styles.mainImage}>
          <div className={styles.placeholder}>
            <span>🏠</span>
            <p>No images available</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={styles.gallery}>
        <div className={styles.mainImage}>
          {isVideo(media[currentIndex]) ? (
            <div className={styles.videoContainer}>
              <iframe
                src={getEmbedUrl(media[currentIndex])}
                title="Property Video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          ) : (
            <img
              src={media[currentIndex]}
              alt={`Property ${currentIndex + 1}`}
              onClick={() => openModal(currentIndex)}
            />
          )}
          
          {media.length > 1 && (
            <>
              <button className={`${styles.navBtn} ${styles.prevBtn}`} onClick={prevImage}>
                <FaChevronLeft />
              </button>
              <button className={`${styles.navBtn} ${styles.nextBtn}`} onClick={nextImage}>
                <FaChevronRight />
              </button>
            </>
          )}
          
          <div className={styles.counter}>
            {currentIndex + 1} / {media.length}
          </div>
        </div>

        {media.length > 1 && (
          <div className={styles.thumbnailStrip}>
            {media.slice(0, 6).map((item, index) => (
              <div
                key={index}
                className={`${styles.thumbnail} ${currentIndex === index ? styles.active : ''}`}
                onClick={() => setCurrentIndex(index)}
              >
                {isVideo(item) ? (
                  <div className={styles.videoThumbnail}>
                    <FaPlay />
                  </div>
                ) : (
                  <img src={item} alt={`Thumbnail ${index + 1}`} />
                )}
              </div>
            ))}
            {media.length > 6 && (
              <div className={styles.moreThumbnail} onClick={() => openModal(0)}>
                +{media.length - 6}
              </div>
            )}
          </div>
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className={styles.modal}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <button className={styles.closeModal} onClick={closeModal}>
                <FaTimes />
              </button>
              
              <div className={styles.modalImage}>
                {isVideo(media[modalIndex]) ? (
                  <iframe
                    src={getEmbedUrl(media[modalIndex])}
                    title="Property Video"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                ) : (
                  <img src={media[modalIndex]} alt="Full size" />
                )}
              </div>
              
              {media.length > 1 && (
                <>
                  <button
                    className={`${styles.modalNav} ${styles.modalPrev}`}
                    onClick={() => setModalIndex((prev) => (prev - 1 + media.length) % media.length)}
                  >
                    <FaChevronLeft />
                  </button>
                  <button
                    className={`${styles.modalNav} ${styles.modalNext}`}
                    onClick={() => setModalIndex((prev) => (prev + 1) % media.length)}
                  >
                    <FaChevronRight />
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}