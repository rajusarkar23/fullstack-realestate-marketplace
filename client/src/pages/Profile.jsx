import { useSelector, useDispatch } from "react-redux";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { app } from "../firebase.js";
import {
  updateUserStart,
  updateUserSuccess,
  updateUserFailure,
  deleteFailure,
  deleteUserStart,
  deleteUserSuccess,
  signOutStart,
  signInFailure,
  signOutFailure,
  signOutSuccess,
} from "../redux/user/userSlice.js";

function Profile() {
  const fileRef = useRef(null);
  const { currentUser, loading, error } = useSelector((state) => state.user);
  const [file, setFile] = useState(undefined);
  const [filePercentage, SetFilePercentage] = useState(0);
  const [fileUploadError, setFileUploadError] = useState(false);
  const [fileSizeError, setFileSizeError] = useState(false);
  const [formData, setFormData] = useState({});
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const dispatch = useDispatch();
  const [showListingError, setShowlIstingError] = useState(false);
  const [userListing, setUserListing] = useState([]);
  // => LOGS
  // console.log(formData);
  // console.log(filePercentage);
  // console.log(fileUploadError);
  // => run the handleFileUpload func if there is any change in file
  useEffect(() => {
    if (file) {
      handleFileUpload();
    }
  }, [file]);

  const handleFileUpload = () => {
    const storage = getStorage(app);
    const fileName = new Date().getTime() + file.name;
    const storageRef = ref(storage, fileName);
    const uploadFile = uploadBytesResumable(storageRef, file);

    uploadFile.on(
      "state_changed",
      (snapshot) => {
        const oneMBInBytes = 1024000;
        if (snapshot.totalBytes > oneMBInBytes * 2) {
          uploadFile.pause();
          setFileSizeError(true);
        }
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        SetFilePercentage(Math.round(progress));
        // console.log("Upload is " + progress + "% done");
      },
      (error) => {
        setFileUploadError(true);
      },
      () => {
        getDownloadURL(uploadFile.snapshot.ref).then((downloadURL) =>
          setFormData({ ...formData, avatar: downloadURL })
        );
      }
    );
  };
  // => handle Changes in form
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };
  // => handle update form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(updateUserStart());
      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success == false) {
        dispatch(updateUserFailure(data.message));
        return;
      }

      dispatch(updateUserSuccess(data));
      setUpdateSuccess(true);
    } catch (error) {
      dispatch(updateUserFailure(error.message));
    }
  };

  const handleDeleteUser = async () => {
    try {
      dispatch(deleteUserStart());
      const res = await fetch(`/api/user/delete/${currentUser._id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data === false) {
        dispatch(deleteFailure(data.message));
        return;
      }
      dispatch(deleteUserSuccess(data));
    } catch (error) {
      dispatch(deleteFailure(error.message));
    }
  };

  const handleSignOut = async () => {
    try {
      dispatch(signOutStart());
      const res = await fetch("/api/auth/signout"); //=> in this case we senfing get request, get request is the default request so we do not need to mention this
      const data = res.json();
      if (data.success === false) {
        dispatch(signOutFailure(data.message));
        return;
      }
      dispatch(signOutSuccess(data));
    } catch (error) {
      dispatch(signOutFailure(data.message));
    }
  };

  const handleShowListing = async () => {
    try {
      setShowlIstingError(false);
      const res = await fetch(`https://fullstack-realestate-marketplace.onrender.com/${currentUser._id}`);
      const data = await res.json();
      if (data.success === false) {
        return;
      }
      setUserListing(data);
    } catch (error) {
      setShowlIstingError(true);
    }
  };

  const handleListingDelete = async (listingId) => {
    try {
      const res = await fetch(`/api/listing/delete/${listingId}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (data.success === false) {
        console.log(data.message);
        return;
      }
      setUserListing((prev) =>
        prev.filter((listing) => listing._id !== listingId)
      );
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <div
      className="p-3 max-w-lg mx-auto
    "
    >
      <h1 className="text-3xl font-semibold text-center my-7">Profile</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="file"
          ref={fileRef}
          hidden
          accept="image/*"
          onClick={() => setFileSizeError(false)}
          onChange={(e) => setFile(e.target.files[0])}
        />

        <img
          src={formData.avatar || currentUser.avatar}
          alt="profile"
          className="rounded-full h-24 w-24 object-cover cursor-pointer self-center mt-2"
          onClick={() => fileRef.current.click()}
        />
        <p className="text-sm self-center">
          {fileUploadError ? (
            <span className="text-red-700">Error while uploading image</span>
          ) : fileSizeError ? (
            <span className="text-red-700">Check image size</span>
          ) : filePercentage > 0 && filePercentage < 100 ? (
            <span className="text-slate-700 font-bold">
              {`Uploading ${filePercentage}%.....`}
            </span>
          ) : formData.avatar ? (
            <span className="text-green-700 font-bold">Success</span>
          ) : (
            ""
          )}
        </p>
        <input
          type="text"
          placeholder="username"
          defaultValue={currentUser.username}
          id="username"
          className="border p-3 rounded-lg"
          onChange={handleChange}
        />
        <input
          type="email"
          placeholder="email"
          defaultValue={currentUser.email}
          id="email"
          className="border p-3 rounded-lg"
          onChange={handleChange}
        />
        <input
          type="password"
          placeholder="password"
          id="password"
          className="border p-3 rounded-lg"
          onChange={handleChange}
        />
        <button
          disabled={loading}
          className="bg-slate-700 text-white rounded-lg p-3 uppercase hover:opacity-95 disabled:opacity-75"
        >
          {loading ? "Loading" : "Update"}
        </button>
        <Link
          to={"/create-listing"}
          className="bg-green-700 text-white p-3 rounded-lg uppercase text-center hover:opacity-90"
        >
          Create Listing
        </Link>
      </form>

      <div className="flex justify-between mt-5">
        <span
          onClick={handleDeleteUser}
          className="text-red-700 cursor-pointer"
        >
          Delete account
        </span>
        <span onClick={handleSignOut} className="text-red-700 cursor-pointer">
          Signout
        </span>
      </div>
      <p className="text-red-700 font-bold">{error ? error : ""}</p>
      <p className="text-green-700 font-bold">
        {updateSuccess ? "Success in updating profile" : ""}
      </p>
      <button onClick={handleShowListing} className="text-green-700 w-full">
        Show Listings
      </button>
      <p>{showListingError ? "Error in showing listings" : ""}</p>
      {userListing &&
        userListing.length > 0 &&
        userListing.map((listing) => (
          <div
            key={listing._id}
            className="border rounded-lg p-3 flex justify-between items-center"
          >
            <Link to={`/listings/${listing._id}`}>
              <img
                src={listing.imageUrls[0]}
                alt="listing cover"
                className="h-16 w-16 object-contain rounded-lg"
              />
            </Link>
            <Link className="flex-1" to={`/listings/${listing._id}`}>
              <p className="truncate hover:underline">{listing.name}</p>
            </Link>

            <div className="flex flex-col">
              <button
                onClick={() => handleListingDelete(listing._id)}
                className="text-red-700 font-bold uppercase"
              >
                Delete
              </button>
              <Link to={`/update-listing/${listing._id}`}>
                <button className="text-green-700 font-bold uppercase">
                  Edit
                </button>
              </Link>
            </div>
          </div>
        ))}
    </div>
  );
}

export default Profile;
