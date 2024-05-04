import React, { useState } from 'react';
import { ListGroup, Modal, OverlayTrigger, Stack, Tooltip } from 'react-bootstrap';
import { Star } from 'react-bootstrap-icons';

/**
 * Use this to represent the SVG rating
 * @param reviews {Array}
 * @param id {string} to distinguish each star group
 * @returns {JSX.Element} 5 stars representing the rating
 * @constructor
 */
function SVGRatings ({ reviews, id }) {
  const [showModal, setShowModal] = useState(false);
  const [currRating, setCurrRating] = useState(0);
  const nReviews = reviews.length;
  const rating = (reviews.reduce((accum, review) => accum + review.rating, 0) / nReviews);

  if (rating < 1 || rating > 5) {
    return null;
  }

  const nFill = Math.floor(rating);
  const fractional = rating - nFill;
  const fractionalString = `${Math.floor(fractional * 100)}%`;

  const nReviewsForEachRating = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  reviews.forEach(x => nReviewsForEachRating[x.rating]++);

  return (
    <>
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          Reviews for <b> {currRating} <Star/></b>
        </Modal.Header>
        <Modal.Body>
          <ListGroup>
            {reviews.filter(x => x.rating === currRating).map((x, index) => (
              <ListGroup.Item key={`review-msg-${index}`}>{x.msg}</ListGroup.Item>
            ))}
          </ListGroup>
        </Modal.Body>
      </Modal>

      <OverlayTrigger
        overlay={
          <Tooltip>
            <b>Details</b>
            {
              Object.keys(nReviewsForEachRating).map((k, index) => (
                <div key={`tool-tips-details-for-${id}-at${index + 1}`}>
                  {k}<Star/>: {nReviewsForEachRating[k]} ({(nReviewsForEachRating[k] / nReviews * 100).toFixed(0)}%)
                </div>
              ))
            }
            <i>Click star to see reviews.</i>
          </Tooltip>
        }
      >
        <Stack direction={'horizontal'} gap={1}>
          {
            Array.from({ length: 5 }, (_, index) => (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16" height="16"
                fill={index < nFill ? 'url(#filled)' : (index === nFill ? 'url(#partial)' : 'url(#empty)')}
                className="bi bi-heart-fill" viewBox="0 0 16 16" key={`svg-rating-for-${id}-${index}`}
                onClick={() => {
                  setCurrRating(index + 1);
                  setShowModal(true);
                }}
              >
                <defs>
                  <linearGradient id={'filled'}>
                    <stop offset={'0%'} stopColor={'#ff7979'}/>
                    <stop offset={'100%'} stopColor={'#ff7979'}/>
                  </linearGradient>
                  <linearGradient id={'partial'}>
                    <stop offset={'0%'} stopColor={'#ff7979'}/>
                    <stop offset={fractionalString} stopColor={'#ff7979'}/>
                    <stop offset={fractionalString} stopColor={'#c7ecee'}/>
                    <stop offset={'100%'} stopColor={'#c7ecee'}/>
                  </linearGradient>
                  <linearGradient id={'empty'}>
                    <stop offset={'0%'} stopColor={'#c7ecee'}/>
                    <stop offset={'100%'} stopColor={'#c7ecee'}/>
                  </linearGradient>
                </defs>
                {/* Source code for Star-fill */}
                <path fillRule="evenodd"
                      d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"/>
              </svg>
            ))
          }
        </Stack>
      </OverlayTrigger>
    </>
  );
}

export default SVGRatings;
