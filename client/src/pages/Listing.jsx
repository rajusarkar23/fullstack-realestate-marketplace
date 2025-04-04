import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore from "swiper";
import { Navigation } from "swiper/modules";
import { useSelector } from "react-redux";
import "swiper/css/bundle";

import {
  FaBath,
  FaBed,
  FaCar,
  FaChair,
  FaMapMarkerAlt,
  FaShare,
} from "react-icons/fa";
import Contact from "../components/Contact";

function Listing() {
  SwiperCore.use([Navigation]);
  const params = useParams();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [contact, setContact] = useState(true);
  const currentUser = useSelector((state) => state.user.currentUser);
  // console.log(`${listing.userRef}`);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/listing/get/${params.listingId}`);
        const data = await res.json();
        if (data.success === false) {
          setError(true);
          setLoading(false);
          return;
        }
        setListing(data);
        setLoading(false);
        setError(false);
      } catch (error) {
        setError(true);
        setLoading(false);
      }
    };
    fetchListing();
  }, [params.listingId]);
  return (
    <main>
      {loading && <p className="text-center my-7 text-2xl">Loading.....</p>}
      {error && <p className="text-center my-7 text-2xl">Error</p>}

      {listing && !error && !loading && (
        <>
          <Swiper navigation>
            {listing.imageUrls.map((url) => (
              <SwiperSlide key={url}>
                <div
                  className="h-[500px]"
                  style={{
                    background: `url(${url}) center no-repeat`,
                    backgroundSize: "cover",
                  }}
                ></div>
              </SwiperSlide>
            ))}
          </Swiper>
          <div className="fixed top-[13%] right-[3%] z-10 border rounded-full w-12 h-12 flex justify-center items-center bg-slate-100 hover:bg-orange-100 cursor-pointer">
            <FaShare
              className="text-slate-500"
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                setCopied(true);
                setTimeout(() => {
                  setCopied(false);
                }, 2000);
              }}
            />
          </div>
          {copied && (
            <p className="fixed top-[23%] right-[5%] z-10 rounded-md bg-slate-100 p-2">
              Link copied
            </p>
          )}
          <div className="flex flex-col max-w-4xl mx-auto p-3 my-7 gap-4">
              {listing.offer && (
                <p className="font-semibold text-3xl text-slate-700">{listing.name} at ${listing.regularPrice - listing.discountPrice}{listing.type === "rent" && "/month"}</p>
              )}
              {!listing.offer && (
                <p className="font-semibold text-3xl text-slate-700">{listing.name} at ${listing.regularPrice}</p>
              )}

              {/* For regular price in case of offer available*/}
              {listing.offer && (
                <p className="font-semibold text-white bg-slate-700 rounded-md w-full max-w-[200px] text-center">Regular price: ${listing.regularPrice}</p>
              )}
            <p className="flex items-center mt-2 gap-2 text-slate-600 text-sm">
              <FaMapMarkerAlt className="text-green-700" />
              {listing.address}
            </p>
            <div className="flex gap-4">
              <p className="bg-red-900 w-full max-w-[200px] text-white text-center rounded-md">
                {listing.type === "rent" ? "For rent" : "For sale"}
              </p>

              {listing.offer && (<p className="bg-green-900 w-full max-w-[200px] text-white text-center rounded-md">
                ${listing.discountPrice} discount available
              </p>)}
            </div>
            <p className="text-slate-800">
              <span className="font-semibold text-black">Description - </span>
              { listing.description}
            </p>
            <ul className="flex items-center gap-4 sm:gap-6 font-bold text-green-900 text-sm flex-wrap">
              <li className="flex items-center gap-1 whitespace-nowrap ">
                <FaBed className="text-lg" />
                {listing.bedrooms > 1
                  ? `${listing.bedrooms} bedrooms`
                  : `${listing.bedrooms} bedroom`}
              </li>
              <li className="flex items-center gap-1 whitespace-nowrap ">
                <FaBath className="text-lg" />
                {listing.bathrooms > 1
                  ? `${listing.bathrooms} bathrooms`
                  : `${listing.bathrooms} bathroom`}
              </li>
              <li className="flex items-center gap-1 whitespace-nowrap ">
                <FaCar className="text-lg" />
                {listing.parking ? "Parking available" : "No Parking"}
              </li>
              <li className="flex items-center gap-1 whitespace-nowrap ">
                <FaChair className="text-lg" />
                {listing.furnished ? "Furnished" : "Not furnished"}
              </li>
            </ul>

            {currentUser && listing.userRef !== currentUser._id && contact && (
              <button
                onClick={() => setContact(false)}
                className="bg-slate-700 text-white rounded-lg uppercase hover:opacity-90"
              >
                Contact Landlord
              </button>
            )}
            {!contact && <Contact listing={listing}/>}
          </div>
        </>
      )}
    </main>
  );
}

export default Listing;
